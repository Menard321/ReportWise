import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react'

// Page 4a: Confirm Understanding
export default async function ConfirmUnderstandingPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getUserSession()
  if (!session) redirect('/login')

  const { id } = await params

  const report = await prisma.report.findUnique({
    where: { id, userId: session.userId },
    include: {
      reportType: true,
      inputs: true,
    }
  })

  if (!report) redirect('/dashboard')

  // Since InputFiles weren't strictly mapped to ReportID in schema v1, 
  // fetch recent files for this user as a mock for this report session
  const files = await prisma.inputFile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  // Determine standard outputs
  const instructions = report.inputs[0]?.instructionText || 'No custom instructions provided.'
  
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#0E8A7D] font-medium">Confirm Understanding</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#1F3A5F]">Is this correct?</h1>
        <p className="text-gray-600 mt-2 text-lg">We processed your files and setup limits. Review what our engine understood.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Core Parameters Board */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
          <h3 className="text-xl font-bold text-[#1F3A5F] mb-6 border-b border-gray-100 pb-4">Report Parameters</h3>
          
          <div className="space-y-5 flex-1">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Document Type</span>
              <span className="font-bold text-gray-900">{report.reportType?.name || 'Unknown'}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Institution</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-bold text-gray-900">
                  {report.institutionProfileId ? 'Verified University' : 'Custom / Not Listed'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <span className="text-sm font-semibold text-gray-500">Length Target</span>
              <span className="font-bold text-gray-900">~{report.targetPages} Pages</span>
            </div>
          </div>
        </div>

        {/* Fact Extraction Board */}
        <div className="bg-[#1f3a5f] rounded-3xl p-8 shadow-xl flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#0E8A7D] rounded-full opacity-10 blur-3xl"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Extracted Context</h3>
          
          <div className="space-y-4 flex-1">
             <div className="bg-white/10 p-4 rounded-xl border border-white/5">
               <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Parsed Instructions</h4>
               <p className="text-sm text-gray-300 font-medium leading-relaxed">
                 {instructions}
               </p>
             </div>
             
             <div className="bg-white/10 p-4 rounded-xl border border-white/5">
               <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Identified Materials</h4>
               {files.length > 0 ? (
                 <ul className="space-y-2">
                   {files.map(f => (
                     <li key={f.id} className="flex justify-between items-center text-sm text-gray-200">
                       <span className="flex items-center gap-2 truncate pr-4">
                         <FileText className="h-4 w-4 text-[#0E8A7D]" />
                         <span className="truncate">{f.fileUrl.split('_').pop()}</span>
                       </span>
                       <span className="bg-[#0E8A7D]/20 text-[#0E8A7D] text-xs px-2 py-1 rounded-md min-w-fit">Uses: {f.label}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-sm text-gray-400 italic">No files provided.</p>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Link 
          href={`/report/${id}/details`}
          className="inline-flex items-center justify-center rounded-xl bg-[#0E8A7D] px-10 py-4 text-base font-bold text-white shadow-lg shadow-[#0E8A7D]/20 hover:bg-[#0c786c] transition-all hover:-translate-y-0.5 min-w-[240px]"
        >
          Looks right, continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>

    </div>
  )
}
