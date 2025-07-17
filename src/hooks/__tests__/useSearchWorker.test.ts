import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useSearchWorker } from '../useSearchWorker'
import { logger } from '../../utils/logger'

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  }
}))

const mockNotes = [
  {
    id: '1',
    title: 'Test Note 1',
    content: 'This is a test note about React',
    tags: ['react', 'testing'],
    notebook: 'development',
    status: 'draft' as const,
    isPinned: false,
    isTrashed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'JavaScript Guide',
    content: 'A comprehensive guide to JavaScript',
    tags: ['javascript', 'programming'],
    notebook: 'learning',
    status: 'completed' as const,
    isPinned: true,
    isTrashed: false,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Trashed Note',
    content: 'This note is trashed',
    tags: ['trash'],
    notebook: 'misc',
    status: 'draft' as const,
    isPinned: false,
    isTrashed: true,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
]

describe('useSearchWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSearchWorker(mockNotes))

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.isSearching).toBe(false)
      expect(result.current.searchResults).toEqual([])
      expect(result.current.searchError).toBeNull()
      expect(result.current.searchTime).toBe(0)
    })

    it('should detect worker support', () => {
      const { result } = renderHook(() => useSearchWorker(mockNotes))

      // Worker support detection depends on environment
      expect(typeof result.current.isWorkerSupported).toBe('boolean')
    })

    it('should handle disabled worker option', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      expect(result.current.isUsingWorker).toBe(false)
    })
  })

  describe('Fallback Search (Main Thread)', () => {
    it('should perform fallback search when worker is disabled', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('React')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('Test Note 1')
      expect(result.current.isSearching).toBe(false)
    })

    it('should search in title', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('JavaScript')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('JavaScript Guide')
    })

    it('should search in content', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('comprehensive')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('JavaScript Guide')
    })

    it('should search in tags', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('programming')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('JavaScript Guide')
    })

    it('should be case insensitive', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('REACT')
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('Test Note 1')
    })

    it('should exclude trashed notes', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('trash')
      })

      expect(result.current.searchResults).toHaveLength(0)
    })

    it('should limit results to 50', () => {
      const manyNotes = Array.from({ length: 60 }, (_, i) => ({
        ...mockNotes[0],
        id: `note-${i}`,
        title: `Test Note ${i}`,
      }))

      const { result } = renderHook(() => 
        useSearchWorker(manyNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('Test')
      })

      expect(result.current.searchResults).toHaveLength(50)
    })

    it('should clear results for empty query', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('')
      })

      expect(result.current.searchResults).toHaveLength(0)
      expect(result.current.isSearching).toBe(false)
    })

    it('should measure search time', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('React')
      })

      expect(result.current.searchTime).toBeGreaterThan(0)
    })
  })

  describe('Filter Function', () => {
    it('should filter by tags', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.filter({ tags: ['react'] })
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('Test Note 1')
    })

    it('should filter by notebook', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.filter({ notebook: 'learning' })
      })

      expect(result.current.searchResults).toHaveLength(1)
      expect(result.current.searchResults[0].title).toBe('JavaScript Guide')
    })

    it('should filter by multiple tags', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.filter({ tags: ['react', 'javascript'] })
      })

      expect(result.current.searchResults).toHaveLength(2)
    })

    it('should handle empty filters', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.filter({})
      })

      expect(result.current.searchResults).toHaveLength(2) // Excludes trashed note
    })
  })

  describe('Clear Results', () => {
    it('should clear all search state', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      act(() => {
        result.current.search('React')
      })

      expect(result.current.searchResults).toHaveLength(1)

      act(() => {
        result.current.clearResults()
      })

      expect(result.current.searchResults).toHaveLength(0)
      expect(result.current.searchError).toBeNull()
      expect(result.current.searchTime).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle search errors gracefully', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false, fallbackToMainThread: false })
      )

      act(() => {
        result.current.search('test')
      })

      expect(result.current.searchError).toBe('Search not available')
      expect(result.current.isSearching).toBe(false)
    })
  })

  describe('Worker Integration', () => {
    it('should attempt to use worker when enabled', () => {
      // Mock Worker constructor
      const mockWorker = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null,
        onerror: null,
      }

      global.Worker = vi.fn(() => mockWorker) as any

      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: true })
      )

      // Worker should be attempted to be created
      expect(global.Worker).toHaveBeenCalledWith('/search-worker.js')
      
      // Should set up message handlers
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'INITIALIZE',
        data: { notes: mockNotes }
      })
    })

    it('should handle worker initialization failure', () => {
      // Mock Worker constructor to throw
      global.Worker = vi.fn(() => {
        throw new Error('Worker creation failed')
      }) as any

      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: true })
      )

      expect(result.current.searchError).toBe('Failed to initialize search')
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'Failed to create search worker:',
        expect.any(Error)
      )
    })
  })

  describe('Options', () => {
    it('should respect enableWorker option', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false })
      )

      expect(result.current.isUsingWorker).toBe(false)
    })

    it('should respect fallbackToMainThread option', () => {
      const { result } = renderHook(() => 
        useSearchWorker(mockNotes, { enableWorker: false, fallbackToMainThread: true })
      )

      act(() => {
        result.current.search('React')
      })

      expect(result.current.searchResults).toHaveLength(1)
    })
  })
})