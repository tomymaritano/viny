/**
 * Tests for usePageLifecycle hook
 * Low priority hook for managing page lifecycle events
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePageLifecycle } from '../usePageLifecycle'
import { storageService } from '../../lib/storage'
import { Note } from '../../types'

// Mock storage service
vi.mock('../../lib/storage', () => ({
  storageService: {
    flushPendingSaves: vi.fn()
  }
}))

// Mock note
const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'Test content',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  tags: ['test'],
  isPinned: false,
  isTrashed: false,
  status: 'active'
}

// Helper to create beforeunload event
const createBeforeUnloadEvent = () => {
  const event = new Event('beforeunload') as BeforeUnloadEvent
  event.preventDefault = vi.fn()
  // Define returnValue property
  let returnValue: string | undefined
  Object.defineProperty(event, 'returnValue', {
    get: () => returnValue,
    set: (value) => { returnValue = value },
    configurable: true
  })
  return event
}

describe('usePageLifecycle', () => {
  // Store original values
  const originalAddEventListener = window.addEventListener
  const originalRemoveEventListener = window.removeEventListener
  const originalDocAddEventListener = document.addEventListener
  const originalDocRemoveEventListener = document.removeEventListener
  
  // Track added listeners
  let windowListeners: { [key: string]: EventListener[] } = {}
  let documentListeners: { [key: string]: EventListener[] } = {}

  beforeEach(() => {
    vi.clearAllMocks()
    windowListeners = {}
    documentListeners = {}
    
    // Reset mock to not throw
    vi.mocked(storageService.flushPendingSaves).mockImplementation(() => {})
    
    // Mock window event listeners
    window.addEventListener = vi.fn((event: string, handler: EventListener) => {
      if (!windowListeners[event]) windowListeners[event] = []
      windowListeners[event].push(handler)
    })
    
    window.removeEventListener = vi.fn((event: string, handler: EventListener) => {
      if (windowListeners[event]) {
        windowListeners[event] = windowListeners[event].filter(h => h !== handler)
      }
    })
    
    // Mock document event listeners
    document.addEventListener = vi.fn((event: string, handler: EventListener) => {
      if (!documentListeners[event]) documentListeners[event] = []
      documentListeners[event].push(handler)
    })
    
    document.removeEventListener = vi.fn((event: string, handler: EventListener) => {
      if (documentListeners[event]) {
        documentListeners[event] = documentListeners[event].filter(h => h !== handler)
      }
    })
  })

  afterEach(() => {
    // Restore original functions
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    document.addEventListener = originalDocAddEventListener
    document.removeEventListener = originalDocRemoveEventListener
  })

  describe('Hook initialization', () => {
    it('should set up event listeners on mount', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
      expect(document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    })

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => usePageLifecycle({ currentNote: null }))
      
      unmount()
      
      expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
      expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
      expect(storageService.flushPendingSaves).toHaveBeenCalled()
    })

    it('should handle currentNote ref updates', () => {
      const { rerender } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      // Update with a note
      rerender({ currentNote: mockNote })
      
      // Should still have only one listener
      expect(windowListeners['beforeunload']).toHaveLength(1)
      expect(documentListeners['visibilitychange']).toHaveLength(1)
    })
  })

  describe('Beforeunload handling', () => {
    it('should flush pending saves on beforeunload', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      const event = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](event)
      
      expect(storageService.flushPendingSaves).toHaveBeenCalled()
    })

    it('should warn user if currentNote exists', () => {
      renderHook(() => usePageLifecycle({ currentNote: mockNote }))
      
      const event = createBeforeUnloadEvent()
      const result = windowListeners['beforeunload'][0](event)
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?')
      expect(result).toBe('You have unsaved changes. Are you sure you want to leave?')
    })

    it('should not warn if currentNote is null', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      const event = createBeforeUnloadEvent()
      const result = windowListeners['beforeunload'][0](event)
      
      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(event.returnValue).toBeUndefined()
      expect(result).toBeUndefined()
    })

    it('should use latest currentNote value via ref', () => {
      const { rerender } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      // Update to have a note
      rerender({ currentNote: mockNote })
      
      const event = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](event)
      
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Visibility change handling', () => {
    it('should flush saves when page becomes hidden', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      // Mock document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true
      })
      
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      
      expect(storageService.flushPendingSaves).toHaveBeenCalled()
    })

    it('should not flush saves when page is visible', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      // Mock document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true
      })
      
      vi.clearAllMocks()
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      
      expect(storageService.flushPendingSaves).not.toHaveBeenCalled()
    })

    it('should handle prerender state', () => {
      renderHook(() => usePageLifecycle({ currentNote: null }))
      
      // Mock document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'prerender',
        writable: true,
        configurable: true
      })
      
      vi.clearAllMocks()
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      
      expect(storageService.flushPendingSaves).not.toHaveBeenCalled()
    })
  })

  describe('Ref behavior', () => {
    it('should not re-register listeners when currentNote changes', () => {
      const { rerender } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      const initialCalls = vi.mocked(window.addEventListener).mock.calls.length
      
      rerender({ currentNote: mockNote })
      rerender({ currentNote: null })
      rerender({ currentNote: { ...mockNote, title: 'Updated' } })
      
      // Should not have added more listeners
      expect(vi.mocked(window.addEventListener).mock.calls.length).toBe(initialCalls)
    })

    it('should always use latest note value in handlers', () => {
      const { rerender } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      // Initially no note
      let event1 = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](event1)
      expect(event1.preventDefault).not.toHaveBeenCalled()
      
      // Update to have a note
      rerender({ currentNote: mockNote })
      
      // Should now warn
      let event2 = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](event2)
      expect(event2.preventDefault).toHaveBeenCalled()
      
      // Update back to null
      rerender({ currentNote: null })
      
      // Should not warn anymore
      let event3 = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](event3)
      expect(event3.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle multiple rapid mounts/unmounts', () => {
      const { unmount, rerender } = renderHook(() => usePageLifecycle({ currentNote: null }))
      
      unmount()
      renderHook(() => usePageLifecycle({ currentNote: mockNote }))
      
      expect(windowListeners['beforeunload']).toHaveLength(1)
      expect(documentListeners['visibilitychange']).toHaveLength(1)
    })

    it('should handle event with readonly returnValue', () => {
      renderHook(() => usePageLifecycle({ currentNote: mockNote }))
      
      const event = new Event('beforeunload') as any
      event.preventDefault = vi.fn()
      
      // Mock a setter to capture the value
      let capturedReturnValue: string | undefined
      Object.defineProperty(event, 'returnValue', {
        get: () => true, // Default browser behavior
        set: (value) => { capturedReturnValue = value },
        configurable: true
      })
      
      const result = windowListeners['beforeunload'][0](event)
      
      // The hook should attempt to set returnValue
      expect(capturedReturnValue).toBe('You have unsaved changes. Are you sure you want to leave?')
      expect(result).toBe('You have unsaved changes. Are you sure you want to leave?')
    })

    it('should handle errors in flushPendingSaves', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { unmount } = renderHook(() => usePageLifecycle({ currentNote: null }))
      
      // Set up to throw only on unmount
      vi.mocked(storageService.flushPendingSaves).mockImplementation(() => {
        throw new Error('Flush failed')
      })
      
      // Should not throw even if flushPendingSaves throws
      expect(() => unmount()).not.toThrow()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete lifecycle flow', () => {
      const { rerender, unmount } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      // Start editing a note
      rerender({ currentNote: mockNote })
      
      // User tries to leave - should warn
      const beforeUnloadEvent = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](beforeUnloadEvent)
      expect(beforeUnloadEvent.preventDefault).toHaveBeenCalled()
      expect(storageService.flushPendingSaves).toHaveBeenCalled()
      
      // Tab becomes hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true
      })
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      expect(storageService.flushPendingSaves).toHaveBeenCalledTimes(2)
      
      // Save completes
      rerender({ currentNote: null })
      
      // Now leaving should not warn
      const newEvent = createBeforeUnloadEvent()
      windowListeners['beforeunload'][0](newEvent)
      expect(newEvent.preventDefault).not.toHaveBeenCalled()
      
      // Unmount
      unmount()
      expect(storageService.flushPendingSaves).toHaveBeenCalledTimes(4)
    })

    it('should handle background/foreground transitions', () => {
      renderHook(() => usePageLifecycle({ currentNote: mockNote }))
      
      // Go to background
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true
      })
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      expect(storageService.flushPendingSaves).toHaveBeenCalledTimes(1)
      
      // Come back to foreground
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true
      })
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      expect(storageService.flushPendingSaves).toHaveBeenCalledTimes(1) // No additional calls
      
      // Go to background again
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true
      })
      documentListeners['visibilitychange'][0](new Event('visibilitychange'))
      expect(storageService.flushPendingSaves).toHaveBeenCalledTimes(2)
    })
  })

  describe('Memory management', () => {
    it('should not leak listeners on multiple renders', () => {
      const { rerender } = renderHook(
        ({ currentNote }) => usePageLifecycle({ currentNote }),
        { initialProps: { currentNote: null } }
      )
      
      for (let i = 0; i < 10; i++) {
        rerender({ currentNote: i % 2 === 0 ? mockNote : null })
      }
      
      expect(windowListeners['beforeunload']).toHaveLength(1)
      expect(documentListeners['visibilitychange']).toHaveLength(1)
    })

    it('should clean up all listeners on unmount', () => {
      const { unmount } = renderHook(() => usePageLifecycle({ currentNote: mockNote }))
      
      unmount()
      
      // Try to trigger events - should not cause issues
      if (windowListeners['beforeunload']?.[0]) {
        expect(() => windowListeners['beforeunload'][0](createBeforeUnloadEvent())).not.toThrow()
      }
      
      expect(window.removeEventListener).toHaveBeenCalled()
      expect(document.removeEventListener).toHaveBeenCalled()
    })
  })
})