import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import API from '../lib/api'

const SPORT_ICON = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐', Hockey: '🏑', Kabaddi: '🤼' }

export default function TournamentPayment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tournament, registration } = location.state || {}

  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [payError, setPayError] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!tournament || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-gray-600 font-semibold mb-2">No registration details found</p>
          <Link to="/dashboard" className="text-green-600 font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const entryFee = tournament.entryFee || 0
  const isFree = entryFee === 0

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const handlePay = async () => {
    setPaying(true)
    setPayError('')
    try {
      await API.post(`/api/tournaments/${tournament._id}/register`, registration)
      setPaid(true)
    } catch (err) {
      setPayError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  // ========= SUCCESS SCREEN =========
  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your team has been successfully registered for the tournament.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tournament</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%]">{tournament.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Team</span>
              <span className="font-semibold text-gray-900">{registration.teamName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Captain</span>
              <span className="font-semibold text-gray-900">{registration.captainName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Players</span>
              <span className="font-semibold text-gray-900">{registration.playerCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Dates</span>
              <span className="font-semibold text-gray-900 text-right">
                {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
              <span className="text-gray-400">{isFree ? 'Entry Fee' : 'Amount Paid'}</span>
              <span className="font-bold text-green-700 text-base">
                {isFree ? 'FREE' : `₹${entryFee.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/my-tournaments"
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition no-underline text-center"
            >
              View My Tournaments
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
                Browse More
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========= PAYMENT SCREEN =========
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
          {isFree ? '🏆 Confirm Registration' : '💳 Tournament Payment'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Tournament Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex gap-4 p-5">
                {tournament.image ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={tournament.image} alt={tournament.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-3xl">{SPORT_ICON[tournament.sport] || '🏆'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base">{tournament.title}</h3>
                  <p className="text-xs text-gray-400 mb-1">{tournament.sport}</p>
                  <p className="text-xs text-gray-500">📍 {tournament.location}</p>
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                📋 Registration Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Team Name</span>
                  <span className="font-semibold text-gray-900">{registration.teamName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Captain</span>
                  <span className="font-semibold text-gray-900">{registration.captainName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-semibold text-gray-900">{registration.phone}</span>
                </div>
                {registration.city && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">City</span>
                    <span className="font-semibold text-gray-900">{registration.city}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Players</span>
                  <span className="font-semibold text-gray-900">{registration.playerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tournament Dates</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Registered By</span>
                  <span className="font-semibold text-gray-900">{user.name || 'User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                🧾 {isFree ? 'Summary' : 'Payment Summary'}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Entry Fee</span>
                  <span className="text-gray-700 font-medium">
                    {isFree ? 'FREE' : `₹${entryFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Convenience Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-700 text-xl">
                    {isFree ? 'FREE' : `₹${entryFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {payError}
                </div>
              )}

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
                ) : isFree ? (
                  'Confirm Registration'
                ) : (
                  `Pay ₹${entryFee.toLocaleString('en-IN')}`
                )}
              </button>

              {!isFree && (
                <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                  🔒 Payments are secure and encrypted
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
