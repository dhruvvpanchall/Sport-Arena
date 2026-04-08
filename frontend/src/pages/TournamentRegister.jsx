import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API from '../lib/api'

const SPORT_ICON = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐', Hockey: '🏑', Kabaddi: '🤼' }

export default function TournamentRegister() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({
    teamName: '',
    captainName: user.name || '',
    phone: '',
    city: '',
    playerCount: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tournamentRes, profileRes] = await Promise.all([
          API.get(`/api/tournaments/${id}`),
          API.get('/api/user/profile'),
        ])
        const t = tournamentRes.data
        if (t.isRegistered) {
          navigate('/my-tournaments', { replace: true })
          return
        }
        setTournament(t)
        setForm((prev) => ({
          ...prev,
          captainName: prev.captainName || profileRes.data.name || '',
          phone: profileRes.data.phone || '',
          city: profileRes.data.city || '',
        }))
      } catch {
        setError('Tournament not found')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.teamName.trim()) return setError('Team name is required')
    if (!form.captainName.trim()) return setError('Captain name is required')
    if (!form.phone.trim()) return setError('Phone number is required')
    if (!form.playerCount || form.playerCount < 1) return setError('Enter number of players')
    setError('')

    // Navigate to tournament payment
    navigate('/tournament-payment', {
      state: {
        tournament,
        registration: {
          teamName: form.teamName.trim(),
          captainName: form.captainName.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          playerCount: Number(form.playerCount),
        },
      },
    })
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-gray-600 font-semibold mb-2">{error}</p>
          <Link to="/dashboard" className="text-green-600 font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const slotsLeft = tournament.maxTeams - (tournament.registrationCount || 0)
  const isClosed = tournament.status === 'closed' || tournament.status === 'completed' || slotsLeft <= 0

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
          🏆 Tournament Registration
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Tournament Info Card */}
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
                  <p className="text-xs text-gray-500 flex items-center gap-1">📅 {formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">📍 {tournament.location}</p>
                </div>
              </div>
              <div className="px-5 pb-4 flex flex-wrap gap-3 text-xs">
                <span className="bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-200">🏅 Prize: {tournament.prize}</span>
                <span className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">👥 {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left</span>
                {tournament.entryFee > 0 && (
                  <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">💰 Entry: ₹{tournament.entryFee}</span>
                )}
                {tournament.entryFee === 0 && (
                  <span className="bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-200">🎉 Free Entry</span>
                )}
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                📝 Team Details
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              {isClosed ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-semibold">Registration is closed for this tournament.</p>
                  <Link to="/dashboard" className="text-green-600 font-semibold text-sm hover:underline mt-2 inline-block">
                    ← Browse Other Tournaments
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Team Name *</label>
                    <input
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      name="teamName"
                      placeholder="e.g. Thunder Strikers"
                      value={form.teamName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Captain / Contact Name *</label>
                    <input
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      name="captainName"
                      placeholder="Your name"
                      value={form.captainName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                      <input
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                        name="phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">City</label>
                      <input
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                        name="city"
                        placeholder="e.g. Mumbai"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Number of Players *</label>
                    <input
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
                      name="playerCount"
                      type="number"
                      min="1"
                      placeholder="e.g. 11"
                      value={form.playerCount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-green-600 text-white rounded-lg text-[15px] font-semibold cursor-pointer transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.98] border-none mt-2"
                  >
                    {tournament.entryFee > 0 ? `Proceed to Payment — ₹${tournament.entryFee}` : 'Complete Registration — Free'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                📋 Registration Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tournament</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%]">{tournament.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sport</span>
                  <span className="font-semibold text-gray-900">{SPORT_ICON[tournament.sport] || ''} {tournament.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dates</span>
                  <span className="font-semibold text-gray-900">{formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold text-gray-900">{tournament.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-semibold text-green-700">{tournament.prize}</span>
                </div>

                {form.teamName && (
                  <>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team</span>
                        <span className="font-semibold text-gray-900">{form.teamName}</span>
                      </div>
                    </div>
                    {form.playerCount && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Players</span>
                        <span className="font-semibold text-gray-900">{form.playerCount}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Entry Fee</span>
                    <span className="font-bold text-green-700 text-lg">
                      {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'FREE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
