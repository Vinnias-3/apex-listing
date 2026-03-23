'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [reference, setReference] = useState('')

  useEffect(() => {
    const ref = searchParams.get('reference')
    const trxref = searchParams.get('trxref')
    
    const paymentRef = ref || trxref
    
    if (paymentRef) {
      setReference(paymentRef)
      // Verify payment with your server
      fetch(`/api/paystack/verify?reference=${paymentRef}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setStatus('success')
          } else {
            setStatus('error')
          }
        })
        .catch(() => setStatus('error'))
    } else {
      setStatus('error')
    }
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Your payment of 500 KES has been received.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Transaction Reference: <span className="font-mono">{reference}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Your listing will be activated within 24 hours after admin approval.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Return to Homepage
            </Link>
            <Link
              href="/freelancer/login"
              className="block w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
            >
              Go to Freelancer Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-red-600">✗</span>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again.
        </p>
        <Link
          href="/"
          className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}
