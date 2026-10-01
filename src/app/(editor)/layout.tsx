import Link from 'next/link'

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="text-lg font-bold text-[#1F3A5F]">ReportWise Editor</div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Exit to Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  )
}
