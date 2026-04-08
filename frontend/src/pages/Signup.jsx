import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/auth/signup', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-gray-500 text-[15px]">
          Join Sport Arena to book turfs, compete in tournaments & connect with players.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Full Name</label>
          <input
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Email address</label>
          <input
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <input
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="py-3.5 bg-green-600 text-white rounded-lg text-[15px] font-semibold cursor-pointer transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-gray-500 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
