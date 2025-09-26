/**
 * useSemanticSearch - Enhanced search with semantic capabilities
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import type { Note } from '../types'
import { embeddingManager } from '../services/ai'
import { logger } from '../utils/logger'
import { useAppStore } from '../stores/newSimpleStore'

// Search configuration for Fuse.js
const SEARCH_OPTIONS = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'notebook', weight: 0.1 },
  ],
}

interface SearchResult {
  note: Note
  score: number
  matches?: any[]
  type: 'keyword' | 'semantic'
  chunk?: string
}

export const useSemanticSearch = (notes: Note[] = []) => {
  const [query, setQuery] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<
    'keyword' | 'semantic' | 'hybrid'
  >('hybrid')
  const { settings } = useAppStore()

  // Check if semantic search is enabled
  const semanticEnabled = settings.ai?.enableSemanticSearch ?? true

  // Create Fuse instance
  const fuse = useMemo(() => {
    const searchableNotes = notes.filter(note => !note.isTrashed)
    return new Fuse(searchableNotes, SEARCH_OPTIONS)
  }, [notes])

  // Keyword search function
  const performKeywordSearch = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery || searchQuery.length < 2) return []

      const fuseResults = fuse.search(searchQuery)

      return fuseResults.map(result => ({
        note: result.item,
        score: result.score || 0,
        matches: result.matches,
        type: 'keyword' as const,
      }))
    },
    [fuse]
  )

  // Semantic search function
  const performSemanticSearch = useCallback(
    async (searchQuery: string): Promise<SearchResult[]> => {
      if (!searchQuery || searchQuery.length < 3) return []

      try {
        logger.debug('Starting semantic search for query:', searchQuery)
        const semanticResults = await embeddingManager.searchByEmbedding(
          searchQuery,
          10,
          0.5
        )
        logger.debug(`Found ${semanticResults.length} semantic results`)

        // Convert semantic results to SearchResult format
        const searchResults: SearchResult[] = []
        const addedNoteIds = new Set<string>()

        for (const result of semanticResults) {
          const note = notes.find(n => n.id === result.noteId)
          if (note && !note.isTrashed && !addedNoteIds.has(note.id)) {
            addedNoteIds.add(note.id)
            searchResults.push({
              note,
              score: 1 - result.similarity, // Convert similarity to score (lower is better)
              type: 'semantic' as const,
              chunk: result.chunk,
            })
          }
        }

        return searchResults
      } catch (error) {
        logger.error('Semantic search failed:', error)
        return []
      }
    },
    [notes]
  )

  // Combined search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        return
      }

      setIsSearching(true)

      try {
        let combinedResults: SearchResult[] = []

        if (searchMode === 'keyword' || searchMode === 'hybrid') {
          const keywordResults = performKeywordSearch(searchQuery)
          combinedResults = [...keywordResults]
        }

        if (
          semanticEnabled &&
          (searchMode === 'semantic' || searchMode === 'hybrid')
        ) {
          const semanticResults = await performSemanticSearch(searchQuery)

          // Merge results, avoiding duplicates
          const existingNoteIds = new Set(combinedResults.map(r => r.note.id))
          for (const result of semanticResults) {
            if (!existingNoteIds.has(result.note.id)) {
              combinedResults.push(result)
            } else {
              // If note already exists from keyword search, update score if semantic is better
              const existingIndex = combinedResults.findIndex(
                r => r.note.id === result.note.id
              )
              if (
                existingIndex !== -1 &&
                result.score < combinedResults[existingIndex].score
              ) {
                combinedResults[existingIndex] = {
                  ...result,
                  type: 'hybrid' as any, // Both keyword and semantic matched
                }
              }
            }
          }
        }

        // Sort by score (lower is better)
        combinedResults.sort((a, b) => a.score - b.score)

        setResults(combinedResults)
      } catch (error) {
        logger.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [searchMode, semanticEnabled, performKeywordSearch, performSemanticSearch]
  )

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const history = localStorage.getItem('viny_search_history')
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  })

  const addToHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      const newHistory = [
        searchQuery,
        ...searchHistory.filter(h => h !== searchQuery),
      ].slice(0, 10)

      setSearchHistory(newHistory)
      localStorage.setItem('viny_search_history', JSON.stringify(newHistory))
    },
    [searchHistory]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  // Get search suggestions
  const getSuggestions = useCallback(
    (input: string): string[] => {
      if (!input) return searchHistory

      const lowercaseInput = input.toLowerCase()
      return searchHistory
        .filter(h => h.toLowerCase().includes(lowercaseInput))
        .slice(0, 5)
    },
    [searchHistory]
  )

  return {
    // State
    query,
    results,
    isSearching,
    searchMode,
    semanticEnabled,
    searchHistory,

    // Actions
    setQuery,
    setSearchMode,
    clearSearch,
    addToHistory,
    getSuggestions,
    performSearch,
  }
}
