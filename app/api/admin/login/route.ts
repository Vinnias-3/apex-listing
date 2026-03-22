import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'apexadmin123'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (password === ADMIN_PASSWORD) {
      const cookieStore = await cookies()
      cookieStore.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax'
      })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
