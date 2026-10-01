import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const reportId = formData.get('reportId') as string
    const file = formData.get('file') as File

    if (!reportId || !file) {
       return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Verify
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report || report.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const textPayload = await file.text()
    
    // Parse pure CSV robustly
    const records = parse(textPayload, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    if (records.length === 0) {
       return NextResponse.json({ error: 'File is empty or incorrectly formatted' }, { status: 400 })
    }

    // Process and Extract Meta-data (Basic statistical aggregation for AnalysisBlock mapping)
    const columns = Object.keys(records[0])
    const summary: Record<string, { type: 'numeric' | 'string', count: number, avg?: number, sum?: number }> = {}

    // Initialize mapping
    columns.forEach(col => { summary[col] = { type: 'string', count: 0, sum: 0 } })

    // Build statistics mapping
    let isNumericColumn: Record<string, boolean> = {}
    columns.forEach(col => isNumericColumn[col] = true)

    records.forEach((row: Record<string, string>) => {
      columns.forEach(col => {
         const val = row[col]
         if (val && val !== '') {
            summary[col].count++
            const num = parseFloat(val)
            if (isNaN(num)) {
               isNumericColumn[col] = false
            } else if (isNumericColumn[col]) {
               summary[col].sum! += num
               summary[col].type = 'numeric'
            }
         }
      })
    })

    columns.forEach(col => {
       if (summary[col].type === 'numeric' && summary[col].count > 0) {
          summary[col].avg = Number((summary[col].sum! / summary[col].count).toFixed(2))
       } else {
          delete summary[col].sum
          delete summary[col].avg
       }
    })

    // Prepare JSON structures
    const datasetSummaryJson = JSON.stringify({
       columns,
       rowCount: records.length,
       meta: summary
    })
    
    // First 5 rows for standard preview capability
    const htmlTablePreview = `
      <table class="table-auto border-collapse border border-slate-300 w-full text-sm">
        <thead>
          <tr>${columns.map(c => `<th class="border border-slate-300 px-2 py-1 bg-gray-100">${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${records.slice(0, 5).map((r: any) => `<tr>${columns.map(c => `<td class="border border-slate-300 px-2 py-1">${r[c] || ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `

    // Create DB entities
    const dataset = await prisma.dataset.create({
      data: {
        reportId,
        fileUrl: `local-buffer-${Date.now()}`, // Typically S3 link, but stored locally mapped to Block for MVP
        summaryJson: datasetSummaryJson
      }
    })

    const analysisBlock = await prisma.analysisBlock.create({
      data: {
        datasetId: dataset.id,
        resultJson: JSON.stringify({
           tablePreview: htmlTablePreview,
           statistics: summary
        }),
        draftText: `Dataset interpretation containing ${records.length} records. Please review columns: ${columns.join(', ')}.`
      }
    })

    return NextResponse.json({ success: true, datasetId: dataset.id, analysisBlock })
  } catch (error) {
    console.error('Dataset ingestion failed:', error)
    return NextResponse.json({ error: 'Failed to process dataset' }, { status: 500 })
  }
}

export async function GET(req: Request) {
   const { searchParams } = new URL(req.url)
   const reportId = searchParams.get('reportId')
   if(!reportId) return NextResponse.json({ blocks: [] })

   const datasets = await prisma.dataset.findMany({
      where: { reportId },
      include: { analysisBlocks: true }
   })

   const blocks = datasets.flatMap(d => d.analysisBlocks)
   return NextResponse.json({ blocks })
}
