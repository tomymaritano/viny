import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch'
import { useAppStore } from '../stores/newSimpleStore'
import SearchInput from './search/SearchInput'
import SearchResults from './search/SearchResults'
import SearchErrorBoundary from './errors/SearchErrorBoundary'

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

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <SearchErrorBoundary>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
        onClick={handleBackdropClick}
      >
        <div className="bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
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
      </div>
    </SearchErrorBoundary>
  )
}

export default SearchModal