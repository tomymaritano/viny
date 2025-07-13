import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch'
import { useAppStore } from '../stores/newSimpleStore'
import SearchInput from './search/SearchInput'
import SearchResults from './search/SearchResults'
import SearchErrorBoundary from './errors/SearchErrorBoundary'
import StandardModal from './ui/StandardModal'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNote: (noteId: string) => void
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNote
}) => {
  const { notes } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {
    query,
    results,
    isSearching,
    search,
    clearSearch,
    hasResults,
    hasQuery,
    highlightMatches
  } = useSearch(notes)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

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
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleNoteSelect(results[selectedIndex].id)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const handleNoteSelect = useCallback((noteId: string) => {
    onSelectNote(noteId)
    onClose()
  }, [onSelectNote, onClose])

  return (
    <SearchErrorBoundary>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        position="top"
        showCloseButton={false}
        className="max-h-[80vh]"
        overlayClassName="pt-[10vh]"
      >
        <div className="flex flex-col h-full -m-4">
          <SearchInput
            ref={inputRef}
            query={query}
            onQueryChange={search}
            onClear={clearSearch}
            onClose={onClose}
          />
          
          <div className="max-h-96 overflow-y-auto">
            <SearchResults
              results={results}
              selectedIndex={selectedIndex}
              highlightMatches={highlightMatches}
              onSelectNote={handleNoteSelect}
              hasQuery={hasQuery}
              isSearching={isSearching}
            />
          </div>
        </div>
      </StandardModal>
    </SearchErrorBoundary>
  )
}

export default SearchModal