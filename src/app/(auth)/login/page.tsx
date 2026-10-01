'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'signin' | 'register'>('signin')
  const [tabMode, setTabMode] = useState<'phone' | 'email'>('phone')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  
  // Data State
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState('Student')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const getIdentifier = () => tabMode === 'phone' ? phone : email

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const identifier = getIdentifier()
    if (!identifier) {
       setError(`Please enter your ${tabMode}.`)
       return
    }

    if (viewMode === 'register' && (!fullName || !termsAccepted)) {
       setError('Please fill full name and accept terms.')
       return
    }

    setLoading(true)
    try {
      const payload: any = { identifier }
      if (viewMode === 'register') {
        payload.name = fullName
        payload.accountType = accountType
      }

      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send OTP')
      setStep('verify')
      // Auto focus first OTP input slightly delayed
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch {
      setError('Error sending OTP. Make sure your server is restarted after Database updates.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) return

    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: getIdentifier(), code: fullCode }),
      })
      if (!res.ok) throw new Error('Invalid Code')
      router.push('/dashboard')
    } catch {
      setError('Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return
    
    const newCode = [...code]
    newCode[index] = value.substring(value.length - 1) // strictly 1 char
    setCode(newCode)

    // Auto advance
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200">
        
        {/* OTP Verify View */}
        {step === 'verify' ? (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter your code</h1>
                  <p className="text-sm text-gray-500">
                     Sent to {tabMode === 'phone' ? `+255 ${phone}` : email}
                  </p>
               </div>
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                 <span className="text-lg">🔒</span>
               </div>
            </div>

            {error && <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

            <form onSubmit={handleVerify}>
               <div className="flex justify-between gap-2 mb-8">
                 {code.map((digit, idx) => (
                   <input
                     key={idx}
                     ref={(el) => { codeRefs.current[idx] = el }}
                     type="text"
                     inputMode="numeric"
                     value={digit}
                     onChange={(e) => handleCodeChange(idx, e.target.value)}
                     onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                     className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                   />
                 ))}
               </div>

               <button
                  type="submit"
                  disabled={loading || code.join('').length < 6}
                  className="w-full h-12 rounded-lg bg-gray-900 text-white font-medium hover:bg-black transition-colors disabled:opacity-50 mb-6"
               >
                 {loading ? 'Verifying...' : 'Verify and continue'}
               </button>

               <div className="flex justify-between text-sm font-medium">
                 <span className="text-gray-500">Resend code in 0:42</span>
                 <button type="button" onClick={() => setStep('request')} className="text-[#0E8A7D] hover:underline">
                   Change {tabMode}
                 </button>
               </div>
            </form>
          </div>
        ) : (
          /* Request Token View (SignIn | Register) */
          <>
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

              {/* Login Only: Phone or Email Selector Tabs */}
              {viewMode === 'signin' && (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                  <button 
                    type="button"
                    onClick={() => setTabMode('phone')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${tabMode === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Phone
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTabMode('email')}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${tabMode === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Email
                  </button>
                </div>
              )}

              <form onSubmit={handleRequest} className="space-y-5">
                {/* Registration Only Fields */}
                {viewMode === 'register' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">Full name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Amina Juma"
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                    />
                  </div>
                )}

                {/* Primary Identifier */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    {viewMode === 'register' ? 'Phone or email' : (tabMode === 'phone' ? 'Phone number' : 'Email address')}
                  </label>
                  
                  {tabMode === 'phone' && viewMode === 'signin' ? (
                    <div className="flex gap-2">
                       <div className="w-20 h-11 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 font-medium">
                         +255
                       </div>
                       <input
                         type="text"
                         required
                         value={phone}
                         onChange={e => setPhone(e.target.value)}
                         placeholder="7XX XXX XXX"
                         className="flex-1 h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                       />
                    </div>
                  ) : (
                     <input
                       type={viewMode === 'signin' && tabMode === 'email' ? 'email' : 'text'}
                       required
                       value={viewMode === 'signin' ? email : phone}
                       onChange={e => viewMode === 'signin' ? setEmail(e.target.value) : setPhone(e.target.value)}
                       placeholder={viewMode === 'register' ? '+255 7XX XXX XXX / email@domain.com' : 'email@domain.com'}
                       className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:border-[#1F3A5F] focus:ring-1 focus:ring-[#1F3A5F] outline-none transition-all"
                     />
                  )}
                </div>

                {/* Registration Extras */}
                {viewMode === 'register' && (
                   <div className="pt-2">
                     <p className="text-sm text-gray-700 mb-2">I'm writing as a</p>
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
                        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                           I agree to the Terms and Privacy Policy
                        </label>
                     </div>
                   </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-semibold transition-colors disabled:opacity-50 mt-4 custom-shadow outline-button"
                  style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                >
                  {loading ? 'Processing...' : (viewMode === 'signin' ? 'Send code' : 'Create account')}
                </button>
                
                {viewMode === 'signin' && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    We'll text you a 6-digit code. No password needed.
                  </p>
                )}
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
          </>
        )}
      </div>
    </div>
  )
}
