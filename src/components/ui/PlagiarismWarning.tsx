'use client'

import { useState, useEffect } from 'react'

export function PlagiarismWarning() {
  const [dismissed, setDismissed] = useState(true) // assume dismissed initially to prevent hydration mismatch flashes

  useEffect(() => {
    const isDismissed = localStorage.getItem('reportwise_plagiarism_warning')
    if (!isDismissed) {
      setDismissed(false)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('reportwise_plagiarism_warning', 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="bg-[#B5651D] text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md z-50 sticky top-0">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">⚠️</span>
        <div>
          <h3 className="font-bold text-lg">Honesty & Originality Required</h3>
          <p className="text-sm text-balance mt-1 opacity-90">
            By using ReportWise, you agree that you are fully responsible for the originality of your work. Our AI assistant helps format and improve grammar, but it does not write the report for you. Your final document will be checked against institutional plagiarism scanners (like Turnitin). Do not copy content blindly.
          </p>
        </div>
      </div>
      <button 
        onClick={handleDismiss} 
        className="bg-white text-[#B5651D] hover:bg-orange-50 font-bold py-2 px-6 rounded-md whitespace-nowrap shadow-sm"
      >
        I understand
      </button>
    </div>
  )
}
