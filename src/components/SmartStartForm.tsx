'use client'

import { useState, useMemo, useEffect } from 'react'
import { UploadCloud, FileType, CheckCircle2, X, Sparkles, BookOpen } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const FEATURED_UNIVERSITIES = [
  { id: 'udsm', name: 'University of Dar es Salaam' },
  { id: 'udom', name: 'University of Dodoma' },
  { id: 'sua', name: 'Sokoine University of Agriculture' },
  { id: 'muhas', name: 'Muhimbili University of Health and Allied Sciences' },
  { id: 'mzumbe', name: 'Mzumbe University' },
  { id: 'aru', name: 'Ardhi University' },
  { id: 'out', name: 'Open University of Tanzania' },
  { id: 'ifm', name: 'Institute of Finance Management' },
  { id: 'saut', name: 'St. Augustine University of Tanzania' },
  { id: 'mocu', name: 'Moshi Co-operative University' }
];

const RECOMMENDED_INPUTS: Record<string, string[]> = {
  'field_report': ['Field guidelines', 'Daily notes (Logbook)', 'Photos', 'Organization details'],
  'final_year_project': ['Guidelines', 'Approved proposal', 'Questionnaire or Data', 'Existing chapters'],
  'research_report': ['Data file (Excel/CSV)', 'Questionnaire', 'Proposal'],
  'organizational_analysis': ['Organization data (KPIs, Sales)', 'Internal documents']
}

