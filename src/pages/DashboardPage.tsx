import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ToolCard from '@/components/ToolCard'

interface Tool {
  id: string
  name: string
  description: string
  url: string
  type: string
  icon: string
  category_id: string
  tags: string[]
  status: string
  view_count: number
  created_at: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  display_order: number
}

export default function DashboardPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [toolsResponse, categoriesResponse] = await Promise.all([
        supabase.from('tools').select('*').eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ])

      if (toolsResponse.data) setTools(toolsResponse.data)
      if (categoriesResponse.data) setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const categoryId = tool.category_id || 'uncategorized'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3">
            Welcome to Dixa Tools Hub
          </h1>
          <p className="text-lg text-secondary max-w-2xl">
            Your central hub for internal tools, POCs, and MVPs.
            Explore our collection of resources designed to help you work more efficiently.
          </p>
        </div>

        {/* Featured Tool: Conversation Generator */}
        <div className="mb-8 bg-white rounded-lg border-2 border-primary/20 p-6 hover:border-primary/40 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💬</span>
                <h2 className="text-2xl font-bold text-primary">Conversation Generator</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Featured</span>
              </div>
              <p className="text-secondary mb-4">
                Generate realistic test conversations in your Dixa instance. Perfect for demos, testing, and training.
              </p>
              <Link
                to="/conversation-generator"
                className="inline-flex items-center px-6 py-3 bg-primary text-light-text rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="mr-2">🚀</span>
                Open Conversation Generator
              </Link>
            </div>
          </div>
        </div>

        {/* Add New Tool Button */}
        <div className="mb-8">
          <Link
            to="/admin/add-tool"
            className="inline-flex items-center px-6 py-3 bg-primary text-light-text rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="mr-2">➕</span>
            Add New Tool
          </Link>
        </div>

        {/* Tools by Category */}
        {tools.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-primary mb-2">No tools yet</h3>
            <p className="text-secondary mb-6">
              Get started by adding your first tool to the hub
            </p>
            <Link
              to="/admin/add-tool"
              className="inline-flex items-center px-6 py-3 bg-primary text-light-text rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="mr-2">➕</span>
              Add Your First Tool
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryTools = toolsByCategory[category.id] || []

              if (categoryTools.length === 0) return null

              return (
                <section key={category.id}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
                    <span className="ml-3 text-sm text-secondary">
                      ({categoryTools.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </section>
              )
            })}

            {/* Uncategorized tools */}
            {toolsByCategory.uncategorized && toolsByCategory.uncategorized.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">📁</span>
                  <h2 className="text-2xl font-bold text-primary">Other Tools</h2>
                  <span className="ml-3 text-sm text-secondary">
                    ({toolsByCategory.uncategorized.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toolsByCategory.uncategorized.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
