'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

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
  registration_paid: boolean
  created_at: string
  expires_at: string
  password: string
}

interface Claim {
  id: string
  freelancer_id: string
  job_description: string
  amount: number
  status: string
  created_at: string
  listings?: {
    full_name: string
    business_name: string
    phone: string
  }
}

interface Withdrawal {
  id: string
  freelancer_id: string
  amount: number
  status: string
  created_at: string
  listings?: {
    full_name: string
    business_name: string
    phone: string
  }
}

interface Message {
  id: string
  freelancer_id: string
  freelancer_name: string
  visitor_name: string
  visitor_phone: string
  visitor_email: string
  message: string
  status: string
  posted_to_notification: boolean
  created_at: string
}

interface Notification {
  id: string
  content: string
  source_message_id: string
  status: string
  created_at: string
}

interface Renewal {
  id: string
  freelancer_id: string
  freelancer_name: string
  amount: number
  status: string
  created_at: string
  listings?: {
    full_name: string
    business_name: string
    phone: string
    expires_at: string
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddBalance, setShowAddBalance] = useState<string | null>(null)
  const [showClaims, setShowClaims] = useState(false)
  const [showWithdrawals, setShowWithdrawals] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRenewals, setShowRenewals] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/admin/check')
      if (!res.ok) {
        router.push('/admin/login')
      }
    }
    checkAuth()
    fetchFreelancers()
    fetchClaims()
    fetchWithdrawals()
    fetchMessages()
    fetchNotifications()
    fetchRenewals()
  }, [])

  const fetchFreelancers = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setFreelancers(data)
    }
    setLoading(false)
  }

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from('claims')
      .select('*, listings(full_name, business_name, phone)')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setClaims(data)
    }
  }

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*, listings(full_name, business_name, phone)')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setWithdrawals(data)
    }
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setMessages(data)
    }
  }

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setNotifications(data)
    }
  }

  const fetchRenewals = async () => {
    const { data, error } = await supabase
      .from('renewals')
      .select('*, listings(full_name, business_name, phone, expires_at)')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setRenewals(data)
    }
  }

  const handleAddFreelancer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    if (!formData.password) {
      alert('Password is required for freelancer login')
      setSubmitting(false)
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
      setShowAddForm(false)
      setFormData({
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
      fetchFreelancers()
      alert('Freelancer added successfully!')
    } else {
      alert('Error adding freelancer: ' + error.message)
    }
    setSubmitting(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      fetchFreelancers()
    } else {
      alert('Error updating status: ' + error.message)
    }
  }

  const handleAddBalance = async (id: string) => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      alert('Enter a valid amount')
      return
    }

    const amount = Number(balanceAmount)
    const freelancer = freelancers.find(f => f.id === id)
    const newBalance = (freelancer?.balance || 0) + amount

    const { error } = await supabase
      .from('listings')
      .update({ balance: newBalance })
      .eq('id', id)

    if (!error) {
      setShowAddBalance(null)
      setBalanceAmount('')
      fetchFreelancers()
      alert(`Added ${amount} KES to ${freelancer?.full_name}'s balance`)
    } else {
      alert('Error adding balance: ' + error.message)
    }
  }

  const handleVerifyClaim = async (claimId: string, freelancerId: string, amount: number) => {
    if (confirm(`Add ${amount} KES to freelancer balance?`)) {
      await supabase
        .from('claims')
        .update({ status: 'verified' })
        .eq('id', claimId)
      
      const { data: freelancer } = await supabase
        .from('listings')
        .select('balance')
        .eq('id', freelancerId)
        .single()
      
      const newBalance = (freelancer?.balance || 0) + amount
      
      await supabase
        .from('listings')
        .update({ balance: newBalance })
        .eq('id', freelancerId)
      
      fetchClaims()
      fetchFreelancers()
      alert(`Added ${amount} KES to freelancer balance`)
    }
  }

  const handleApproveWithdrawal = async (withdrawalId: string, freelancerId: string, amount: number) => {
    if (confirm(`Approve withdrawal of ${amount} KES? You will send money to freelancer via M-Pesa.`)) {
      await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawalId)
      
      const { data: freelancer } = await supabase
        .from('listings')
        .select('balance')
        .eq('id', freelancerId)
        .single()
      
      const newBalance = (freelancer?.balance || 0) - amount
      
      await supabase
        .from('listings')
        .update({ balance: newBalance })
        .eq('id', freelancerId)
      
      fetchWithdrawals()
      fetchFreelancers()
      alert(`Withdrawal approved. Send ${amount} KES to freelancer via M-Pesa.`)
    }
  }

  const handleMarkPaid = async (withdrawalId: string) => {
    await supabase
      .from('withdrawals')
      .update({ status: 'paid' })
      .eq('id', withdrawalId)
    
    fetchWithdrawals()
    alert('Withdrawal marked as paid')
  }

  const handlePostNotification = async (messageId: string, content: string) => {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        content: content,
        source_message_id: messageId,
        status: 'active'
      }])
    
    if (!error) {
      await supabase
        .from('messages')
        .update({ posted_to_notification: true })
        .eq('id', messageId)
      
      fetchMessages()
      fetchNotifications()
      alert('Posted to notification area')
    } else {
      alert('Error posting notification: ' + error.message)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (confirm('Delete this notification?')) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      
      fetchNotifications()
    }
  }

  const handleApproveRenewal = async (renewalId: string, freelancerId: string) => {
    if (confirm('Approve renewal? This will extend listing by 4 months.')) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 4)
      
      await supabase
        .from('listings')
        .update({ 
          expires_at: expiresAt.toISOString(),
          status: 'active'
        })
        .eq('id', freelancerId)
      
      await supabase
        .from('renewals')
        .update({ status: 'approved' })
        .eq('id', renewalId)
      
      fetchRenewals()
      fetchFreelancers()
      alert('Renewal approved! Listing extended by 4 months.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (!error) {
        fetchFreelancers()
      } else {
        alert('Error deleting: ' + error.message)
      }
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const pendingCount = freelancers.filter(f => f.status === 'pending').length
  const activeCount = freelancers.filter(f => f.status === 'active').length
  const totalBalance = freelancers.reduce((sum, f) => sum + (f.balance || 0), 0)
  const pendingClaims = claims.filter(c => c.status === 'pending').length
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length
  const unreadMessages = messages.filter(m => !m.posted_to_notification).length
  const pendingRenewals = renewals.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">APEX Listing Admin</h1>
            <p className="text-sm text-gray-500">Manage Freelancers, Claims, Withdrawals, Messages & Renewals</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-blue-600">{freelancers.length}</h3><p className="text-gray-600">Total Freelancers</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-yellow-600">{pendingCount}</h3><p className="text-gray-600">Pending Approval</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-green-600">{activeCount}</h3><p className="text-gray-600">Active Listings</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-purple-600">{totalBalance.toLocaleString()} KES</h3><p className="text-gray-600">Total Balance</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-orange-600">{pendingClaims + pendingWithdrawals}</h3><p className="text-gray-600">Pending Actions</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-teal-600">{unreadMessages}</h3><p className="text-gray-600">New Messages</p></div>
          <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-2xl font-bold text-indigo-600">{pendingRenewals}</h3><p className="text-gray-600">Pending Renewals</p></div>
        </div>

        {/* Add Freelancer Button */}
        <div className="mb-6">
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {showAddForm ? 'Cancel' : '+ Add New Freelancer'}
          </button>
        </div>

        {/* Add Freelancer Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Freelancer</h2>
            <form onSubmit={handleAddFreelancer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="p-2 border rounded" required />
                <input type="text" placeholder="Business Name" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="p-2 border rounded" />
                <input type="tel" placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="p-2 border rounded" required />
                <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" required />
                <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="p-2 border rounded" required />
                <input type="text" placeholder="Category *" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="p-2 border rounded" required />
                <textarea placeholder="Description *" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="p-2 border rounded md:col-span-2" rows={3} required />
                <input type="text" placeholder="Price Range" value={formData.price_range} onChange={(e) => setFormData({...formData, price_range: e.target.value})} className="p-2 border rounded" />
                <input type="text" placeholder="Experience" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="p-2 border rounded" />
                <input type="password" placeholder="Password *" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="p-2 border rounded" required />
              </div>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">{submitting ? 'Saving...' : 'Save Freelancer'}</button>
            </form>
          </div>
        )}

        {/* Freelancers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">All Freelancers</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Balance</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {freelancers.map((f) => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="p-3"><div className="font-semibold">{f.full_name}</div><div className="text-sm text-gray-500">{f.business_name || 'Individual'}</div></td>
                    <td className="p-3"><div>{f.phone}</div><div className="text-sm text-gray-500">{f.email}</div><div className="text-xs text-gray-400">{f.location}</div></td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{f.category}</span></td>
                    <td className="p-3"><div className="font-bold text-green-600">{f.balance?.toLocaleString() || 0} KES</div><button onClick={() => setShowAddBalance(f.id)} className="text-xs text-blue-600 hover:underline">Add Earnings</button></td>
                    <td className="p-3"><select value={f.status} onChange={(e) => handleUpdateStatus(f.id, e.target.value)} className={`px-2 py-1 rounded text-sm border ${f.status === 'active' ? 'bg-green-100' : f.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select></td>
                    <td className="p-3"><button onClick={() => handleDelete(f.id, f.full_name)} className="text-red-600 hover:text-red-800 text-sm">Delete</button></td>
                  </tr>
                ))}
                {showAddBalance && (
                  <tr className="bg-yellow-50">
                    <td colSpan={6} className="p-4">
                      <div className="flex gap-2">
                        <input type="number" placeholder="Amount" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="p-2 border rounded w-40" />
                        <button onClick={() => handleAddBalance(showAddBalance)} className="bg-green-600 text-white px-4 py-2 rounded">Confirm</button>
                        <button onClick={() => { setShowAddBalance(null); setBalanceAmount(''); }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
                {freelancers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">No freelancers yet. Click "Add New Freelancer" to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claims Section */}
        <div className="mt-8">
          <button onClick={() => setShowClaims(!showClaims)} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 mb-4">{showClaims ? 'Hide' : 'Show'} Claims ({pendingClaims} pending)</button>
          {showClaims && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Job Claims from Freelancers</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Freelancer</th>
                      <th className="p-3 text-left">Job Description</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-t">
                        <td className="p-3"><div className="font-semibold">{claim.listings?.full_name}</div><div className="text-sm text-gray-500">{claim.listings?.business_name}</div><div className="text-xs text-gray-400">{claim.listings?.phone}</div></td>
                        <td className="p-3 max-w-xs">{claim.job_description}</td>
                        <td className="p-3 font-semibold text-green-600">{claim.amount.toLocaleString()} KES</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${claim.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{claim.status}</span></td>
                        <td className="p-3">{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td className="p-3">{claim.status === 'pending' && (<button onClick={() => handleVerifyClaim(claim.id, claim.freelancer_id, claim.amount)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Verify & Add</button>)}</td>
                      </tr>
                    ))}
                    {claims.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">No claims yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawals Section */}
        <div className="mt-8">
          <button onClick={() => setShowWithdrawals(!showWithdrawals)} className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 mb-4">{showWithdrawals ? 'Hide' : 'Show'} Withdrawals ({pendingWithdrawals} pending)</button>
          {showWithdrawals && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Withdrawal Requests</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Freelancer</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="border-t">
                        <td className="p-3"><div className="font-semibold">{w.listings?.full_name}</div><div className="text-sm text-gray-500">{w.listings?.business_name}</div></td>
                        <td className="p-3">{w.listings?.phone}</td>
                        <td className="p-3 font-semibold text-orange-600">{w.amount.toLocaleString()} KES</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${w.status === 'paid' ? 'bg-green-100' : w.status === 'approved' ? 'bg-blue-100' : 'bg-yellow-100'}`}>{w.status}</span></td>
                        <td className="p-3">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          {w.status === 'pending' && (<button onClick={() => handleApproveWithdrawal(w.id, w.freelancer_id, w.amount)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Approve</button>)}
                          {w.status === 'approved' && (<button onClick={() => handleMarkPaid(w.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Mark Paid</button>)}
                          {w.status === 'paid' && (<span className="text-green-600 text-sm">✓ Paid</span>)}
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">No withdrawal requests yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Messages Section */}
        <div className="mt-8">
          <button onClick={() => setShowMessages(!showMessages)} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 mb-4">{showMessages ? 'Hide' : 'Show'} Messages ({unreadMessages} unread)</button>
          {showMessages && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Visitor Messages</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Visitor</th>
                      <th className="p-3 text-left">For Freelancer</th>
                      <th className="p-3 text-left">Message</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id} className="border-t hover:bg-gray-50">
                        <td className="p-3"><div className="font-semibold">{msg.visitor_name}</div><div className="text-sm">{msg.visitor_phone}</div><div className="text-xs text-gray-500">{msg.visitor_email}</div></td>
                        <td className="p-3">{msg.freelancer_name}</td>
                        <td className="p-3 max-w-md"><div className="whitespace-pre-wrap">{msg.message}</div></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${msg.posted_to_notification ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{msg.posted_to_notification ? 'Posted' : 'Pending'}</span></td>
                        <td className="p-3">{new Date(msg.created_at).toLocaleString()}</td>
                        <td className="p-3">
                          {!msg.posted_to_notification && (
                            <button onClick={() => handlePostNotification(msg.id, `📩 New inquiry for ${msg.freelancer_name}: "${msg.message.substring(0, 100)}..." Contact: ${msg.visitor_name} (${msg.visitor_phone})`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Post to Notification</button>
                          )}
                          {msg.posted_to_notification && <span className="text-green-600 text-sm">✓ Posted</span>}
                        </td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">No messages yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="mt-8">
          <button onClick={() => setShowNotifications(!showNotifications)} className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 mb-4">{showNotifications ? 'Hide' : 'Show'} Notification Area ({notifications.length} active)</button>
          {showNotifications && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Public Notifications</h2></div>
              <div className="divide-y">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <p className="flex-1">{n.content}</p>
                    <button onClick={() => handleDeleteNotification(n.id)} className="text-red-500 hover:text-red-700 text-sm ml-4">Delete</button>
                  </div>
                ))}
                {notifications.length === 0 && <p className="p-6 text-center text-gray-500">No notifications yet. Post messages from the Messages section.</p>}
              </div>
            </div>
          )}
        </div>

        {/* Renewals Section */}
        <div className="mt-8 mb-8">
          <button onClick={() => setShowRenewals(!showRenewals)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 mb-4">{showRenewals ? 'Hide' : 'Show'} Renewals ({pendingRenewals} pending)</button>
          {showRenewals && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold">Renewal Requests (500 KES)</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Freelancer</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Current Expiry</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3"><div className="font-semibold">{r.listings?.full_name}</div><div className="text-sm text-gray-500">{r.listings?.business_name}</div></td>
                        <td className="p-3">{r.listings?.phone}</td>
                        <td className="p-3">{r.listings?.expires_at ? new Date(r.listings.expires_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${r.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>{r.status}</span></td>
                        <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          {r.status === 'pending' && (<button onClick={() => handleApproveRenewal(r.id, r.freelancer_id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve & Extend</button>)}
                          {r.status === 'approved' && <span className="text-green-600 text-sm">✓ Extended</span>}
                        </td>
                      </tr>
                    ))}
                    {renewals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-500">No renewal requests yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
