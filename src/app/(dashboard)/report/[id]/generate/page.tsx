'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

export default function GenerateReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reportId) return

    let isMounted = true

    const generateReport = async () => {
      try {
        const res = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reportId })
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to generate report')
        }

        if (isMounted) {
          // Redirect to the wizard editor once the draft is created
          router.push(`/editor/${reportId}/wizard`)
        }
      } catch (err: any) {
        console.error(err)
        if (isMounted) {
          setError(err.message)
        }
      }
    }

    generateReport()

    return () => {
      isMounted = false
    }
  }, [reportId, router])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center -mt-10">
      <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center max-w-lg text-center">
        {!error ? (
          <>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#0E8A7D] blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4 border border-gray-100 shadow-sm">
                 <Loader2 className="h-12 w-12 text-[#0E8A7D] animate-spin" />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-[#1F3A5F] mb-3 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-[#0E8A7D]" />
              Writing Your Report...
            </h1>
            <p className="text-gray-500 font-medium">
              Our AI is analyzing your documents and drafting the core sections. This might take a minute, please don't close this page.
            </p>
          </>
        ) : (
          <>
             <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-4 w-full text-left w-full border border-red-100">
               <h3 className="font-bold mb-1">Generation Failed</h3>
               <p className="text-sm">{error}</p>
             </div>
             <button
               onClick={() => router.push(`/editor/${reportId}/wizard`)}
               className="mt-4 px-6 py-2 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 text-gray-700"
             >
               Go to empty editor instead
             </button>
          </>
        )}
      </div>
    </div>
  )
}
