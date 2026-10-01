import { PlagiarismWarning } from '@/components/ui/PlagiarismWarning'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <PlagiarismWarning />
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="text-xl font-bold text-[#1F3A5F]">ReportWise</div>
        <nav className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-600">My Account</div>
        </nav>
      </header>
      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
