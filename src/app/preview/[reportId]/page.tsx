import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PreviewPage({ params }: { params: Promise<{ reportId: string }> }) {
  const session = await getUserSession()
  if (!session) redirect('/login')

  const { reportId } = await params

  const report = await prisma.report.findUnique({
    where: { id: reportId, userId: session.userId },
    include: { sections: true, reportType: true }
  })

  if (!report) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/editor/${report.id}/wizard`} className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-md px-3 py-1.5">
            &larr; Back to Editor
          </Link>
          <span className="font-semibold text-gray-800 hidden sm:inline">{report.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            TZS {report.reportType.basePrice.toLocaleString()}
          </span>
          <form action="/api/payments/checkout" method="POST">
             <input type="hidden" name="reportId" value={report.id} />
             <button type="submit" className="bg-[#0E8A7D] hover:bg-[#0c786c] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
               Pay & Download Clean PDF
             </button>
          </form>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto shadow-xl bg-white min-h-[1056px] relative p-12 sm:p-20 select-none">
          {/* Watermark overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-10">
             {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="text-6xl sm:text-8xl font-black text-gray-500 -rotate-45 my-12 tracking-widest whitespace-nowrap">
                 REPORTWISE PREVIEW
               </div>
             ))}
          </div>

          <div className="relative z-10 prose max-w-none">
            <h1 className="text-center text-3xl font-bold mb-16">{report.title}</h1>
            
            {report.sections.length === 0 && (
              <p className="text-center text-gray-500 italic mt-20">No content added yet. Go back to editor to write your report.</p>
            )}

            {report.sections.map((sec) => (
              <div key={sec.id} className="mb-12">
                <div dangerouslySetInnerHTML={{ __html: sec.content }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
