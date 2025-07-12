import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch'
import { useAppStore } from '../stores/newSimpleStore'
import { SearchLoading } from './LoadingStates'
import Icons from './Icons'
import BaseModal from './ui/BaseModal'
import { Note } from '../types'

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
    searchHistory,
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

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch()
      setSelectedIndex(0)
    }
  }, [isOpen, clearSearch])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onSelectNote(results[selectedIndex].id)
          onClose()
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }, [results, selectedIndex, onSelectNote, onClose])

  // Handle search history selection
  const handleHistorySelect = useCallback((historyQuery: string) => {
    search(historyQuery)
  }, [search])

  // Handle note selection
  const handleNoteSelect = useCallback((note: Note) => {
    onSelectNote(note.id)
    onClose()
  }, [onSelectNote, onClose])

  // Get snippet for content matches
  const getSnippet = useCallback((note: Note, matches: any[]) => {
    const contentMatch = matches.find(match => match.key === 'content')
    if (!contentMatch) return ''

    const content = note.content
    const indices = contentMatch.indices[0]
    if (!indices) return content.slice(0, 100) + '...'

    const [start, end] = indices
    const snippetStart = Math.max(0, start - 50)
    const snippetEnd = Math.min(content.length, end + 50)
    
    let snippet = content.slice(snippetStart, snippetEnd)
    if (snippetStart > 0) snippet = '...' + snippet
    if (snippetEnd < content.length) snippet = snippet + '...'
    
    return snippet
  }, [])

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`
    
    return date.toLocaleDateString()
  }, [])

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-theme-bg-secondary rounded-lg border border-theme-border-primary overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center p-4 border-b border-theme-border-primary">
          <Icons.Search size={20} className="text-theme-text-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-theme-text-primary placeholder:text-theme-text-muted outline-none"
          />
          {hasQuery && (
            <button
              onClick={clearSearch}
              className="ml-2 p-1 hover:bg-theme-bg-tertiary rounded"
            >
              <Icons.X size={16} className="text-theme-text-muted" />
            </button>
          )}
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isSearching && (
            <SearchLoading />
          )}

          {/* Search History */}
          {!hasQuery && searchHistory.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-theme-text-secondary mb-3">
                Recent Searches
              </h3>
              <div className="space-y-1">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistorySelect(historyItem)}
                    className="w-full text-left px-3 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary rounded transition-colors"
                  >
                    <Icons.Clock size={14} className="inline mr-2 text-theme-text-muted" />
                    {historyItem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasQuery && !isSearching && (
            <div>
              {hasResults ? (
                <div className="py-2">
                  {results.map((note, index) => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteSelect(note)}
                      className={`w-full text-left px-4 py-3 border-b border-theme-border-primary last:border-b-0 transition-colors ${
                        index === selectedIndex
                          ? 'bg-theme-bg-tertiary'
                          : 'hover:bg-theme-bg-tertiary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Note Title */}
                          <h4 
                            className="font-medium text-theme-text-primary mb-1 truncate"
                            dangerouslySetInnerHTML={{
                              __html: highlightMatches(note.title, note._searchMatches?.filter(m => m.key === 'title'))
                            }}
                          />

                          {/* Content Snippet */}
                          {note._searchMatches && (
                            <p 
                              className="text-sm text-theme-text-secondary line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html: getSnippet(note, note._searchMatches)
                              }}
                            />
                          )}

                          {/* Tags */}
                          {note.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-bg-primary text-theme-text-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-xs text-theme-text-muted">
                                  +{note.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Note Metadata */}
                        <div className="flex flex-col items-end gap-1 text-xs text-theme-text-muted">
                          <span>{formatDate(note.updatedAt)}</span>
                          {note.notebook && (
                            <span className="flex items-center gap-1">
                              <Icons.Book size={12} />
                              {note.notebook}
                            </span>
                          )}
                          {note.isPinned && (
                            <Icons.Pin size={12} className="text-theme-accent-orange" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Icons.Search size={48} className="mx-auto mb-4 text-theme-text-muted" />
                  <h3 className="text-lg font-medium text-theme-text-primary mb-2">
                    No results found
                  </h3>
                  <p className="text-theme-text-secondary">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasQuery && searchHistory.length === 0 && (
            <div className="p-8 text-center">
              <Icons.Search size={48} className="mx-auto mb-4 text-theme-text-muted" />
              <h3 className="text-lg font-medium text-theme-text-primary mb-2">
                Search your notes
              </h3>
              <p className="text-theme-text-secondary">
                Find notes by title, content, tags, or notebook
              </p>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="px-4 py-3 border-t border-theme-border-primary bg-theme-bg-tertiary/30">
          <div className="flex items-center justify-between text-xs text-theme-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary rounded text-xs">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-theme-bg-primary rounded text-xs">Esc</kbd>
                Close
              </span>
            </div>
            {hasResults && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

export default SearchModal