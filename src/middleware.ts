import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-changeme'

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')
  
  if (isProtected) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jose.jwtVerify(sessionToken, secret)
    } catch (e) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If already logged in, redirect away from login
  if (isAuthRoute && sessionToken) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jose.jwtVerify(sessionToken, secret)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Token expired, allow to proceed to login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}
