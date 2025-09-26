/**
 * Smart Search Hook with Fuse.js Integration
 * Provides indexed search for large datasets with fuzzy matching
 * and performance optimizations
 */

import { useMemo, useState, useCallback, useRef } from 'react'
import Fuse from 'fuse.js'
import type { Note } from '../types'
import { logger } from '../utils/logger'

interface UseSmartSearchOptions {
  threshold?: number // Fuzzy match threshold (0 = exact, 1 = match anything)
  includeScore?: boolean
  keys?: string[] // Fields to search in
  minMatchCharLength?: number
  shouldSort?: boolean
  ignoreLocation?: boolean
}

interface SearchResult {
  item: Note
  score: number
  matches?: Fuse.FuseResultMatch[]
}

interface UseSmartSearchReturn {
  search: (query: string) => Note[]
  searchWithResults: (query: string) => SearchResult[]
  isIndexing: boolean
  searchStats: {
    totalNotes: number
    lastSearchTime: number
    lastResultCount: number
  }
  clearCache: () => void
}

const DEFAULT_OPTIONS: UseSmartSearchOptions = {
  threshold: 0.3, // Good balance between fuzzy and accurate
  includeScore: true,
  keys: [
    {
      name: 'title',
      weight: 3, // Title matches are most important
    },
    {
      name: 'content',
      weight: 1,
    },
    {
      name: 'tags',
      weight: 2,
    },
    {
      name: 'notebook',
      weight: 1.5,
    },
  ],
  minMatchCharLength: 2,
  shouldSort: true,
  ignoreLocation: true, // Don't care where in the text the match is
}

export function useSmartSearch(
  notes: Note[],
  options: UseSmartSearchOptions = {}
): UseSmartSearchReturn {
  const [isIndexing, setIsIndexing] = useState(false)
  const searchStatsRef = useRef({
    totalNotes: 0,
    lastSearchTime: 0,
    lastResultCount: 0,
  })

  // Memoize the options to prevent infinite re-renders
  const memoizedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      ...options,
    }),
    [
      options.threshold,
      options.includeScore,
      options.minMatchCharLength,
      options.shouldSort,
      options.ignoreLocation,
    ]
  )

  // Memoize Fuse.js instance - only recreate when notes change
  const fuseInstance = useMemo(() => {
    if (notes.length === 0) return null

    setIsIndexing(true)
    logger.time('search-index-creation')

    try {
      const fuseOptions = memoizedOptions

      const fuse = new Fuse(notes, fuseOptions)

      logger.timeEnd('search-index-creation')
      logger.info('Search index created', {
        notesCount: notes.length,
        options: fuseOptions,
      })

      searchStatsRef.current.totalNotes = notes.length
      setIsIndexing(false)

      return fuse
    } catch (error) {
      logger.error('Failed to create search index', { error })
      setIsIndexing(false)
      return null
    }
  }, [notes, memoizedOptions])

  // Debounced search cache
  const searchCacheRef = useRef(new Map<string, SearchResult[]>())

  // Clear cache when notes change
  const clearCache = useCallback(() => {
    searchCacheRef.current.clear()
    logger.debug('Search cache cleared')
  }, [])

  // Clear cache when notes change
  useMemo(() => {
    clearCache()
  }, [notes, clearCache])

  // Main search function with caching
  const searchWithResults = useCallback(
    (query: string): SearchResult[] => {
      if (!query.trim() || !fuseInstance) {
        return []
      }

      const normalizedQuery = query.trim().toLowerCase()

      // Check cache first
      if (searchCacheRef.current.has(normalizedQuery)) {
        const cached = searchCacheRef.current.get(normalizedQuery)!
        searchStatsRef.current.lastResultCount = cached.length
        return cached
      }

      // Perform search
      logger.time('search-execution')

      try {
        const results = fuseInstance.search(query).map(result => ({
          item: result.item,
          score: result.score || 0,
          matches: result.matches,
        }))

        logger.timeEnd('search-execution')

        // Cache results
        searchCacheRef.current.set(normalizedQuery, results)

        // Limit cache size to prevent memory issues
        if (searchCacheRef.current.size > 100) {
          const firstKey = searchCacheRef.current.keys().next().value
          searchCacheRef.current.delete(firstKey)
        }

        // Update stats
        searchStatsRef.current.lastSearchTime = performance.now()
        searchStatsRef.current.lastResultCount = results.length

        logger.debug('Search completed', {
          query: normalizedQuery,
          resultCount: results.length,
          cached: false,
        })

        return results
      } catch (error) {
        logger.error('Search execution failed', { query, error })
        return []
      }
    },
    [fuseInstance]
  )

  // Simple search function that returns just the notes
  const search = useCallback(
    (query: string): Note[] => {
      return searchWithResults(query).map(result => result.item)
    },
    [searchWithResults]
  )

  return {
    search,
    searchWithResults,
    isIndexing,
    searchStats: searchStatsRef.current,
    clearCache,
  }
}

// Hook for search with highlighting
export function useSearchWithHighlights(
  notes: Note[],
  options: UseSmartSearchOptions = {}
) {
  const smartSearch = useSmartSearch(notes, {
    ...options,
    includeScore: true,
  })

  const searchWithHighlights = useCallback(
    (query: string) => {
      const results = smartSearch.searchWithResults(query)

      return results.map(result => ({
        ...result.item,
        searchScore: result.score,
        highlights: result.matches?.reduce(
          (acc, match) => {
            if (match.key && match.indices) {
              acc[match.key] = match.indices
            }
            return acc
          },
          {} as Record<string, readonly [number, number][]>
        ),
      }))
    },
    [smartSearch]
  )

  return {
    ...smartSearch,
    searchWithHighlights,
  }
}

// Performance testing utilities
export function createSearchBenchmark(notes: Note[], queries: string[]) {
  return {
    async runBenchmark() {
      logger.group('Search Performance Benchmark')

      const results = {
        indexCreationTime: 0,
        averageSearchTime: 0,
        queries: [] as Array<{
          query: string
          time: number
          resultCount: number
        }>,
      }

      // Test index creation
      const indexStart = performance.now()
      const fuse = new Fuse(notes, DEFAULT_OPTIONS)
      results.indexCreationTime = performance.now() - indexStart

      logger.info('Index creation completed', {
        time: `${results.indexCreationTime.toFixed(2)}ms`,
        notesCount: notes.length,
      })

      // Test search queries
      let totalSearchTime = 0

      for (const query of queries) {
        const searchStart = performance.now()
        const searchResults = fuse.search(query)
        const searchTime = performance.now() - searchStart

        totalSearchTime += searchTime
        results.queries.push({
          query,
          time: searchTime,
          resultCount: searchResults.length,
        })

        logger.debug('Query benchmark', {
          query,
          time: `${searchTime.toFixed(2)}ms`,
          results: searchResults.length,
        })
      }

      results.averageSearchTime = totalSearchTime / queries.length

      logger.info('Benchmark completed', {
        averageSearchTime: `${results.averageSearchTime.toFixed(2)}ms`,
        totalQueries: queries.length,
      })

      logger.groupEnd()

      return results
    },
  }
}
