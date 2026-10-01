import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reportId, text, photoUrl, audioUrl, caption, tags, timestamp } = await req.json()

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report || report.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.fieldEntry.create({
      data: {
        reportId, text, photoUrl, audioUrl, caption,
        tags: tags ? JSON.stringify(tags) : null,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get('reportId')

    if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report || report.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const entries = await prisma.fieldEntry.findMany({
      where: { reportId },
      orderBy: { timestamp: 'desc' }
    })

    return NextResponse.json({ entries })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
