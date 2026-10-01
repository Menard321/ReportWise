import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TipTapEditor from '@/components/ui/TipTapEditor'

export default async function WizardPage({
  params,
  searchParams
}: {
  params: Promise<{ reportId: string }>,
  searchParams: Promise<{ s?: string }>
}) {
  const session = await getUserSession()
  if (!session) redirect('/login')

  const { reportId } = await params
  const { s: activeSectionKeyParam } = await searchParams

  const report = await prisma.report.findUnique({
    where: { id: reportId, userId: session.userId },
    include: { sections: true, institutionProfile: true, reportType: true }
  })

  if (!report) redirect('/dashboard')

  let template = null
  if (report.institutionProfile?.institutionId) {
     template = await prisma.template.findFirst({
        where: { 
          reportTypeKey: report.reportTypeId, 
          institutionId: report.institutionProfile.institutionId,
          version: report.templateVersion 
        } as any
     })
  }
  
  if (!template) {
     template = await prisma.template.findFirst({
        where: { reportTypeKey: report.reportTypeId, version: report.templateVersion } as any
     })
  }

  if (!template) return <div>Template not found</div>

  let schema = { sections: [] as any[] }
  try {
    schema = JSON.parse(template.schemaJson as string)
  } catch (e) {}

  const activeSectionList = schema.sections || []
  const activeSectionKey = activeSectionKeyParam || (activeSectionList.length > 0 ? activeSectionList[0].key : '')
  const currentSectionMeta = activeSectionList.find((s: any) => s.key === activeSectionKey)

  const activeContentItem = report.sections.find((s: any) => s.sectionKey === activeSectionKey)
  const activeContent = activeContentItem?.content || ''

  return (
    <div className="flex w-full h-[calc(100vh-56px)]">
      {/* Sidebar sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1F3A5F]">Report Sections</h2>
          <p className="text-xs text-gray-500 mt-1">{report.title}</p>
        </div>
        <ul className="p-2 space-y-1">
          {activeSectionList.map((sec: any) => {
            const isActive = sec.key === activeSectionKey
            const isCompleted = report.sections.find((s: any) => s.sectionKey === sec.key && s.content.trim().length > 10)
            return (
               <li key={sec.key}>
                  <Link 
                    href={`/editor/${report.id}/wizard?s=${sec.key}`}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive ? 'bg-[#0E8A7D] text-white font-medium shadow-sm' : 
                      isCompleted ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {isCompleted && !isActive && <span className="mr-2 text-[#0E8A7D]">✓</span>}
                    {sec.title}
                  </Link>
               </li>
            )
          })}
        </ul>
        
        {report.reportType.key === 'research_report' && (
          <div className="p-4 mt-4 border-t border-gray-100">
             <Link href={`/editor/${report.id}/dataset`} className="block w-full text-center rounded-md border border-[#0E8A7D] bg-white py-2 text-sm font-medium text-[#0E8A7D] hover:bg-gray-50">
               📊 CSV Dataset Manager
             </Link>
          </div>
        )}

        {report.reportType.key === 'field_report' && (
          <div className="p-4 mt-4 border-t border-gray-100">
             <Link href={`/editor/${report.id}/field-log`} className="block w-full text-center rounded-md border border-[#B5651D] bg-white py-2 text-sm font-medium text-[#B5651D] hover:bg-gray-50">
               📓 Field Log Tracker
             </Link>
          </div>
        )}

        <div className="p-4 mt-auto">
          <Link href={`/preview/${report.id}`} className="block w-full text-center rounded-md bg-[#1F3A5F] py-2 text-sm text-white hover:bg-[#1a3152]">
            Finish & Preview
          </Link>
        </div>
      </div>

      {/* Editor Main */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1F3A5F]">{currentSectionMeta?.title || 'Unknown Section'}</h1>
            {currentSectionMeta?.required && <span className="inline-block mt-2 text-xs font-semibold uppercase text-[#0E8A7D] bg-[#0E8A7D]/10 px-2 py-1 rounded">Required</span>}
            <p className="mt-2 text-sm text-gray-600 font-medium">Use the editor below to draft this section.</p>
          </div>

          <TipTapEditor 
            key={activeSectionKey} 
            initialContent={activeContent} 
            sectionKey={activeSectionKey} 
            reportId={report.id} 
          />

          <div className="mt-8 flex justify-between items-center pb-12">
            <Link href={`/dashboard`} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Save and Exit
            </Link>
            
            {/* Logic to link to next section */}
            <Link 
              href={`/preview/${report.id}`} 
              className="rounded-md bg-white border border-gray-300 shadow-sm px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Preview &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
