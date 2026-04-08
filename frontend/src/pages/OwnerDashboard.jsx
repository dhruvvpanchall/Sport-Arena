import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = axios.create({ baseURL: '/api' })
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const VENUE_TYPES = ['Football Turf', 'Cricket Ground', 'Badminton Court', 'Tennis Court', 'Multi-Sport']
const ICON_MAP = { 'Football Turf': '⚽', 'Cricket Ground': '🏏', 'Badminton Court': '🏸', 'Tennis Court': '🎾', 'Multi-Sport': '🏟️' }

const emptyForm = { name: '', type: 'Football Turf', location: '', price: '', amenities: '', image: '', description: '' }

export default function OwnerDashboard() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bookingsModal, setBookingsModal] = useState({ open: false, venue: null, bookings: [], loading: false })
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    try {
      const { data } = await API.get('/venues/my')
      setVenues(data)
    } catch {
      setError('Failed to load venues')
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
        price: Number(form.price),
        icon: ICON_MAP[form.type] || '🏟️',
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      }
      if (editingId) {
        const { data } = await API.put(`/venues/${editingId}`, payload)
        setVenues((prev) => prev.map((v) => (v._id === editingId ? data : v)))
      } else {
        const { data } = await API.post('/venues', payload)
        setVenues((prev) => [data, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save venue')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (venue) => {
    setForm({
      name: venue.name,
      type: venue.type,
      location: venue.location,
      price: String(venue.price),
      amenities: (venue.amenities || []).join(', '),
      image: venue.image || '',
      description: venue.description || '',
    })
    setEditingId(venue._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return
    try {
      await API.delete(`/venues/${id}`)
      setVenues((prev) => prev.filter((v) => v._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleToggleAvailability = async (venue) => {
    try {
      const { data } = await API.put(`/venues/${venue._id}`, { available: !venue.available })
      setVenues((prev) => prev.map((v) => (v._id === venue._id ? data : v)))
    } catch {
      alert('Failed to update availability')
    }
  }

  const viewBookings = async (venue) => {
    setBookingsModal({ open: true, venue, bookings: [], loading: true })
    try {
      const { data } = await API.get(`/venues/${venue._id}/bookings`)
      setBookingsModal((prev) => ({ ...prev, bookings: data, loading: false }))
    } catch {
      setBookingsModal((prev) => ({ ...prev, loading: false }))
    }
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
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full ml-1">OWNER</span>
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
        {/* Title + Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your sports venues and view bookings</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
              showForm ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showForm ? 'Cancel' : '+ Add Venue'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Venue' : 'Add New Venue'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Venue Name *</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. Green Turf Arena"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Type *</label>
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {VENUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Location *</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. Andheri West, Mumbai"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Price per hour (₹) *</label>
                <input
                  type="number"
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. 1200"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Amenities (comma separated)</label>
                <input
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition"
                  placeholder="e.g. Floodlights, Changing Room, Parking"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                />
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
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition resize-none"
                  rows={3}
                  placeholder="Brief description of the venue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
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
                  {saving ? 'Saving...' : editingId ? 'Update Venue' : 'Create Venue'}
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

        {/* Empty State */}
        {!loading && venues.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">🏟️</p>
            <p className="text-gray-600 font-semibold mb-1">No venues yet</p>
            <p className="text-sm text-gray-400 mb-5">Add your first venue to start receiving bookings!</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-lg border-none cursor-pointer transition"
            >
              + Add Your First Venue
            </button>
          </div>
        )}

        {/* Venues List */}
        {!loading && venues.length > 0 && (
          <div className="space-y-4">
            {venues.map((venue) => (
              <div key={venue._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {venue.image && (
                    <div className="sm:w-52 h-44 sm:h-auto shrink-0 relative">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${venue.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {venue.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{ICON_MAP[venue.type] || '🏟️'} {venue.name}</h3>
                        <p className="text-xs text-gray-400">{venue.type}</p>
                      </div>
                      <span className="text-green-700 font-bold text-lg shrink-0">₹{venue.price}/hr</span>
                    </div>

                    <p className="flex items-center gap-2 text-sm text-gray-500 mb-2">📍 {venue.location}</p>

                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {venue.amenities.map((a) => (
                          <span key={a} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{a}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => viewBookings(venue)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer transition"
                      >
                        View Bookings
                      </button>
                      <button
                        onClick={() => handleEdit(venue)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(venue)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                          venue.available
                            ? 'text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100'
                            : 'text-green-700 border-green-200 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {venue.available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => handleDelete(venue._id)}
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

      {/* Bookings Modal */}
      {bookingsModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBookingsModal({ open: false, venue: null, bookings: [], loading: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Bookings — {bookingsModal.venue?.name}</h3>
                <p className="text-green-100/80 text-sm">{bookingsModal.bookings.length} booking(s)</p>
              </div>
              <button
                onClick={() => setBookingsModal({ open: false, venue: null, bookings: [], loading: false })}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white border-none cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {bookingsModal.loading && (
                <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                </div>
              )}
              {!bookingsModal.loading && bookingsModal.bookings.length === 0 && (
                <p className="text-center text-gray-400 py-10">No bookings yet for this venue.</p>
              )}
              {!bookingsModal.loading && bookingsModal.bookings.length > 0 && (
                <div className="space-y-3">
                  {bookingsModal.bookings.map((b) => (
                    <div key={b._id} className={`border rounded-xl p-4 ${b.status === 'cancelled' ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{b.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400">{b.user?.email}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>📅 {b.date}</span>
                        <span>🕐 {b.slots?.length} slot(s)</span>
                        <span className="font-semibold text-green-700">₹{b.totalPrice?.toLocaleString('en-IN')}</span>
                      </div>
                      {b.slots && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.slots.map((s) => (
                            <span key={s.id} className="bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">{s.label}</span>
                          ))}
                        </div>
                      )}
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
