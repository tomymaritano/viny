import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNotesSearchQuery } from '../hooks/queries/useNotesQuery'
import { useAppStore } from '../stores/newSimpleStore'
import SearchInput from './search/SearchInput'
import SearchResults from './search/SearchResults'
import SearchErrorBoundary from './errors/SearchErrorBoundary'
import { StandardModal } from './ui/StandardModal'
import { logger } from '../utils/logger'

interface SearchModalWithQueryProps {
  isOpen: boolean
  onClose: () => void
  onSelectNote: (noteId: string) => void
}

/**
 * Search Modal using TanStack Query for searching
 * Provides better performance with caching and deduplication
 */
const SearchModalWithQuery: React.FC<SearchModalWithQueryProps> = ({
  isOpen,
  onClose,
  onSelectNote,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [localQuery, setLocalQuery] = useState('')
  
  // Use TanStack Query for search
  const { 
    data: searchResults = [], 
    isLoading: isSearching,
    isFetching
  } = useNotesSearchQuery(localQuery)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocalQuery('')
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            Math.min(prev + 1, searchResults.length - 1)
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (searchResults[selectedIndex]) {
            handleNoteSelect(searchResults[selectedIndex].id)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, selectedIndex, onClose])

  const handleNoteSelect = useCallback(
    (noteId: string) => {
      logger.debug('Note selected from search', { noteId })
      onSelectNote(noteId)
      onClose()
    },
    [onSelectNote, onClose]
  )

  // Simple highlight function for query version
  const highlightMatches = useCallback((text: string): string => {
    if (!localQuery) return text
    
    const regex = new RegExp(`(${localQuery.split(' ').join('|')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }, [localQuery])

  return (
    <SearchErrorBoundary>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        position="top"
        showCloseButton={false}
        className="max-h-[80vh] bg-theme-bg-primary"
        overlayClassName="pt-[10vh]"
        data-testid="search-modal"
      >
        <div className="flex flex-col h-full bg-theme-bg-primary">
          <div className="px-4 py-3 border-b border-theme-border-primary bg-theme-bg-secondary">
            <SearchInput
              ref={inputRef}
              query={localQuery}
              onQueryChange={setLocalQuery}
              onClear={() => setLocalQuery('')}
              onClose={onClose}
            />
          </div>

          <div className="max-h-96 overflow-y-auto px-2 py-2 bg-theme-bg-primary">
            <SearchResults
              results={searchResults}
              selectedIndex={selectedIndex}
              highlightMatches={highlightMatches}
              onSelectNote={handleNoteSelect}
              hasQuery={localQuery.length > 0}
              isSearching={isSearching || isFetching}
            />
          </div>
        </div>
      </StandardModal>
    </SearchErrorBoundary>
  )
}

export { SearchModalWithQuery }