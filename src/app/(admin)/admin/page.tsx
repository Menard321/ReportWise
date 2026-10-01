import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const usersCount = await prisma.user.count()
  const reportsCount = await prisma.report.count()
  
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCESS' }
  })
  const revenue = payments.reduce((acc: number, p: { amount: number }) => acc + p.amount, 0)
  
  const recentReports = await prisma.report.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true, reportType: true }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F3A5F] mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Users</p>
           <p className="text-3xl font-bold text-[#1F3A5F] mt-2">{usersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Reports Created</p>
           <p className="text-3xl font-bold text-[#0E8A7D] mt-2">{reportsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Revenue (TZS)</p>
           <p className="text-3xl font-bold text-[#B5651D] mt-2">{revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Recent Reports</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">User ID</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentReports.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No reports exist</td></tr>
            )}
            {recentReports.map((rp: any) => (
               <tr key={rp.id}>
                 <td className="px-6 py-3 font-medium text-gray-900">{rp.title || 'Untitled'}</td>
                 <td className="px-6 py-3 text-gray-600">{rp.reportType.name}</td>
                 <td className="px-6 py-3 text-gray-600 font-mono text-xs">{rp.userId}</td>
                 <td className="px-6 py-3">
                   <span className={`px-2 py-1 text-xs rounded-full ${rp.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                     {rp.status}
                   </span>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
