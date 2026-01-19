'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tool {
  id: string
  name: string
  description: string
  url: string
  type: string
  icon: string
  tags: string[]
  view_count: number
}

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  const [viewCount, setViewCount] = useState(tool.view_count)
  const supabase = createClient()

  const handleClick = async () => {
    // Track view
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Insert view record
        await supabase.from('tool_views').insert({
          tool_id: tool.id,
          user_id: user.id,
        })

        // Update view count
        const { data } = await supabase
          .from('tools')
          .update({ view_count: viewCount + 1 })
          .eq('id', tool.id)
          .select('view_count')
          .single()

        if (data) {
          setViewCount(data.view_count)
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error)
    }

    // Open tool in new tab
    window.open(tool.url, '_blank', 'noopener,noreferrer')
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      artifact: 'Claude Artifact',
      repo: 'Repository',
      webapp: 'Web App',
      external: 'External Link',
    }
    return labels[type] || type
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      artifact: 'bg-blue-100 text-blue-800',
      repo: 'bg-green-100 text-green-800',
      webapp: 'bg-purple-100 text-purple-800',
      external: 'bg-gray-100 text-gray-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl border-2 border-secondary hover:border-primary transition-all duration-200 overflow-hidden group shadow-lg hover:shadow-xl">
      <button
        onClick={handleClick}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {/* Icon and Type Badge */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-5xl">{tool.icon}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(tool.type)}`}>
            {getTypeLabel(tool.type)}
          </span>
        </div>

        {/* Tool Name */}
        <h3 className="text-xl font-semibold text-primary mb-3 group-hover:text-secondary transition-colors">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
          {tool.description}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="px-3 py-1 text-secondary text-xs font-semibold">
                +{tool.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-secondary font-semibold">
          <span>👁️ {viewCount} views</span>
          <span className="group-hover:text-primary transition-colors flex items-center gap-1">
            Launch
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </button>
    </div>
  )
}
