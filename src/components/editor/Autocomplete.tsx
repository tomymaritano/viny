import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '../../lib/utils'
import { Icons } from '../Icons'
import { useAppStore } from '../../stores/newSimpleStore'

interface AutocompleteProps {
  visible: boolean
  position: { x: number; y: number }
  query: string
  onSelect: (text: string) => void
  onClose: () => void
  editorRef: React.RefObject<any>
}

interface Suggestion {
  type: 'tag' | 'notebook' | 'note' | 'snippet' | 'emoji' | 'command'
  label: string
  value: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  description?: string
  meta?: string
}

const EMOJI_SUGGESTIONS = [
  { label: 'smile', value: '😊', description: 'Smiling face' },
  { label: 'heart', value: '❤️', description: 'Red heart' },
  { label: 'thumbs up', value: '👍', description: 'Thumbs up' },
  { label: 'star', value: '⭐', description: 'Star' },
  { label: 'fire', value: '🔥', description: 'Fire' },
  { label: 'rocket', value: '🚀', description: 'Rocket' },
  { label: 'check', value: '✅', description: 'Check mark' },
  { label: 'x', value: '❌', description: 'Cross mark' },
  { label: 'warning', value: '⚠️', description: 'Warning' },
  { label: 'info', value: 'ℹ️', description: 'Information' },
  { label: 'bulb', value: '💡', description: 'Light bulb' },
  { label: 'pin', value: '📌', description: 'Pushpin' },
]

const SNIPPET_SUGGESTIONS = [
  { 
    label: 'todo', 
    value: '- [ ] ', 
    description: 'Todo checkbox',
    icon: Icons.CheckSquare 
  },
  { 
    label: 'date', 
    value: new Date().toLocaleDateString(), 
    description: 'Today\'s date',
    icon: Icons.Calendar 
  },
  { 
    label: 'time', 
    value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    description: 'Current time',
    icon: Icons.Clock 
  },
  { 
    label: 'codeblock', 
    value: '```\n\n```', 
    description: 'Code block',
    icon: Icons.Code2 
  },
  { 
    label: 'table', 
    value: '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |', 
    description: 'Table template',
    icon: Icons.Table 
  },
]

export const Autocomplete: React.FC<AutocompleteProps> = ({
  visible,
  position,
  query,
  onSelect,
  onClose,
  editorRef
}) => {
  const { notes, tags, notebooks } = useAppStore()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Generate suggestions based on query
  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const newSuggestions: Suggestion[] = []

    // Check what type of autocomplete based on trigger
    if (query.startsWith('#')) {
      // Tag autocomplete
      const tagQuery = query.slice(1).toLowerCase()
      const matchingTags = tags
        .filter(tag => tag.name.toLowerCase().includes(tagQuery))
        .slice(0, 5)
        .map(tag => ({
          type: 'tag' as const,
          label: tag.name,
          value: `#${tag.name}`,
          icon: Icons.Tag,
          meta: `${notes.filter(n => n.tags?.includes(tag.id)).length} notes`
        }))
      newSuggestions.push(...matchingTags)
    } else if (query.startsWith('@')) {
      // Notebook autocomplete
      const notebookQuery = query.slice(1).toLowerCase()
      const matchingNotebooks = notebooks
        .filter(nb => nb.name.toLowerCase().includes(notebookQuery))
        .slice(0, 5)
        .map(nb => ({
          type: 'notebook' as const,
          label: nb.name,
          value: `@${nb.name}`,
          icon: Icons.Folder,
          meta: `${notes.filter(n => n.notebook === nb.id).length} notes`
        }))
      newSuggestions.push(...matchingNotebooks)
    } else if (query.startsWith('[[')) {
      // Note link autocomplete
      const noteQuery = query.slice(2).toLowerCase()
      const matchingNotes = notes
        .filter(note => 
          note.title.toLowerCase().includes(noteQuery) && 
          !note.isTrashed
        )
        .slice(0, 5)
        .map(note => ({
          type: 'note' as const,
          label: note.title,
          value: `[[${note.title}]]`,
          icon: Icons.FileText,
          description: note.content.slice(0, 50) + '...'
        }))
      newSuggestions.push(...matchingNotes)
    } else if (query.startsWith(':')) {
      // Emoji autocomplete
      const emojiQuery = query.slice(1).toLowerCase()
      const matchingEmojis = EMOJI_SUGGESTIONS
        .filter(emoji => emoji.label.includes(emojiQuery))
        .slice(0, 8)
        .map(emoji => ({
          type: 'emoji' as const,
          label: emoji.value,
          value: emoji.value,
          description: emoji.label
        }))
      newSuggestions.push(...matchingEmojis)
    } else if (query.startsWith('/')) {
      // Snippet autocomplete
      const snippetQuery = query.slice(1).toLowerCase()
      const matchingSnippets = SNIPPET_SUGGESTIONS
        .filter(snippet => snippet.label.includes(snippetQuery))
        .map(snippet => ({
          type: 'snippet' as const,
          ...snippet
        }))
      newSuggestions.push(...matchingSnippets)
    }

    setSuggestions(newSuggestions)
    setSelectedIndex(0)
  }, [query, tags, notebooks, notes])

  // Handle keyboard navigation
  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, suggestions, selectedIndex, onClose])

  const handleSelect = (suggestion: Suggestion) => {
    // For snippets with cursor position (like codeblock)
    if (suggestion.value.includes('\n\n')) {
      const [before, after] = suggestion.value.split('\n\n')
      onSelect(before + '\n')
      // Position cursor in the middle
      setTimeout(() => {
        if (editorRef.current && editorRef.current.view) {
          const view = editorRef.current.view
          const pos = view.state.selection.main.from
          view.dispatch({
            selection: { anchor: pos, head: pos }
          })
        }
      }, 0)
      onSelect('\n' + after)
    } else {
      onSelect(suggestion.value)
    }
  }

  if (!visible || suggestions.length === 0) return null

  const getIcon = (suggestion: Suggestion) => {
    if (suggestion.icon) {
      const Icon = suggestion.icon
      return <Icon size={14} className="text-theme-text-muted" />
    }
    if (suggestion.type === 'emoji') {
      return <span className="text-sm">{suggestion.label}</span>
    }
    return null
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '200px',
        minWidth: '200px'
      }}
    >
      <div className="py-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.type}-${suggestion.label}`}
            onClick={() => handleSelect(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              'px-3 py-2 cursor-pointer flex items-center gap-2',
              selectedIndex === index
                ? 'bg-theme-accent-primary/10 text-theme-text-primary'
                : 'hover:bg-theme-bg-secondary text-theme-text-secondary'
            )}
          >
            {getIcon(suggestion)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">
                  {suggestion.type === 'emoji' ? suggestion.description : suggestion.label}
                </span>
                {suggestion.meta && (
                  <span className="text-xs text-theme-text-muted">
                    {suggestion.meta}
                  </span>
                )}
              </div>
              {suggestion.description && suggestion.type !== 'emoji' && (
                <div className="text-xs text-theme-text-muted truncate">
                  {suggestion.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}