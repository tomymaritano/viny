import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { useNotebookManager } from '../useNotebookManager'
import { useNotebooks } from '../useNotebooks'
import { logger } from '../../utils/logger'

// Mock dependencies
vi.mock('../useNotebooks')
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  }
}))

const mockNotebooks = [
  {
    id: 'notebook-1',
    name: 'Work',
    color: 'blue',
    description: 'Work-related notes',
    parentId: null,
    children: ['notebook-2'],
    level: 0,
    path: 'work',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'notebook-2',
    name: 'Projects',
    color: 'green',
    description: 'Project notes',
    parentId: 'notebook-1',
    children: [],
    level: 1,
    path: 'work/projects',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'notebook-3',
    name: 'Personal',
    color: 'purple',
    description: 'Personal notes',
    parentId: null,
    children: [],
    level: 0,
    path: 'personal',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
]

const mockNote = {
  id: 'note-1',
  title: 'Test Note',
  content: 'Test content',
  notebookId: 'notebook-1',
  tags: [],
  status: 'draft' as const,
  isPinned: false,
  isTrashed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('useNotebookManager', () => {
  const mockOnNotebookChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useNotebooks hook
    ;(useNotebooks as Mock).mockReturnValue({
      flatNotebooks: mockNotebooks,
    })
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      expect(result.current.showNotebookModal).toBe(false)
      expect(result.current.notebookSearchInput).toBe('')
      expect(result.current.notebookOptions).toHaveLength(3)
      expect(result.current.filteredNotebooks).toHaveLength(3)
    })

    it('should convert notebooks to options format', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      const expectedOptions = [
        { value: 'notebook-1', label: 'Work', icon: 'Book' },
        { value: 'notebook-2', label: 'Projects', icon: 'Book' },
        { value: 'notebook-3', label: 'Personal', icon: 'Book' },
      ]

      expect(result.current.notebookOptions).toEqual(expectedOptions)
    })

    it('should identify current notebook', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      expect(result.current.currentNotebook).toEqual({
        value: 'notebook-1',
        label: 'Work',
        icon: 'Book'
      })
    })

    it('should handle note without notebook', () => {
      const noteWithoutNotebook = { ...mockNote, notebookId: undefined }
      
      const { result } = renderHook(() => 
        useNotebookManager(noteWithoutNotebook, mockOnNotebookChange)
      )

      expect(result.current.currentNotebook).toBeNull()
    })

    it('should handle note with invalid notebook ID', () => {
      const noteWithInvalidNotebook = { ...mockNote, notebookId: 'invalid-id' }
      
      const { result } = renderHook(() => 
        useNotebookManager(noteWithInvalidNotebook, mockOnNotebookChange)
      )

      expect(result.current.currentNotebook).toBeNull()
    })
  })

  describe('Notebook Search', () => {
    it('should show all notebooks when search is empty', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      expect(result.current.filteredNotebooks).toHaveLength(3)
    })

    it('should filter notebooks by search input', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('work')
      })

      expect(result.current.filteredNotebooks).toHaveLength(1)
      expect(result.current.filteredNotebooks[0].label).toBe('Work')
    })

    it('should filter notebooks case-insensitively', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('WORK')
      })

      expect(result.current.filteredNotebooks).toHaveLength(1)
      expect(result.current.filteredNotebooks[0].label).toBe('Work')
    })

    it('should show multiple matches for partial search', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('p')
      })

      expect(result.current.filteredNotebooks).toHaveLength(2)
      expect(result.current.filteredNotebooks.map(nb => nb.label)).toEqual(['Projects', 'Personal'])
    })

    it('should handle search with no matches', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('nonexistent')
      })

      expect(result.current.filteredNotebooks).toHaveLength(0)
    })

    it('should trim search input', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('  work  ')
      })

      expect(result.current.filteredNotebooks).toHaveLength(1)
      expect(result.current.filteredNotebooks[0].label).toBe('Work')
    })
  })

  describe('Notebook Selection', () => {
    it('should handle notebook selection', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.handleNotebookSelect('notebook-2')
      })

      expect(mockOnNotebookChange).toHaveBeenCalledWith('notebook-2')
      expect(result.current.showNotebookModal).toBe(false)
      expect(result.current.notebookSearchInput).toBe('')
      expect(vi.mocked(logger.debug)).toHaveBeenCalledWith('Notebook changed to:', 'notebook-2')
    })

    it('should handle notebook selection errors', () => {
      const errorOnNotebookChange = vi.fn(() => {
        throw new Error('Selection failed')
      })

      const { result } = renderHook(() => 
        useNotebookManager(mockNote, errorOnNotebookChange)
      )

      act(() => {
        result.current.handleNotebookSelect('notebook-2')
      })

      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        'Failed to change notebook:',
        expect.any(Error)
      )
    })
  })

  describe('Modal Management', () => {
    it('should show notebook modal', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setShowNotebookModal(true)
      })

      expect(result.current.showNotebookModal).toBe(true)
    })

    it('should close notebook modal and clear search', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      // Setup initial state
      act(() => {
        result.current.setShowNotebookModal(true)
        result.current.setNotebookSearchInput('test search')
      })

      expect(result.current.showNotebookModal).toBe(true)
      expect(result.current.notebookSearchInput).toBe('test search')

      // Close modal
      act(() => {
        result.current.handleNotebookModalClose()
      })

      expect(result.current.showNotebookModal).toBe(false)
      expect(result.current.notebookSearchInput).toBe('')
    })
  })

  describe('Notebook Updates', () => {
    it('should update options when notebooks change', () => {
      const { result, rerender } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      expect(result.current.notebookOptions).toHaveLength(3)

      // Update mock to return different notebooks
      const newNotebooks = [
        ...mockNotebooks,
        {
          id: 'notebook-4',
          name: 'New Notebook',
          color: 'red',
          description: 'New notebook',
          parentId: null,
          children: [],
          level: 0,
          path: 'new',
          createdAt: '2024-01-04T00:00:00.000Z',
          updatedAt: '2024-01-04T00:00:00.000Z',
        },
      ]

      ;(useNotebooks as Mock).mockReturnValue({
        flatNotebooks: newNotebooks,
      })

      rerender()

      expect(result.current.notebookOptions).toHaveLength(4)
      expect(result.current.notebookOptions[3]).toEqual({
        value: 'notebook-4',
        label: 'New Notebook',
        icon: 'Book'
      })
    })

    it('should update current notebook when note changes', () => {
      const { result, rerender } = renderHook(
        ({ note }) => useNotebookManager(note, mockOnNotebookChange),
        { initialProps: { note: mockNote } }
      )

      expect(result.current.currentNotebook?.value).toBe('notebook-1')

      // Change note to different notebook
      const updatedNote = { ...mockNote, notebookId: 'notebook-2' }
      rerender({ note: updatedNote })

      expect(result.current.currentNotebook?.value).toBe('notebook-2')
      expect(result.current.currentNotebook?.label).toBe('Projects')
    })
  })

  describe('State Management', () => {
    it('should maintain search state independently of modal state', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setNotebookSearchInput('work')
      })

      expect(result.current.notebookSearchInput).toBe('work')
      expect(result.current.filteredNotebooks).toHaveLength(1)

      act(() => {
        result.current.setShowNotebookModal(true)
      })

      expect(result.current.notebookSearchInput).toBe('work')
      expect(result.current.filteredNotebooks).toHaveLength(1)
    })

    it('should clear search when modal closes', () => {
      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      act(() => {
        result.current.setShowNotebookModal(true)
        result.current.setNotebookSearchInput('work')
      })

      expect(result.current.notebookSearchInput).toBe('work')

      act(() => {
        result.current.handleNotebookModalClose()
      })

      expect(result.current.notebookSearchInput).toBe('')
      expect(result.current.filteredNotebooks).toHaveLength(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty notebooks array', () => {
      ;(useNotebooks as Mock).mockReturnValue({
        flatNotebooks: [],
      })

      const { result } = renderHook(() => 
        useNotebookManager(mockNote, mockOnNotebookChange)
      )

      expect(result.current.notebookOptions).toHaveLength(0)
      expect(result.current.filteredNotebooks).toHaveLength(0)
      expect(result.current.currentNotebook).toBeNull()
    })

    it('should handle null note', () => {
      const { result } = renderHook(() => 
        useNotebookManager(null, mockOnNotebookChange)
      )

      expect(result.current.currentNotebook).toBeNull()
    })

    it('should handle undefined note', () => {
      const { result } = renderHook(() => 
        useNotebookManager(undefined, mockOnNotebookChange)
      )

      expect(result.current.currentNotebook).toBeNull()
    })
  })
})