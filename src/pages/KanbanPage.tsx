import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

interface Board {
  id: string
  name: string
  user_id: string
}

interface Swimlane {
  id: string
  board_id: string
  name: string
  position: number
}

interface Tag {
  id: string
  user_id: string
  name: string
  color: string
}

interface Card {
  id: string
  board_id: string
  swimlane_id: string | null
  title: string
  description: string | null
  status: 'backlog' | 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  position: number
  tags?: Tag[]
}

const STATUSES: Array<{id: 'backlog' | 'todo' | 'in_progress' | 'done', name: string}> = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'todo', name: 'To Do' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'done', name: 'Done' },
]

const PRIORITIES: Array<{id: 'low' | 'medium' | 'high' | 'urgent', name: string}> = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'urgent', name: 'Urgent' },
]

const defaultColors = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
]

export default function KanbanPage() {
  const [board, setBoard] = useState<Board | null>(null)
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [showAddCard, setShowAddCard] = useState<string | null>(null)
  const [showAddSwimlane, setShowAddSwimlane] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  // Form states
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newSwimlane, setNewSwimlane] = useState('')

  useEffect(() => {
    initializeBoard()
  }, [])

  const initializeBoard = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get or create board
      let { data: boards } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (!boards || boards.length === 0) {
        // Create default board
        const { data: newBoard, error: createError } = await supabase
          .from('boards')
          .insert({ user_id: user.id, name: 'My Board' })
          .select()
          .single()

        if (createError) throw createError
        boards = [newBoard]
      }

      setBoard(boards[0])
      await Promise.all([fetchSwimlanes(boards[0].id), fetchCards(boards[0].id), fetchTags(user.id)])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSwimlanes = async (boardId: string) => {
    const { data, error } = await supabase
      .from('swimlanes')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (error) throw error
    setSwimlanes(data || [])
  }

  const fetchCards = async (boardId: string) => {
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (cardsError) throw cardsError

    // Fetch tags for each card
    const cardsWithTags = await Promise.all(
      (cardsData || []).map(async (card) => {
        const { data: cardTags } = await supabase
          .from('card_tags')
          .select('tag_id')
          .eq('card_id', card.id)

        const tagIds = (cardTags || []).map((ct) => ct.tag_id)
        const cardTagsData = tags.filter((t) => tagIds.includes(t.id))

        return { ...card, tags: cardTagsData }
      })
    )

    setCards(cardsWithTags)
  }

  const fetchTags = async (userId: string) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    setTags(data || [])
  }

  const addCard = async (status: string) => {
    if (!board || !newCardTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          board_id: board.id,
          title: newCardTitle,
          status,
          priority: 'medium',
          position: cards.filter((c) => c.status === status).length,
        })
        .select()
        .single()

      if (error) throw error

      // Fetch tags for the new card
      const { data: cardTags } = await supabase
        .from('card_tags')
        .select('tag_id')
        .eq('card_id', data.id)

      const tagIds = (cardTags || []).map((ct) => ct.tag_id)
      const cardTagsData = tags.filter((t) => tagIds.includes(t.id))

      setCards([...cards, { ...data, tags: cardTagsData }])
      setNewCardTitle('')
      setShowAddCard(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      const { error } = await supabase.from('cards').update(updates).eq('id', cardId)

      if (error) throw error

      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c)))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId)

      if (error) throw error

      setCards((prev) => prev.filter((c) => c.id !== cardId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const addSwimlane = async () => {
    if (!board || !newSwimlane.trim()) return

    try {
      const { data, error } = await supabase
        .from('swimlanes')
        .insert({
          board_id: board.id,
          name: newSwimlane,
          position: swimlanes.length,
        })
        .select()
        .single()

      if (error) throw error

      setSwimlanes([...swimlanes, data])
      setNewSwimlane('')
      setShowAddSwimlane(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteSwimlane = async (swimlaneId: string) => {
    try {
      const { error } = await supabase.from('swimlanes').delete().eq('id', swimlaneId)

      if (error) throw error

      setSwimlanes((prev) => prev.filter((s) => s.id !== swimlaneId))
      // Remove swimlane from cards
      setCards((prev) =>
        prev.map((c) => (c.swimlane_id === swimlaneId ? { ...c, swimlane_id: null } : c))
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDragStart = (card: Card) => {
    setDraggedCard(card)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: string, swimlaneId: string | null = null) => {
    if (!draggedCard) return

    try {
      await updateCard(draggedCard.id, { status: status as any, swimlane_id: swimlaneId })
      setDraggedCard(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getCardsByStatusAndSwimlane = (status: string, swimlaneId: string | null) => {
    return cards.filter((c) => c.status === status && c.swimlane_id === swimlaneId)
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    return colors[priority]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header />
        <main className="max-w-full mx-auto px-4 py-6">
          <div className="text-center text-secondary">Loading your board...</div>
        </main>
      </div>
    )
  }

  const swimlanesWithNull = [{ id: null, name: 'No Swimlane' }, ...swimlanes]

  return (
    <div className="min-h-screen bg-background-light">
      <Header />

      <main className="max-w-full mx-auto px-4 py-3">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">My Kanban Board</h1>
          <button
            onClick={() => setShowAddSwimlane(!showAddSwimlane)}
            className="px-3 py-1.5 text-sm bg-primary text-light-text rounded hover:bg-primary/90"
          >
            {showAddSwimlane ? 'Cancel' : '+ Swimlane'}
          </button>
        </div>

        {/* Add Swimlane */}
        {showAddSwimlane && (
          <div className="mb-3 p-2.5 bg-white rounded-lg border border-secondary/20">
            <input
              type="text"
              value={newSwimlane}
              onChange={(e) => setNewSwimlane(e.target.value)}
              placeholder="Swimlane name"
              className="w-full px-3 py-1.5 text-sm border border-secondary/30 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addSwimlane()
              }}
            />
            <button
              onClick={addSwimlane}
              className="mt-2 px-3 py-1 text-sm bg-primary text-light-text rounded hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-3 min-w-full pb-4">
            {STATUSES.map((status) => (
              <div key={status.id} className="flex-1 min-w-[280px] max-w-[320px]">
                {/* Status Header */}
                <div className="bg-white rounded-t-lg border border-b-0 border-secondary/20 px-3 py-1.5">
                  <h2 className="font-semibold text-primary text-sm">{status.name}</h2>
                  <div className="text-xs text-secondary">
                    {cards.filter((c) => c.status === status.id).length} cards
                  </div>
                </div>

                {/* Cards Container */}
                <div
                  className="bg-gray-50 rounded-b-lg border border-secondary/20 p-2 min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] overflow-y-auto"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status.id)}
                >
                  {swimlanesWithNull.map((swimlane) => {
                    const swimlaneCards = getCardsByStatusAndSwimlane(status.id, swimlane.id)
                    if (swimlaneCards.length === 0 && swimlane.id !== null) return null

                    return (
                      <div key={swimlane.id || 'null'} className="mb-2">
                        {/* Swimlane Header */}
                        {swimlane.id !== null && swimlaneCards.length > 0 && (
                          <div className="flex items-center justify-between mb-1 px-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {swimlane.name}
                            </span>
                            <button
                              onClick={() => deleteSwimlane(swimlane.id!)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        )}

                        {/* Cards */}
                        <div className="space-y-1.5">
                          {swimlaneCards.map((card) => (
                            <div
                              key={card.id}
                              draggable
                              onDragStart={() => handleDragStart(card)}
                              onClick={() => setEditingCard(card)}
                              className="bg-white rounded border border-secondary/20 p-2 cursor-pointer hover:shadow-md transition-shadow group"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-medium text-primary flex-1 leading-tight">
                                  {card.title}
                                </h3>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(card.priority)}`}>
                                  {card.priority}
                                </span>
                              </div>

                              {card.description && (
                                <p className="text-xs text-secondary mb-1 line-clamp-2 leading-snug">
                                  {card.description}
                                </p>
                              )}

                              {card.tags && card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {card.tags.map((tag) => (
                                    <span
                                      key={tag.id}
                                      className="text-xs px-1.5 py-0.5 rounded"
                                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                    >
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to edit
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Card Button */}
                  {showAddCard === status.id ? (
                    <div className="bg-white rounded border border-secondary/20 p-2 mt-2">
                      <input
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCard(status.id)
                          if (e.key === 'Escape') {
                            setShowAddCard(null)
                            setNewCardTitle('')
                          }
                        }}
                        placeholder="Card title"
                        className="w-full px-2 py-1 text-sm border border-secondary/30 rounded mb-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addCard(status.id)}
                          className="px-3 py-1 text-xs bg-primary text-light-text rounded hover:bg-primary/90"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCard(null)
                            setNewCardTitle('')
                          }}
                          className="px-3 py-1 text-xs text-secondary border border-secondary/30 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddCard(status.id)}
                      className="w-full mt-2 px-2 py-1.5 text-sm text-secondary border border-dashed border-secondary/30 rounded hover:bg-white hover:border-secondary/50 transition-colors"
                    >
                      + Add Card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          allTags={tags}
          allStatuses={STATUSES}
          allPriorities={PRIORITIES}
          onClose={() => setEditingCard(null)}
          onSave={async (updatedCard) => {
            try {
              // Update card in database
              const { error: updateError } = await supabase
                .from('cards')
                .update({
                  title: updatedCard.title,
                  description: updatedCard.description,
                  status: updatedCard.status,
                  priority: updatedCard.priority,
                })
                .eq('id', updatedCard.id)

              if (updateError) throw updateError

              // Handle tag updates
              const currentTagIds = editingCard.tags?.map(t => t.id) || []
              const newTagIds = updatedCard.tags?.map(t => t.id) || []

              // Remove old tags
              const tagsToRemove = currentTagIds.filter(id => !newTagIds.includes(id))
              if (tagsToRemove.length > 0) {
                await supabase
                  .from('card_tags')
                  .delete()
                  .eq('card_id', updatedCard.id)
                  .in('tag_id', tagsToRemove)
              }

              // Add new tags
              const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id))
              if (tagsToAdd.length > 0) {
                await supabase
                  .from('card_tags')
                  .insert(tagsToAdd.map(tagId => ({
                    card_id: updatedCard.id,
                    tag_id: tagId
                  })))
              }

              // Update local state
              setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c))
              setEditingCard(null)
            } catch (err: any) {
              setError(err.message)
            }
          }}
          onDelete={async (cardId) => {
            await deleteCard(cardId)
            setEditingCard(null)
          }}
          onCreateTag={async (tagName, tagColor) => {
            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) throw new Error('Not authenticated')

              const { data, error } = await supabase
                .from('tags')
                .insert({
                  name: tagName,
                  color: tagColor,
                  user_id: user.id
                })
                .select()
                .single()

              if (error) throw error

              setTags([...tags, data])
              return data
            } catch (err: any) {
              setError(err.message)
              return null
            }
          }}
        />
      )}
    </div>
  )
}

// Edit Card Modal Component
function EditCardModal({
  card,
  allTags,
  allStatuses,
  allPriorities,
  onClose,
  onSave,
  onDelete,
  onCreateTag,
}: {
  card: Card
  allTags: Tag[]
  allStatuses: Array<{id: string, name: string}>
  allPriorities: Array<{id: string, name: string}>
  onClose: () => void
  onSave: (card: Card) => void
  onDelete: (cardId: string) => void
  onCreateTag: (name: string, color: string) => Promise<Tag | null>
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [status, setStatus] = useState(card.status)
  const [priority, setPriority] = useState(card.priority)
  const [selectedTags, setSelectedTags] = useState<Tag[]>(card.tags || [])
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(defaultColors[0])

  const availableTags = allTags.filter(t => !selectedTags.find(st => st.id === t.id))

  const handleAddTag = async () => {
    if (!newTagName.trim()) return

    // Check if tag exists
    const existingTag = allTags.find(t => t.name.toLowerCase() === newTagName.toLowerCase())
    if (existingTag) {
      if (!selectedTags.find(t => t.id === existingTag.id)) {
        setSelectedTags([...selectedTags, existingTag])
      }
    } else {
      // Create new tag
      const newTag = await onCreateTag(newTagName, newTagColor)
      if (newTag) {
        setSelectedTags([...selectedTags, newTag])
      }
    }

    setNewTagName('')
    setIsAddingTag(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-primary">Edit Card</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Card title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Add a description..."
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {allStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {allPriorities.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  {tag.name}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                    className="hover:opacity-70"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag Section */}
            {isAddingTag ? (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag()
                    if (e.key === 'Escape') {
                      setIsAddingTag(false)
                      setNewTagName('')
                    }
                  }}
                  placeholder="Tag name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
                  <div className="flex gap-2">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTagColor === color ? 'border-gray-900' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 text-sm bg-primary text-light-text rounded-lg hover:bg-primary/90"
                  >
                    Create Tag
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTagName('')
                    }}
                    className="px-3 py-1.5 text-sm text-secondary border border-secondary/30 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Or select existing tag:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            setSelectedTags([...selectedTags, tag])
                            setIsAddingTag(false)
                          }}
                          className="px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            border: `1px solid ${tag.color}40`
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="w-full px-4 py-2 text-sm text-secondary hover:bg-gray-50 rounded-lg transition-colors border-2 border-dashed border-gray-300"
              >
                + Add Tag
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this card?')) {
                  onDelete(card.id)
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Card
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!title.trim()) return
                  onSave({
                    ...card,
                    title,
                    description: description || null,
                    status: status as any,
                    priority: priority as any,
                    tags: selectedTags
                  })
                }}
                disabled={!title.trim()}
                className="px-4 py-2 bg-primary text-light-text rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
