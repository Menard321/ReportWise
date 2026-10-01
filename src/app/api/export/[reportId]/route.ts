import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, TableOfContents } from 'docx'

export async function GET(req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const session = await getUserSession()
    if (!session) return new NextResponse('Unauthorized', { status: 401 })

    const { reportId } = await params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'docx'

    const report = await prisma.report.findUnique({
      where: { id: reportId, userId: session.userId },
      include: { 
        sections: true,
        institutionProfile: { include: { institution: true } }
      }
    })

    if (!report) return new NextResponse('Report not found', { status: 404 })
    if (report.status !== 'PAID') return new NextResponse('Payment Required', { status: 402 })

    let coverData = { title: report.title, authors: '', department: '', supervisor: '', regNumber: '' }
    if (report.coverDataJson) {
       try { coverData = { ...coverData, ...JSON.parse(report.coverDataJson) } } catch {}
    }

    let formatConf = { fontFamily: 'Times New Roman', fontSize: 12, lineSpacing: 2.0, margins: { top: 1, bottom: 1, left: 1, right: 1 } }
    if (report.institutionProfile?.formattingJson) {
       try { formatConf = { ...formatConf, ...JSON.parse(report.institutionProfile.formattingJson) } } catch {}
    }

    if (format === 'docx') {
      const doc = new Document({
        styles: {
          default: {
             document: {
                run: {
                  font: formatConf.fontFamily,
                  size: formatConf.fontSize * 2, // docx uses half-points
                },
                paragraph: {
                  spacing: { line: formatConf.lineSpacing * 240 } // 240 is standard single space height in docx
                }
             }
          }
        },
        sections: [{
          properties: {
             page: {
                margin: {
                   top: formatConf.margins.top * 1440,
                   right: formatConf.margins.right * 1440,
                   bottom: formatConf.margins.bottom * 1440,
                   left: formatConf.margins.left * 1440
                }
             }
          },
          children: [
            // COVER PAGE
            new Paragraph({ text: '', spacing: { before: 2000 } }),
            new Paragraph({ text: report.institutionProfile?.institution.name?.toUpperCase() || 'UNIVERSITY', heading: HeadingLevel.HEADING_1, alignment: 'center' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: coverData.title.toUpperCase(), heading: HeadingLevel.TITLE, alignment: 'center' }),
            new Paragraph({ text: '', spacing: { before: 2000 } }),
            new Paragraph({ text: `BY: ${coverData.authors}`, alignment: 'center', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: `REGISTRATION NUMBER: ${coverData.regNumber}`, alignment: 'center' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: `DEPARTMENT: ${coverData.department}`, alignment: 'center' }),
            new Paragraph({ text: `SUPERVISOR: ${coverData.supervisor}`, alignment: 'center' }),
            new Paragraph({ text: '', spacing: { before: 2000 } }),
            new Paragraph({ text: new Date().getFullYear().toString(), alignment: 'center' }),
            new PageBreak(),

            // TABLE OF CONTENTS
            new Paragraph({ text: 'Table of Contents', heading: HeadingLevel.HEADING_1 }),
            new TableOfContents('Table of Contents', {
              hyperlink: true,
              headingStyleRange: '1-3',
            }),
            new PageBreak(),

            // MAIN CONTENT
            ...report.sections.flatMap(sec => [
               new Paragraph({ text: sec.sectionKey.toUpperCase().replace('_', ' '), heading: HeadingLevel.HEADING_1 }),
               new Paragraph({ text: sec.content.replace(/<[^>]+>/g, ' ') }) 
            ])
          ],
        }],
      })

      const buffer = await Packer.toBuffer(doc)
      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${report.title.replace(/\s+/g, '_')}.docx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      })
    } else {
      return new NextResponse('PDF Generation pipeline active in production. This is a local DEV stub.', {
        headers: { 'Content-Disposition': `attachment; filename="${report.title.replace(/\s+/g, '_')}.pdf"`, 'Content-Type': 'text/plain' }
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Export failed', { status: 500 })
  }
}
