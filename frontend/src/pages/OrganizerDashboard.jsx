import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = axios.create({ baseURL: '/api' })
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const SPORTS = ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Volleyball', 'Hockey', 'Kabaddi']
const ICON_MAP = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Tennis: '🎾', Basketball: '🏀', Volleyball: '🏐', Hockey: '🏑', Kabaddi: '🤼' }
const STATUS_OPTIONS = ['upcoming', 'open', 'few-slots', 'closed', 'ongoing', 'completed']

const emptyForm = { title: '', sport: 'Football', startDate: '', endDate: '', location: '', maxTeams: '', prize: '', image: '', description: '', entryFee: '0', status: 'open' }

export default function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [regsModal, setRegsModal] = useState({ open: false, tournament: null, registrations: [], loading: false })
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const { data } = await API.get('/tournaments/my')
      setTournaments(data)
    } catch {
      setError('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        icon: ICON_MAP[form.sport] || '🏆',
        maxTeams: Number(form.maxTeams),
        entryFee: Number(form.entryFee) || 0,
      }
      if (editingId) {
        const { data } = await API.put(`/tournaments/${editingId}`, payload)
        setTournaments((prev) => prev.map((t) => (t._id === editingId ? data : t)))
      } else {
        const { data } = await API.post('/tournaments', payload)
        setTournaments((prev) => [data, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tournament')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (t) => {
    setForm({
      title: t.title,
      sport: t.sport,
      startDate: t.startDate?.slice(0, 10) || '',
      endDate: t.endDate?.slice(0, 10) || '',
      location: t.location,
      maxTeams: String(t.maxTeams),
      prize: t.prize,
      image: t.image || '',
      description: t.description || '',
      entryFee: String(t.entryFee || 0),
      status: t.status || 'open',
    })
    setEditingId(t._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return
    try {
      await API.delete(`/tournaments/${id}`)
      setTournaments((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const viewRegistrations = async (tournament) => {
    setRegsModal({ open: true, tournament, registrations: [], loading: true })
    try {
      const { data } = await API.get(`/tournaments/${tournament._id}/registrations`)
      setRegsModal((prev) => ({ ...prev, registrations: data, loading: false }))
    } catch {
      setRegsModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  const statusBadge = (status) => {
    const styles = {
      open: 'bg-green-100 text-green-700',
      'few-slots': 'bg-orange-100 text-orange-700',
      upcoming: 'bg-blue-100 text-blue-700',
      closed: 'bg-red-100 text-red-600',
      ongoing: 'bg-purple-100 text-purple-700',
      completed: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status?.replace('-', ' ')}
      </span>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full ml-1">ORGANIZER</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 no-underline">Dashboard</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-semibold text-gray-700">{user.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tournaments</h1>
            <p className="text-sm text-gray-400 mt-1">Create and manage sports tournaments</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
              showForm ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showForm ? 'Cancel' : '+ Create Tournament'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Tournament' : 'Create New Tournament'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Tournament Title *</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. City Football League 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Sport *</label>
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                >
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Start Date *</label>
                <input
                  type="date"
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">End Date *</label>
                <input
                  type="date"
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Location *</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. Green Park Stadium"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Max Teams *</label>
                <input
                  type="number"
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. 16"
                  value={form.maxTeams}
                  onChange={(e) => setForm({ ...form, maxTeams: e.target.value })}
                  required
                  min="2"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Prize *</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. ₹50,000"
                  value={form.prize}
                  onChange={(e) => setForm({ ...form, prize: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Entry Fee (₹)</label>
                <input
                  type="number"
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="0 for free"
                  value={form.entryFee}
                  onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Image URL</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition resize-none"
                  rows={3}
                  placeholder="Tournament details, rules, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 justify-end">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white border-none transition-all ${
                    saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 cursor-pointer hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && tournaments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-gray-600 font-semibold mb-1">No tournaments yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first tournament to get players registered!</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg border-none cursor-pointer transition"
            >
              + Create Your First Tournament
            </button>
          </div>
        )}

        {/* Tournaments List */}
        {!loading && tournaments.length > 0 && (
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {t.image && (
                    <div className="sm:w-52 h-44 sm:h-auto shrink-0 relative">
                      <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">{statusBadge(t.status)}</div>
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{ICON_MAP[t.sport] || '🏆'} {t.title}</h3>
                        <p className="text-xs text-gray-400">{t.sport}</p>
                      </div>
                      {!t.image && statusBadge(t.status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-500 mb-3">
                      <span>📅 {formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
                      <span>📍 {t.location}</span>
                      <span>👥 {t.registrations?.length || 0}/{t.maxTeams} teams</span>
                      <span className="text-green-700 font-semibold">🏅 {t.prize}</span>
                    </div>

                    {/* Registration progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Registrations</span>
                        <span>{t.registrations?.length || 0} / {t.maxTeams}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${Math.min(((t.registrations?.length || 0) / t.maxTeams) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => viewRegistrations(t)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer transition"
                      >
                        View Registrations ({t.registrations?.length || 0})
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations Modal */}
      {regsModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRegsModal({ open: false, tournament: null, registrations: [], loading: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Registrations — {regsModal.tournament?.title}</h3>
                <p className="text-purple-100/80 text-sm">{regsModal.registrations.length} registered</p>
              </div>
              <button
                onClick={() => setRegsModal({ open: false, tournament: null, registrations: [], loading: false })}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white border-none cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {regsModal.loading && (
                <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              )}
              {!regsModal.loading && regsModal.registrations.length === 0 && (
                <p className="text-center text-gray-400 py-10">No registrations yet.</p>
              )}
              {!regsModal.loading && regsModal.registrations.length > 0 && (
                <div className="space-y-2">
                  {regsModal.registrations.map((r, i) => (
                    <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                      <div className="text-right">
                        {r.city && <p className="text-xs text-gray-500">📍 {r.city}</p>}
                        <p className="text-[11px] text-gray-300">{new Date(r.registeredAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
