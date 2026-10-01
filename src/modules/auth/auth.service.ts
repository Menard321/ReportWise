import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-changeme'

export class AuthService {
  /**
   * Mock OTP Send
   * In a real implementation this would call an SMS/Email aggregator
   */
  static async sendOtp(identifier: string, name?: string, accountType?: string): Promise<string> {
    // For mock, we always generate '123456', but we simulate DB logic.
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    })
    
    // Create transient user if they don't exist yet
    if (!user) {
      const isEmail = identifier.includes('@')
      user = await prisma.user.create({
        data: {
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          name: name || null,
          accountType: accountType || null
        },
      })
    }
    
    // Simulate sending OTP
    const mockOtp = '123456'
    console.log(`[AUTH MOCK] OTP for ${identifier} is ${mockOtp}`)
    
    return mockOtp
  }

  static async verifyOtp(identifier: string, code: string): Promise<string | null> {
    if (code !== '123456') return null // Only accept the mock code

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    })

    if (!user) return null

    // Sign JWT
    return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    } catch {
      return null
    }
  }
}
