import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()
  
  // Strict role check
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard') // fallback non-admins to dashboard
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-64 bg-[#1F3A5F] text-white flex flex-col hidden md:flex">
         <div className="p-6 border-b border-[#1a3152]">
            <h1 className="text-xl font-bold">ReportWise Admin</h1>
         </div>
         <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin" className="block px-4 py-2 rounded bg-[#1a3152]">Dashboard Overview</Link>
            <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-[#1a3152] text-gray-300">Users Manager</Link>
            <Link href="/admin/reports" className="block px-4 py-2 rounded hover:bg-[#1a3152] text-gray-300">Report Templates</Link>
            <Link href="/admin/payments" className="block px-4 py-2 rounded hover:bg-[#1a3152] text-gray-300">Payments</Link>
         </nav>
      </div>
      <div className="flex-1 overflow-auto">
         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <h2 className="font-semibold text-gray-800">Admin Portal</h2>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 border border-gray-300 rounded px-3 py-1">Exit to User Dashboard</Link>
         </header>
         <main className="p-6">
           {children}
         </main>
      </div>
    </div>
  )
}
