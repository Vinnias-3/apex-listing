'use client'

import { useState } from 'react'

interface PaystackButtonProps {
  amount: number
  email: string
  firstName: string
  lastName: string
  phone: string
  onSuccess: (reference: string) => void
  onClose: () => void
  buttonText?: string
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function PaystackButton({
  amount,
  email,
  firstName,
  lastName,
  phone,
  onSuccess,
  onClose,
  buttonText = 'Pay Now'
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePay = () => {
    setLoading(true)

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

    if (!publicKey) {
      alert('Paystack key not configured. Please contact admin.')
      setLoading(false)
      return
    }

    if (typeof window !== 'undefined' && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amount * 100, // Paystack uses kobo (500 KES = 50000 kobo)
        currency: 'KES',
        ref: `APEX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: phone
            }
          ]
        },
        callback: (response: any) => {
          setLoading(false)
          onSuccess(response.reference)
        },
        onClose: () => {
          setLoading(false)
          onClose()
        }
      })
      
      handler.openIframe()
    } else {
      alert('Paystack not loaded. Please refresh the page.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  )
}
