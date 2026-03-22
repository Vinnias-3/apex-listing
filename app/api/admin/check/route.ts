import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin-auth')?.value === 'true'
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Check auth error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
