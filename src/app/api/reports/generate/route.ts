import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key-for-builds'
})

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId, userId: session.userId },
      include: {
        reportType: true,
        inputs: true,
        institutionProfile: true
      }
    })

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Find the template
    let template = null
    if (report.institutionProfile?.institutionId) {
       template = await prisma.template.findFirst({
          where: { 
            reportTypeKey: report.reportType.key, 
            institutionId: report.institutionProfile.institutionId,
            version: report.templateVersion 
          } as any
       })
    }
    
    if (!template) {
       template = await prisma.template.findFirst({
          where: { reportTypeKey: report.reportType.key, version: report.templateVersion } as any
       })
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found for generation' }, { status: 500 })
    }

    let schema = { sections: [] as any[] }
    try {
      schema = JSON.parse(template.schemaJson as string)
    } catch (e) {}

    const sections = schema.sections || []

    const instructions = report.inputs[0]?.instructionText || 'No specific instructions provided.'
    const language = report.language === 'sw' ? 'Swahili' : 'English'

    // Mock generating for each section concurrently if no API key
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY

    const generationTasks = sections.map(async (sec: any) => {
      let content = ''

      if (!hasAnthropicKey) {
        content = `<p><strong>MOCK AI GENERATED CONTENT:</strong> This is a drafted response for the section: <em>${sec.title}</em>.</p>
                   <p>User Instructions provided: ${instructions}</p>
                   <p>Please provide a valid Anthropic API key to unlock the actual Claude 3.5 generation!</p>`
      } else {
        const promptText = `
          You are an expert academic and professional report writer writing a complete document for the user.
          You are currently drafting the section titled: "${sec.title}".
          
          Context/Instructions:
          ${instructions}
          
          Guidelines:
          1. Write 2-3 comprehensive paragraphs (using HTML format like <p>, <ul>, <strong>) that perfectly fit the section.
          2. Maintain a professional, academic tone.
          3. Ensure the output language is ${language}.
          4. Only return the final HTML snippet. Do not use markdown wrappers like \`\`\`html.
        `

        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            temperature: 0.3,
            messages: [
              { role: 'user', content: promptText }
            ]
          })
          content = (response.content[0] as any)?.text || ''
        } catch (err) {
          console.error(`Failed to generate ${sec.key}`, err)
          content = `<p>Error generating this section.</p>`
        }
      }

      // Upsert into ReportSection
      await prisma.reportSection.upsert({
        where: {
          reportId_sectionKey: {
            reportId: report.id,
            sectionKey: sec.key
          }
        },
        update: {
          content,
          wordCount: content.split(/\s+/).length,
          draftStatus: 'COMPLETED'
        },
        create: {
          reportId: report.id,
          sectionKey: sec.key,
          content,
          wordCount: content.split(/\s+/).length,
          draftStatus: 'COMPLETED'
        }
      })
    })

    await Promise.all(generationTasks)

    // Update Report Progress
    await prisma.report.update({
      where: { id: report.id },
      data: { progress: 50 } // Indicating drafted
    })

    return NextResponse.json({ success: true, message: 'Report sections generated successfully' })

  } catch (error) {
    console.error('[API Report Generate Error]:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
