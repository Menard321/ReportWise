import { NextResponse } from 'next/server'
import { AuthService } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const { identifier, name, accountType } = await req.json()
    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 })
    }
    
    // In production, implement rate limiting here. Let's send the mock OTP
    await AuthService.sendOtp(identifier, name, accountType)
    
    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
