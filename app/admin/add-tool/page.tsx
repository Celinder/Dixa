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
      <header className="bg-white border-b border-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-secondary hover:text-primary">
              <span className="mr-2">←</span>
              <span>Back to Hub</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Add New Tool</h1>
          <p className="text-secondary">
            Add a new tool, POC, or MVP to the Dixa Tools Hub
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            ✅ Tool added successfully! Redirecting to home...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-error-red/20 text-error-red px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-secondary/20 p-8">
          <div className="space-y-6">
            {/* Tool Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                Tool Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="BattleCard Generator"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Generate competitive battlecards for SDRs and AEs"
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-primary mb-2">
                URL *
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="https://claude.ai/artifact/abc123 or https://github.com/..."
              />
              <p className="mt-1 text-xs text-secondary">
                Can be a Claude Artifact, GitHub repo, web app, or any URL
              </p>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-primary mb-2">
                Tool Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="artifact">Claude Artifact</option>
                <option value="repo">Repository</option>
                <option value="webapp">Web App</option>
                <option value="external">External Link</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-primary mb-2">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <label htmlFor="icon" className="block text-sm font-medium text-primary mb-2">
                Icon
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  id="icon"
                  name="icon"
                  type="text"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-20 px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center text-2xl"
                />
                <span className="text-sm text-secondary">Choose an emoji icon</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonIcons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className="w-10 h-10 flex items-center justify-center border border-secondary/30 rounded hover:border-primary hover:bg-primary/5 transition-colors text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-primary mb-2">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="SDR, AE, Competition (comma-separated)"
              />
              <p className="mt-1 text-xs text-secondary">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-light-text py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Tool...' : 'Add Tool'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-secondary/30 rounded-lg font-medium text-secondary hover:border-secondary hover:text-primary transition-colors text-center"
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
