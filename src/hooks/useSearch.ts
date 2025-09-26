import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import type { Note } from '../types'
import { logger } from '../utils/logger'
import { createEnhancedDocumentRepository } from '../lib/repositories/RepositoryFactory'

// Search configuration for Fuse.js
const SEARCH_OPTIONS = {
  // Include score and matches for highlighting
  includeScore: true,
  includeMatches: true,

  // Search threshold (0.0 = exact match, 1.0 = match anything)
  threshold: 0.3,

  // Location and distance for fuzzy matching
  location: 0,
  distance: 100,

  // Minimum character length before triggering search
  minMatchCharLength: 2,

  // Fields to search in order of importance
  keys: [
    {
      name: 'title',
      weight: 0.4, // Title is most important
    },
    {
      name: 'content',
      weight: 0.3, // Content is second most important
    },
    {
      name: 'tags',
      weight: 0.2, // Tags are third
    },
    {
      name: 'notebook',
      weight: 0.1, // Notebook is least important
    },
  ],
}

// Search history storage key
const SEARCH_HISTORY_KEY = 'viny_search_history'
const MAX_SEARCH_HISTORY = 10

export const useSearch = (notes: Note[] = []) => {
  // Search state
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Filters state
  const [filters, setFilters] = useState<{
    notebooks: string[]
    tags: string[]
    dateRange: { start: Date; end: Date } | null
    isPinned: boolean | null
  }>({
    notebooks: [], // Array of notebook IDs to filter by
    tags: [], // Array of tags to filter by
    dateRange: null, // { start: Date, end: Date }
    isPinned: null, // null, true, or false
  })

  // Create Fuse instance with memoization
  const fuse = useMemo(() => {
    if (!notes || notes.length === 0) return null

    // Filter out trashed notes for search
    const searchableNotes = notes.filter(note => !note.isTrashed)

    return new Fuse(searchableNotes, SEARCH_OPTIONS)
  }, [notes])

  // Load search history from repository
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()

        const stored = await repository.getUIState<string[]>(
          'search',
          'history'
        )
        if (stored && Array.isArray(stored)) {
          setSearchHistory(stored)
        }
      } catch (error) {
        logger.warn('Failed to load search history:', error)
      }
    }

    loadSearchHistory()
  }, [])

  // Save search history to repository
  const saveSearchHistory = useCallback((history: string[]) => {
    const saveToRepository = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()
        await repository.setUIState('search', 'history', history)
      } catch (error) {
        logger.warn('Failed to save search history:', error)
      }
    }

    saveToRepository()
  }, [])

  // Add query to search history
  const addToHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) return

      setSearchHistory(prev => {
        // Remove duplicates and add to front
        const filtered = prev.filter(item => item !== searchQuery.trim())
        const newHistory = [searchQuery.trim(), ...filtered].slice(
          0,
          MAX_SEARCH_HISTORY
        )
        saveSearchHistory(newHistory)
        return newHistory
      })
    },
    [saveSearchHistory]
  )

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    saveSearchHistory([])
  }, [saveSearchHistory])

  // Apply filters to notes
  const applyFilters = useCallback(
    (notesToFilter: Note[]) => {
      return notesToFilter.filter(note => {
        // Notebook filter
        if (
          filters.notebooks.length > 0 &&
          !filters.notebooks.includes(note.notebook)
        ) {
          return false
        }

        // Tags filter (note must have ALL specified tags)
        if (filters.tags.length > 0) {
          const noteTags = note.tags || []
          const hasAllTags = filters.tags.every(tag => noteTags.includes(tag))
          if (!hasAllTags) return false
        }

        // Pinned filter
        if (filters.isPinned !== null && note.isPinned !== filters.isPinned) {
          return false
        }

        // Date range filter
        if (filters.dateRange) {
          const noteDate = new Date(note.updatedAt || note.createdAt)
          const { start, end } = filters.dateRange
          if (start && noteDate < start) return false
          if (end && noteDate > end) return false
        }

        return true
      })
    },
    [filters]
  )

  // Perform search with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      if (!fuse) {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)

      try {
        // Perform Fuse.js search
        const fuseResults = fuse.search(query)

        // Extract and process results
        const processedResults = fuseResults.map(result => ({
          ...result.item,
          _searchScore: result.score,
          _searchMatches: result.matches || [],
        }))

        // Apply additional filters
        const filteredResults = applyFilters(processedResults)

        setResults(filteredResults)
      } catch (error) {
        logger.error('Search error:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(searchTimeout)
  }, [query, fuse, applyFilters])

  // Search with immediate history update
  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)
      if (searchQuery.trim().length >= 2) {
        addToHistory(searchQuery)
      }
    },
    [addToHistory]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setIsSearching(false)
  }, [])

  // Update specific filter
  const updateFilter = useCallback((filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      notebooks: [],
      tags: [],
      dateRange: null,
      isPinned: null,
    })
  }, [])

  // Get available filter options from notes
  const filterOptions = useMemo(() => {
    if (!notes || notes.length === 0) {
      return { notebooks: [], tags: [] }
    }

    const activeNotes = notes.filter(note => !note.isTrashed)

    const notebooks = [
      ...new Set(activeNotes.map(note => note.notebook)),
    ].sort()

    const allTags = activeNotes.reduce((acc, note) => {
      if (note.tags && Array.isArray(note.tags)) {
        acc.push(...note.tags)
      }
      return acc
    }, [])
    const tags = [...new Set(allTags)].sort()

    return { notebooks, tags }
  }, [notes])

  // Helper function to highlight search matches
  const highlightMatches = useCallback((text: string, matches: any[] = []) => {
    if (!matches.length) return text

    // Sort matches by position to process from end to start
    const sortedMatches = matches
      .filter(match => match.value === text)
      .flatMap(match => match.indices)
      .sort((a, b) => b[0] - a[0])

    let highlightedText = text

    // Insert highlight tags from end to start to preserve indices
    sortedMatches.forEach(([start, end]) => {
      highlightedText =
        highlightedText.slice(0, start) +
        `<mark>${highlightedText.slice(start, end + 1)}</mark>` +
        highlightedText.slice(end + 1)
    })

    return highlightedText
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.notebooks.length > 0 ||
      filters.tags.length > 0 ||
      filters.dateRange !== null ||
      filters.isPinned !== null
    )
  }, [filters])

  return {
    // Search state
    query,
    results,
    isSearching,
    searchHistory,

    // Filter state
    filters,
    filterOptions,
    hasActiveFilters,

    // Search actions
    search,
    setQuery,
    clearSearch,
    addToHistory,
    clearHistory,

    // Filter actions
    updateFilter,
    clearFilters,

    // Utilities
    highlightMatches,

    // Stats
    totalResults: results.length,
    hasResults: results.length > 0,
    hasQuery: query.trim().length > 0,
  }
}

// useSearch is already exported as a named export above
