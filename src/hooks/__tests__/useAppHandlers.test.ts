/**
 * Tests for useAppHandlers hook
 * Low priority hook for app-level event handlers
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppHandlers } from '../useAppHandlers'
import { useAppStore } from '../../stores/newSimpleStore'
import { Note } from '../../types'

// Mock store
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn()
}))

// Mock logger
vi.mock('../../utils/logger', () => ({
  noteLogger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// Mock data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'First Note',
    content: 'Initial content',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    tags: ['test'],
    isPinned: false,
    isTrashed: false,
    status: 'active',
    notebook: 'default'
  },
  {
    id: '2',
    title: 'Second Note',
    content: 'Another note',
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
    tags: ['demo'],
    isPinned: true,
    isTrashed: false,
    status: 'active',
    notebook: 'work'
  }
]

// Mock store functions
const mockSetCurrentNote = vi.fn()
const mockSetSelectedNoteId = vi.fn()
const mockSetIsEditorOpen = vi.fn()

// Mock props
const mockOnSaveNote = vi.fn().mockResolvedValue(undefined)
const mockDebouncedAutoSave = vi.fn()

// Default mock state
const defaultMockState = {
  notes: mockNotes,
  currentNote: mockNotes[0],
  setCurrentNote: mockSetCurrentNote,
  setSelectedNoteId: mockSetSelectedNoteId,
  setIsEditorOpen: mockSetIsEditorOpen
}

// Setup mocks
const setupMocks = (state = defaultMockState) => {
  vi.mocked(useAppStore).mockReturnValue(state as any)
  vi.mocked(useAppStore).getState = vi.fn().mockReturnValue(state)
}

describe('useAppHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('Hook initialization', () => {
    it('should provide all expected handlers', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      expect(result.current).toHaveProperty('handleOpenNote')
      expect(result.current).toHaveProperty('handleContentChange')
      expect(result.current).toHaveProperty('handleNotebookChange')
      expect(result.current).toHaveProperty('handleMetadataChange')
      
      expect(typeof result.current.handleOpenNote).toBe('function')
      expect(typeof result.current.handleContentChange).toBe('function')
      expect(typeof result.current.handleNotebookChange).toBe('function')
      expect(typeof result.current.handleMetadataChange).toBe('function')
    })
  })

  describe('handleOpenNote', () => {
    it('should open an existing note', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      act(() => {
        result.current.handleOpenNote('2')
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(mockNotes[1])
      expect(mockSetSelectedNoteId).toHaveBeenCalledWith('2')
      expect(mockSetIsEditorOpen).toHaveBeenCalledWith(true)
    })

    it('should handle non-existent note', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      act(() => {
        result.current.handleOpenNote('non-existent')
      })
      
      expect(mockSetCurrentNote).not.toHaveBeenCalled()
      expect(mockSetSelectedNoteId).not.toHaveBeenCalled()
      expect(mockSetIsEditorOpen).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Note not found:', 'non-existent')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle empty notes array', () => {
      setupMocks({ ...defaultMockState, notes: [] })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: [],
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      act(() => {
        result.current.handleOpenNote('1')
      })
      
      expect(mockSetCurrentNote).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('handleContentChange', () => {
    it('should update content and trigger auto-save', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const newContent = 'Updated content'
      
      act(() => {
        result.current.handleContentChange(newContent)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockNotes[0],
          content: newContent,
          updatedAt: expect.any(String)
        })
      )
      expect(mockDebouncedAutoSave).toHaveBeenCalledWith(
        expect.objectContaining({
          content: newContent
        })
      )
    })

    it('should handle empty content', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      act(() => {
        result.current.handleContentChange('')
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          content: ''
        })
      )
      expect(mockDebouncedAutoSave).toHaveBeenCalled()
    })

    it('should handle when no current note exists', () => {
      setupMocks({ ...defaultMockState, currentNote: null })
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      act(() => {
        result.current.handleContentChange('New content')
      })
      
      expect(mockSetCurrentNote).not.toHaveBeenCalled()
      expect(mockDebouncedAutoSave).not.toHaveBeenCalled()
    })

    it('should update timestamp on content change', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const beforeTime = new Date().toISOString()
      
      act(() => {
        result.current.handleContentChange('New content')
      })
      
      const updatedNote = mockSetCurrentNote.mock.calls[0][0]
      expect(new Date(updatedNote.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime())
    })
  })

  describe('handleNotebookChange', () => {
    it('should update notebook and save immediately', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const newNotebook = 'personal'
      
      await act(async () => {
        result.current.handleNotebookChange(newNotebook)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockNotes[0],
          notebook: newNotebook
        })
      )
      expect(mockOnSaveNote).toHaveBeenCalledWith(
        expect.objectContaining({
          notebook: newNotebook
        })
      )
      expect(mockDebouncedAutoSave).not.toHaveBeenCalled()
    })

    it('should handle empty notebook name', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      await act(async () => {
        result.current.handleNotebookChange('')
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          notebook: ''
        })
      )
      expect(mockOnSaveNote).toHaveBeenCalled()
    })

    it('should handle when no current note exists', async () => {
      setupMocks({ ...defaultMockState, currentNote: null })
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      await act(async () => {
        result.current.handleNotebookChange('personal')
      })
      
      expect(mockSetCurrentNote).not.toHaveBeenCalled()
      expect(mockOnSaveNote).not.toHaveBeenCalled()
    })
  })

  describe('handleMetadataChange', () => {
    it('should update metadata and save immediately', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const updatedNote = {
        ...mockNotes[0],
        title: 'Updated Title',
        tags: ['updated', 'test'],
        isPinned: true
      }
      
      await act(async () => {
        await result.current.handleMetadataChange(updatedNote)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(updatedNote)
      expect(mockOnSaveNote).toHaveBeenCalledWith(updatedNote)
    })

    it('should handle save errors gracefully', async () => {
      const error = new Error('Save failed')
      mockOnSaveNote.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const updatedNote = { ...mockNotes[0], title: 'Failed Update' }
      
      await act(async () => {
        await result.current.handleMetadataChange(updatedNote)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(updatedNote)
      expect(mockOnSaveNote).toHaveBeenCalledWith(updatedNote)
    })

    it('should update only changed metadata fields', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const updatedNote = {
        ...mockNotes[0],
        title: 'Only Title Changed'
      }
      
      await act(async () => {
        await result.current.handleMetadataChange(updatedNote)
      })
      
      const savedNote = mockOnSaveNote.mock.calls[0][0]
      expect(savedNote.title).toBe('Only Title Changed')
      expect(savedNote.content).toBe(mockNotes[0].content)
      expect(savedNote.tags).toEqual(mockNotes[0].tags)
    })
  })

  describe('Handler stability', () => {
    it('should provide stable handler references', () => {
      const { result, rerender } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const initialHandlers = {
        handleOpenNote: result.current.handleOpenNote,
        handleContentChange: result.current.handleContentChange,
        handleNotebookChange: result.current.handleNotebookChange,
        handleMetadataChange: result.current.handleMetadataChange
      }
      
      rerender()
      
      expect(result.current.handleOpenNote).toBe(initialHandlers.handleOpenNote)
      expect(result.current.handleContentChange).toBe(initialHandlers.handleContentChange)
      expect(result.current.handleNotebookChange).toBe(initialHandlers.handleNotebookChange)
      expect(result.current.handleMetadataChange).toBe(initialHandlers.handleMetadataChange)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete note editing workflow', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      // Open a note
      act(() => {
        result.current.handleOpenNote('1')
      })
      
      expect(mockSetIsEditorOpen).toHaveBeenCalledWith(true)
      
      // Update content
      act(() => {
        result.current.handleContentChange('New content for the note')
      })
      
      expect(mockDebouncedAutoSave).toHaveBeenCalled()
      
      // Change notebook
      await act(async () => {
        result.current.handleNotebookChange('work')
      })
      
      expect(mockOnSaveNote).toHaveBeenCalledWith(
        expect.objectContaining({
          notebook: 'work'
        })
      )
      
      // Update metadata
      const updatedNote = {
        ...mockNotes[0],
        title: 'Updated Title',
        tags: ['important']
      }
      
      await act(async () => {
        await result.current.handleMetadataChange(updatedNote)
      })
      
      expect(mockOnSaveNote).toHaveBeenCalledWith(updatedNote)
    })

    it('should handle rapid content changes', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      // Simulate rapid typing
      const changes = ['H', 'He', 'Hel', 'Hell', 'Hello']
      
      changes.forEach(content => {
        act(() => {
          result.current.handleContentChange(content)
        })
      })
      
      // Each change should update current note
      expect(mockSetCurrentNote).toHaveBeenCalledTimes(5)
      
      // Each change should trigger debounced auto-save
      expect(mockDebouncedAutoSave).toHaveBeenCalledTimes(5)
      
      // Last call should have final content
      expect(mockDebouncedAutoSave).toHaveBeenLastCalledWith(
        expect.objectContaining({
          content: 'Hello'
        })
      )
    })

    it('should handle switching between notes', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      // Open first note
      act(() => {
        result.current.handleOpenNote('1')
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(mockNotes[0])
      
      // Switch to second note
      act(() => {
        result.current.handleOpenNote('2')
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(mockNotes[1])
      expect(mockSetSelectedNoteId).toHaveBeenLastCalledWith('2')
    })
  })

  describe('Edge cases', () => {
    it('should handle very long content', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const veryLongContent = 'A'.repeat(100000)
      
      act(() => {
        result.current.handleContentChange(veryLongContent)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          content: veryLongContent
        })
      )
      expect(mockDebouncedAutoSave).toHaveBeenCalled()
    })

    it('should handle special characters in content', () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const specialContent = '🎉 Unicode 你好世界 \n\t Special chars: <>&"\'`'
      
      act(() => {
        result.current.handleContentChange(specialContent)
      })
      
      expect(mockSetCurrentNote).toHaveBeenCalledWith(
        expect.objectContaining({
          content: specialContent
        })
      )
    })

    it('should handle concurrent metadata updates', async () => {
      const { result } = renderHook(() => useAppHandlers({
        filteredNotes: mockNotes,
        onSaveNote: mockOnSaveNote,
        debouncedAutoSave: mockDebouncedAutoSave
      }))
      
      const update1 = { ...mockNotes[0], title: 'Update 1' }
      const update2 = { ...mockNotes[0], title: 'Update 2' }
      
      await act(async () => {
        // Fire both updates without waiting
        const promise1 = result.current.handleMetadataChange(update1)
        const promise2 = result.current.handleMetadataChange(update2)
        await Promise.all([promise1, promise2])
      })
      
      expect(mockOnSaveNote).toHaveBeenCalledTimes(2)
      expect(mockSetCurrentNote).toHaveBeenCalledTimes(2)
    })
  })
})