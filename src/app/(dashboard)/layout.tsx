import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserMenu } from '@/components/ui/UserMenu'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()
  
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true }
  })

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="text-xl font-bold text-[#1F3A5F]">ReportWise</div>
        <nav className="flex items-center gap-4 z-50">
          <UserMenu name={user?.name || null} email={user?.email || null} />
        </nav>
      </header>
      <main className="flex-1 p-6 lg:p-10 relative z-0">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
