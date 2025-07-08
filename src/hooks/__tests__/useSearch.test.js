import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'

// Mock localStorage
const mockLocalStorage = {
  store: {},
  getItem: vi.fn(key => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key, value) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn(key => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useSearch Hook', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'React Development Guide',
      content:
        'This is a comprehensive guide to React development with hooks and state management.',
      tags: ['react', 'development', 'javascript'],
      notebook: 'Work',
      isPinned: true,
      isTrashed: false,
      date: '2024-01-15',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'Vue.js Tutorial',
      content:
        'Learn Vue.js framework basics including components, directives, and reactive data.',
      tags: ['vue', 'javascript', 'frontend'],
      notebook: 'Learning',
      isPinned: false,
      isTrashed: false,
      date: '2024-01-14',
      updatedAt: '2024-01-14T15:30:00Z',
    },
    {
      id: 3,
      title: 'Shopping List',
      content: 'Groceries: milk, bread, eggs, cheese, apples',
      tags: ['personal', 'shopping'],
      notebook: 'Personal',
      isPinned: false,
      isTrashed: true, // This should be filtered out
      date: '2024-01-13',
      updatedAt: '2024-01-13T09:15:00Z',
    },
    {
      id: 4,
      title: 'Meeting Notes',
      content: 'Project status update and next steps discussion.',
      tags: ['meeting', 'work'],
      notebook: 'Work',
      isPinned: true,
      isTrashed: false,
      date: '2024-01-12',
      updatedAt: '2024-01-12T14:00:00Z',
    },
  ]

  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
    expect(result.current.searchHistory).toEqual([])
    expect(result.current.hasQuery).toBe(false)
    expect(result.current.hasResults).toBe(false)
    expect(result.current.totalResults).toBe(0)
  })

  it('should perform search and return results', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.search('React')
    })

    // Wait for debounced search
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    expect(result.current.query).toBe('React')
    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.hasQuery).toBe(true)
    expect(result.current.hasResults).toBe(true)

    // Should find the React note
    const reactNote = result.current.results.find(note =>
      note.title.includes('React')
    )
    expect(reactNote).toBeDefined()
    expect(reactNote.title).toBe('React Development Guide')
  })

  it('should search by content', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.search('comprehensive')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    expect(result.current.results.length).toBeGreaterThan(0)
    const foundNote = result.current.results.find(note =>
      note.content.includes('comprehensive')
    )
    expect(foundNote).toBeDefined()
  })

  it('should search by tags', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.search('javascript')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    expect(result.current.results.length).toBeGreaterThan(0)
    const foundNotes = result.current.results.filter(
      note => note.tags && note.tags.includes('javascript')
    )
    expect(foundNotes.length).toBeGreaterThan(0)
  })

  it('should search by notebook', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.search('Work')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    expect(result.current.results.length).toBeGreaterThan(0)
    const workNotes = result.current.results.filter(
      note => note.notebook === 'Work'
    )
    expect(workNotes.length).toBeGreaterThan(0)
  })

  it('should filter out trashed notes from search', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.search('Shopping')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    // Should not find the trashed shopping list note
    const trashedNote = result.current.results.find(
      note => note.title === 'Shopping List'
    )
    expect(trashedNote).toBeUndefined()
  })

  it('should handle fuzzy search', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Search with partial match - should find notes with similar content
    act(() => {
      result.current.search('develo')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    expect(result.current.results.length).toBeGreaterThan(0)
    // Should find "React Development Guide"
    const foundNote = result.current.results.find(
      note =>
        note.title.toLowerCase().includes('development') ||
        note.content.toLowerCase().includes('development')
    )
    expect(foundNote).toBeDefined()
  })

  it('should clear search', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.setQuery('test query')
    })

    expect(result.current.query).toBe('test query')

    act(() => {
      result.current.clearSearch()
    })

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('should manage search history', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.addToHistory('React hooks')
    })

    act(() => {
      result.current.addToHistory('Vue components')
    })

    expect(result.current.searchHistory).toContain('React hooks')
    expect(result.current.searchHistory).toContain('Vue components')
    expect(result.current.searchHistory[0]).toBe('Vue components') // Most recent first
  })

  it('should not add short queries to history', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.addToHistory('a') // Too short
    })

    act(() => {
      result.current.addToHistory('') // Empty
    })

    expect(result.current.searchHistory).toEqual([])
  })

  it('should clear search history', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    act(() => {
      result.current.addToHistory('test query')
    })

    expect(result.current.searchHistory.length).toBeGreaterThan(0)

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.searchHistory).toEqual([])
  })

  it('should apply notebook filter', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Set notebook filter
    act(() => {
      result.current.updateFilter('notebooks', ['Work'])
    })

    act(() => {
      result.current.search('notes') // General search
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    // All results should be from Work notebook
    result.current.results.forEach(note => {
      expect(note.notebook).toBe('Work')
    })
  })

  it('should apply tags filter', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Set tags filter
    act(() => {
      result.current.updateFilter('tags', ['javascript'])
    })

    act(() => {
      result.current.search('guide') // General search
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    // All results should have javascript tag
    result.current.results.forEach(note => {
      expect(note.tags).toContain('javascript')
    })
  })

  it('should apply pinned filter', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Set pinned filter
    act(() => {
      result.current.updateFilter('isPinned', true)
    })

    act(() => {
      result.current.search('guide') // General search
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    // All results should be pinned
    result.current.results.forEach(note => {
      expect(note.isPinned).toBe(true)
    })
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Set some filters
    act(() => {
      result.current.updateFilter('notebooks', ['Work'])
      result.current.updateFilter('tags', ['javascript'])
      result.current.updateFilter('isPinned', true)
    })

    expect(result.current.hasActiveFilters).toBe(true)

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.filters.notebooks).toEqual([])
    expect(result.current.filters.tags).toEqual([])
    expect(result.current.filters.isPinned).toBe(null)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should provide filter options from notes', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    expect(result.current.filterOptions.notebooks).toContain('Work')
    expect(result.current.filterOptions.notebooks).toContain('Learning')
    // Note: 'Personal' notebook is from trashed note, so it won't appear in filter options

    expect(result.current.filterOptions.tags).toContain('react')
    expect(result.current.filterOptions.tags).toContain('javascript')
    expect(result.current.filterOptions.tags).toContain('vue')
  })

  it('should highlight search matches', () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    const text = 'This is a React tutorial'
    const matches = [
      {
        value: text,
        indices: [[10, 14]], // 'React' position
      },
    ]

    const highlighted = result.current.highlightMatches(text, matches)
    expect(highlighted).toContain('<mark>React</mark>')
  })

  it('should handle empty notes array', () => {
    const { result } = renderHook(() => useSearch([]))

    expect(result.current.filterOptions.notebooks).toEqual([])
    expect(result.current.filterOptions.tags).toEqual([])

    act(() => {
      result.current.search('anything')
    })

    expect(result.current.results).toEqual([])
  })

  it('should handle search with minimum character length', async () => {
    const { result } = renderHook(() => useSearch(mockNotes))

    // Search with single character (below minimum)
    act(() => {
      result.current.search('R')
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350))
    })

    // Should not perform search with too few characters
    expect(result.current.results).toEqual([])
  })
})
