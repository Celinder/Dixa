'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  icon: string
}

export default function AddToolPage() {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    type: 'artifact' as 'artifact' | 'repo' | 'webapp' | 'external',
    category_id: '',
    icon: '🔧',
    tags: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('display_order', { ascending: true })

    if (data) {
      setCategories(data)
      if (data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to add tools')
      }

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error: insertError } = await supabase.from('tools').insert({
        name: formData.name,
        description: formData.description,
        url: formData.url,
        type: formData.type,
        category_id: formData.category_id || null,
        icon: formData.icon,
        tags,
        status: 'active',
        created_by: user.id,
      })

      if (insertError) throw insertError

      setSuccess(true)

      // Reset form
      setFormData({
        name: '',
        description: '',
        url: '',
        type: 'artifact',
        category_id: categories[0]?.id || '',
        icon: '🔧',
        tags: '',
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add tool')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const commonIcons = ['🔧', '⚔️', '✍️', '🎯', '🔌', '📊', '🚀', '💡', '🎨', '📦', '🔍', '⚡']

  return (
    <div className="min-h-screen bg-background-light">
      <header className="bg-primary border-b-2 border-primary shadow-lg">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center h-20">
            <Link href="/" className="flex items-center text-light hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-semibold">
              <span className="mr-2 text-xl">←</span>
              <span>Back to Hub</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-primary mb-3">Add New Tool</h1>
          <p className="text-base text-secondary">
            Add a new tool, POC, or MVP to the Dixa Tools Hub
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-300 text-green-800 px-6 py-4 rounded-xl font-semibold shadow-lg">
            ✅ Tool added successfully! Redirecting to home...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-error-red/30 text-error-red px-6 py-4 rounded-xl font-semibold shadow-lg">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-secondary p-8 shadow-lg">
          <div className="space-y-6">
            {/* Tool Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
                Tool Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="BattleCard Generator"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-primary mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Generate competitive battlecards for SDRs and AEs"
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-primary mb-2">
                URL *
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="https://claude.ai/artifact/abc123 or https://github.com/..."
              />
              <p className="mt-2 text-xs text-secondary">
                Can be a Claude Artifact, GitHub repo, web app, or any URL
              </p>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-primary mb-2">
                Tool Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="artifact">Claude Artifact</option>
                <option value="repo">Repository</option>
                <option value="webapp">Web App</option>
                <option value="external">External Link</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-semibold text-primary mb-2">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label htmlFor="icon" className="block text-sm font-semibold text-primary mb-2">
                Icon
              </label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  id="icon"
                  name="icon"
                  type="text"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-20 px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-3xl transition-all"
                />
                <span className="text-sm text-secondary font-semibold">Choose an emoji icon</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonIcons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className="w-12 h-12 flex items-center justify-center border-2 border-secondary rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-2xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-primary mb-2">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="SDR, AE, Competition (comma-separated)"
              />
              <p className="mt-2 text-xs text-secondary">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-light py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Tool...' : 'Add Tool'}
              </button>
              <Link
                href="/"
                className="px-8 py-4 border-2 border-secondary rounded-xl font-semibold text-secondary hover:border-primary hover:text-primary transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
