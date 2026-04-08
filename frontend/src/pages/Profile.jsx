import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const allSports = [
  { icon: '⚽', label: 'Football' },
  { icon: '🏏', label: 'Cricket' },
  { icon: '🏸', label: 'Badminton' },
  { icon: '🎾', label: 'Tennis' },
  { icon: '🏀', label: 'Basketball' },
  { icon: '🏐', label: 'Volleyball' },
  { icon: '🏊', label: 'Swimming' },
  { icon: '🏃', label: 'Running' },
  { icon: '🚴', label: 'Cycling' },
  { icon: '🏋️', label: 'Gym' },
  { icon: '🥊', label: 'Boxing' },
  { icon: '⛳', label: 'Golf' },
]

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro']
const genders = ['Male', 'Female', 'Other']

const skillIcons = { Beginner: '🌱', Intermediate: '🔥', Advanced: '⚡', Pro: '🏆' }

const API = axios.create({ baseURL: '/api' })
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function Profile() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [profile, setProfile] = useState(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', age: '', gender: '',
    bio: '', favSports: [], skillLevel: '', avatar: '',
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const loadProfile = () => {
    API.get('/user/profile')
      .then(({ data }) => {
        setProfile(data)
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          age: data.age || '',
          gender: data.gender || '',
          bio: data.bio || '',
          favSports: data.favSports || [],
          skillLevel: data.skillLevel || '',
          avatar: data.avatar || '',
        })
        if (data.avatar) setAvatarPreview(data.avatar)
        setLoading(false)

        // If profile is incomplete (no city/phone/favSports), open edit mode
        if (!data.city && !data.phone && (!data.favSports || data.favSports.length === 0)) {
          setEditing(true)
        }
      })
      .catch(() => navigate('/login'))
  }

  useEffect(() => { loadProfile() }, [navigate])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const toggleSport = (sport) => {
    setForm((prev) => ({
      ...prev,
      favSports: prev.favSports.includes(sport)
        ? prev.favSports.filter((s) => s !== sport)
        : [...prev.favSports, sport],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      formData.append('city', form.city)
      formData.append('age', form.age)
      formData.append('gender', form.gender)
      formData.append('bio', form.bio)
      formData.append('favSports', JSON.stringify(form.favSports))
      formData.append('skillLevel', form.skillLevel)
      if (avatarFile) formData.append('avatar', avatarFile)

      const { data } = await API.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setProfile(data)
      setForm({
        name: data.name || '', email: data.email || '', phone: data.phone || '',
        city: data.city || '', age: data.age || '', gender: data.gender || '',
        bio: data.bio || '', favSports: data.favSports || [],
        skillLevel: data.skillLevel || '', avatar: data.avatar || '',
      })
      if (data.avatar) setAvatarPreview(data.avatar)
      setAvatarFile(null)

      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, avatar: data.avatar }))
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        name: profile.name || '', email: profile.email || '', phone: profile.phone || '',
        city: profile.city || '', age: profile.age || '', gender: profile.gender || '',
        bio: profile.bio || '', favSports: profile.favSports || [],
        skillLevel: profile.skillLevel || '', avatar: profile.avatar || '',
      })
      setAvatarPreview(profile.avatar || '')
      setAvatarFile(null)
    }
    setEditing(false)
    setError('')
  }

  const initials = (form.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-green-600 hover:text-green-800 no-underline flex items-center gap-1.5"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-green-600 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{initials}</span>
              )}
            </div>
            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-base cursor-pointer border-2 border-green-600 hover:bg-green-50 transition"
                >
                  📷
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile?.name || 'Your Name'}</h1>
            <p className="text-green-100/70 text-sm mt-1">{profile?.email}</p>
            {profile?.city && (
              <p className="text-green-200/60 text-sm mt-1 flex items-center gap-1 justify-center sm:justify-start">
                📍 {profile.city}
              </p>
            )}
            {profile?.favSports?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                {profile.favSports.map((s) => {
                  const sport = allSports.find((sp) => sp.label === s)
                  return (
                    <span key={s} className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full">
                      {sport?.icon} {s}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur text-white border border-white/20 rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 shrink-0"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6">
            {error}
          </div>
        )}

        {editing ? (
          <EditForm
            form={form}
            setForm={setForm}
            saving={saving}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            toggleSport={toggleSport}
          />
        ) : (
          <ViewCard profile={profile} onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  )
}

/* ============ VIEW CARD ============ */
function ViewCard({ profile, onEdit }) {
  const p = profile || {}

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">👤 Personal Information</h3>
          <button
            onClick={onEdit}
            className="text-sm text-green-600 font-semibold hover:text-green-800 cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            <InfoRow label="Full Name" value={p.name} />
            <InfoRow label="Email" value={p.email} />
            <InfoRow label="Phone" value={p.phone || '—'} />
            <InfoRow label="City" value={p.city || '—'} />
            <InfoRow label="Age" value={p.age ? `${p.age} years` : '—'} />
            <InfoRow label="Gender" value={p.gender || '—'} />
          </div>
          {p.bio && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{p.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Favourite Sports Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🏅 Favourite Sports</h3>
          <button
            onClick={onEdit}
            className="text-sm text-green-600 font-semibold hover:text-green-800 cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="p-6">
          {p.favSports?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {p.favSports.map((s) => {
                const sport = allSports.find((sp) => sp.label === s)
                return (
                  <div
                    key={s}
                    className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    <span className="text-xl">{sport?.icon}</span>
                    {s}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No favourite sports added yet.</p>
          )}
        </div>
      </div>

      {/* Skill Level Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">📊 Skill Level</h3>
          <button
            onClick={onEdit}
            className="text-sm text-green-600 font-semibold hover:text-green-800 cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="p-6">
          {p.skillLevel ? (
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl text-base font-bold shadow-sm">
              <span className="text-xl">{skillIcons[p.skillLevel]}</span>
              {p.skillLevel}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No skill level set yet.</p>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">⚙️ Account</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <InfoRow label="Member Since" value={p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
            <InfoRow label="Last Updated" value={p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[15px] text-gray-800 font-medium">{value}</p>
    </div>
  )
}

/* ============ EDIT FORM ============ */
function EditForm({ form, setForm, saving, onSave, onCancel, toggleSport }) {
  return (
    <form onSubmit={onSave} className="space-y-8">
      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          👤 Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
              value={form.email}
              disabled
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">City</label>
            <input
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Mumbai, Delhi, Pune..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Age</label>
            <input
              type="number"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="25"
              min="5"
              max="99"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            <div className="flex gap-2">
              {genders.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all border ${
                    form.gender === g
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Bio</label>
            <textarea
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself... e.g. Weekend footballer, love cricket and swimming"
            />
          </div>
        </div>
      </div>

      {/* Favourite Sports */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          🏅 Favourite Sports
        </h3>
        <p className="text-sm text-gray-400 mb-5">Select all the sports you love to play</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allSports.map((sport) => {
            const selected = form.favSports.includes(sport.label)
            return (
              <button
                key={sport.label}
                type="button"
                onClick={() => toggleSport(sport.label)}
                className={`flex items-center gap-3 p-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${
                  selected
                    ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                }`}
              >
                <span className="text-2xl">{sport.icon}</span>
                <span>{sport.label}</span>
                {selected && <span className="ml-auto text-green-600">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill Level */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          📊 Skill Level
        </h3>
        <p className="text-sm text-gray-400 mb-5">How would you rate your overall sports ability?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {skillLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setForm({ ...form, skillLevel: level })}
              className={`py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${
                form.skillLevel === level
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300'
              }`}
            >
              {skillIcons[level]} {level}
            </button>
          ))}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition cursor-pointer bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all border-none ${
            saving
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 cursor-pointer hover:bg-green-700 hover:shadow-md active:scale-[0.98]'
          }`}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
