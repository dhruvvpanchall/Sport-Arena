import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BookVenue from './pages/BookVenue'
import Payment from './pages/Payment'
import MyBookings from './pages/MyBookings'
import MyTournaments from './pages/MyTournaments'
import OwnerDashboard from './pages/OwnerDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminPanel from './pages/AdminPanel'
import TournamentRegister from './pages/TournamentRegister'
import TournamentPayment from './pages/TournamentPayment'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : children
}

function RoleRoute({ children, roles }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/book-venue" element={<ProtectedRoute><BookVenue /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/my-tournaments" element={<ProtectedRoute><MyTournaments /></ProtectedRoute>} />
      <Route path="/tournament-register/:id" element={<ProtectedRoute><TournamentRegister /></ProtectedRoute>} />
      <Route path="/tournament-payment" element={<ProtectedRoute><TournamentPayment /></ProtectedRoute>} />
      <Route path="/owner-dashboard" element={<RoleRoute roles={['venue-owner', 'admin']}><OwnerDashboard /></RoleRoute>} />
      <Route path="/organizer-dashboard" element={<RoleRoute roles={['organizer', 'admin']}><OrganizerDashboard /></RoleRoute>} />
      <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminPanel /></RoleRoute>} />
    </Routes>
  )
}

export default App
