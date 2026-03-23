'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import PaystackButton from '../../../components/PaystackButton'

export default function Register() {
  const router = useRouter()
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
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [registeredFreelancer, setRegisteredFreelancer] = useState<{ id: string; email: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = [
    'Graphic Design', 'Web Development', 'Plumbing', 'Photography',
    'Writing', 'Cleaning', 'Electrician', 'Catering', 'Digital Marketing',
    'Video Editing', 'Translation', 'Event Planning'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if email exists
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

    const { data, error } = await supabase
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
      .select()
      .single()

    if (!error && data) {
      setRegisteredFreelancer({
        id: data.id,
        email: data.email,
        name: data.full_name
      })
      setStep('payment')
    } else {
      setError('Registration failed: ' + error?.message)
    }
    setLoading(false)
  }

  const handlePaymentSuccess = async (reference: string) => {
    // Payment successful, redirect to callback page
    router.push(`/payment/callback?reference=${reference}`)
  }

  const handlePaymentClose = () => {
    // User closed payment modal
    setError('Payment was cancelled. You can pay later from your dashboard.')
  }

  if (step === 'payment' && registeredFreelancer) {
    const nameParts = registeredFreelancer.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Complete Payment</h1>
            <p className="text-center text-gray-600 mb-6">
              Pay 500 KES to activate your listing
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Freelancer: <span className="font-semibold">{registeredFreelancer.name}</span></p>
              <p className="text-sm text-gray-600">Email: <span className="font-semibold">{registeredFreelancer.email}</span></p>
              <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-green-600">500 KES</span></p>
            </div>
            <PaystackButton
              amount={500}
              email={registeredFreelancer.email}
              firstName={firstName}
              lastName={lastName}
              phone={formData.phone}
              onSuccess={handlePaymentSuccess}
              onClose={handlePaymentClose}
              buttonText="Pay 500 KES Now"
            />
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            <p className="text-xs text-gray-500 text-center mt-4">
              Your listing will be activated after payment is confirmed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Freelancer Registration</h1>
          <p className="text-center text-gray-600 mb-6">Registration fee: 500 KES (pay after registration)</p>
          
          {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Business Name (optional)"
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Location (City/Town) *"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category *</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <textarea
                placeholder="Description of Services *"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="p-2 border rounded md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <input
                type="text"
                placeholder="Price Range (e.g., 1,000 - 5,000 KES)"
                value={formData.price_range}
                onChange={(e) => setFormData({...formData, price_range: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Years of Experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <button onClick={() => router.push('/freelancer/login')} className="text-blue-600 hover:underline">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
