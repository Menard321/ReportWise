'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'

export function UserMenu({ name, email }: { name: string | null, email: string | null }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  // Close the dropdown when clicking outside (simple optional trick: wrapping in a blurry background for mobile, but fine as is for now)
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
      >
        <div className="h-8 w-8 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center font-bold">
          <User className="h-4 w-4" />
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-sm font-semibold text-[#1F3A5F] truncate">{name || 'User Account'}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{email || ''}</p>
          </div>
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
      
      {/* Invisible overlay to close dropdown */}
      {open && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
