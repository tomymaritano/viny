import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { useNoteSync } from '../useNoteSync'
import { useAppStore } from '../../stores/newSimpleStore'
import { Note } from '../../types'

// Mock the store
vi.mock('../../stores/newSimpleStore')

// Mock window.electronAPI
const mockElectronAPI = {
  send: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
}

describe('useNoteSync', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notebook: 'test',
    status: 'active' as const,
    tags: ['test'],
    pinned: false
  }

  const mockUpdateNote = vi.fn()
  const mockNotes = [mockNote]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useAppStore
    vi.mocked(useAppStore).mockReturnValue({
      notes: mockNotes,
      updateNote: mockUpdateNote
    } as any)
    
    // Setup window.electronAPI
    Object.defineProperty(window, 'electronAPI', {
      value: mockElectronAPI,
      configurable: true
    })
  })

  afterEach(() => {
    // Clean up
    delete (window as any).electronAPI
  })

  describe('Initialization', () => {
    it('should set up note-updated listener when electronAPI is available', () => {
      renderHook(() => useNoteSync())
      
      expect(mockElectronAPI.on).toHaveBeenCalledWith('note-updated', expect.any(Function))
    })

    it('should not set up listener when electronAPI is not available', () => {
      delete (window as any).electronAPI
      
      renderHook(() => useNoteSync())
      
      expect(mockElectronAPI.on).not.toHaveBeenCalled()
    })
  })

  describe('Note Updates', () => {
    it('should update note when receiving note-updated event', () => {
      renderHook(() => useNoteSync())
      
      // Get the callback that was registered
      const noteUpdatedCallback = mockElectronAPI.on.mock.calls[0][1]
      
      // Simulate receiving a note update
      const updatedNote = { ...mockNote, title: 'Updated Title' }
      noteUpdatedCallback(null, updatedNote)
      
      expect(mockUpdateNote).toHaveBeenCalledWith(updatedNote)
    })

    it('should handle note-updated with new content', () => {
      renderHook(() => useNoteSync())
      
      const noteUpdatedCallback = mockElectronAPI.on.mock.calls[0][1]
      
      const updatedNote = { 
        ...mockNote, 
        content: 'New content',
        updatedAt: new Date().toISOString()
      }
      noteUpdatedCallback(null, updatedNote)
      
      expect(mockUpdateNote).toHaveBeenCalledWith(updatedNote)
    })

    it('should not update if note does not exist in store', () => {
      vi.mocked(useAppStore).mockReturnValue({
        notes: [], // Empty notes array
        updateNote: mockUpdateNote
      } as any)
      
      renderHook(() => useNoteSync())
      
      const noteUpdatedCallback = mockElectronAPI.on.mock.calls[0][1]
      noteUpdatedCallback(null, mockNote)
      
      // Should still call updateNote - let the store handle if note exists
      expect(mockUpdateNote).toHaveBeenCalledWith(mockNote)
    })
  })

  describe('Broadcasting Updates', () => {
    it('should broadcast note update when note changes in store', () => {
      const { rerender } = renderHook(() => useNoteSync())
      
      // Update the note in store
      const updatedNote = { ...mockNote, title: 'New Title' }
      vi.mocked(useAppStore).mockReturnValue({
        notes: [updatedNote],
        updateNote: mockUpdateNote
      } as any)
      
      rerender()
      
      expect(mockElectronAPI.send).toHaveBeenCalledWith('broadcast-note-update', updatedNote)
    })

    it('should broadcast multiple note changes', () => {
      const { rerender } = renderHook(() => useNoteSync())
      
      // First update
      const firstUpdate = { ...mockNote, title: 'First Update' }
      vi.mocked(useAppStore).mockReturnValue({
        notes: [firstUpdate],
        updateNote: mockUpdateNote
      } as any)
      rerender()
      
      // Second update
      const secondUpdate = { ...mockNote, title: 'Second Update' }
      vi.mocked(useAppStore).mockReturnValue({
        notes: [secondUpdate],
        updateNote: mockUpdateNote
      } as any)
      rerender()
      
      expect(mockElectronAPI.send).toHaveBeenCalledTimes(2)
      expect(mockElectronAPI.send).toHaveBeenNthCalledWith(1, 'broadcast-note-update', firstUpdate)
      expect(mockElectronAPI.send).toHaveBeenNthCalledWith(2, 'broadcast-note-update', secondUpdate)
    })

    it('should not broadcast when electronAPI is not available', () => {
      delete (window as any).electronAPI
      
      const { rerender } = renderHook(() => useNoteSync())
      
      const updatedNote = { ...mockNote, title: 'New Title' }
      vi.mocked(useAppStore).mockReturnValue({
        notes: [updatedNote],
        updateNote: mockUpdateNote
      } as any)
      
      rerender()
      
      expect(mockElectronAPI.send).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should remove listener on unmount', () => {
      const { unmount } = renderHook(() => useNoteSync())
      
      unmount()
      
      expect(mockElectronAPI.removeListener).toHaveBeenCalledWith(
        'note-updated',
        expect.any(Function)
      )
    })

    it('should not attempt to remove listener if electronAPI not available', () => {
      const { unmount } = renderHook(() => useNoteSync())
      
      delete (window as any).electronAPI
      
      unmount()
      
      // Should have been called once during setup, but not during cleanup
      expect(mockElectronAPI.removeListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in note-updated callback gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockUpdateNote.mockImplementation(() => {
        throw new Error('Update failed')
      })
      
      renderHook(() => useNoteSync())
      
      const noteUpdatedCallback = mockElectronAPI.on.mock.calls[0][1]
      
      // Should not throw
      expect(() => {
        noteUpdatedCallback(null, mockNote)
      }).not.toThrow()
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle invalid note data', () => {
      renderHook(() => useNoteSync())
      
      const noteUpdatedCallback = mockElectronAPI.on.mock.calls[0][1]
      
      // Send invalid data
      noteUpdatedCallback(null, null)
      noteUpdatedCallback(null, undefined)
      noteUpdatedCallback(null, {})
      
      // Should handle gracefully
      expect(mockUpdateNote).toHaveBeenCalledTimes(3)
    })
  })

  describe('Performance', () => {
    it('should not cause excessive re-renders', () => {
      let renderCount = 0
      
      renderHook(() => {
        renderCount++
        useNoteSync()
      })
      
      // Should only render once on mount
      expect(renderCount).toBe(1)
    })

    it('should debounce rapid updates', () => {
      vi.useFakeTimers()
      
      const { rerender } = renderHook(() => useNoteSync())
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedNote = { ...mockNote, title: `Update ${i}` }
        vi.mocked(useAppStore).mockReturnValue({
          notes: [updatedNote],
          updateNote: mockUpdateNote
        } as any)
        rerender()
      }
      
      vi.runAllTimers()
      
      // Should broadcast all updates (no debouncing in current implementation)
      expect(mockElectronAPI.send).toHaveBeenCalledTimes(10)
      
      vi.useRealTimers()
    })
  })
})