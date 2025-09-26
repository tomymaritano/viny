/**
 * SearchModalEnhanced - Search modal with semantic search capabilities
 */

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { useAISearch } from '../hooks/useAISearch'
import { useAppStore } from '../stores/newSimpleStore'
import SearchInput from './search/SearchInput'
import { StandardModal } from './ui/StandardModal'
import { Icons } from './Icons'
import { cn } from '../lib/utils'
import { formatRelativeDate } from '../utils/dateUtils'
import { aiService } from '../services/ai/AIService'

interface SearchModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSelectNote: (noteId: string) => void
}

export const SearchModalEnhanced: React.FC<SearchModalEnhancedProps> = ({
  isOpen,
  onClose,
  onSelectNote,
}) => {
  const { notes, notebooks } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })

  // Filter notes based on selected filters
  const getFilteredNotes = useCallback(() => {
    let filtered = notes

    // Filter by notebook
    if (selectedNotebook) {
      filtered = filtered.filter(note => note.notebook === selectedNotebook)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      const startOfToday = new Date(now.setHours(0, 0, 0, 0))
      
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.updatedAt)
        
        switch (dateFilter) {
          case 'today':
            return noteDate >= startOfToday
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7))
            return noteDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
            return noteDate >= monthAgo
          case 'custom':
            const from = customDateRange.from ? new Date(customDateRange.from) : null
            const to = customDateRange.to ? new Date(customDateRange.to) : null
            if (from && to) {
              return noteDate >= from && noteDate <= to
            } else if (from) {
              return noteDate >= from
            } else if (to) {
              return noteDate <= to
            }
            return true
          default:
            return true
        }
      })
    }

    return filtered
  }, [notes, selectedNotebook, dateFilter, customDateRange])

  // Use filtered notes for search
  const filteredNotes = getFilteredNotes()
  
  const {
    query,
    results,
    isSearching,
    searchMode,
    semanticEnabled,
    searchHistory,
    setQuery,
    setSearchMode,
    clearSearch,
    addToHistory,
    getSuggestions,
    aiResult,
    isAIMode,
    setIsAIMode,
    isQuestion,
    generateAnswer,
  } = useAISearch(filteredNotes)
  
  // Track AI availability
  const [isAIAvailable, setIsAIAvailable] = useState(false)
  const [aiProvider, setAIProvider] = useState<string>('')
  
  useEffect(() => {
    // Check AI availability when modal opens
    if (isOpen) {
      aiService.isAvailable().then(available => {
        setIsAIAvailable(available)
        if (available) {
          const provider = aiService.getProviderInfo()
          setAIProvider(provider.name)
        }
      })
    }
  }, [isOpen])
  
  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      clearSearch()
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, clearSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (isQuestion(query) && !aiResult.answer && !aiResult.isGenerating) {
          // Generate AI answer on Enter for questions
          generateAnswer(query)
        } else if (results.length > 0) {
          const selectedResult = results[selectedIndex]
          if (selectedResult) {
            addToHistory(query)
            onSelectNote(selectedResult.note.id)
            onClose()
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [results, selectedIndex, query, addToHistory, onSelectNote, onClose, isQuestion, aiResult, generateAnswer]
  )

  const handleSelectNote = useCallback(
    (noteId: string) => {
      addToHistory(query)
      onSelectNote(noteId)
      onClose()
    },
    [query, addToHistory, onSelectNote, onClose]
  )

  const renderSearchModeToggle = () => {
    return (
      <>
        {semanticEnabled && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              <button
                onClick={() => setSearchMode('keyword')}
                className={cn(
                  'px-2 py-0.5 text-xs',
                  searchMode === 'keyword'
                    ? 'text-theme-accent-primary'
                    : 'text-theme-text-muted hover:text-theme-text-primary'
                )}
              >
                Keyword
              </button>
              <span className="text-theme-text-muted">|</span>
              <button
                onClick={() => setSearchMode('semantic')}
                className={cn(
                  'px-2 py-0.5 text-xs',
                  searchMode === 'semantic'
                    ? 'text-theme-accent-primary'
                    : 'text-theme-text-muted hover:text-theme-text-primary'
                )}
              >
                Semantic
              </button>
              <span className="text-theme-text-muted">|</span>
              <button
                onClick={() => setSearchMode('hybrid')}
                className={cn(
                  'px-2 py-0.5 text-xs',
                  searchMode === 'hybrid'
                    ? 'text-theme-accent-primary'
                    : 'text-theme-text-muted hover:text-theme-text-primary'
                )}
              >
                Hybrid
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'text-xs text-theme-text-muted hover:text-theme-text-primary',
                showFilters && 'text-theme-accent-primary'
              )}
            >
              <Icons.Filter size={12} />
              <span>Filters</span>
            </button>
          </div>
        )}
        
        {/* Filter panel */}
        {showFilters && (
        <div className="mt-2 pt-2 border-t border-theme-border-primary">
          <div className="flex gap-2 items-center">
            <select
              value={selectedNotebook || ''}
              onChange={(e) => setSelectedNotebook(e.target.value || null)}
              className="flex-1 text-xs bg-theme-bg-secondary border-0 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-theme-accent-primary"
            >
              <option value="">All notebooks</option>
              {notebooks.map(notebook => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          
            <div className="flex items-center gap-0.5 text-xs">
              <span className="text-theme-text-muted mr-1">Date:</span>
              {(['all', 'today', 'week', 'month'] as const).map((option, index) => (
                <Fragment key={option}>
                  <button
                    onClick={() => setDateFilter(option)}
                    className={cn(
                      'px-1.5 py-0.5',
                      dateFilter === option
                        ? 'text-theme-accent-primary font-medium'
                        : 'text-theme-text-muted hover:text-theme-text-primary'
                    )}
                  >
                    {option === 'all' ? 'All' : option === 'week' ? '7d' : option === 'month' ? '30d' : 'Today'}
                  </button>
                  {index < 3 && <span className="text-theme-text-muted opacity-30">·</span>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        )}
      </>
    )
  }

  const renderResult = (result: (typeof results)[0], index: number) => {
    const isSelected = index === selectedIndex
    const TypeIcon = result.type === 'semantic' ? Icons.Brain : Icons.Search

    return (
      <div
        key={result.note.id}
        onClick={() => handleSelectNote(result.note.id)}
        onMouseEnter={() => setSelectedIndex(index)}
        className={cn(
          'px-3 py-2 cursor-pointer',
          isSelected
            ? 'bg-theme-bg-secondary'
            : 'hover:bg-theme-bg-secondary/50'
        )}
      >
        <div className="flex items-start gap-3">
          <TypeIcon className="w-3 h-3 text-theme-text-muted mt-0.5 opacity-50" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-theme-text-primary">
              {result.note.title || 'Untitled'}
            </h3>
            
            {result.chunk ? (
              <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-1">
                {result.chunk}
              </p>
            ) : (
              result.note.content && (
                <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-1">
                  {result.note.content.substring(0, 100)}...
                </p>
              )
            )}
            
            <div className="flex items-center gap-2 mt-1 text-xs text-theme-text-muted">
              <span className="opacity-60">{formatRelativeDate(new Date(result.note.updatedAt))}</span>
              {result.note.notebook && (
                <span className="opacity-60">•</span>
              )}
              {result.note.notebook && (
                <span className="opacity-60">
                  {notebooks.find(n => n.id === result.note.notebook)?.name || result.note.notebook}
                </span>
              )}
              {result.type === 'semantic' && (
                <span className="opacity-60">•</span>
              )}
              {result.type === 'semantic' && (
                <span className="opacity-60">
                  semantic
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col h-[400px]" onKeyDown={handleKeyDown}>
        {/* Search Input */}
        <div className="relative">
          <SearchInput
            ref={inputRef}
            query={query}
            onQueryChange={setQuery}
            onClear={clearSearch}
            placeholder="Search notes or ask a question..."
          />
          {query && isQuestion(query) && isAIAvailable && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-theme-accent-primary">
              <Icons.Sparkles size={12} />
              <span>Press Enter to ask AI</span>
            </div>
          )}
        </div>

        {/* Search Mode Toggle */}
        <div className={query && isQuestion(query) ? "mt-8" : "mt-2"}>
          {renderSearchModeToggle()}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto mt-2">
          {/* AI Answer */}
          {(aiResult.answer || aiResult.isGenerating) && (
            <div className="mb-4 p-3 bg-theme-bg-secondary rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Icons.Brain className="w-4 h-4 text-theme-accent-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-theme-text-primary whitespace-pre-wrap">
                    {aiResult.answer || 'Thinking...'}
                  </p>
                  {aiResult.isGenerating && (
                    <Icons.Loader className="w-3 h-3 animate-spin text-theme-text-muted mt-2" />
                  )}
                </div>
              </div>
              {aiResult.sources.length > 0 && !aiResult.isGenerating && (
                <div className="mt-2 pt-2 border-t border-theme-border-primary">
                  <p className="text-xs text-theme-text-muted mb-1">Sources:</p>
                  <div className="space-y-1">
                    {aiResult.sources.map(source => (
                      <button
                        key={source.id}
                        onClick={() => {
                          onSelectNote(source.id)
                          onClose()
                        }}
                        className="block w-full text-left text-xs text-theme-text-muted hover:text-theme-text-primary"
                      >
                        • {source.title || 'Untitled'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isSearching && !aiResult.isGenerating && (
            <div className="flex items-center justify-center p-8">
              <Icons.Loader className="w-4 h-4 animate-spin text-theme-text-muted" />
            </div>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="p-4 text-center text-sm text-theme-text-muted">
              No results found
              {searchMode === 'keyword' && semanticEnabled && (
                <span> - Try <button onClick={() => setSearchMode('semantic')} className="text-theme-accent-primary hover:underline">semantic search</button></span>
              )}
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="divide-y divide-theme-border-primary">
              {results.map((result, index) => renderResult(result, index))}
            </div>
          )}

          {!isSearching && !aiResult.isGenerating && !query && searchHistory.length > 0 && (
            <div className="p-4">
              <p className="text-xs text-theme-text-muted mb-2">Recent searches</p>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(term)}
                    className="w-full text-left px-2 py-1 text-sm text-theme-text-muted hover:text-theme-text-primary transition-colors flex items-center gap-2"
                  >
                    <Icons.Clock size={12} className="opacity-50" />
                    <span className="truncate">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-theme-border-primary text-xs text-theme-text-muted flex items-center gap-3">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
          {results.length > 0 && <span className="ml-auto">{results.length} results</span>}
        </div>
      </div>
    </StandardModal>
  )
}
