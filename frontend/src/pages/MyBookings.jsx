import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../lib/api'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    API.get('/api/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancellingId(id)
    try {
      const { data } = await API.put(`/api/bookings/${id}/cancel`)
      setBookings((prev) => prev.map((b) => (b._id === id ? data : b)))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  const statusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-600',
      completed: 'bg-blue-100 text-blue-700',
    }
    return (
      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    )
  }

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-green-600 hover:text-green-800 no-underline flex items-center gap-1.5"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📋 My Bookings
          </h1>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg no-underline transition"
          >
            + Book Venue
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'confirmed', 'cancelled', 'completed'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all border ${
                filter === key
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-600 font-semibold mb-1">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </p>
            <p className="text-sm text-gray-400 mb-5">
              {filter === 'all'
                ? 'Book a venue from the dashboard to get started!'
                : 'Try a different filter to see other bookings.'}
            </p>
            {filter === 'all' && (
              <Link
                to="/dashboard"
                className="inline-block text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg no-underline transition"
              >
                Browse Venues
              </Link>
            )}
          </div>
        )}

        {/* Bookings List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const bookingDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={booking._id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    booking.status === 'cancelled' ? 'border-red-100 opacity-75' : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Venue Image */}
                    {booking.venueImage && (
                      <div className="sm:w-48 h-40 sm:h-auto shrink-0">
                        <img
                          src={booking.venueImage}
                          alt={booking.venueName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-snug">
                            {booking.venueName}
                          </h3>
                          {booking.venueType && (
                            <p className="text-xs text-gray-400 mt-0.5">{booking.venueType}</p>
                          )}
                        </div>
                        {statusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <p className="flex items-center gap-2 text-gray-500">
                          <span>📅</span> {bookingDate}
                        </p>
                        {booking.venueLocation && (
                          <p className="flex items-center gap-2 text-gray-500">
                            <span>📍</span> {booking.venueLocation}
                          </p>
                        )}
                      </div>

                      {/* Slots */}
                      {booking.slots && booking.slots.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {booking.slots.map((s) => (
                            <span
                              key={s.id}
                              className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-bold text-green-700 text-lg">
                          ₹{booking.totalPrice?.toLocaleString('en-IN')}
                        </span>

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                              cancellingId === booking._id
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer'
                            }`}
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
