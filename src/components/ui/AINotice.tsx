'use client'

import { useState } from 'react'
import { X, Info } from 'lucide-react'

export function AINotice() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="rounded-md bg-blue-50 p-4 mb-6 shadow-sm border border-blue-100 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">
            ReportWise writes your draft from your answers, notes and data. Check every fact, figure and source, and follow your institution's rules on AI use.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            className="inline-flex rounded-md bg-blue-50 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
            onClick={() => setIsVisible(false)}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
