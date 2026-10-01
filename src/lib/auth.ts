import { cookies } from 'next/headers'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-changeme'

export async function getUserSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) return null
  
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as { userId: string, role: string }
  } catch {
    return null
  }
}
