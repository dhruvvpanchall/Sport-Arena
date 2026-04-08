import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = axios.create({ baseURL: '/api' })
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const SPORT_ICON = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐', Hockey: '🏑', Kabaddi: '🤼' }

export default function MyTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [withdrawingId, setWithdrawingId] = useState(null)

  useEffect(() => {
    API.get('/tournaments/registered')
      .then(({ data }) => setTournaments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw from this tournament?')) return
    setWithdrawingId(id)
    try {
      await API.delete(`/tournaments/${id}/register`)
      setTournaments((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw')
    } finally {
      setWithdrawingId(null)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  const now = new Date()
  const filtered = filter === 'all'
    ? tournaments
    : filter === 'upcoming'
    ? tournaments.filter((t) => new Date(t.startDate) > now)
    : filter === 'ongoing'
    ? tournaments.filter((t) => new Date(t.startDate) <= now && new Date(t.endDate) >= now)
    : tournaments.filter((t) => new Date(t.endDate) < now)

  const counts = {
    all: tournaments.length,
    upcoming: tournaments.filter((t) => new Date(t.startDate) > now).length,
    ongoing: tournaments.filter((t) => new Date(t.startDate) <= now && new Date(t.endDate) >= now).length,
    past: tournaments.filter((t) => new Date(t.endDate) < now).length,
  }

  const statusBadge = (t) => {
    const start = new Date(t.startDate)
    const end = new Date(t.endDate)
    if (end < now) return { label: 'Completed', color: 'bg-gray-100 text-gray-600' }
    if (start <= now && end >= now) return { label: 'Ongoing', color: 'bg-purple-100 text-purple-700' }
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700' }
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
            🏆 My Tournaments
          </h1>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg no-underline transition"
          >
            Browse Tournaments
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'upcoming', 'ongoing', 'past'].map((key) => (
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
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-gray-600 font-semibold mb-1">
              {filter === 'all' ? 'No tournament registrations yet' : `No ${filter} tournaments`}
            </p>
            <p className="text-sm text-gray-400 mb-5">
              {filter === 'all'
                ? 'Register for a tournament from the dashboard!'
                : 'Try a different filter to see other tournaments.'}
            </p>
            {filter === 'all' && (
              <Link
                to="/dashboard"
                className="inline-block text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg no-underline transition"
              >
                Browse Tournaments
              </Link>
            )}
          </div>
        )}

        {/* Tournaments List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((t) => {
              const badge = statusBadge(t)
              const canWithdraw = new Date(t.startDate) > now && t.status !== 'ongoing' && t.status !== 'completed'

              return (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    {t.image && (
                      <div className="sm:w-52 h-44 sm:h-auto shrink-0 relative">
                        <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-snug">
                            {SPORT_ICON[t.sport] || '🏆'} {t.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">{t.sport}</p>
                        </div>
                        {!t.image && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <p className="flex items-center gap-2 text-gray-500">
                          <span>📅</span> {formatDate(t.startDate)} – {formatDate(t.endDate)}
                        </p>
                        <p className="flex items-center gap-2 text-gray-500">
                          <span>📍</span> {t.location}
                        </p>
                        <p className="flex items-center gap-2 text-gray-500">
                          <span>👥</span> {t.registrationCount}/{t.maxTeams} teams registered
                        </p>
                        <p className="flex items-center gap-2 text-green-700 font-semibold">
                          <span>🏅</span> {t.prize}
                        </p>
                      </div>

                      {/* Registration info */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                          ✅ Registered
                        </span>
                        {t.teamName && (
                          <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                            🏅 {t.teamName}
                          </span>
                        )}
                        {t.playerCount > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            👥 {t.playerCount} players
                          </span>
                        )}
                        {t.paymentStatus === 'paid' && (
                          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            💳 Paid ₹{t.amountPaid}
                          </span>
                        )}
                        {t.paymentStatus === 'free' && (
                          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                            🎉 Free Entry
                          </span>
                        )}
                        {t.registeredAt && (
                          <span className="text-xs text-gray-400">
                            on {new Date(t.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {/* Progress */}
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                            <span>Slots filled</span>
                            <span>{t.registrationCount}/{t.maxTeams}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${Math.min((t.registrationCount / t.maxTeams) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {canWithdraw && (
                          <button
                            onClick={() => handleWithdraw(t._id)}
                            disabled={withdrawingId === t._id}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all shrink-0 ${
                              withdrawingId === t._id
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer'
                            }`}
                          >
                            {withdrawingId === t._id ? 'Withdrawing...' : 'Withdraw'}
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
