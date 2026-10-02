import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReviewShare } from '@/components/ui/ReviewShare'
import { AINotice } from '@/components/ui/AINotice'
import { SmartStartForm } from '@/components/SmartStartForm'

export default async function DashboardPage() {
  const session = await getUserSession()
  if (!session) {
    redirect('/login')
  }

  // Fetch report types and universities to seed the Smart Start Form
  const reportTypes = await prisma.reportType.findMany({ select: { id: true, name: true, key: true } })
  const universities = await prisma.institution.findMany({ select: { id: true, name: true } })

  const reports = await prisma.report.findMany({
    where: { userId: session.userId },
    include: {
      reportType: true,
      institutionProfile: {
        include: { institution: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <AINotice />
      
      <SmartStartForm 
        reportTypes={reportTypes} 
        universities={universities} 
      />

      <div className="flex items-center justify-between mb-6 mt-16 pt-8 border-t border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-[#1F3A5F]">My reports</h2>
          <p className="mt-1 text-sm text-gray-500">Pick up where you left off or view your generated drafts.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/import"
            className="text-sm font-medium text-[#0E8A7D] hover:text-[#0c786c] flex items-center"
          >
            Import Draft
          </Link>
          <Link
            href="/dashboard/new"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center border-l pl-4 border-gray-300"
          >
            New report (guided)
          </Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-sm font-medium text-gray-500">No reports yet. Your drafts will appear here.</h3>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-500">{report.progress}% Complete</span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {report.title || 'Untitled Report'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{report.reportType.name}</p>
                {report.institutionProfile && (
                  <p className="mt-2 text-xs text-gray-400 truncate">
                    {report.institutionProfile.institution.name} - {report.institutionProfile.faculty || 'General'}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between flex-wrap gap-2 items-center">
                <Link
                  href={`/editor/${report.id}`}
                  className="text-sm font-medium text-[#0E8A7D] hover:text-[#0c786c]"
                >
                  Continue
                </Link>
                <div className="flex items-center gap-4">
                  <ReviewShare reportId={report.id} />
                  <Link
                    href={`/preview/${report.id}`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
