import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthService } from '@/modules/auth/auth.service'
import fs from 'fs'

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    if (!bodyText) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
    }
    
    const { email, firstName, lastName, password, accountType } = JSON.parse(bodyText)
    
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    const token = await AuthService.register(email, firstName, lastName, password, accountType)
    
    const response = NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 })
    
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
    console.error('[Auth Register Error]:', error.message || error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error while creating account' },
      { status: 500 }
    )
  }
}
