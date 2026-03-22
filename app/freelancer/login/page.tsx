'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FreelancerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simple email + password check against your listings table
    const { data, error } = await supabase
      .from('listings')
      .select('id, full_name, email, password')
      .eq('email', email)
      .single()

    if (error || !data) {
      setError('Email not found. Contact admin.')
      setLoading(false)
      return
    }

    // Simple password check (for now, store password in database)
    if (data.password !== password) {
      setError('Invalid password')
      setLoading(false)
      return
    }

    // Store freelancer session
    localStorage.setItem('freelancer_id', data.id)
    localStorage.setItem('freelancer_name', data.full_name)
    
    router.push('/freelancer/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Freelancer Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm mt-4">
  <button onClick={() => router.push('/freelancer/forgot-password')} className="text-blue-600 hover:underline">
    Forgot Password?
  </button>
</p>
<p className="text-center text-sm mt-2">
  Don't have an account?{' '}
  <button onClick={() => router.push('/freelancer/register')} className="text-blue-600 hover:underline">
    Register as Freelancer
  </button>
</p>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? Contact admin to register.
        </p>
      </div>
    </div>
  )
}
