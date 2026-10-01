import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.redirect(new URL('/login', req.url))

    const formData = await req.formData()
    const reportId = formData.get('reportId') as string

    const report = await prisma.report.findUnique({
      where: { id: reportId, userId: session.userId },
      include: { reportType: true }
    })

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Check if already paid
    if (report.status === 'PAID') {
      return NextResponse.redirect(new URL(`/downloads/${report.id}`, req.url), 303)
    }

    // Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        reportId: report.id,
        amount: report.reportType.basePrice,
        provider: 'MockAzamPay',
        providerRef: `MOCK-${Date.now()}-${report.id}`,
        status: 'PENDING',
      }
    })

    // Forward to mocked payment gateway page
    return NextResponse.redirect(new URL(`/mock-gateway?paymentId=${payment.id}`, req.url), 303)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
