'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'signin' | 'register'>('signin')
  
  // Data State
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('Student')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
       setError('Please provide both email and password.')
       return
    }

    if (viewMode === 'register' && (!firstName || !lastName || !termsAccepted)) {
       setError('Please fill in all required fields and accept the terms.')
       return
    }

    setLoading(true)
    try {
      if (viewMode === 'register') {
        const payload = { email, firstName, lastName, password, accountType }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create account')
        router.push('/dashboard')
      } else {
        const payload = { email, password }
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Invalid email or password')
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200">
        
        <div className="p-8 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {viewMode === 'signin' ? 'ReportWise' : 'Create your account'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {viewMode === 'signin' ? 'Sign in to your account' : 'Start writing in under a minute'}
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-1 space-x-1">
              <span className="text-gray-900">EN</span> <span className="opacity-50">|</span> <span>SW</span>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Registration Only Fields */}
            {viewMode === 'register' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Amina"
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Juma"
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
              />
            </div>

            {/* Registration Extras */}
            {viewMode === 'register' && (
               <div className="pt-2">
                 <p className="text-sm font-medium text-gray-700 mb-2">I'm writing as a</p>
                 <div className="flex flex-wrap gap-2">
                    {['Student', 'Researcher', 'Professional', 'Organization'].map(t => (
                       <button
                         key={t}
                         type="button"
                         onClick={() => setAccountType(t)}
                         className={`px-4 py-1.5 rounded-md text-sm border transition-colors ${
                           accountType === t 
                           ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                           : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                         {t}
                       </button>
                    ))}
                 </div>
                 <div className="mt-6 flex items-start gap-2">
                    <input 
                       type="checkbox" 
                       id="terms" 
                       required
                       checked={termsAccepted}
                       onChange={e => setTermsAccepted(e.target.checked)}
                       className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0E8A7D] focus:ring-[#0E8A7D]" 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                       I agree to the Terms and Privacy Policy
                    </label>
                 </div>
               </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-lg font-medium transition-colors disabled:opacity-50 mt-4 custom-shadow ${
                viewMode === 'register' 
                  ? 'bg-gray-900 hover:bg-black text-white' 
                  : 'bg-[#1F3A5F] hover:bg-[#162a45] text-white'
              }`}
            >
              {loading ? 'Processing...' : (viewMode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>
        </div>
        
        <div className="p-6 text-center text-sm font-medium bg-gray-50/50 rounded-b-2xl">
           {viewMode === 'signin' ? (
              <span className="text-gray-600">
                New to ReportWise? <button onClick={() => setViewMode('register')} className="text-[#0E8A7D] hover:underline underline-offset-2">Create an account</button>
              </span>
           ) : (
              <span className="text-gray-600">
                Already have an account? <button onClick={() => setViewMode('signin')} className="text-[#0E8A7D] hover:underline underline-offset-2">Sign in</button>
              </span>
           )}
        </div>
      </div>
    </div>
  )
}
