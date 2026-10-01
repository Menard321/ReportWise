import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { generatePresignedUrl } from '@/lib/s3'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { fileName, fileType, reportId, type } = await req.json()

    // Validate ownership
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    })

    if (!report || report.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uniqueFileName = `${reportId}/${Date.now()}-${fileName}`
    const signedUrl = await generatePresignedUrl(uniqueFileName, fileType)

    // Using real host URL base from S3 or R2
    const bucketHost = process.env.R2_ACCOUNT_ID 
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.S3_BUCKET_NAME || 'reportwise-assets'}`
      : `https://${process.env.S3_BUCKET_NAME || 'reportwise-assets'}.s3.amazonaws.com`

    const finalUrl = `${bucketHost}/${uniqueFileName}`

    // Insert Asset reference
    const asset = await prisma.asset.create({
      data: {
        reportId,
        type: type || 'ATTACHMENT',
        url: finalUrl
      }
    })

    return NextResponse.json({ signedUrl, finalUrl, asset })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 })
  }
}
