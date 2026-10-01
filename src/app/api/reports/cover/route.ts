import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const formData = await req.formData()
    const reportId = formData.get('reportId') as string
    const title = formData.get('title') as string
    const authors = formData.get('authors') as string
    const regNumber = formData.get('regNumber') as string
    const department = formData.get('department') as string
    const supervisor = formData.get('supervisor') as string
    const institutionProfileId = formData.get('institutionProfileId') as string

    if (!reportId || !title || !institutionProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ownership
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    })

    if (!report || report.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update Report
    const coverData = {
      authors,
      regNumber,
      department,
      supervisor
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
        institutionProfileId,
        coverDataJson: JSON.stringify(coverData),
        progress: 10 // increment progress
      }
    })

    // Redirect to Wizard Editor
    return NextResponse.redirect(new URL(`/editor/${reportId}/wizard`, req.url), 303)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update cover' }, { status: 500 })
  }
}
