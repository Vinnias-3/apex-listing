'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    email: '',
    location: '',
    category: '',
    description: '',
    price_range: '',
    experience: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const categories = [
    'Graphic Design', 'Web Development', 'Plumbing', 'Photography',
    'Writing', 'Cleaning', 'Electrician', 'Catering', 'Digital Marketing',
    'Video Editing', 'Translation', 'Event Planning'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data: existing } = await supabase
      .from('listings')
      .select('email')
      .eq('email', formData.email)
      .single()

    if (existing) {
      setError('Email already registered. Please login or contact admin.')
      setLoading(false)
      return
    }

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 4)

    const { error } = await supabase
      .from('listings')
      .insert([{
        full_name: formData.full_name,
        business_name: formData.business_name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        category: formData.category,
        description: formData.description,
        price_range: formData.price_range,
        experience: formData.experience,
        password: formData.password,
        status: 'pending',
        registration_paid: false,
        balance: 0,
        expires_at: expiresAt.toISOString()
      }])

    if (!error) {
      setSuccess('Registration submitted! Admin will review and activate your account. You will receive an email when approved.')
      setTimeout(() => router.push('/freelancer/login'), 5000)
    } else {
      setError('Registration failed: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Freelancer Registration</h1>
          <p className="text-center text-gray-600 mb-6">Registration fee: 500 KES (pay after approval)</p>
          
          {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name *" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="p-2 border rounded" required />
              <input type="text" placeholder="Business Name" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="p-2 border rounded" />
              <input type="tel" placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="p-2 border rounded" required />
              <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" required />
              <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="p-2 border rounded" required />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="p-2 border rounded" required>
                <option value="">Select Category *</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <textarea placeholder="Description of Services *" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="p-2 border rounded md:col-span-2" rows={3} required />
              <input type="text" placeholder="Price Range (e.g., 1,000 - 5,000 KES)" value={formData.price_range} onChange={(e) => setFormData({...formData, price_range: e.target.value})} className="p-2 border rounded" />
              <input type="text" placeholder="Years of Experience" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="p-2 border rounded" />
              <input type="password" placeholder="Password *" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="p-2 border rounded" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700">{loading ? 'Submitting...' : 'Register'}</button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <button onClick={() => router.push('/freelancer/login')} className="text-blue-600 hover:underline">Login here</button>
          </p>
        </div>
      </div>
    </div>
  )
}
