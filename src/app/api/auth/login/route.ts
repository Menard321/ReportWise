import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    if (!bodyText) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
    }
    
    const { email, password } = JSON.parse(bodyText)
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }
    
    const token = await AuthService.login(email, password)
    
    if (!token) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    
    const response = NextResponse.json({ success: true })
    
    // Safely apply secure cookies directly to the outgoing framework response
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    
    return response
  } catch (error: any) {
    console.error('[Auth Login Error]:', error.message || error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
