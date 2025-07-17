import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch'
import { useSearchWorker } from '../hooks/useSearchWorker'
import { useAppStore } from '../stores/newSimpleStore'
import SearchInput from './search/SearchInput'
import SearchResults from './search/SearchResults'
import SearchErrorBoundary from './errors/SearchErrorBoundary'
import { StandardModal } from './ui/StandardModal'

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

  // Use web worker for large datasets (>500 notes)
  const useWorkerSearch = notes.length > 500
  
  const fallbackSearch = useSearch(notes)
  const workerSearch = useSearchWorker(notes, { 
    enableWorker: useWorkerSearch,
    fallbackToMainThread: true 
  })

  // Choose which search to use
  const searchInterface = useWorkerSearch ? {
    query: '', // Worker doesn't track query state
    results: workerSearch.searchResults,
    isSearching: workerSearch.isSearching,
    search: workerSearch.search,
    clearSearch: workerSearch.clearResults,
    hasResults: workerSearch.searchResults.length > 0,
    hasQuery: false, // We'll track this locally
    highlightMatches: (text: string) => text, // Worker handles highlighting
    searchTime: workerSearch.searchTime,
    isUsingWorker: workerSearch.isUsingWorker
  } : {
    ...fallbackSearch,
    searchTime: 0,
    isUsingWorker: false
  }

  const [localQuery, setLocalQuery] = useState('')

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchInterface.results])

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
          setSelectedIndex((prev) => Math.min(prev + 1, searchInterface.results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (searchInterface.results[selectedIndex]) {
            handleNoteSelect(searchInterface.results[selectedIndex].id)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchInterface.results, selectedIndex, onClose])

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
        className="max-h-[80vh] bg-theme-bg-primary"
        overlayClassName="pt-[10vh]"
        data-testid="search-modal"
      >
        <div className="flex flex-col h-full bg-theme-bg-primary">
          <div className="px-4 py-3 border-b border-theme-border-primary bg-theme-bg-secondary">
            <SearchInput
              ref={inputRef}
              query={localQuery}
              onQueryChange={(query) => {
                setLocalQuery(query)
                searchInterface.search(query)
              }}
              onClear={() => {
                setLocalQuery('')
                searchInterface.clearSearch()
              }}
              onClose={onClose}
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto px-2 py-2 bg-theme-bg-primary">
            <SearchResults
              results={searchInterface.results}
              selectedIndex={selectedIndex}
              highlightMatches={searchInterface.highlightMatches}
              onSelectNote={handleNoteSelect}
              hasQuery={localQuery.length > 0}
              isSearching={searchInterface.isSearching}
            />
          </div>
        </div>
      </StandardModal>
    </SearchErrorBoundary>
  )
}

export { SearchModal }