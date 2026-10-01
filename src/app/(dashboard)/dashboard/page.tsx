import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReviewShare } from '@/components/ui/ReviewShare'

export default async function DashboardPage() {
  const session = await getUserSession()
  if (!session) {
    redirect('/login')
  }

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1F3A5F]">My Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Pick up where you left off or start a new draft.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-[#0E8A7D] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0c786c]"
        >
          New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-lg font-medium text-[#1F3A5F]">No reports yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first guided report draft.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/new"
              className="inline-flex rounded-md bg-[#1F3A5F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a3152]"
            >
              Start Writing
            </Link>
          </div>
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
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
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
