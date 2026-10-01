import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string
    const reportSectionId = formData.get('reportSectionId') as string
    const reviewerName = formData.get('reviewerName') as string
    const text = formData.get('text') as string

    if (!token || !reportSectionId || !text) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Authenticate submission via the implicit capabilities of the token
    const link = await prisma.reviewLink.findUnique({
      where: { token }
    })

    if (!link || link.revoked || link.status !== 'ACTIVE' || (link.expiresAt && link.expiresAt < new Date())) {
      return NextResponse.json({ error: 'Link invalid' }, { status: 401 })
    }

    // Verify section belongs to link's report
    const section = await prisma.reportSection.findUnique({
      where: { id: reportSectionId }
    })
    
    if (!section || section.reportId !== link.reportId) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    // Persist comment
    await prisma.comment.create({
      data: {
        reportSectionId,
        reviewerName: reviewerName || 'Reviewer',
        text
      }
    })

    // Redirect back to same page to refresh UI
    return NextResponse.redirect(new URL(`/review/${token}`, req.url), 303)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }
}
