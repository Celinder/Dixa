import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/ToolCard'
import Header from '@/components/Header'
import Link from 'next/link'

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

async function getTools() {
  const supabase = await createClient()

  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tools:', error)
    return []
  }

  return tools as Tool[]
}

async function getCategories() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories as Category[]
}

export default async function HomePage() {
  const tools = await getTools()
  const categories = await getCategories()

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const categoryId = tool.category_id || 'uncategorized'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  return (
    <div className="min-h-screen bg-background-light">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-semibold text-primary mb-4 leading-tight">
            Welcome to Dixa Tools Hub
          </h1>
          <p className="text-base text-secondary max-w-3xl leading-relaxed">
            Your central hub for internal tools, POCs, and MVPs.
            Explore our collection of resources designed to help you work more efficiently.
          </p>
        </div>

        {/* Add New Tool Button */}
        <div className="mb-12">
          <Link
            href="/admin/add-tool"
            className="inline-flex items-center px-8 py-4 bg-primary text-light rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="mr-2 text-xl">➕</span>
            Add New Tool
          </Link>
        </div>

        {/* Tools by Category */}
        {tools.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border-2 border-secondary shadow-lg">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-3xl font-semibold text-primary mb-3">No tools yet</h3>
            <p className="text-base text-secondary mb-8 max-w-md mx-auto">
              Get started by adding your first tool to the hub
            </p>
            <Link
              href="/admin/add-tool"
              className="inline-flex items-center px-8 py-4 bg-primary text-light rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              <span className="mr-2 text-xl">➕</span>
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
                    <span className="text-4xl mr-4">{category.icon}</span>
                    <h2 className="text-3xl font-semibold text-primary">{category.name}</h2>
                    <span className="ml-4 px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                      {categoryTools.length}
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
                  <span className="text-4xl mr-4">📁</span>
                  <h2 className="text-3xl font-semibold text-primary">Other Tools</h2>
                  <span className="ml-4 px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                    {toolsByCategory.uncategorized.length}
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
