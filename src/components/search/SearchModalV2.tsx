/**
 * SearchModalV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react'
import { useActiveNotesQueryV2 } from '../../hooks/queries/useNotesServiceQueryV2'
import { useModalStore, useNoteUIStore } from '../../stores/cleanUIStore'
import { StandardModal } from '../ui/StandardModal'
import { Icons } from '../Icons'
import { fuzzySearch, sortSearchResults } from '../../utils/searchUtils'
import type { Note } from '../../types'

export const SearchModalV2: React.FC = memo(() => {
  const { modals, setModal } = useModalStore()
  const { setSelectedNoteId, openEditor } = useNoteUIStore()
  const { data: notes = [] } = useActiveNotesQueryV2()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    setModal('search', false)
    setSearchQuery('')
    setSearchResults([])
    setSelectedIndex(0)
  }, [setModal])

  const handleOpenNote = useCallback((note: Note) => {
    setSelectedNoteId(note.id)
    openEditor()
    handleClose()
  }, [setSelectedNoteId, openEditor, handleClose])

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSelectedIndex(0)
      return
    }

    const results = fuzzySearch(
      notes,
      searchQuery,
      (note: Note) => `${note.title} ${note.content}`,
      { maxResults: 20 }
    )
    
    const sortedResults = sortSearchResults(results, searchQuery)
    setSearchResults(sortedResults)
    setSelectedIndex(0)
  }, [searchQuery, notes])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modals.search) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (searchResults[selectedIndex]) {
            handleOpenNote(searchResults[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          handleClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modals.search, searchResults, selectedIndex, handleOpenNote, handleClose])

  // Focus input when modal opens
  useEffect(() => {
    if (modals.search) {
      inputRef.current?.focus()
    }
  }, [modals.search])

  if (!modals.search) return null

  return (
    <StandardModal
      isOpen={modals.search}
      onClose={handleClose}
      title=""
      className="max-w-2xl"
      showHeader={false}
    >
      <div className="p-0">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-theme-border">
          <Icons.Search className="w-5 h-5 text-theme-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent outline-none text-theme-text-primary placeholder:text-theme-text-secondary"
          />
          <kbd className="text-xs bg-theme-bg-secondary px-2 py-1 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searchResults.length === 0 && searchQuery && (
            <div className="px-4 py-8 text-center text-theme-text-secondary">
              No results found for "{searchQuery}"
            </div>
          )}
          
          {searchResults.map((note, index) => (
            <button
              key={note.id}
              onClick={() => handleOpenNote(note)}
              className={`w-full text-left px-4 py-3 border-b border-theme-border-light hover:bg-theme-hover transition-colors ${
                index === selectedIndex ? 'bg-theme-hover' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-theme-text-primary truncate">
                    {note.title}
                  </h3>
                  <p className="text-sm text-theme-text-secondary truncate mt-1">
                    {note.content.substring(0, 100)}...
                  </p>
                </div>
                {note.isPinned && (
                  <Icons.Pin className="w-4 h-4 text-theme-text-secondary ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Help Text */}
        {searchResults.length > 0 && (
          <div className="px-4 py-2 text-xs text-theme-text-secondary bg-theme-bg-secondary">
            <span className="inline-flex items-center gap-1">
              <kbd className="bg-theme-bg-primary px-1.5 py-0.5 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="bg-theme-bg-primary px-1.5 py-0.5 rounded">Enter</kbd>
              Open
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="bg-theme-bg-primary px-1.5 py-0.5 rounded">Esc</kbd>
              Close
            </span>
          </div>
        )}
      </div>
    </StandardModal>
  )
})

SearchModalV2.displayName = 'SearchModalV2'

export default SearchModalV2