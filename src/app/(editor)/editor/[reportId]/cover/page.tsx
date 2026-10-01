import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CoverDetailsPage({
  params,
}: {
  params: Promise<{ reportId: string }>
}) {
  const session = await getUserSession()
  if (!session) redirect('/login')

  const { reportId } = await params
  
  const report = await prisma.report.findUnique({
    where: { id: reportId, userId: session.userId },
    include: { institutionProfile: true }
  })

  if (!report) redirect('/dashboard')

  const institutions = await prisma.institution.findMany({
    include: { profiles: true }
  })

  // Basic prefilled values from JSON string if present
  let coverData = {
    title: report.title || '',
    authors: '',
    department: '',
    supervisor: '',
    regNumber: '',
  }
  
  if (report.coverDataJson) {
    try {
      coverData = { ...coverData, ...JSON.parse(report.coverDataJson) }
    } catch (e) {}
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F3A5F]">Cover Details</h1>
        <p className="mt-2 text-gray-600">Fill in the details for your report cover page and select your institution.</p>
      </div>

      <form action="/api/reports/cover" method="POST" className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <input type="hidden" name="reportId" value={report.id} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1F3A5F] border-b pb-2">Report Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" defaultValue={coverData.title} className="w-full p-2 border rounded-md" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author Name(s)</label>
              <input name="authors" defaultValue={coverData.authors} className="w-full p-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input name="regNumber" defaultValue={coverData.regNumber} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department/Faculty</label>
              <input name="department" defaultValue={coverData.department} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
              <input name="supervisor" defaultValue={coverData.supervisor} className="w-full p-2 border rounded-md" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-[#1F3A5F] border-b pb-2">Institution Format</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Institution Profile</label>
            <select 
              name="institutionProfileId" 
              className="w-full p-2 border rounded-md"
              defaultValue={report.institutionProfileId || ""}
              required
            >
              <option value="" disabled>-- Choose Institution --</option>
              {institutions.map(inst => (
                <optgroup key={inst.id} label={inst.name}>
                  {inst.profiles.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {inst.code} - {prof.faculty} ({prof.version})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Choosing an institution will automatically apply its unique formatting rules (font, margins, spacing).</p>
          </div>
        </div>

        <div className="pt-6 flex justify-between">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 py-2">Cancel</Link>
          <button type="submit" className="bg-[#1F3A5F] hover:bg-[#1a3152] text-white px-6 py-2 rounded-md font-medium">
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  )
}
