import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const event = body.event

  // Only process successful charges
  if (event === 'charge.success') {
    const data = body.data
    const reference = data.reference
    const amount = data.amount / 100
    const customerEmail = data.customer.email
    const customerPhone = data.customer.phone

    console.log(`Payment received: ${reference} - ${amount} KES from ${customerEmail}`)

    // Find pending freelancer with this email
    const { data: freelancer, error } = await supabase
      .from('listings')
      .select('id, full_name, status')
      .eq('email', customerEmail)
      .eq('status', 'pending')
      .single()

    if (freelancer && !error) {
      // Update freelancer to active
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 4)

      await supabase
        .from('listings')
        .update({
          status: 'active',
          registration_paid: true,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', freelancer.id)

      // Record payment
      await supabase
        .from('payments')
        .insert([{
          transaction_id: reference,
          amount: amount,
          email: customerEmail,
          phone: customerPhone,
          freelancer_id: freelancer.id,
          status: 'completed'
        }])

      console.log(`Freelancer ${freelancer.full_name} activated`)
    }

    // Also handle renewal payments
    const { data: renewal, error: renewalError } = await supabase
      .from('renewals')
      .select('id, freelancer_id, listings(email)')
      .eq('status', 'pending')
      .single()

    if (renewal && !renewalError) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 4)

      await supabase
        .from('listings')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', renewal.freelancer_id)

      await supabase
        .from('renewals')
        .update({ status: 'approved' })
        .eq('id', renewal.id)

      console.log(`Renewal approved for freelancer`)
    }
  }

  return NextResponse.json({ received: true })
}
