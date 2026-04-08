import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h2>
        <p className="text-gray-500 text-[15px]">
          No worries! Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Email address</label>
          <input
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="py-3.5 bg-green-600 text-white rounded-lg text-[15px] font-semibold cursor-pointer transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
        >
          Send Reset Link
        </button>

        <p className="text-center text-sm text-gray-500 mt-2">
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
