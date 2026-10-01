import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DownloadPage({ params }: { params: Promise<{ reportId: string }> }) {
  const session = await getUserSession()
  if (!session) redirect('/login')

  const { reportId } = await params

  const report = await prisma.report.findUnique({
    where: { id: reportId, userId: session.userId }
  })

  if (!report) redirect('/dashboard')

  if (report.status !== 'PAID') {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Required</h1>
          <p className="mb-4">You need to pay for this report before you can download it.</p>
          <Link href={`/preview/${report.id}`} className="text-blue-600 underline">Back to Preview</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="w-16 h-16 bg-[#0E8A7D]/10 text-[#0E8A7D] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-[#1F3A5F]">Payment Successful!</h1>
        <p className="mt-2 text-gray-600 mb-8">
          Thank you for your purchase. Your clean, unwatermarked report is ready to download. 
          You can come back and edit your draft at any time and download it again for free over the next 30 days.
        </p>
        
        <div className="flex flex-col gap-4">
          <a
            href={`/api/export/${report.id}?format=docx`}
            className="w-full bg-[#1F3A5F] hover:bg-[#1a3152] text-white font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Download Word (DOCX)
          </a>
          <a
            href={`/api/export/${report.id}?format=pdf`}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md shadow-sm transition-colors"
          >
            Download PDF
          </a>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
           <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
             &larr; Back to Dashboard
           </Link>
        </div>
      </div>
    </div>
  )
}
