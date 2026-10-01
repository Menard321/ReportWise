import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ reportTypeId?: string }> }) {
  const { reportTypeId } = await searchParams

  const reportTypes = await prisma.reportType.findMany({
    orderBy: { createdAt: 'asc' },
  })

  // Only fetch valid universities that actually have a template registered or fallback logic applies
  const institutions = await prisma.institution.findMany({
    orderBy: { code: 'asc' }
  })

  if (!reportTypeId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#1F3A5F]">Select Report Type</h1>
          <p className="mt-2 text-gray-600">Choose the type of report you want to write.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {reportTypes.map((type) => (
            <div key={type.id} className="relative group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#0E8A7D] hover:shadow-md transition-all">
              <h3 className="text-xl font-bold text-[#1F3A5F]">{type.name}</h3>
              <p className="mt-2 text-sm text-gray-600 min-h-[40px]">{type.description}</p>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-900">
                  TZS {type.basePrice.toLocaleString()} <span className="font-normal text-gray-500">to download</span>
                </span>
                <Link
                  href={`/dashboard/new?reportTypeId=${type.id}`}
                  className="rounded-md bg-[#1F3A5F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a3152] group-hover:bg-[#0E8A7D] transition-colors"
                >
                  Select &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Next Step: University Selection
  const selectedType = reportTypes.find(t => t.id === reportTypeId)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/new" className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-block">
          &larr; Back to Report Types
        </Link>
        <h1 className="text-3xl font-bold text-[#1F3A5F]">Select Your University</h1>
        <p className="mt-2 text-gray-600">
          You selected <span className="font-bold">{selectedType?.name}</span>. 
          Pick your institution below so we can load the exact required template pattern.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {institutions.map((uni) => (
           <form key={uni.id} action="/api/reports" method="POST">
             <input type="hidden" name="reportTypeId" value={reportTypeId} />
             <input type="hidden" name="institutionId" value={uni.id} />
             <button
                type="submit"
                className="w-full text-left relative group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#0E8A7D] hover:shadow-md transition-all"
              >
                <div className="text-sm font-bold text-[#B5651D] mb-1">{uni.code}</div>
                <h3 className="font-semibold text-[#1F3A5F] leading-snug">{uni.name}</h3>
                
                <div className="mt-4 text-xs font-semibold text-[#0E8A7D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Load Template &rarr;
                </div>
             </button>
           </form>
        ))}
      </div>
    </div>
  )
}
