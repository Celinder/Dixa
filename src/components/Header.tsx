import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="bg-white border-b border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔧</span>
            <span className="text-xl font-bold text-primary">Dixa Tools Hub</span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  )
}
