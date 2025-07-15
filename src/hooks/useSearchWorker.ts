/**
 * Hook for using Web Worker based search
 * Offloads search operations to a separate thread for better performance
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Note } from '../types'
import { logger } from '../utils/logger'

interface SearchFilters {
  tags?: string[]
  notebook?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

interface SearchResult extends Note {
  score?: number
  matches?: any[]
}

interface UseSearchWorkerOptions {
  enableWorker?: boolean
  fallbackToMainThread?: boolean
}

export function useSearchWorker(notes: Note[], options: UseSearchWorkerOptions = {}) {
  const { enableWorker = true, fallbackToMainThread = true } = options
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number>(0)
  const [isWorkerSupported, setIsWorkerSupported] = useState(false)
  
  const workerRef = useRef<Worker | null>(null)
  const pendingSearchRef = useRef<string>('')

  // Check if Web Workers are supported
  useEffect(() => {
    setIsWorkerSupported(typeof Worker !== 'undefined')
  }, [])

  // Initialize worker
  useEffect(() => {
    if (!enableWorker || !isWorkerSupported) return

    try {
      workerRef.current = new Worker('/search-worker.js')
      
      workerRef.current.onmessage = (e) => {
        const { type, results, query, totalResults, searchTime, error, success, notesCount } = e.data
        
        switch (type) {
          case 'INITIALIZED':
            setIsInitialized(success)
            if (success) {
              logger.debug(`Search worker initialized with ${notesCount} notes`)
            }
            break
            
          case 'SEARCH_RESULTS':
            if (query === pendingSearchRef.current) {
              setSearchResults(results || [])
              setSearchTime(searchTime || 0)
              setIsSearching(false)
              logger.debug(`Search completed in ${searchTime?.toFixed(2)}ms with ${totalResults} results`)
            }
            break
            
          case 'NOTES_UPDATED':
            if (success) {
              logger.debug(`Search worker updated with ${notesCount} notes`)
            }
            break
            
          case 'FILTER_RESULTS':
            setSearchResults(results || [])
            setIsSearching(false)
            break
            
          case 'ERROR':
            setSearchError(error)
            setIsSearching(false)
            logger.error('Search worker error:', error)
            break
        }
      }

      workerRef.current.onerror = (error) => {
        logger.error('Search worker error:', error)
        setSearchError('Search worker failed')
        setIsSearching(false)
      }

      // Initialize with current notes
      workerRef.current.postMessage({
        type: 'INITIALIZE',
        data: { notes }
      })

    } catch (error) {
      logger.error('Failed to create search worker:', error)
      setSearchError('Failed to initialize search')
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [enableWorker, isWorkerSupported])

  // Update notes in worker when they change
  useEffect(() => {
    if (workerRef.current && isInitialized) {
      workerRef.current.postMessage({
        type: 'UPDATE_NOTES',
        data: { notes }
      })
    }
  }, [notes, isInitialized])

  // Fallback search function (main thread)
  const fallbackSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const startTime = performance.now()
    const searchLower = query.toLowerCase()
    
    const results = notes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    ).slice(0, 50) // Limit results
    
    const endTime = performance.now()
    
    setSearchResults(results)
    setSearchTime(endTime - startTime)
    setIsSearching(false)
    
    logger.debug(`Fallback search completed in ${(endTime - startTime).toFixed(2)}ms with ${results.length} results`)
  }, [notes])

  // Search function
  const search = useCallback((query: string) => {
    setIsSearching(true)
    setSearchError(null)
    pendingSearchRef.current = query

    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Use worker if available and enabled
    if (workerRef.current && isInitialized && enableWorker) {
      workerRef.current.postMessage({
        type: 'SEARCH',
        data: { query, limit: 50 }
      })
    } else if (fallbackToMainThread) {
      // Fallback to main thread search
      fallbackSearch(query)
    } else {
      setSearchError('Search not available')
      setIsSearching(false)
    }
  }, [isInitialized, enableWorker, fallbackToMainThread, fallbackSearch])

  // Filter function
  const filter = useCallback((filters: SearchFilters) => {
    setIsSearching(true)
    setSearchError(null)

    if (workerRef.current && isInitialized && enableWorker) {
      workerRef.current.postMessage({
        type: 'FILTER',
        data: { filters }
      })
    } else {
      // Simple fallback filtering
      let filtered = [...notes]
      
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(note => 
          filters.tags!.some(tag => note.tags.includes(tag))
        )
      }
      
      if (filters.notebook) {
        filtered = filtered.filter(note => note.notebookId === filters.notebook)
      }
      
      setSearchResults(filtered)
      setIsSearching(false)
    }
  }, [notes, isInitialized, enableWorker])

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
    setSearchTime(0)
    pendingSearchRef.current = ''
  }, [])

  return {
    // State
    isInitialized,
    isSearching,
    searchResults,
    searchError,
    searchTime,
    isWorkerSupported,
    isUsingWorker: enableWorker && isWorkerSupported && isInitialized,
    
    // Actions
    search,
    filter,
    clearResults,
  }
}