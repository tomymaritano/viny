import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'
import type { Note } from '../../types'

// Mock dependencies
vi.mock('../../utils/logger')

// Mock timers for debouncing
vi.useFakeTimers()

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('useSearch', () => {
  // Mock logger
  const mockLogger = {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }

  // Test data
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'React Hooks Guide',
      content: 'Learn about useState and useEffect',
      notebook: 'programming',
      tags: ['react', 'javascript'],
      status: 'draft',
      isPinned: true,
      isTrashed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'TypeScript Tips',
      content: 'Advanced TypeScript patterns',
      notebook: 'programming',
      tags: ['typescript', 'javascript'],
      status: 'completed',
      isPinned: false,
      isTrashed: false,
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-04T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'CSS Flexbox',
      content: 'Flexbox layout guide',
      notebook: 'design',
      tags: ['css', 'layout'],
      status: 'draft',
      isPinned: false,
      isTrashed: false,
      createdAt: '2023-01-05T00:00:00.000Z',
      updatedAt: '2023-01-06T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Trashed Note',
      content: 'This note is in trash',
      notebook: 'trash',
      tags: ['deleted'],
      status: 'draft',
      isPinned: false,
      isTrashed: true,
      createdAt: '2023-01-07T00:00:00.000Z',
      updatedAt: '2023-01-08T00:00:00.000Z',
    },
  ]

  beforeEach(async () => {
    // Mock current date
    vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'))

    // Setup logger mock
    const loggerModule = await import('../../utils/logger')
    Object.defineProperty(loggerModule, 'logger', {
      value: mockLogger,
      writable: true,
    })

    // Clear localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.query).toBe('')
      expect(result.current.results).toEqual([])
      expect(result.current.isSearching).toBe(false)
      expect(result.current.searchHistory).toEqual([])
      expect(result.current.hasQuery).toBe(false)
      expect(result.current.hasResults).toBe(false)
      expect(result.current.totalResults).toBe(0)
    })

    it('should initialize with empty notes array', () => {
      const { result } = renderHook(() => useSearch([]))

      expect(result.current.filterOptions.notebooks).toEqual([])
      expect(result.current.filterOptions.tags).toEqual([])
    })

    it('should load search history from localStorage', () => {
      const savedHistory = ['react', 'typescript']
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedHistory))

      const { result } = renderHook(() => useSearch(mockNotes))

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'viny_search_history'
      )
      expect(result.current.searchHistory).toEqual(savedHistory)
    })

    it('should handle localStorage error gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.searchHistory).toEqual([])
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to load search history:',
        expect.any(Error)
      )
    })
  })

  describe('filter options', () => {
    it('should extract unique notebooks and tags', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.filterOptions.notebooks).toEqual([
        'design',
        'programming',
      ])
      expect(result.current.filterOptions.tags).toEqual([
        'css',
        'javascript',
        'layout',
        'react',
        'typescript',
      ])
    })

    it('should exclude trashed notes from filter options', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.filterOptions.notebooks).not.toContain('trash')
      expect(result.current.filterOptions.tags).not.toContain('deleted')
    })
  })

  describe('search functionality', () => {
    it('should set query and trigger search after debounce', async () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.search('react')
      })

      expect(result.current.query).toBe('react')
      expect(result.current.isSearching).toBe(false) // Not yet due to debounce

      // Fast-forward timers to trigger debounced search
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.isSearching).toBe(false)
      // Note: Since we're using real Fuse.js, results will depend on actual search
    })

    it('should clear results for empty query', async () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      // Set query to empty
      act(() => {
        result.current.setQuery('')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.results).toEqual([])
      expect(result.current.isSearching).toBe(false)
    })

    it('should handle null fuse instance gracefully', async () => {
      const { result } = renderHook(() => useSearch([]))

      act(() => {
        result.current.search('test')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.results).toEqual([])
      expect(result.current.isSearching).toBe(false)
    })
  })

  describe('search history', () => {
    it('should add queries to history', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.search('react hooks')
      })

      expect(result.current.searchHistory).toContain('react hooks')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'viny_search_history',
        JSON.stringify(['react hooks'])
      )
    })

    it('should not add short queries to history', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.search('a')
      })

      expect(result.current.searchHistory).not.toContain('a')
    })

    it('should remove duplicates and move to front', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      // Add initial history
      act(() => {
        result.current.addToHistory('react')
        result.current.addToHistory('typescript')
        result.current.addToHistory('react') // duplicate
      })

      expect(result.current.searchHistory).toEqual(['react', 'typescript'])
    })

    it('should limit history to MAX_SEARCH_HISTORY', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      // Add more than max history items
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addToHistory(`search${i}`)
        }
      })

      expect(result.current.searchHistory).toHaveLength(10) // MAX_SEARCH_HISTORY
    })

    it('should clear search history', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.addToHistory('react')
        result.current.clearHistory()
      })

      expect(result.current.searchHistory).toEqual([])
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'viny_search_history',
        JSON.stringify([])
      )
    })

    it('should handle save history errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })

      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.addToHistory('react')
      })

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to save search history:',
        expect.any(Error)
      )
    })
  })

  describe('filters', () => {
    it('should update specific filter', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.updateFilter('notebooks', ['programming'])
      })

      expect(result.current.filters.notebooks).toEqual(['programming'])
    })

    it('should clear all filters', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.updateFilter('notebooks', ['programming'])
        result.current.updateFilter('tags', ['react'])
        result.current.updateFilter('isPinned', true)
        result.current.clearFilters()
      })

      expect(result.current.filters).toEqual({
        notebooks: [],
        tags: [],
        dateRange: null,
        isPinned: null,
      })
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should detect active filters', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.hasActiveFilters).toBe(false)

      act(() => {
        result.current.updateFilter('notebooks', ['programming'])
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should filter by date range', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      const dateRange = {
        start: new Date('2023-01-01T00:00:00.000Z'),
        end: new Date('2023-01-03T00:00:00.000Z'),
      }

      act(() => {
        result.current.updateFilter('dateRange', dateRange)
      })

      expect(result.current.filters.dateRange).toEqual(dateRange)
    })
  })

  describe('highlight matches', () => {
    it('should highlight text matches', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      const text = 'React Hooks Guide'
      const matches = [
        {
          value: 'React Hooks Guide',
          indices: [
            [0, 4],
            [6, 10],
          ],
        },
      ]

      const highlighted = result.current.highlightMatches(text, matches)
      expect(highlighted).toBe('<mark>React</mark> <mark>Hooks</mark> Guide')
    })

    it('should return original text when no matches', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      const text = 'React Hooks Guide'
      const highlighted = result.current.highlightMatches(text, [])
      expect(highlighted).toBe(text)
    })

    it('should handle multiple matches correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      const text = 'JavaScript and TypeScript'
      const matches = [
        {
          value: 'JavaScript and TypeScript',
          indices: [
            [0, 9],
            [15, 24],
          ],
        },
      ]

      const highlighted = result.current.highlightMatches(text, matches)
      expect(highlighted).toBe(
        '<mark>JavaScript</mark> and <mark>TypeScript</mark>'
      )
    })

    it('should handle overlapping matches', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      const text = 'React Native'
      const matches = [
        {
          value: 'React Native',
          indices: [[0, 10]], // Overlapping with next match
        },
      ]

      const highlighted = result.current.highlightMatches(text, matches)
      expect(highlighted).toBe('<mark>React Nativ</mark>e')
    })
  })

  describe('clear search', () => {
    it('should clear search query and results', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      // Set up search state
      act(() => {
        result.current.search('react')
      })

      // Clear search
      act(() => {
        result.current.clearSearch()
      })

      expect(result.current.query).toBe('')
      expect(result.current.results).toEqual([])
      expect(result.current.isSearching).toBe(false)
      expect(result.current.hasQuery).toBe(false)
      expect(result.current.hasResults).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should compute hasQuery correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.hasQuery).toBe(false)

      act(() => {
        result.current.setQuery('  ')
      })
      expect(result.current.hasQuery).toBe(false)

      act(() => {
        result.current.setQuery('react')
      })
      expect(result.current.hasQuery).toBe(true)
    })

    it('should compute hasResults correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.hasResults).toBe(false)
      expect(result.current.totalResults).toBe(0)
    })

    it('should compute totalResults correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      expect(result.current.totalResults).toBe(result.current.results.length)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined notes gracefully', () => {
      const { result } = renderHook(() => useSearch())

      expect(result.current.results).toEqual([])
      expect(result.current.filterOptions.notebooks).toEqual([])
      expect(result.current.filterOptions.tags).toEqual([])
    })

    it('should handle notes with missing properties', () => {
      const incompleteNotes = [
        {
          id: '1',
          title: 'Test',
          content: 'Test content',
          notebook: 'test',
          tags: undefined, // Missing tags
          status: 'draft',
          isPinned: false,
          isTrashed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ] as Note[]

      const { result } = renderHook(() => useSearch(incompleteNotes))

      expect(result.current.filterOptions.tags).toEqual([])
    })

    it('should handle whitespace in search queries', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.search('   react   ')
      })

      expect(result.current.query).toBe('   react   ')
      expect(result.current.searchHistory).toContain('react')
    })

    it('should handle empty search results', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.search('nonexistent')
        vi.advanceTimersByTime(300)
      })

      expect(result.current.hasResults).toBe(false)
      expect(result.current.totalResults).toBe(0)
    })
  })

  describe('filter functions', () => {
    it('should apply notebook filter correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      // Create a simple filter scenario
      const notesToFilter = mockNotes.slice(0, 3) // Exclude trashed note

      act(() => {
        result.current.updateFilter('notebooks', ['programming'])
      })

      // Test the filter logic by checking the filters object
      expect(result.current.filters.notebooks).toEqual(['programming'])
    })

    it('should apply tags filter correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.updateFilter('tags', ['javascript'])
      })

      expect(result.current.filters.tags).toEqual(['javascript'])
    })

    it('should apply pinned filter correctly', () => {
      const { result } = renderHook(() => useSearch(mockNotes))

      act(() => {
        result.current.updateFilter('isPinned', true)
      })

      expect(result.current.filters.isPinned).toBe(true)
    })
  })
})
