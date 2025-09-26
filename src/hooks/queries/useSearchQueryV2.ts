/**
 * useSearchQueryV2 - Optimized search with debouncing and caching
 */

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDebounce } from '../useDebounce'
import { fuzzySearch, sortSearchResults } from '../../utils/searchUtils'
import { useActiveNotesQueryV2 } from './useNotesServiceQueryV2'
import type { Note } from '../../types'

export const useSearchQueryV2 = (searchQuery: string, options?: {
  debounceMs?: number
  maxResults?: number
  enabled?: boolean
}) => {
  const { debounceMs = 300, maxResults = 50, enabled = true } = options || {}
  
  // Get all notes
  const { data: notes = [] } = useActiveNotesQueryV2()
  
  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, debounceMs)
  
  // Search query with caching
  const searchQueryResult = useQuery({
    queryKey: ['search', debouncedQuery, maxResults],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return []
      }
      
      // Perform fuzzy search
      const results = fuzzySearch(
        notes,
        debouncedQuery,
        (note: Note) => `${note.title} ${note.content}`,
        { maxResults }
      )
      
      // Sort by relevance
      return sortSearchResults(results, debouncedQuery)
    },
    enabled: enabled && !!debouncedQuery.trim() && notes.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
  
  // Memoize empty results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    return searchQueryResult.data || []
  }, [debouncedQuery, searchQueryResult.data])
  
  return {
    searchResults,
    isSearching: searchQueryResult.isLoading,
    searchError: searchQueryResult.error,
    isDebouncing: searchQuery !== debouncedQuery,
  }
}