import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function MockGatewayPage({ searchParams }: { searchParams: Promise<{ paymentId?: string }> }) {
  const { paymentId } = await searchParams
  if (!paymentId) redirect('/dashboard')

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { report: true }
  })

  if (!payment || payment.status !== 'PENDING') redirect('/dashboard')

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1F3A5F] p-4 text-center">
          <h2 className="text-xl font-bold text-white">MockAzamPay Gateway</h2>
        </div>
        <div className="p-8">
          <div className="mb-8 text-center text-gray-600">
            <p>You are about to pay</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">TZS {payment.amount.toLocaleString()}</p>
            <p className="text-sm mt-3">for "{payment.report.title}"</p>
          </div>
          
          <form action="/api/payments/webhook" method="POST">
             {/* Simulating webhook payload being posted to the server */}
             <input type="hidden" name="providerRef" value={payment.providerRef || ''} />
             <input type="hidden" name="status" value="SUCCESS" />
             <input type="hidden" name="paymentId" value={payment.id} />
             
             <button type="submit" className="w-full bg-[#0E8A7D] hover:bg-[#0c786c] text-white font-bold py-3 px-4 rounded-md shadow-md transition-colors">
               Simulate Successful Payment
             </button>
          </form>

          <form action="/api/payments/webhook" method="POST" className="mt-4">
             <input type="hidden" name="providerRef" value={payment.providerRef || ''} />
             <input type="hidden" name="status" value="FAILED" />
             <input type="hidden" name="paymentId" value={payment.id} />
             
             <button type="submit" className="w-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 font-bold py-3 px-4 rounded-md transition-colors">
               Simulate Payment Failure
             </button>
          </form>
        </div>
      </div>
    </div>
  )
}
