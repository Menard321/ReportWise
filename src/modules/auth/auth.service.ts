import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-changeme'

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(salt + ':' + derivedKey.toString('hex'))
    })
  })
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':')
    if (!salt || !key) {
      // Handle the case where old unhashed passwords somehow end up here
      resolve(false)
      return
    }
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err)
      resolve(key === derivedKey.toString('hex'))
    })
  })
}

export class AuthService {
  /**
   * Register a new user with email and password
   */
  static async register(email: string, firstName: string, lastName: string, password: string, accountType: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`.trim(),
        passwordHash,
        accountType
      },
    })

    // Sign JWT
    return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<string | null> {
    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return null // either user doesn't exist or registered via old OTP method without a password
    }

    // Compare passwords
    const isValid = await verifyPassword(password, user.passwordHash)
    
    if (!isValid) {
      return null
    }

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

