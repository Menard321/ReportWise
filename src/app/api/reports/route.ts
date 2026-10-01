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
    const reportTypeId = formData.get('reportTypeId') as string
    const institutionId = formData.get('institutionId') as string

    if (!reportTypeId || !institutionId) {
      return NextResponse.json({ error: 'Missing type or institution' }, { status: 400 })
    }

    // Default title
    const reportType = await prisma.reportType.findUnique({ where: { id: reportTypeId } })
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } })

    // Find if the Institution has a linked formatting profile
    const instProfile = await prisma.institutionProfile.findFirst({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    })

    const newReport = await prisma.report.create({
      data: {
        userId: session.userId,
        reportTypeId,
        institutionProfileId: instProfile?.id || null,
        title: `Draft: ${institution?.code} ${reportType?.name}`,
        status: 'DRAFT',
      }
    })

    // Now redirect user to Cover Details using the reportId.
    return NextResponse.redirect(new URL(`/editor/${newReport.id}/cover`, req.url), 303)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
