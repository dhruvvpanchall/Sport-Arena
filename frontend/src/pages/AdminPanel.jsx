import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = axios.create({ baseURL: '/api' })
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const ROLE_COLORS = {
  user: 'bg-gray-100 text-gray-600',
  'venue-owner': 'bg-amber-100 text-amber-700',
  organizer: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
}

const ROLE_LABELS = {
  user: 'User',
  'venue-owner': 'Venue Owner',
  organizer: 'Organizer',
  admin: 'Admin',
}

export default function AdminPanel() {
  const [tab, setTab] = useState('requests')
  const [stats, setStats] = useState(null)
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, requestsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/role-requests'),
        API.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setRequests(requestsRes.data)
      setUsers(usersRes.data)
    } catch {
      // handled by empty state
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    setActionLoading(userId)
    try {
      await API.put(`/admin/role-requests/${userId}/approve`)
      setRequests((prev) => prev.filter((r) => r._id !== userId))
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading('')
    }
  }

  const handleReject = async (userId) => {
    setActionLoading(userId)
    try {
      await API.put(`/admin/role-requests/${userId}/reject`)
      setRequests((prev) => prev.filter((r) => r._id !== userId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading('')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${ROLE_LABELS[newRole]}"?`)) return
    setActionLoading(userId)
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole, roleRequest: '' } : u)))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role')
    } finally {
      setActionLoading('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { key: 'requests', label: 'Role Requests', count: requests.length },
    { key: 'users', label: 'All Users', count: users.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full ml-1">ADMIN</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 no-underline">Dashboard</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-semibold text-gray-700">{currentUser.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.users, icon: '👥', color: 'bg-blue-50 text-blue-700' },
              { label: 'Venues', value: stats.venues, icon: '🏟️', color: 'bg-green-50 text-green-700' },
              { label: 'Tournaments', value: stats.tournaments, icon: '🏆', color: 'bg-purple-50 text-purple-700' },
              { label: 'Bookings', value: stats.bookings, icon: '📋', color: 'bg-amber-50 text-amber-700' },
              { label: 'Pending Requests', value: stats.pendingRequests, icon: '⏳', color: stats.pendingRequests > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl px-5 py-4 border border-black/5`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm mt-0.5 opacity-70 flex items-center gap-1.5">{s.icon} {s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Role Requests Tab */}
        {!loading && tab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-4">✅</p>
                <p className="text-gray-600 font-semibold">No pending role requests</p>
                <p className="text-sm text-gray-400 mt-1">All requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-400">{r.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[r.role]}`}>
                          {ROLE_LABELS[r.role]}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[r.roleRequest]}`}>
                          {ROLE_LABELS[r.roleRequest]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(r._id)}
                        disabled={actionLoading === r._id}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 border-none cursor-pointer transition disabled:opacity-50"
                      >
                        {actionLoading === r._id ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        disabled={actionLoading === r._id}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {!loading && tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{u.city || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                        {u.roleRequest && (
                          <span className="ml-2 text-xs text-orange-500 font-medium">
                            (wants: {ROLE_LABELS[u.roleRequest]})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {u._id !== currentUser._id ? (
                          <select
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-green-500 cursor-pointer"
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            disabled={actionLoading === u._id}
                          >
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">— (you)</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
