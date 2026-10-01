import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const paymentId = formData.get('paymentId') as string
    const providerRef = formData.get('providerRef') as string
    const status = formData.get('status') as string

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Lookup payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    // Idempotent processing
    if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
       // Already processed, redirect based on real state
       if (payment.status === 'SUCCESS') {
         return NextResponse.redirect(new URL(`/download/${payment.reportId}`, req.url), 303)
       } else {
         return NextResponse.redirect(new URL(`/preview/${payment.reportId}`, req.url), 303)
       }
    }

    if (status === 'SUCCESS') {
      // Begin Transaction to update Payment and Report
      await prisma.$transaction(async (tx: any) => {
         await tx.payment.update({
           where: { id: payment.id },
           data: { status: 'SUCCESS', paidAt: new Date() }
         })
         await tx.report.update({
           where: { id: payment.reportId },
           data: { status: 'PAID' }
         })
      })
      return NextResponse.redirect(new URL(`/download/${payment.reportId}`, req.url), 303)
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })
      // Failed payment, go back to preview
      return NextResponse.redirect(new URL(`/preview/${payment.reportId}`, req.url), 303)
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
