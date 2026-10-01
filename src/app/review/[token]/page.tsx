import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const link = await prisma.reviewLink.findUnique({
    where: { token },
    include: {
      report: {
        include: { sections: { include: { comments: true } } }
      }
    }
  })

  // Prevent invalid, revoked, or expired links
  if (!link || link.revoked || link.status !== 'ACTIVE' || (link.expiresAt && link.expiresAt < new Date())) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1F3A5F]">Link Expired or Invalid</h1>
          <p className="mt-2 text-gray-500">This review link is no longer active.</p>
        </div>
      </div>
    )
  }

  const report = link.report

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
         <div className="max-w-4xl mx-auto shadow-lg bg-white relative p-12 select-none min-h-[800px]">
           {/* Watermark */}
           <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-5">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="text-6xl font-black text-gray-500 -rotate-45 my-12 tracking-widest whitespace-nowrap">
                   REPORTWISE REVIEW
                 </div>
               ))}
           </div>
           
           <div className="relative z-10 prose prose-sm max-w-none">
             <h1 className="text-center text-3xl font-bold mb-10">{report.title}</h1>
             
             {report.sections.map((sec) => (
               <div key={sec.id} className="mb-12 group relative">
                 <div dangerouslySetInnerHTML={{ __html: sec.content }} />
               </div>
             ))}
           </div>
         </div>
      </div>

      <div className="w-full md:w-80 bg-white border-l border-gray-200 shadow-xl overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
             <h2 className="font-bold text-[#1F3A5F]">Supervisor Review</h2>
             <p className="text-xs text-gray-500 mt-1">Leave comments by section</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
             {report.sections.map(sec => (
               <div key={sec.id} className="border border-gray-200 rounded p-3">
                 <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Section: {sec.sectionKey}</h3>
                 
                 <div className="space-y-3 mb-3">
                   {sec.comments.map(c => (
                     <div key={c.id} className="bg-gray-50 p-2 text-sm text-gray-800 rounded">
                       <span className="font-semibold text-xs block text-[#1F3A5F]">{c.reviewerName || 'Guest'}</span>
                       {c.text}
                     </div>
                   ))}
                   {sec.comments.length === 0 && <span className="text-xs text-gray-400 italic">No comments</span>}
                 </div>

                 <form action="/api/reports/comment" method="POST" className="flex flex-col gap-2">
                   <input type="hidden" name="reportSectionId" value={sec.id} />
                   <input type="hidden" name="token" value={token} />
                   <input type="text" name="reviewerName" placeholder="Your Name" required className="border p-1 text-xs rounded w-full" />
                   <textarea name="text" placeholder="Add comment..." required className="border p-2 text-sm rounded w-full min-h-[60px]" />
                   <button type="submit" className="bg-[#0E8A7D] text-white text-xs font-medium py-1.5 rounded hover:bg-[#0c786c]">Submit Comment</button>
                 </form>
               </div>
             ))}
          </div>
      </div>
    </div>
  )
}
