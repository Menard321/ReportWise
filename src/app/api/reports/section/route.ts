import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reportId, sectionKey, content } = await req.json()

    // Ensure the report belongs to user
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    })
    
    if (!report || report.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert section content
    await prisma.reportSection.upsert({
      where: { reportId_sectionKey: { reportId, sectionKey } },
      update: { content },
      create: { reportId, sectionKey, content }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save section' }, { status: 500 })
  }
}
