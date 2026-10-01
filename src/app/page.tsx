import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="flex h-16 items-center justify-between px-6 lg:px-12 bg-white shadow-sm">
        <div className="text-xl font-bold text-[#1F3A5F]">ReportWise</div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-[#1F3A5F]">
            Login
          </Link>
          <Link href="/login" className="rounded-md bg-[#0E8A7D] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c786c]">
            Start Writing
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-24 text-center lg:px-12">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-[#1F3A5F] sm:text-5xl lg:text-6xl">
            Guided Report Writing, <br className="hidden sm:block" /> Done Right
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Write complete, correctly formatted reports with ease. Select your type, answer guided questions, and get a beautifully formatted final draft tailored to your institution.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-[#1F3A5F] px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-[#1a3152] transition-colors w-full sm:w-auto"
            >
              Start Free Draft
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-[#1F3A5F] border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              How it Works
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1F3A5F] mb-12">Three Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
             <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#0E8A7D]/10 text-[#0E8A7D] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold text-[#1F3A5F] mb-2">Select Template</h3>
                <p className="text-gray-600">Choose your report type and your institution to apply the exact formatting rules required.</p>
             </div>
             <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#0E8A7D]/10 text-[#0E8A7D] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-bold text-[#1F3A5F] mb-2">Answer Questions</h3>
                <p className="text-gray-600">Our wizard guides you section-by-section. Just answer simple questions or upload data.</p>
             </div>
             <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#0E8A7D]/10 text-[#0E8A7D] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-bold text-[#1F3A5F] mb-2">Export & Payment</h3>
                <p className="text-gray-600">Preview your watermarked draft for free. Pay only TZS 30,000 to download the clean Word or PDF.</p>
             </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-8 px-6 lg:px-12 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>&copy; 2026 ReportWise. All rights reserved.</p>
      </footer>
    </div>
  )
}
