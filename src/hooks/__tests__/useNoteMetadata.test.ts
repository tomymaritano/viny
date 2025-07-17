/**
 * Tests for useNoteMetadata hook
 * Medium priority hook for managing note metadata state
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNoteMetadata } from '../useNoteMetadata'

// Mock callbacks
const mockOnTitleChange = vi.fn()
const mockOnNotebookChange = vi.fn()
const mockOnStatusChange = vi.fn()
const mockOnTagsChange = vi.fn()

// Test note
const testNote = {
  id: 'test-note-id',
  title: 'Test Note Title',
  notebook: 'test-notebook',
  status: 'active',
  tags: ['tag1', 'tag2']
}

// Helper function to create event
const createEvent = (value: string) => ({
  target: { value }
})

describe('useNoteMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook initialization', () => {
    it('should initialize with note title', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      expect(result.current.localTitle).toBe('Test Note Title')
      expect(result.current.showNotebookDropdown).toBe(false)
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should initialize with empty title when note is null', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          null,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      expect(result.current.localTitle).toBe('')
      expect(result.current.showNotebookDropdown).toBe(false)
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should initialize with empty title when note has no title', () => {
      const noteWithoutTitle = { ...testNote, title: undefined }
      const { result } = renderHook(() => 
        useNoteMetadata(
          noteWithoutTitle,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      expect(result.current.localTitle).toBe('')
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      // State
      expect(result.current).toHaveProperty('localTitle')
      expect(result.current).toHaveProperty('showNotebookDropdown')
      expect(result.current).toHaveProperty('showStatusDropdown')
      
      // Actions
      expect(typeof result.current.handleTitleChange).toBe('function')
      expect(typeof result.current.handleTitleBlur).toBe('function')
      expect(typeof result.current.handleNotebookSelect).toBe('function')
      expect(typeof result.current.handleStatusSelect).toBe('function')
      expect(typeof result.current.toggleNotebookDropdown).toBe('function')
      expect(typeof result.current.toggleStatusDropdown).toBe('function')
      expect(typeof result.current.closeAllDropdowns).toBe('function')
      
      // Direct setters
      expect(typeof result.current.setLocalTitle).toBe('function')
      expect(typeof result.current.setShowNotebookDropdown).toBe('function')
      expect(typeof result.current.setShowStatusDropdown).toBe('function')
    })
  })

  describe('Title management', () => {
    it('should handle title change', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      const event = createEvent('New Title')
      
      act(() => {
        result.current.handleTitleChange(event)
      })
      
      expect(result.current.localTitle).toBe('New Title')
      expect(mockOnTitleChange).toHaveBeenCalledWith(event)
    })

    it('should handle title blur', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      const event = createEvent('Blurred Title')
      
      act(() => {
        result.current.handleTitleBlur(event)
      })
      
      expect(mockOnTitleChange).toHaveBeenCalledWith(event)
    })

    it('should handle title change when callback is null', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          null,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      const event = createEvent('New Title')
      
      act(() => {
        result.current.handleTitleChange(event)
      })
      
      expect(result.current.localTitle).toBe('New Title')
    })

    it('should update local title when note changes', () => {
      const { result, rerender } = renderHook(
        ({ note }) => useNoteMetadata(
          note,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        ),
        { initialProps: { note: testNote } }
      )
      
      expect(result.current.localTitle).toBe('Test Note Title')
      
      const updatedNote = { ...testNote, id: 'new-id', title: 'Updated Title' }
      rerender({ note: updatedNote })
      
      expect(result.current.localTitle).toBe('Updated Title')
    })

    it('should update local title when note title changes but id remains same', () => {
      const { result, rerender } = renderHook(
        ({ note }) => useNoteMetadata(
          note,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        ),
        { initialProps: { note: testNote } }
      )
      
      const updatedNote = { ...testNote, title: 'Updated Title Same ID' }
      rerender({ note: updatedNote })
      
      expect(result.current.localTitle).toBe('Updated Title Same ID')
    })

    it('should handle direct title setter', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setLocalTitle('Direct Set Title')
      })
      
      expect(result.current.localTitle).toBe('Direct Set Title')
    })
  })

  describe('Notebook dropdown', () => {
    it('should toggle notebook dropdown', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      expect(result.current.showNotebookDropdown).toBe(false)
      
      act(() => {
        result.current.toggleNotebookDropdown()
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      
      act(() => {
        result.current.toggleNotebookDropdown()
      })
      
      expect(result.current.showNotebookDropdown).toBe(false)
    })

    it('should close status dropdown when opening notebook dropdown', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowStatusDropdown(true)
      })
      
      expect(result.current.showStatusDropdown).toBe(true)
      
      act(() => {
        result.current.toggleNotebookDropdown()
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should handle notebook selection', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowNotebookDropdown(true)
      })
      
      act(() => {
        result.current.handleNotebookSelect('new-notebook-id')
      })
      
      expect(mockOnNotebookChange).toHaveBeenCalledWith({
        target: { value: 'new-notebook-id' }
      })
      expect(result.current.showNotebookDropdown).toBe(false)
    })

    it('should handle notebook selection when callback is null', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          null,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowNotebookDropdown(true)
      })
      
      act(() => {
        result.current.handleNotebookSelect('new-notebook-id')
      })
      
      expect(result.current.showNotebookDropdown).toBe(false)
    })

    it('should handle direct notebook dropdown setter', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowNotebookDropdown(true)
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      
      act(() => {
        result.current.setShowNotebookDropdown(false)
      })
      
      expect(result.current.showNotebookDropdown).toBe(false)
    })
  })

  describe('Status dropdown', () => {
    it('should toggle status dropdown', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      expect(result.current.showStatusDropdown).toBe(false)
      
      act(() => {
        result.current.toggleStatusDropdown()
      })
      
      expect(result.current.showStatusDropdown).toBe(true)
      
      act(() => {
        result.current.toggleStatusDropdown()
      })
      
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should close notebook dropdown when opening status dropdown', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowNotebookDropdown(true)
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      
      act(() => {
        result.current.toggleStatusDropdown()
      })
      
      expect(result.current.showStatusDropdown).toBe(true)
      expect(result.current.showNotebookDropdown).toBe(false)
    })

    it('should handle status selection', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowStatusDropdown(true)
      })
      
      act(() => {
        result.current.handleStatusSelect('completed')
      })
      
      expect(mockOnStatusChange).toHaveBeenCalledWith({
        target: { value: 'completed' }
      })
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should handle status selection when callback is null', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          null,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowStatusDropdown(true)
      })
      
      act(() => {
        result.current.handleStatusSelect('completed')
      })
      
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should handle direct status dropdown setter', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowStatusDropdown(true)
      })
      
      expect(result.current.showStatusDropdown).toBe(true)
      
      act(() => {
        result.current.setShowStatusDropdown(false)
      })
      
      expect(result.current.showStatusDropdown).toBe(false)
    })
  })

  describe('Close all dropdowns', () => {
    it('should close all dropdowns', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        result.current.setShowNotebookDropdown(true)
        result.current.setShowStatusDropdown(true)
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      expect(result.current.showStatusDropdown).toBe(true)
      
      act(() => {
        result.current.closeAllDropdowns()
      })
      
      expect(result.current.showNotebookDropdown).toBe(false)
      expect(result.current.showStatusDropdown).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle all null callbacks', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(testNote, null, null, null, null)
      )
      
      // Should not throw when calling handlers
      act(() => {
        result.current.handleTitleChange(createEvent('New Title'))
        result.current.handleTitleBlur(createEvent('Blur'))
        result.current.handleNotebookSelect('notebook-id')
        result.current.handleStatusSelect('status')
      })
      
      expect(result.current.localTitle).toBe('New Title')
    })

    it('should handle rapid dropdown toggles', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      act(() => {
        // Rapid toggles
        result.current.toggleNotebookDropdown()
        result.current.toggleStatusDropdown()
        result.current.toggleNotebookDropdown()
        result.current.toggleStatusDropdown()
      })
      
      // Only status dropdown should be open
      expect(result.current.showNotebookDropdown).toBe(false)
      expect(result.current.showStatusDropdown).toBe(true)
    })

    it('should handle note change to null', () => {
      const { result, rerender } = renderHook(
        ({ note }) => useNoteMetadata(
          note,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        ),
        { initialProps: { note: testNote } }
      )
      
      expect(result.current.localTitle).toBe('Test Note Title')
      
      rerender({ note: null })
      
      expect(result.current.localTitle).toBe('')
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      const initialMethods = {
        handleTitleChange: result.current.handleTitleChange,
        handleTitleBlur: result.current.handleTitleBlur,
        handleNotebookSelect: result.current.handleNotebookSelect,
        handleStatusSelect: result.current.handleStatusSelect,
        toggleNotebookDropdown: result.current.toggleNotebookDropdown,
        toggleStatusDropdown: result.current.toggleStatusDropdown,
        closeAllDropdowns: result.current.closeAllDropdowns
      }
      
      rerender()
      
      expect(result.current.handleTitleChange).toBe(initialMethods.handleTitleChange)
      expect(result.current.handleTitleBlur).toBe(initialMethods.handleTitleBlur)
      expect(result.current.handleNotebookSelect).toBe(initialMethods.handleNotebookSelect)
      expect(result.current.handleStatusSelect).toBe(initialMethods.handleStatusSelect)
      expect(result.current.toggleNotebookDropdown).toBe(initialMethods.toggleNotebookDropdown)
      expect(result.current.toggleStatusDropdown).toBe(initialMethods.toggleStatusDropdown)
      expect(result.current.closeAllDropdowns).toBe(initialMethods.closeAllDropdowns)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete metadata update flow', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      // Update title
      act(() => {
        result.current.handleTitleChange(createEvent('Updated Title'))
      })
      
      expect(result.current.localTitle).toBe('Updated Title')
      expect(mockOnTitleChange).toHaveBeenCalled()
      
      // Change notebook
      act(() => {
        result.current.toggleNotebookDropdown()
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      
      act(() => {
        result.current.handleNotebookSelect('new-notebook')
      })
      
      expect(mockOnNotebookChange).toHaveBeenCalled()
      expect(result.current.showNotebookDropdown).toBe(false)
      
      // Change status
      act(() => {
        result.current.toggleStatusDropdown()
      })
      
      expect(result.current.showStatusDropdown).toBe(true)
      
      act(() => {
        result.current.handleStatusSelect('archived')
      })
      
      expect(mockOnStatusChange).toHaveBeenCalled()
      expect(result.current.showStatusDropdown).toBe(false)
    })

    it('should handle typical UI interaction flow', () => {
      const { result } = renderHook(() => 
        useNoteMetadata(
          testNote,
          mockOnTitleChange,
          mockOnNotebookChange,
          mockOnStatusChange,
          mockOnTagsChange
        )
      )
      
      // User starts editing title
      act(() => {
        result.current.handleTitleChange(createEvent('New'))
      })
      
      act(() => {
        result.current.handleTitleChange(createEvent('New Title'))
      })
      
      act(() => {
        result.current.handleTitleChange(createEvent('New Title for Note'))
      })
      
      expect(result.current.localTitle).toBe('New Title for Note')
      expect(mockOnTitleChange).toHaveBeenCalledTimes(3)
      
      // User blurs title field
      act(() => {
        result.current.handleTitleBlur(createEvent('New Title for Note'))
      })
      
      expect(mockOnTitleChange).toHaveBeenCalledTimes(4)
      
      // User opens dropdown but clicks away
      act(() => {
        result.current.toggleNotebookDropdown()
      })
      
      expect(result.current.showNotebookDropdown).toBe(true)
      
      act(() => {
        result.current.closeAllDropdowns()
      })
      
      expect(result.current.showNotebookDropdown).toBe(false)
    })
  })
})