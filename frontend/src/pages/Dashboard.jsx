import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../lib/api'

const ICON_MAP = { 'Football Turf': '⚽', 'Cricket Ground': '🏏', 'Badminton Court': '🏸', 'Tennis Court': '🎾', 'Multi-Sport': '🏟️' }
const SPORT_ICON = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐', Hockey: '🏑', Kabaddi: '🤼' }

const tabs = [
  { key: 'tournaments', label: 'Tournaments', icon: '🏆' },
  { key: 'venues', label: 'Book Venues', icon: '📍' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tournaments')
  const [profileOpen, setProfileOpen] = useState(false)
  const [userCity, setUserCity] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [userRoleRequest, setUserRoleRequest] = useState('')
  const [cityModal, setCityModal] = useState({ open: false, action: '', itemName: '', venueData: null, tournamentId: null })
  const [roleModal, setRoleModal] = useState(false)
  const [venues, setVenues] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [loadingTournaments, setLoadingTournaments] = useState(true)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = (user.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    // Load user profile
    API.get('/api/user/profile')
      .then(({ data }) => {
        setUserCity(data.city || '')
        setUserRole(data.role || 'user')
        setUserRoleRequest(data.roleRequest || '')
        // Update localStorage with latest role
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        stored.role = data.role
        localStorage.setItem('user', JSON.stringify(stored))
      })
      .catch(() => {})

    // Load venues
    API.get('/api/venues')
      .then(({ data }) => setVenues(data))
      .catch(() => {})
      .finally(() => setLoadingVenues(false))

    // Load tournaments
    API.get('/api/tournaments')
      .then(({ data }) => setTournaments(data))
      .catch(() => {})
      .finally(() => setLoadingTournaments(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleAction = (action, itemName, venueData, tournamentId) => {
    if (!userCity) {
      setCityModal({ open: true, action, itemName, venueData: venueData || null, tournamentId: tournamentId || null })
    } else if (action === 'book' && venueData) {
      navigate('/book-venue', { state: { venue: venueData } })
    } else if (action === 'register' && tournamentId) {
      navigate(`/tournament-register/${tournamentId}`)
    }
  }

  const handleCitySave = async (city) => {
    try {
      const formData = new FormData()
      formData.append('city', city)
      await API.put('/api/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUserCity(city)

      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      stored.city = city
      localStorage.setItem('user', JSON.stringify(stored))

      if (cityModal.action === 'book' && cityModal.venueData) {
        setCityModal({ open: false, action: '', itemName: '', venueData: null, tournamentId: null })
        navigate('/book-venue', { state: { venue: cityModal.venueData } })
      } else if (cityModal.action === 'register' && cityModal.tournamentId) {
        setCityModal({ open: false, action: '', itemName: '', venueData: null, tournamentId: null })
        navigate(`/tournament-register/${cityModal.tournamentId}`)
      } else {
        setCityModal({ open: false, action: '', itemName: '', venueData: null, tournamentId: null })
      }
    } catch {
      alert('Failed to save city. Please try again.')
    }
  }

  const handleRequestRole = async (role) => {
    try {
      const { data } = await API.post('/api/user/request-role', { role })
      alert(`✅ ${data.message}`)
      setUserRoleRequest(role)
      setRoleModal(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========= HEADER ========= */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">
                Sport Arena
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">{user.email || ''}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {initials}
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {user.email || ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {userCity && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            📍 {userCity}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          userRole === 'admin' ? 'bg-red-100 text-red-700' :
                          userRole === 'venue-owner' ? 'bg-amber-100 text-amber-700' :
                          userRole === 'organizer' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {userRole === 'venue-owner' ? 'Owner' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Link to="/profile" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 no-underline">
                      <span>👤</span> My Profile
                    </Link>
                    <Link to="/my-bookings" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 no-underline">
                      <span>📋</span> My Bookings
                    </Link>
                    <Link to="/my-tournaments" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 no-underline">
                      <span>🏆</span> My Tournaments
                    </Link>

                    {/* Role-based menu items */}
                    {(userRole === 'venue-owner' || userRole === 'admin') && (
                      <Link to="/owner-dashboard" className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-3 no-underline">
                        <span>🏟️</span> Manage Venues
                      </Link>
                    )}
                    {(userRole === 'organizer' || userRole === 'admin') && (
                      <Link to="/organizer-dashboard" className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-3 no-underline">
                        <span>🏆</span> Manage Tournaments
                      </Link>
                    )}
                    {userRole === 'admin' && (
                      <Link to="/admin" className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 no-underline">
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}

                    {/* Request role upgrade */}
                    {userRole === 'user' && (
                      <button
                        onClick={() => { setProfileOpen(false); setRoleModal(true) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 cursor-pointer border-none bg-transparent"
                      >
                        <span>🚀</span>
                        {userRoleRequest ? `Request pending (${userRoleRequest})` : 'Become Owner / Organizer'}
                      </button>
                    )}

                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 cursor-pointer border-none bg-transparent"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========= MOBILE TABS ========= */}
      <div className="md:hidden flex border-b border-gray-200 bg-white sticky top-16 z-40">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all cursor-pointer border-none ${
              activeTab === tab.key
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50'
                : 'text-gray-400 bg-transparent'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========= HERO BANNER ========= */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Player'} 👋
          </h1>
          <p className="text-green-100/80 text-base sm:text-lg max-w-xl">
            {activeTab === 'tournaments'
              ? 'Discover and register for the hottest sports tournaments near you.'
              : 'Find and book the best sports venues and turfs in your city.'}
          </p>

          {userCity && (
            <div className="inline-flex items-center gap-2 mt-4 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-sm">
              📍 <span className="font-semibold">{userCity}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3 min-w-[140px]">
              <p className="text-2xl font-bold">{tournaments.length}</p>
              <p className="text-sm text-green-200/70">Active Tournaments</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3 min-w-[140px]">
              <p className="text-2xl font-bold">{venues.length}</p>
              <p className="text-sm text-green-200/70">Venues Available</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3 min-w-[140px]">
              <p className="text-2xl font-bold">{new Set([...venues.map((v) => v.type), ...tournaments.map((t) => t.sport)]).size}</p>
              <p className="text-sm text-green-200/70">Sports</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========= CONTENT ========= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tournaments' && (
          <TournamentsTab
            tournaments={tournaments}
            loading={loadingTournaments}
            onAction={handleAction}
          />
        )}
        {activeTab === 'venues' && (
          <VenuesTab
            venues={venues}
            loading={loadingVenues}
            onAction={handleAction}
          />
        )}
      </main>

      {/* ========= CITY MODAL ========= */}
      {cityModal.open && (
        <CityModal
          action={cityModal.action}
          itemName={cityModal.itemName}
          onSave={handleCitySave}
          onClose={() => setCityModal({ open: false, action: '', itemName: '', venueData: null, tournamentId: null })}
        />
      )}

      {/* ========= ROLE REQUEST MODAL ========= */}
      {roleModal && (
        <RoleRequestModal
          currentRequest={userRoleRequest}
          onRequest={handleRequestRole}
          onClose={() => setRoleModal(false)}
        />
      )}
    </div>
  )
}

/* ============ CITY MODAL ============ */
function CityModal({ action, itemName, onSave, onClose }) {
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!city.trim()) return
    setSaving(true)
    await onSave(city.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">📍 Enter Your City</h3>
              <p className="text-green-100/80 text-sm mt-1">
                We need your city to {action === 'register' ? 'register you for' : 'book'} this
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white border-none cursor-pointer text-lg transition"
            >
              ✕
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-2xl">{action === 'register' ? '🏆' : '🏟️'}</span>
            <div>
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">
                {action === 'register' ? 'Tournament' : 'Venue'}
              </p>
              <p className="text-sm font-bold text-gray-900">{itemName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-sm font-semibold text-gray-700">Your City</label>
            <input
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Mumbai, Delhi, Pune, Bangalore..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoFocus
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be saved to your profile for future bookings.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !city.trim()}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold text-white border-none transition-all ${
                saving || !city.trim()
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 cursor-pointer hover:bg-green-700 active:scale-[0.98]'
              }`}
            >
              {saving ? 'Saving...' : `Save & ${action === 'register' ? 'Register' : 'Book'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ============ ROLE REQUEST MODAL ============ */
function RoleRequestModal({ currentRequest, onRequest, onClose }) {
  const roles = [
    { key: 'venue-owner', label: 'Venue Owner', icon: '🏟️', desc: 'List and manage your sports venues. Receive bookings from players.' },
    { key: 'organizer', label: 'Tournament Organizer', icon: '🏆', desc: 'Create and manage tournaments. Track player registrations.' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">🚀 Upgrade Your Role</h3>
              <p className="text-blue-100/80 text-sm mt-1">Request a role upgrade from the admin</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white border-none cursor-pointer text-lg transition">
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {currentRequest && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              ⏳ Your request for <strong>{currentRequest === 'venue-owner' ? 'Venue Owner' : 'Organizer'}</strong> is pending admin approval.
            </div>
          )}
          {roles.map((r) => (
            <div key={r.key} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                  <button
                    onClick={() => onRequest(r.key)}
                    disabled={currentRequest === r.key}
                    className={`mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold border-none transition ${
                      currentRequest === r.key
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                    }`}
                  >
                    {currentRequest === r.key ? 'Pending...' : 'Request This Role'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer bg-white transition mt-2">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- TOURNAMENTS TAB ---------- */
function TournamentsTab({ tournaments, loading, onAction }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

  const statusLabel = (s) => {
    const map = { open: 'Registrations Open', 'few-slots': 'Few Slots Left', upcoming: 'Coming Soon', closed: 'Closed', ongoing: 'Ongoing', completed: 'Completed' }
    return map[s] || s
  }

  const statusColor = (s) => {
    const map = { open: 'bg-green-500', 'few-slots': 'bg-orange-500', upcoming: 'bg-blue-500', closed: 'bg-red-500', ongoing: 'bg-purple-500', completed: 'bg-gray-500' }
    return map[s] || 'bg-gray-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Top Tournaments</h2>
        <span className="text-sm text-gray-400">{tournaments.length} events</span>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-gray-600 font-semibold">No tournaments available yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon for upcoming tournaments!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tournaments.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-44 overflow-hidden">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-5xl">{SPORT_ICON[t.sport] || '🏆'}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${statusColor(t.status)}`}>
                    {statusLabel(t.status)}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-lg w-9 h-9 flex items-center justify-center rounded-full">
                  {SPORT_ICON[t.sport] || t.icon || '🏆'}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                  {t.title}
                </h3>
                <div className="space-y-1.5 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <span className="text-base">📅</span> {formatDate(t.startDate)} – {formatDate(t.endDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-base">📍</span> {t.location}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="flex items-center gap-2">
                      <span className="text-base">👥</span> {t.registrationCount || 0}/{t.maxTeams}
                    </p>
                    <span className="text-green-700 font-bold text-sm">
                      🏅 {t.prize}
                    </span>
                  </div>
                </div>

                {/* Registration progress */}
                <div className="mt-3 mb-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(((t.registrationCount || 0) / t.maxTeams) * 100, 100)}%` }} />
                  </div>
                </div>

                {t.isRegistered ? (
                  <Link
                    to="/my-tournaments"
                    className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-2 no-underline hover:bg-green-100 transition"
                  >
                    ✅ Registered — View
                  </Link>
                ) : (
                  <button
                    onClick={() => onAction('register', t.title, null, t._id)}
                    disabled={t.status === 'closed' || t.status === 'completed' || (t.registrationCount >= t.maxTeams)}
                    className={`w-full mt-3 py-2.5 rounded-lg text-sm font-semibold transition-all border-none ${
                      t.status === 'closed' || t.status === 'completed' || (t.registrationCount >= t.maxTeams)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white cursor-pointer hover:bg-green-700 active:scale-[0.98]'
                    }`}
                  >
                    {t.status === 'closed' || t.status === 'completed' ? 'Closed' : t.registrationCount >= t.maxTeams ? 'Full' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- VENUES TAB ---------- */
function VenuesTab({ venues, loading, onAction }) {
  const [filter, setFilter] = useState('All')
  const types = ['All', ...new Set(venues.map((v) => v.type))]

  const filtered = filter === 'All' ? venues : venues.filter((v) => v.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">📍 Book a Venue</h2>
        <span className="text-sm text-gray-400">{filtered.length} venues</span>
      </div>

      {types.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all border ${
                filter === type
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-gray-600 font-semibold">No venues available yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon for new venues!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => {
            const venueForBooking = {
              ...v,
              price: v.priceLabel || `₹${v.price} / hr`,
              icon: ICON_MAP[v.type] || v.icon || '🏟️',
            }

            return (
              <div
                key={v._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-44 overflow-hidden">
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <span className="text-5xl">{ICON_MAP[v.type] || '🏟️'}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        v.available
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {v.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-lg w-9 h-9 flex items-center justify-center rounded-full">
                    {ICON_MAP[v.type] || v.icon || '🏟️'}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-sm font-bold px-3 py-1 rounded-lg">
                    ₹{v.price} / hr
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {v.name}
                    </h3>
                    {v.rating > 0 && (
                      <span className="flex items-center gap-1 text-sm text-yellow-500 font-semibold shrink-0 ml-2">
                        ⭐ {v.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{v.type}</p>

                  <p className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>📍</span> {v.location}
                  </p>

                  {v.amenities && v.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {v.amenities.map((a) => (
                        <span
                          key={a}
                          className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => v.available && onAction('book', v.name, venueForBooking)}
                    disabled={!v.available}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all border-none ${
                      v.available
                        ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700 active:scale-[0.98]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {v.available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
