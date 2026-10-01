'use client'

import { useState } from 'react'

export function ReviewShare({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)

  const handleShare = async () => {
    if (link) {
      navigator.clipboard.writeText(link)
      alert('Link copied to clipboard!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reports/review-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId })
      })
      const data = await res.json()
      if (data.link) {
        setLink(data.link)
        navigator.clipboard.writeText(data.link)
        alert('Link copied to clipboard!')
      }
    } catch {
      alert('Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleShare} 
      disabled={loading}
      className={`text-sm font-medium ${link ? 'text-[#0E8A7D]' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {loading ? '...' : link ? 'Copy Link' : 'Share for Review'}
    </button>
  )
}
