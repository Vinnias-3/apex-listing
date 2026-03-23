'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import PaystackButton from '../../components/PaystackButton'

interface Freelancer {
  id: string
  full_name: string
  business_name: string
  phone: string
  email: string
  location: string
  category: string
  description: string
  price_range: string
  experience: string
  status: string
  balance: number
  expires_at: string
}

export default function FreelancerDashboard() {
  const router = useRouter()
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [showRenewForm, setShowRenewForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [claimData, setClaimData] = useState({
    job_description: '',
    amount: ''
  })
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [editData, setEditData] = useState({
    business_name: '',
    phone: '',
    location: '',
    description: '',
    price_range: ''
  })
  const [claims, setClaims] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const freelancerId = localStorage.getItem('freelancer_id')
    if (!freelancerId) {
      router.push('/freelancer/login')
      return
    }
    fetchFreelancerData(freelancerId)
    fetchClaims(freelancerId)
    fetchWithdrawals(freelancerId)
  }, [])

  useEffect(() => {
    if (freelancer && showEditForm) {
      setEditData({
        business_name: freelancer.business_name || '',
        phone: freelancer.phone,
        location: freelancer.location,
        description: freelancer.description,
        price_range: freelancer.price_range || ''
      })
    }
  }, [freelancer, showEditForm])

  const fetchFreelancerData = async (id: string) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!error && data) {
      setFreelancer(data)
    }
    setLoading(false)
  }

  const fetchClaims = async (freelancerId: string) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setClaims(data)
    }
  }

  const fetchWithdrawals = async (freelancerId: string) => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setWithdrawals(data)
    }
  }

  const handleClaimJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    if (!claimData.amount || !claimData.job_description) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      setSubmitting(false)
      return
    }

    const freelancerId = localStorage.getItem('freelancer_id')
    
    const { error } = await supabase
      .from('claims')
      .insert([{
        freelancer_id: freelancerId,
        job_description: claimData.job_description,
        amount: parseInt(claimData.amount),
        status: 'pending'
      }])

    if (!error) {
      setMessage({ type: 'success', text: 'Job claim submitted! Admin will contact you.' })
      setShowClaimForm(false)
      setClaimData({ job_description: '', amount: '' })
      fetchClaims(freelancerId!)
    } else {
      setMessage({ type: 'error', text: 'Error submitting claim: ' + error.message })
    }
    setSubmitting(false)
  }

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const amount = parseInt(withdrawAmount)
    
    if (amount < 1000) {
      setMessage({ type: 'error', text: 'Minimum withdrawal is 1,000 KES' })
      setSubmitting(false)
      return
    }

    if (freelancer && amount > freelancer.balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' })
      setSubmitting(false)
      return
    }

    const freelancerId = localStorage.getItem('freelancer_id')
    
    const { error } = await supabase
      .from('withdrawals')
      .insert([{
        freelancer_id: freelancerId,
        amount: amount,
        status: 'pending'
      }])

    if (!error) {
      setMessage({ type: 'success', text: 'Withdrawal request submitted! Admin will process within 5-72 hours.' })
      setShowWithdrawForm(false)
      setWithdrawAmount('')
      fetchWithdrawals(freelancerId!)
    } else {
      setMessage({ type: 'error', text: 'Error submitting withdrawal: ' + error.message })
    }
    setSubmitting(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const freelancerId = localStorage.getItem('freelancer_id')
    
    const { error } = await supabase
      .from('listings')
      .update({
        business_name: editData.business_name,
        phone: editData.phone,
        location: editData.location,
        description: editData.description,
        price_range: editData.price_range
      })
      .eq('id', freelancerId)
    
    if (!error) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setShowEditForm(false)
      fetchFreelancerData(freelancerId!)
    } else {
      setMessage({ type: 'error', text: 'Error updating profile: ' + error.message })
    }
    setSubmitting(false)
  }

  const handlePaymentSuccess = async (reference: string) => {
    const freelancerId = localStorage.getItem('freelancer_id')
    
    await supabase
      .from('renewals')
      .insert([{
        freelancer_id: freelancerId,
        freelancer_name: freelancer?.full_name,
        amount: 500,
        status: 'pending'
      }])
    
    setMessage({ 
      type: 'success', 
      text: `Payment successful! Your renewal request has been submitted. Admin will extend your listing within 24 hours. Transaction ID: ${reference}` 
    })
    setShowRenewForm(false)
  }

  const handlePaymentClose = () => {
    setMessage({ type: 'error', text: 'Payment was cancelled. You can try again later.' })
    setShowRenewForm(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('freelancer_id')
    localStorage.removeItem('freelancer_name')
    router.push('/freelancer/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!freelancer) {
    return <div className="min-h-screen flex items-center justify-center">Freelancer not found</div>
  }

  const canWithdraw = freelancer.balance >= 1000
  const isExpired = freelancer.expires_at && new Date(freelancer.expires_at) < new Date()
  const daysLeft = freelancer.expires_at ? Math.ceil((new Date(freelancer.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  const nameParts = freelancer.full_name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">APEX Listing</h1>
            <p className="text-sm text-gray-500">Welcome, {freelancer.full_name}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {isExpired && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ⚠️ Your listing has expired. Clients cannot see your profile. Click "Renew Listing" below to pay 500 KES and reactivate for 4 months.
          </div>
        )}

        {!isExpired && daysLeft <= 30 && (
          <div className="mb-4 p-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
            ⏰ Your listing expires in {daysLeft} days. Click "Renew Listing" to extend for another 4 months (500 KES).
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-green-600">{freelancer.balance?.toLocaleString() || 0} KES</h3>
            <p className="text-gray-600">Available Balance</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-blue-600">{freelancer.status === 'active' ? 'Active' : freelancer.status}</h3>
            <p className="text-gray-600">Listing Status</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-purple-600">
              {freelancer.expires_at ? new Date(freelancer.expires_at).toLocaleDateString() : 'Set by admin'}
            </h3>
            <p className="text-gray-600">Expiry Date</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-orange-600">{isExpired ? 'Expired' : `${daysLeft} days`}</h3>
            <p className="text-gray-600">Time Remaining</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold">My Listing</h2>
            <button onClick={() => setShowEditForm(!showEditForm)} className="text-blue-600 hover:text-blue-800 text-sm">
              {showEditForm ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          {!showEditForm ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Business Name</p><p className="font-semibold">{freelancer.business_name || freelancer.full_name}</p></div>
                <div><p className="text-sm text-gray-500">Category</p><p className="font-semibold">{freelancer.category}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-semibold">{freelancer.phone}</p></div>
                <div><p className="text-sm text-gray-500">Location</p><p className="font-semibold">{freelancer.location}</p></div>
                <div><p className="text-sm text-gray-500">Price Range</p><p className="font-semibold">{freelancer.price_range || 'Price on request'}</p></div>
                <div className="md:col-span-2"><p className="text-sm text-gray-500">Description</p><p className="font-semibold">{freelancer.description}</p></div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Business Name" value={editData.business_name} onChange={(e) => setEditData({...editData, business_name: e.target.value})} className="p-2 border rounded" />
                  <input type="tel" placeholder="Phone Number *" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="p-2 border rounded" required />
                  <input type="text" placeholder="Location *" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} className="p-2 border rounded" required />
                  <input type="text" placeholder="Price Range" value={editData.price_range} onChange={(e) => setEditData({...editData, price_range: e.target.value})} className="p-2 border rounded" />
                  <textarea placeholder="Description *" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="p-2 border rounded md:col-span-2" rows={4} required />
                </div>
                <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={() => setShowClaimForm(!showClaimForm)} className="bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700">
            {showClaimForm ? 'Cancel' : '+ Claim Completed Job'}
          </button>
          <button onClick={() => setShowWithdrawForm(!showWithdrawForm)} disabled={!canWithdraw} className={`p-4 rounded-lg font-semibold ${canWithdraw ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}>
            {canWithdraw ? 'Request Withdrawal' : `Need ${(1000 - (freelancer.balance || 0)).toLocaleString()} KES more`}
          </button>
          <button onClick={() => setShowRenewForm(!showRenewForm)} className="bg-orange-600 text-white p-4 rounded-lg font-semibold hover:bg-orange-700">
            {showRenewForm ? 'Cancel' : 'Renew Listing (500 KES)'}
          </button>
        </div>

        {showClaimForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Claim Completed Job</h2>
            <form onSubmit={handleClaimJob} className="space-y-4">
              <textarea placeholder="Describe the job you completed (e.g., Designed logo for client John)" value={claimData.job_description} onChange={(e) => setClaimData({...claimData, job_description: e.target.value})} className="w-full p-3 border rounded" rows={4} required />
              <input type="number" placeholder="Amount client paid you (KES)" value={claimData.amount} onChange={(e) => setClaimData({...claimData, amount: e.target.value})} className="w-full p-3 border rounded" required />
              <p className="text-sm text-gray-500">Note: You will pay 8% commission to admin separately. Admin will contact you to verify.</p>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Submit Claim</button>
            </form>
          </div>
        )}

        {showWithdrawForm && canWithdraw && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <p className="text-lg font-semibold">Available Balance: {freelancer.balance?.toLocaleString()} KES</p>
              <input type="number" placeholder="Amount (Minimum 1,000 KES)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full p-3 border rounded" required min="1000" max={freelancer.balance} />
              <p className="text-sm text-gray-500">Withdrawals processed within 5-72 hours. Money sent to your M-Pesa.</p>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Request Withdrawal</button>
            </form>
          </div>
        )}

        {showRenewForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Renew Listing - 500 KES</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold mb-2">Payment Options:</p>
                <p className="text-sm text-gray-600 mb-3">
                  Pay 500 KES to renew your listing for another 4 months.
                </p>
              </div>
              
              <PaystackButton
                amount={500}
                email={freelancer.email}
                firstName={firstName}
                lastName={lastName}
                phone={freelancer.phone}
                onSuccess={handlePaymentSuccess}
                onClose={handlePaymentClose}
                buttonText="Pay 500 KES Now"
              />
              
              <p className="text-xs text-gray-500 text-center">
                After payment, your renewal request will be processed within 24 hours.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Claimed Jobs History</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Job Description</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                 </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-t">
                    <td className="p-3">{claim.job_description}</td>
                    <td className="p-3 font-semibold">{claim.amount.toLocaleString()} KES</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${claim.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'}`}>{claim.status}</span></td>
                    <td className="p-3">{new Date(claim.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">No claims yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Withdrawal History</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                 </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3 font-semibold">{w.amount.toLocaleString()} KES</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${w.status === 'paid' ? 'bg-green-100' : w.status === 'approved' ? 'bg-blue-100' : 'bg-yellow-100'}`}>{w.status}</span></td>
                    <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">No withdrawals yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
