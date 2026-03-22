'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error } = await supabase
      .from('listings')
      .select('id, full_name')
      .eq('email', email)
      .single()

    if (error || !data) {
      setError('Email not found. Please contact admin.')
      setLoading(false)
      return
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    
    await supabase
      .from('reset_tokens')
      .insert([{
        freelancer_id: data.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 3600000).toISOString()
      }])

    setMessage(`Password reset link sent to ${email}. (Demo: Contact admin for password reset)`)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded mb-4"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/freelancer/login')}
            className="w-full mt-3 text-gray-600 text-sm hover:text-blue-600"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}
