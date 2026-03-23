import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Reference required' }, { status: 400 })
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  const data = await response.json()

  if (data.status && data.data.status === 'success') {
    return NextResponse.json({
      status: 'success',
      amount: data.data.amount / 100,
      reference: data.data.reference,
      customer: data.data.customer
    })
  }

  return NextResponse.json({ status: 'failed' }, { status: 400 })
}
