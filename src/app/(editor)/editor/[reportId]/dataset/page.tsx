'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function DatasetPage() {
  const { reportId } = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [blocks, setBlocks] = useState<any[]>([])
  
  useEffect(() => {
    fetch(`/api/dataset/upload?reportId=${reportId}`)
      .then(r => r.json())
      .then(d => setBlocks(d.blocks || []))
  }, [reportId])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('reportId', reportId as string)
    formData.append('file', file)

    try {
      const res = await fetch('/api/dataset/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.success) {
         setBlocks(prev => [...prev, data.analysisBlock])
         setFile(null)
      } else {
         alert(data.error || 'Upload failed')
      }
    } catch {
       alert('Upload failed. Try again.')
    } finally {
       setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 w-full h-screen overflow-y-auto bg-gray-50 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1F3A5F]">Dataset Manager</h1>
          <p className="mt-2 text-gray-600">Upload CSV datasets for automatic mapping and analysis extraction.</p>
        </div>
        <Link href={`/editor/${reportId}/wizard`} className="text-sm font-medium text-gray-500 border border-gray-300 rounded px-4 py-2 bg-white shadow-sm hover:bg-gray-50">
          Back to Wizard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
         <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800">Upload New Dataset</h3>
            <div className="flex gap-4 items-center">
               <input 
                 type="file" 
                 accept=".csv"
                 onChange={(e) => setFile(e.target.files?.[0] || null)}
                 className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-[#1F3A5F]
                   hover:file:bg-blue-100 cursor-pointer border border-gray-200 p-2 rounded" 
                 required
               />
               <button 
                 disabled={uploading || !file} 
                 type="submit" 
                 className="shrink-0 bg-[#0E8A7D] px-6 py-2 text-white font-medium rounded hover:bg-[#0c786c] disabled:opacity-50"
               >
                 {uploading ? 'Processing...' : 'Upload & Analyze CSV'}
               </button>
            </div>
         </form>
      </div>

      <div className="space-y-6">
        <h2 className="font-semibold text-gray-700 uppercase tracking-wide text-xs">Analyzed Blocks ({blocks.length})</h2>
        {blocks.length === 0 && <p className="text-gray-500 italic text-sm">No datasets analyzed yet.</p>}
        
        {blocks.map(block => {
           const json = JSON.parse(block.resultJson || '{}')
           const stats = Object.entries(json.statistics || {}) as [string, any][]
           
           return (
             <div key={block.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <div className="bg-[#1F3A5F]/5 p-4 border-b border-gray-100 flex justify-between items-center">
                   <h4 className="font-semibold text-[#1F3A5F]">Dataset Block</h4>
                   <span className="text-xs text-gray-500">{new Date(block.createdAt).toLocaleString()}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                   <div className="mb-4">
                     <p className="font-medium text-sm text-gray-700 mb-2">Column Averages & Totals</p>
                     <div className="flex flex-wrap gap-2 text-xs">
                       {stats.filter(([_, s]) => s.type === 'numeric' && s.avg).map(([col, s]) => (
                         <span key={col} className="bg-[#B5651D]/10 text-[#B5651D] px-2 py-1 rounded font-mono">
                           <b>{col}:</b> Avg {s.avg} | Sum {s.sum}
                         </span>
                       ))}
                     </div>
                   </div>
                   <p className="font-medium text-sm text-gray-700 mb-2 mt-6">Preview Selection</p>
                   {/* Render table preview raw securely since we generated it serverside without user XSS input vectors directly */}
                   <div dangerouslySetInnerHTML={{ __html: json.tablePreview }} className="prose prose-sm max-w-none" />
                </div>
             </div>
           )
        })}
      </div>
    </div>
  )
}
