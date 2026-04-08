import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import API from '../lib/api'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { venue, date, slots, totalPrice, pricePerSlot } = location.state || {}

  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!venue || !slots) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">💳</p>
          <p className="text-gray-600 font-semibold mb-2">No booking details found</p>
          <Link to="/dashboard" className="text-green-600 font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [payError, setPayError] = useState('')

  const handlePay = async () => {
    setPaying(true)
    setPayError('')
    try {
      await API.post('/api/bookings', {
        venueName: venue.name,
        venueType: venue.type,
        venueLocation: venue.location,
        venueImage: venue.image,
        venuePrice: venue.price,
        date,
        slots,
        totalPrice,
      })
      setPaid(true)
    } catch (err) {
      setPayError(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your venue has been booked successfully. You'll receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Venue</span>
              <span className="font-semibold text-gray-900">{venue.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Date</span>
              <span className="font-semibold text-gray-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slots</span>
              <span className="font-semibold text-gray-900">{slots.length} hr{slots.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
              <span className="text-gray-400">Amount Paid</span>
              <span className="font-bold text-green-700 text-base">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/my-bookings"
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition no-underline text-center"
            >
              View My Bookings
            </Link>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition no-underline text-center"
              >
                Dashboard
              </Link>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 rounded-lg text-sm font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 transition cursor-pointer"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-green-600 hover:text-green-800 cursor-pointer bg-transparent border-none flex items-center gap-1.5"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          💳 Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Order Summary */}
          <div className="lg:col-span-3 space-y-5">
            {/* Venue Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex gap-4 p-5">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base">{venue.name}</h3>
                  <p className="text-xs text-gray-400 mb-1">{venue.type}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">📍 {venue.location}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                📋 Booking Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date</span>
                  <span className="font-semibold text-gray-900">{formattedDate}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-400">Time Slots ({slots.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {slots.map((s) => (
                      <span
                        key={s.id}
                        className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Booked By</span>
                  <span className="font-semibold text-gray-900">{user.name || 'User'}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email</span>
                  <span className="font-semibold text-gray-900">{user.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price Breakdown & Pay */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                🧾 Price Breakdown
              </h3>

              <div className="space-y-3 mb-4">
                {slots.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="text-gray-700 font-medium">₹{pricePerSlot.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Subtotal ({slots.length} slots)</span>
                  <span className="text-gray-700">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-700 text-xl">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className={`w-full py-4 rounded-xl text-sm font-bold transition-all border-none ${
                  paying
                    ? 'bg-green-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white cursor-pointer hover:bg-green-700 hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {paying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${totalPrice.toLocaleString('en-IN')}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                🔒 Payments are secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
