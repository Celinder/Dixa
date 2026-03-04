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
  board_id: string
  name: string
  color: string
}

interface Card {
  id: string
  board_id: string
  swimlane_id: string | null
  title: string
  description: string | null
  status: 'Todo' | 'Doing' | 'Awaiting Reply' | 'Done'
  position: number
  due_date: string | null
  tags?: Tag[]
}

const STATUSES: Array<'Todo' | 'Doing' | 'Awaiting Reply' | 'Done'> = [
  'Todo',
  'Doing',
  'Awaiting Reply',
  'Done',
]

export default function KanbanPage() {
  const [board, setBoard] = useState<Board | null>(null)
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showAddCard, setShowAddCard] = useState<string | null>(null)
  const [showAddSwimlane, setShowAddSwimlane] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  // Form states
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDescription, setNewCardDescription] = useState('')
  const [newCardDueDate, setNewCardDueDate] = useState('')
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
        .from('kanban_boards')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (!boards || boards.length === 0) {
        // Create default board
        const { data: newBoard, error: createError } = await supabase
          .from('kanban_boards')
          .insert({ user_id: user.id, name: 'My Board' })
          .select()
          .single()

        if (createError) throw createError
        boards = [newBoard]
      }

      setBoard(boards[0])
      await Promise.all([fetchSwimlanes(boards[0].id), fetchCards(boards[0].id), fetchTags(boards[0].id)])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSwimlanes = async (boardId: string) => {
    const { data, error } = await supabase
      .from('kanban_swimlanes')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (error) throw error
    setSwimlanes(data || [])
  }

  const fetchCards = async (boardId: string) => {
    const { data: cardsData, error: cardsError } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (cardsError) throw cardsError

    // Fetch tags for each card
    const cardsWithTags = await Promise.all(
      (cardsData || []).map(async (card) => {
        const { data: cardTags } = await supabase
          .from('kanban_card_tags')
          .select('tag_id')
          .eq('card_id', card.id)

        const tagIds = (cardTags || []).map((ct) => ct.tag_id)
        const cardTagsData = tags.filter((t) => tagIds.includes(t.id))

        return { ...card, tags: cardTagsData }
      })
    )

    setCards(cardsWithTags)
  }

  const fetchTags = async (boardId: string) => {
    const { data, error } = await supabase
      .from('kanban_tags')
      .select('*')
      .eq('board_id', boardId)
      .order('name', { ascending: true })

    if (error) throw error
    setTags(data || [])
  }

  const addCard = async (status: string) => {
    if (!board || !newCardTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from('kanban_cards')
        .insert({
          board_id: board.id,
          title: newCardTitle,
          description: newCardDescription || null,
          status,
          due_date: newCardDueDate || null,
          position: cards.filter((c) => c.status === status).length,
        })
        .select()
        .single()

      if (error) throw error

      setCards([...cards, { ...data, tags: [] }])
      setNewCardTitle('')
      setNewCardDescription('')
      setNewCardDueDate('')
      setShowAddCard(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      const { error } = await supabase.from('kanban_cards').update(updates).eq('id', cardId)

      if (error) throw error

      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c)))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase.from('kanban_cards').delete().eq('id', cardId)

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
        .from('kanban_swimlanes')
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
      const { error } = await supabase.from('kanban_swimlanes').delete().eq('id', swimlaneId)

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
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDrop = async (status: string, swimlaneId: string | null = null) => {
    if (!draggedCard) return

    try {
      await updateCard(draggedCard.id, { status: status as any, swimlane_id: swimlaneId })
      setDraggedCard(null)
      setIsDragging(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getDaysUntilDue = (dueDate: string | null): number | null => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDueDateClass = (dueDate: string | null): string => {
    const days = getDaysUntilDue(dueDate)
    if (days === null) return ''
    if (days < 0) return 'text-red-600 font-semibold'
    if (days <= 2) return 'text-orange-600 font-semibold'
    if (days <= 7) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getCardsByStatusAndSwimlane = (status: string, swimlaneId: string | null) => {
    return cards.filter((c) => c.status === status && c.swimlane_id === swimlaneId)
  }

  const getStatusColors = (status: string) => {
    const colors = {
      'Todo': 'bg-slate-200 border-slate-300 text-slate-700',
      'Doing': 'bg-amber-100 border-amber-200 text-amber-800',
      'Awaiting Reply': 'bg-purple-200 border-purple-300 text-purple-800',
      'Done': 'bg-emerald-100 border-emerald-200 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800'
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
              <div key={status} className="flex-1 min-w-[280px] max-w-[320px]">
                {/* Status Header */}
                <div className={`rounded-t-lg border border-b-0 px-3 py-1.5 ${getStatusColors(status)}`}>
                  <h2 className="font-semibold text-sm">{status}</h2>
                  <div className="text-xs opacity-75">
                    {cards.filter((c) => c.status === status).length} cards
                  </div>
                </div>

                {/* Cards Container */}
                <div
                  className="bg-gray-50 rounded-b-lg border border-secondary/20 p-2 min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] overflow-y-auto"
                >
                  {swimlanesWithNull.map((swimlane) => {
                    const swimlaneCards = getCardsByStatusAndSwimlane(status, swimlane.id)

                    return (
                      <div
                        key={swimlane.id || 'null'}
                        className={`mb-2 min-h-[60px] rounded p-1 transition-colors ${
                          isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(status, swimlane.id)}
                      >
                        {/* Swimlane Header */}
                        <div className="flex items-center justify-between mb-1 px-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {swimlane.name}
                          </span>
                          {swimlane.id !== null && (
                            <button
                              onClick={() => deleteSwimlane(swimlane.id!)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        {/* Cards */}
                        <div className="space-y-1.5">
                          {swimlaneCards.map((card) => (
                            <div
                              key={card.id}
                              draggable
                              onDragStart={() => handleDragStart(card)}
                              onDragEnd={handleDragEnd}
                              onClick={() => !isDragging && setEditingCard(card)}
                              className="bg-white rounded border border-secondary/20 p-2 cursor-pointer hover:shadow-md transition-shadow group"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-medium text-primary flex-1 leading-tight">
                                  {card.title}
                                </h3>
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Edit
                                </span>
                              </div>

                              {card.description && (
                                <p className="text-xs text-secondary mb-1 line-clamp-2 leading-snug">
                                  {card.description}
                                </p>
                              )}

                              {card.due_date && (
                                <div className={`text-xs ${getDueDateClass(card.due_date)} mb-1`}>
                                  📅 {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  {getDaysUntilDue(card.due_date) !== null && (
                                    <span className="ml-1">
                                      ({Math.abs(getDaysUntilDue(card.due_date)!)}d
                                      {getDaysUntilDue(card.due_date)! < 0 ? ' overdue' : ''})
                                    </span>
                                  )}
                                </div>
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Card Button */}
                  {showAddCard === status ? (
                    <div className="bg-white rounded border border-secondary/20 p-2 mt-2">
                      <input
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Card title"
                        className="w-full px-2 py-1 text-sm border border-secondary/30 rounded mb-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        autoFocus
                      />
                      <textarea
                        value={newCardDescription}
                        onChange={(e) => setNewCardDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-2 py-1 text-sm border border-secondary/30 rounded mb-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                        rows={2}
                      />
                      <input
                        type="date"
                        value={newCardDueDate}
                        onChange={(e) => setNewCardDueDate(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-secondary/30 rounded mb-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addCard(status)}
                          className="px-3 py-1 text-xs bg-primary text-light-text rounded hover:bg-primary/90"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCard(null)
                            setNewCardTitle('')
                            setNewCardDescription('')
                            setNewCardDueDate('')
                          }}
                          className="px-3 py-1 text-xs text-secondary border border-secondary/30 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddCard(status)}
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
          onClose={() => setEditingCard(null)}
          onSave={async (updatedCard) => {
            try {
              // Update card in database
              const { error: updateError } = await supabase
                .from('kanban_cards')
                .update({
                  title: updatedCard.title,
                  description: updatedCard.description,
                  due_date: updatedCard.due_date,
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
                  .from('kanban_card_tags')
                  .delete()
                  .eq('card_id', updatedCard.id)
                  .in('tag_id', tagsToRemove)
              }

              // Add new tags
              const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id))
              if (tagsToAdd.length > 0) {
                await supabase
                  .from('kanban_card_tags')
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
            if (!board) return null
            try {
              const { data, error } = await supabase
                .from('kanban_tags')
                .insert({
                  name: tagName,
                  color: tagColor,
                  board_id: board.id
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
  onClose,
  onSave,
  onDelete,
  onCreateTag,
}: {
  card: Card
  allTags: Tag[]
  onClose: () => void
  onSave: (card: Card) => void
  onDelete: (cardId: string) => void
  onCreateTag: (name: string, color: string) => Promise<Tag | null>
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.due_date || '')
  const [selectedTags, setSelectedTags] = useState<Tag[]>(card.tags || [])
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6B7280')

  const availableTags = allTags.filter(t => !selectedTags.find(st => st.id === t.id))

  const tagColors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981',
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  ]

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

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
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
                    {tagColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTagColor === color ? 'border-gray-900' : 'border-gray-300'
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
                    due_date: dueDate || null,
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
