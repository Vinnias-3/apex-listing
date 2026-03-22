'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ContactModalProps {
  listingId: string
  listingName: string
  onClose: () => void
}

export default function ContactModal({ listingId, listingName, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase
      .from('messages')
      .insert([{
        freelancer_id: listingId,
        freelancer_name: listingName,
        visitor_name: formData.visitor_name,
        visitor_phone: formData.visitor_phone,
        visitor_email: formData.visitor_email || null,
        message: formData.message,
        status: 'unread',
        posted_to_notification: false
      }])

    if (!error) {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="text-center p-4">
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg mb-4">
          ✓ Your request has been successfully sent!
        </div>
        <p className="text-gray-700 mb-4">
          We will process your request within <strong>5 hours</strong> and connect you with {listingName}.
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Check your email and phone for updates.
        </p>
        <p className="text-gray-500 text-xs">
          Thank you for choosing APEX Listing Company.
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Contact {listingName}</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name *</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={formData.visitor_name}
          onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
        <textarea
          placeholder="Describe the service you need. Be specific about what you're looking for."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {submitting ? 'Sending...' : 'Send Request'}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Your request will be processed within 5 hours. We'll contact you via phone or email.
      </p>
    </form>
  )
}
