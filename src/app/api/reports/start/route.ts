import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    
    const title = formData.get('title') as string
    const reportTypeId = formData.get('reportTypeId') as string
    const universityId = formData.get('universityId') as string
    const customUniversity = formData.get('customUniversity') as string
    const pageTarget = parseInt(formData.get('pageTarget') as string) || 40
    const instructions = formData.get('instructions') as string

    // Basic validation
    if (!title && !Array.from(formData.keys()).some(k => k.startsWith('file_'))) {
      return NextResponse.json({ error: 'Title or files are required' }, { status: 400 })
    }
    if (!reportTypeId) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }

    // 1. Create the base Report
    const report = await prisma.report.create({
      data: {
        userId: session.userId,
        title: title || 'Untitled Report',
        targetPages: pageTarget,
        status: 'DRAFT',
        reportTypeId,
      },
    })
    
    // 2. Mock processing of uploaded files (Phase 1)
    // Extract everything that is a file from the formData map
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('file_'))
    
    for (const [key, value] of fileEntries) {
      const file = value as File
      const labelDataRaw = formData.get(`label_${key}`) as string
      const label = labelDataRaw || 'Other'

      // Mock Storage Path
      const mockFileUrl = `/mock-uploads/${Date.now()}_${file.name}`

      await prisma.inputFile.create({
        data: {
          userId: session.userId,
          fileUrl: mockFileUrl,
          label: label,
          usedFor: 'content',
          readStatus: 'PENDING'
        }
      })
    }

    // 3. Create the ReportInput instruction log
    if (instructions) {
      await prisma.reportInput.create({
        data: {
          reportId: report.id,
          instructionText: instructions,
          status: 'PENDING'
        }
      })
    }

    return NextResponse.json({ success: true, reportId: report.id })
    
  } catch (error: any) {
    console.error('[API Smart Start Error]:', error)
    return NextResponse.json({ error: 'Failed to build report pipeline' }, { status: 500 })
  }
}
