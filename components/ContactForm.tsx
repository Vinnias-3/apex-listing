'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ContactFormProps {
  freelancerId: string
  freelancerName: string
}

export default function ContactForm({ freelancerId, freelancerName }: ContactFormProps) {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error } = await supabase
      .from('messages')
      .insert([{
        freelancer_id: freelancerId,
        freelancer_name: freelancerName,
        visitor_name: formData.visitor_name,
        visitor_phone: formData.visitor_phone,
        visitor_email: formData.visitor_email || null,
        message: formData.message,
        status: 'unread',
        posted_to_notification: false
      }])

    if (!error) {
      setSubmitted(true)
      setFormData({
        visitor_name: '',
        visitor_phone: '',
        visitor_email: '',
        message: ''
      })
    } else {
      setError('Failed to send message. Please try again.')
      console.error('Error:', error)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg text-center">
        <p className="font-semibold">✓ Message Sent!</p>
        <p className="text-sm mt-1">Admin will review and post to notification area.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={formData.visitor_name}
          onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone Number *</label>
        <input
          type="tel"
          placeholder="07XX XXX XXX"
          value={formData.visitor_phone}
          onChange={(e) => setFormData({...formData, visitor_phone: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email (Optional)</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={formData.visitor_email}
          onChange={(e) => setFormData({...formData, visitor_email: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
        <textarea
          placeholder="What service do you need? Please be specific."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-2 rounded text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your message will be reviewed by admin and posted to the notification area.
      </p>
    </form>
  )
}
