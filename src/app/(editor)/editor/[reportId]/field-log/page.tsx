'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { queueOfflineAction } from '@/lib/offline-sync'

export default function FieldLogPage() {
  const { reportId } = useParams()
  const router = useRouter()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [logs, setLogs] = useState<any[]>([])

  // Load existing logs (client-side for MVP simplicity)
  useEffect(() => {
    fetch(`/api/reports/field-entry?reportId=${reportId}`)
      .then(res => res.json())
      .then(data => setLogs(data.entries || []))
      .catch()
  }, [reportId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    let photoUrl = null
    // If online & has file, get presigned URL & upload
    if (file && navigator.onLine) {
      try {
        const presign = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, reportId, type: 'IMAGE' })
        }).then(r => r.json())

        await fetch(presign.signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })
        photoUrl = presign.finalUrl
      } catch (err) {
        console.error('Upload failed', err)
      }
    }

    const payload = {
      reportId,
      text,
      photoUrl,
      timestamp: Date.now()
    }

    if (!navigator.onLine) {
      await queueOfflineAction('/api/reports/field-entry', 'POST', payload)
      // Mock locally
      setLogs([{ ...payload, id: 'temp' }, ...logs])
    } else {
      const saved = await fetch('/api/reports/field-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json())
      if (saved.success) {
        setLogs([saved.entry, ...logs])
      }
    }

    setText('')
    setFile(null)
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 w-full h-screen overflow-y-auto bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1F3A5F]">Field Log Tracker</h1>
          <p className="mt-2 text-gray-600">Track your daily field activities. These sync offline!</p>
        </div>
        <Link href={`/editor/${reportId}/wizard`} className="text-sm font-medium text-gray-500 border border-gray-300 rounded px-4 py-2 bg-white">
          Back to Wizard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
             <textarea 
               value={text} onChange={(e) => setText(e.target.value)} required
               placeholder="What did you observe or do today?" 
               className="w-full p-3 border rounded-md min-h-[120px] focus:ring-[#0E8A7D]" 
             />
          </div>
          <div className="flex gap-4 items-center">
             <label className="text-sm border border-gray-300 px-4 py-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100">
               📷 Attach Photo
               <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
             </label>
             {file && <span className="text-xs text-green-600">{file.name}</span>}
             <button disabled={saving} type="submit" className="ml-auto bg-[#1F3A5F] px-6 py-2 text-white font-medium rounded hover:bg-[#1a3152] disabled:opacity-50">
               {saving ? 'Saving...' : 'Save Entry'}
             </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-4">Past Entries</h2>
        {logs.length === 0 && <p className="text-gray-500 italic text-sm">No entries logged yet.</p>}
        {logs.map((log, i) => (
          <div key={log.id || i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
             <div className="text-xs text-gray-400 mb-2">{new Date(log.timestamp).toLocaleString()}</div>
             <p className="text-gray-800 whitespace-pre-wrap">{log.text}</p>
             {log.photoUrl && <img src={log.photoUrl} alt="Field capture" className="mt-4 rounded max-h-[300px] object-cover" />}
          </div>
        ))}
      </div>
    </div>
  )
}
