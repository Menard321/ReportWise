'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { queueOfflineAction } from '@/lib/offline-sync'

export default function TipTapEditor({ 
  initialContent, 
  sectionKey, 
  reportId 
}: { 
  initialContent: string, 
  sectionKey: string,
  reportId: string 
}) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'offline-queued'>('saved')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [showDataModal, setShowDataModal] = useState(false)
  const [analysisBlocks, setAnalysisBlocks] = useState<any[]>([])

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p>Enter draft text here...</p>',
    onUpdate: () => setSaveStatus('dirty')
  })

  // Basic Autosave Hook with Offline queue
  useEffect(() => {
    if (saveStatus !== 'dirty') return

    const timeout = setTimeout(async () => {
      setSaveStatus('saving')
      const payload = { reportId, sectionKey, content: editor?.getHTML() }
      
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await queueOfflineAction('/api/reports/section', 'POST', payload)
        setSaveStatus('offline-queued')
        return
      }

      try {
        const res = await fetch('/api/reports/section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('API Reject')
        setSaveStatus('saved')
      } catch (e) {
        await queueOfflineAction('/api/reports/section', 'POST', payload)
        setSaveStatus('offline-queued')
      }
    }, 1500)

    return () => clearTimeout(timeout)
  }, [editor?.getHTML(), saveStatus, sectionKey, reportId])

  useEffect(() => {
    // Prefetch datasets if they exist for easy insertion
    fetch(`/api/dataset/upload?reportId=${reportId}`)
      .then(r => r.json())
      .then(d => setAnalysisBlocks(d.blocks || []))
      .catch()
  }, [reportId])

  const improveWithAi = async () => {
    if (!editor || isAiLoading) return
    setIsAiLoading(true)
    try {
      const currentText = editor.getText()
      if (!currentText.trim() || currentText.includes('Enter draft text here')) {
         alert('Please write some content first.')
         setIsAiLoading(false)
         return
      }

      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, language: 'en' }) // defaulting EN
      })
      const data = await res.json()
      if (data.improvedText) {
        setAiSuggestion(data.improvedText)
      }
    } catch {
      alert('AI improvement failed. Check your connection.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const acceptSuggestion = () => {
    if (editor && aiSuggestion) {
      editor.commands.setContent(`<p>${aiSuggestion}</p>`)
      setAiSuggestion(null)
    }
  }

  const insertTable = (htmlTable: string) => {
    if (editor) {
       editor.commands.insertContent(`<br/>${htmlTable}<br/>`)
       setShowDataModal(false)
    }
  }

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col relative">
      {/* Mini toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2 items-center flex-wrap">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1.5 rounded text-sm font-medium ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 rounded text-sm font-medium ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>I</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1.5 rounded text-sm font-medium ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>• List</button>
        
        {analysisBlocks.length > 0 && (
          <button 
             onClick={() => setShowDataModal(!showDataModal)}
             className="px-3 py-1.5 rounded text-sm font-medium bg-[#1F3A5F]/10 text-[#1F3A5F] hover:bg-[#1F3A5F]/20 ml-2"
          >
            📊 Insert Data
          </button>
        )}

        <div className="ml-auto flex items-center gap-4">
           <button 
             onClick={improveWithAi} 
             disabled={isAiLoading}
             className="flex items-center gap-2 bg-[#0E8A7D]/10 text-[#0E8A7D] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#0E8A7D]/20 transition-colors disabled:opacity-50"
           >
             ✨ {isAiLoading ? 'Improving...' : 'Improve with AI'}
           </button>
           <div className="text-xs font-medium text-gray-500 w-24 text-right">
             {saveStatus === 'saved' ? '✓ Saved' : 
              saveStatus === 'saving' ? 'Saving...' : 
              saveStatus === 'offline-queued' ? '☁ Queued' : 'Unsaved'}
           </div>
        </div>
      </div>
      
      {/* Data Insertion Box */}
      {showDataModal && analysisBlocks.length > 0 && (
         <div className="bg-gray-50 border-b border-gray-200 p-4">
           <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">My Dataset Components</p>
           <div className="flex flex-wrap gap-2">
             {analysisBlocks.map((b, i) => {
               const j = JSON.parse(b.resultJson || '{}')
               const statsObj = JSON.stringify(j.statistics || {}).replace(/[{}]/g, '').substring(0, 50) + '...'
               return (
                 <button 
                   key={b.id} 
                   onClick={() => insertTable(j.tablePreview)}
                   className="text-left bg-white border border-gray-300 p-2 rounded hover:border-[#1F3A5F] group w-full sm:w-auto"
                 >
                    <div className="text-xs font-bold text-[#1F3A5F] group-hover:underline">Insert Setup Table {i+1}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{statsObj}</div>
                 </button>
               )
             })}
           </div>
         </div>
      )}

      {/* AI Suggestion Panel */}
      {aiSuggestion && (
        <div className="bg-orange-50 border-b border-orange-200 p-4">
          <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">AI Suggestion</p>
          <div className="text-sm text-gray-800 mb-3 bg-white p-3 rounded border border-orange-100 whitespace-pre-wrap">{aiSuggestion}</div>
          <div className="flex gap-3">
             <button onClick={acceptSuggestion} className="bg-[#B5651D] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#9a5416]">Accept & Replace</button>
             <button onClick={() => setAiSuggestion(null)} className="text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded text-sm font-medium">Reject</button>
          </div>
        </div>
      )}

      {/* Editor Main */}
      <div className="p-5 min-h-[350px] max-h-[600px] overflow-y-auto prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} className="focus:outline-none" />
      </div>
    </div>
  )
}
