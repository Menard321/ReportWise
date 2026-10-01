import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, password, accountType } = await req.json()
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    const token = await AuthService.register(email, firstName, lastName, password, accountType)
    
    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    
    return NextResponse.json({ success: true, message: 'Account created successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 })
  }
}
