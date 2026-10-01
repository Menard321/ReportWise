import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reportId } = await req.json()

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    })
    
    if (!report || report.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if an active link already exists
    let existingLink = await prisma.reviewLink.findFirst({
      where: { reportId, status: 'ACTIVE' }
    })

    if (!existingLink) {
      const token = crypto.randomBytes(16).toString('hex')
      existingLink = await prisma.reviewLink.create({
        data: {
          reportId,
          token,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      })
    }

    // Determine base URL dynamically or fallback to localhost
    const host = req.headers.get('host')
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const fullLink = `${protocol}://${host}/review/${existingLink.token}`

    return NextResponse.json({ link: fullLink })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate review link' }, { status: 500 })
  }
}
