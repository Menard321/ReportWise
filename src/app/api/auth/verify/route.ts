import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json()
    if (!identifier || !code) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const token = await AuthService.verifyOtp(identifier, code)
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