export function SmartStartForm({ reportTypes, universities }: { reportTypes: any[], universities: any[] }) {
  const router = useRouter()
  
  // State for Card 1 (Uploads)
  const [files, setFiles] = useState<{ id: string, file: File, label: string }[]>([])
  const fileLabels = ['Guidelines', 'Sample report', 'Cover page', 'Field notes', 'Data', 'My draft', 'Other']

  const searchParams = useSearchParams()
  const urlType = searchParams.get('type')
  
  // Try to find if urlType matches any reportType key or id
  const initialTypeObj = reportTypes.find(rt => rt.key === urlType || rt.id === urlType)
  const initialTypeId = initialTypeObj ? initialTypeObj.id : ''

  // State for Card 2 (Instructions)
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  
  const [selectedType, setSelectedType] = useState(initialTypeId)
  
  const [pageTarget, setPageTarget] = useState(40)
  const [selectedUniversity, setSelectedUniversity] = useState('')
  const [customUniversity, setCustomUniversity] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        label: 'Other'
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }
  
  // Derive selected report type object to fetch key
  const activeTypeObj = reportTypes.find(rt => rt.id === selectedType);
  const activeTypeKey = activeTypeObj ? activeTypeObj.key : null; // Assumes DB 'key' field exists and matches 'field_report' etc

  // Validation Logic (v3.3)
  const hasTitle = title.trim().length > 2;
  const hasFiles = files.length > 0;
  
  // Title or File is strictly required to start
  const baseRequirementsMet = hasTitle || hasFiles;
  
  // University Requirement (Required if Field Report or FYP)
  const needsUniversity = activeTypeKey === 'field_report' || activeTypeKey === 'final_year_project';
  const universityResolved = selectedUniversity === 'missing' 
      ? customUniversity.trim().length > 3 
      : selectedUniversity.length > 0;

  // Report Type is strictly required before submission
  const canSubmit = baseRequirementsMet && selectedType.length > 0 && (!needsUniversity || universityResolved);

  // Readiness Indicator logic
  const readinessValue = useMemo(() => {
    let score = 0;
    if (hasTitle) score += 30;
    if (hasFiles) score += 30;
    if (instructions.trim().length > 10) score += 20;
    if (selectedType) score += 10;
    if (universityResolved) score += 10;
    return Math.min(100, score);
  }, [hasTitle, hasFiles, instructions, selectedType, universityResolved]);


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      const submitData = new FormData()
      
      submitData.append('title', title)
      submitData.append('reportTypeId', selectedType)
      submitData.append('pageTarget', pageTarget.toString())
      submitData.append('universityId', selectedUniversity)
      if (selectedUniversity === 'missing') {
        submitData.append('customUniversity', customUniversity)
      }
      if (instructions) {
        submitData.append('instructions', instructions)
      }

      files.forEach((f, idx) => {
        submitData.append(`file_${idx}`, f.file)
        submitData.append(`label_file_${idx}`, f.label)
      })

      const res = await fetch('/api/reports/start', {
        method: 'POST',
        body: submitData
      })
      
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to submit pipeline.')
      }

      const { reportId } = await res.json()
      router.push(`/report/${reportId}/confirm`)
      
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#1F3A5F]">What do you want to write today?</h2>
        <p className="mt-1 text-gray-500 font-medium">Upload your documents, tell us what you need, or do both.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: Upload Documents - Premium Glass Effect */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-gray-200/60 duration-300">
          <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-[#1F3A5F] mb-6 flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-[#0E8A7D]" />
              Upload your documents
            </h3>
            
            <div className="border-2 border-dashed border-[#0E8A7D]/30 bg-[#0E8A7D]/5 hover:bg-[#0E8A7D]/10 rounded-2xl p-10 text-center transition-all duration-300 transform hover:scale-[1.01] flex flex-col items-center justify-center min-h-[220px]">
              <UploadCloud className="mx-auto h-12 w-12 text-[#0E8A7D]/60" />
              <div className="mt-5 flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer rounded-md font-bold text-[#0E8A7D] hover:text-[#0c786c]">
                  <span>Upload a file</span>
                  <input type="file" multiple className="sr-only" onChange={handleFileUpload} accept=".docx,.pdf,.xlsx,.csv,.png,.jpg" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Word, PDF, Excel, or Image up to 20MB</p>
            </div>

            {/* V3.3 Dynamic Recommended Uploads Chips */}
            {activeTypeKey && RECOMMENDED_INPUTS[activeTypeKey] && (
              <div className="mt-6">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Recommended for {activeTypeObj?.name}</span>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDED_INPUTS[activeTypeKey].map(rec => (
                   <span key={rec} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                     {rec}
                   </span>
                  ))}
                </div>
              </div>
            )}
            
            {files.length > 0 && (
              <div className="mt-6 flex-1 overflow-y-auto pr-2">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 block">Uploaded ({files.length})</h4>
                <ul className="space-y-3">
                  {files.map(f => (
                    <li key={f.id} className="flex flex-col bg-gray-50/80 rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <FileType className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate">{f.file.name}</span>
                        </div>
                        <button onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <select 
                        value={f.label}
                        onChange={(e) => setFiles(prev => prev.map(item => item.id === f.id ? {...item, label: e.target.value} : item))}
                        className="text-xs border-gray-200 bg-white rounded-lg focus:ring-[#0E8A7D] focus:border-[#0E8A7D] font-medium"
                      >
                        {fileLabels.map(label => <option key={label} value={label}>{label}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Instructions - Premium */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-gray-200/60 duration-300">
          <div className="p-8 flex-1 flex flex-col space-y-6">
            <h3 className="text-xl font-bold text-[#1F3A5F] mb-2 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#1F3A5F]" />
              Tell ReportWise what to write
            </h3>

            {/* V3.3 Required Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Report Title or Topic {!hasFiles && <span className="text-orange-500">*</span>}
              </label>
              {!hasFiles && <span className="text-xs text-gray-500 mb-2 block">No documents? Just enter your title and we'll ask what we need.</span>}
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3 font-medium transition-all"
                placeholder="E.g. Analysis of VAT returns at Example Consultancy Ltd..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Instructions (Optional)</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3 block transition-all"
                rows={3}
                placeholder="E.g., I need a field attachment report for my 8 weeks at the tax authority. Use my dataset to write the findings..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {!initialTypeId && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Report Type <span className="text-orange-500">*</span>
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3 block font-medium"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Select a report type</option>
                  {reportTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-4 flex-col sm:flex-row">
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-gray-800 mb-1">Page Goal</label>
                 <input
                   type="number"
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3"
                   value={pageTarget}
                   onChange={(e) => setPageTarget(parseInt(e.target.value) || 0)}
                 />
               </div>
               <div className="flex-[2]">
                 <label className="block text-sm font-semibold text-gray-800 mb-1">
                   University {needsUniversity && <span className="text-orange-500">*</span>}
                 </label>
                 <select
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3 font-medium"
                   value={selectedUniversity}
                   onChange={(e) => setSelectedUniversity(e.target.value)}
                 >
                   <option value="">Select university</option>
                   {FEATURED_UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   <option disabled>──────────</option>
                   <option value="missing">My university is not listed</option>
                 </select>
                 
                 {/* V3.3 Dynamic University Custom Text */}
                 {selectedUniversity === 'missing' && (
                   <input 
                     type="text" 
                     className="mt-3 w-full animate-in fade-in slide-in-from-top-2 bg-gray-50 border border-gray-100 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-[#0E8A7D] outline-none hover:bg-gray-100/50 sm:text-sm p-3"
                     placeholder="Write your university's name"
                     value={customUniversity}
                     onChange={(e) => setCustomUniversity(e.target.value)}
                   />
                 )}
               </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-2xl shadow-gray-200/50 border border-white/80 sticky bottom-6 z-10 hover:bg-white/95 transition-all duration-300 ring-1 ring-gray-100/50">
        
        {/* V3.3 Readiness Indicator */}
        <div className="flex-1 w-full sm:w-auto mb-6 sm:mb-0 max-w-sm">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-gray-700">Information gathered: {readinessValue}%</span>
            {readinessValue < 50 && <span className="text-xs text-gray-400">Add more for a stronger draft</span>}
            {readinessValue >= 50 && <span className="text-xs text-[#0E8A7D] flex items-center font-semibold"><Sparkles className="h-3 w-3 mr-1"/> Ready to draft</span>}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-2.5 rounded-full transition-all duration-700 ease-out" 
              style={{ 
                width: `${readinessValue}%`,
                backgroundColor: readinessValue > 60 ? '#0E8A7D' : (readinessValue > 20 ? '#3b82f6' : '#9ca3af')
              }}
            ></div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#0E8A7D] px-10 py-4 text-base font-bold text-white shadow-md shadow-[#0E8A7D]/30 hover:bg-[#0c786c] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 min-w-[200px]"
        >
          {isSubmitting ? (
             <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
          ) : (
             canSubmit && <CheckCircle2 className="mr-2 h-5 w-5" />
          )}
          {isSubmitting ? 'Starting Engine...' : 'Write my report'}
        </button>
      </div>
    </div>
  )
}
