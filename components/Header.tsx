'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-primary border-b-2 border-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🔧</span>
            <span className="text-2xl font-semibold text-light">Dixa Tools Hub</span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-6 py-3 text-sm font-semibold text-light hover:bg-white/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  )
}
