/**
 * Tests for useKeyboardShortcuts hook
 * High priority hook for user experience and keyboard navigation
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import type { Note } from '../../types'

// Mock note for testing
const mockNote: Note = {
  id: 'test-note-id',
  title: 'Test Note',
  content: 'Test content',
  tags: [],
  notebook: 'inbox',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

// Mock callbacks
const mockCallbacks = {
  onCreateNew: vi.fn(),
  onSave: vi.fn(),
  onSearch: vi.fn(),
  onExport: vi.fn(),
  onSettings: vi.fn(),
}

// Helper function to simulate keyboard events
const simulateKeyDown = (
  key: string,
  options: { metaKey?: boolean; ctrlKey?: boolean; target?: HTMLElement } = {}
) => {
  const event = new KeyboardEvent('keydown', {
    key,
    metaKey: options.metaKey || false,
    ctrlKey: options.ctrlKey || false,
    bubbles: true,
    cancelable: true,
  })

  // Always set a target - use provided target or default to document.body
  const target = options.target || document.body
  Object.defineProperty(event, 'target', {
    value: target,
    writable: false,
  })

  window.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any existing event listeners
    window.removeEventListener('keydown', () => {})
  })

  describe('Hook Setup and Cleanup', () => {
    it('should attach event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })

    it('should update event listener when dependencies change', () => {
      const { rerender } = renderHook(
        ({ currentNote, ...callbacks }) =>
          useKeyboardShortcuts({
            currentNote,
            ...callbacks,
          }),
        { initialProps: { currentNote: null, ...mockCallbacks } }
      )

      // Change currentNote
      rerender({ currentNote: mockNote, ...mockCallbacks })

      // Event listener should be updated
      simulateKeyDown('s', { metaKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })
  })

  describe('Search Shortcut (Cmd/Ctrl + K)', () => {
    it('should trigger search on Cmd+K (macOS)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('k', { metaKey: true })
      expect(mockCallbacks.onSearch).toHaveBeenCalledTimes(1)
    })

    it('should trigger search on Ctrl+K (Windows/Linux)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('k', { ctrlKey: true })
      expect(mockCallbacks.onSearch).toHaveBeenCalledTimes(1)
    })

    it('should work regardless of typing context', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      // Create mock input element
      const inputElement = document.createElement('input')
      simulateKeyDown('k', { metaKey: true, target: inputElement })

      expect(mockCallbacks.onSearch).toHaveBeenCalledTimes(1)
    })

    it('should prevent default behavior', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const event = simulateKeyDown('k', { metaKey: true })
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('New Note Shortcut (Cmd/Ctrl + N)', () => {
    it('should trigger create new on Cmd+N when not typing', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('n', { metaKey: true })
      expect(mockCallbacks.onCreateNew).toHaveBeenCalledTimes(1)
    })

    it('should trigger create new on Ctrl+N when not typing', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('n', { ctrlKey: true })
      expect(mockCallbacks.onCreateNew).toHaveBeenCalledTimes(1)
    })

    it('should NOT trigger when typing in input field', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const inputElement = document.createElement('input')
      simulateKeyDown('n', { metaKey: true, target: inputElement })

      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
    })

    it('should NOT trigger when typing in textarea', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const textareaElement = document.createElement('textarea')
      simulateKeyDown('n', { metaKey: true, target: textareaElement })

      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
    })

    it('should prevent default behavior when not typing', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const event = simulateKeyDown('n', { metaKey: true })
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('Save Shortcut (Cmd/Ctrl + S)', () => {
    it('should trigger save when currentNote exists', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { metaKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })

    it('should NOT trigger save when currentNote is null', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { metaKey: true })
      expect(mockCallbacks.onSave).not.toHaveBeenCalled()
    })

    it('should work with Ctrl+S on Windows/Linux', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { ctrlKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })

    it('should prevent default behavior when note exists', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      const event = simulateKeyDown('s', { metaKey: true })
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('Export Shortcut (Cmd/Ctrl + E)', () => {
    it('should trigger export when currentNote exists', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('e', { metaKey: true })
      expect(mockCallbacks.onExport).toHaveBeenCalledTimes(1)
    })

    it('should NOT trigger export when currentNote is null', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('e', { metaKey: true })
      expect(mockCallbacks.onExport).not.toHaveBeenCalled()
    })

    it('should work with Ctrl+E on Windows/Linux', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('e', { ctrlKey: true })
      expect(mockCallbacks.onExport).toHaveBeenCalledTimes(1)
    })

    it('should prevent default behavior when note exists', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      const event = simulateKeyDown('e', { metaKey: true })
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('Settings Shortcut (Cmd/Ctrl + ,)', () => {
    it('should trigger settings on Cmd+,', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown(',', { metaKey: true })
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(1)
    })

    it('should trigger settings on Ctrl+,', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      simulateKeyDown(',', { ctrlKey: true })
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(1)
    })

    it('should work regardless of currentNote state', () => {
      const { rerender } = renderHook(
        ({ currentNote }) =>
          useKeyboardShortcuts({
            currentNote,
            ...mockCallbacks,
          }),
        { initialProps: { currentNote: null } }
      )

      // Test with no note
      simulateKeyDown(',', { metaKey: true })
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(1)

      // Test with note
      rerender({ currentNote: mockNote })
      simulateKeyDown(',', { metaKey: true })
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(2)
    })

    it('should prevent default behavior', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const event = simulateKeyDown(',', { metaKey: true })
      expect(event.defaultPrevented).toBe(true)
    })
  })

  describe('Typing Context Detection', () => {
    it('should detect typing in input elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const inputElement = document.createElement('input')
      simulateKeyDown('n', { metaKey: true, target: inputElement })

      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
    })

    it('should detect typing in textarea elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const textareaElement = document.createElement('textarea')
      simulateKeyDown('n', { metaKey: true, target: textareaElement })

      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
    })

    it('should be case insensitive for element tag names', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      // Create element with uppercase tag name
      const element = document.createElement('INPUT')
      simulateKeyDown('n', { metaKey: true, target: element })

      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
    })

    it('should NOT detect typing in other elements', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      const divElement = document.createElement('div')
      simulateKeyDown('n', { metaKey: true, target: divElement })

      expect(mockCallbacks.onCreateNew).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multiple Shortcuts and Conflicts', () => {
    it('should handle multiple shortcuts in sequence', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      // Test multiple shortcuts
      simulateKeyDown('k', { metaKey: true }) // Search
      simulateKeyDown('n', { metaKey: true }) // New note
      simulateKeyDown('s', { metaKey: true }) // Save
      simulateKeyDown('e', { metaKey: true }) // Export
      simulateKeyDown(',', { metaKey: true }) // Settings

      expect(mockCallbacks.onSearch).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onCreateNew).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onSave).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onExport).toHaveBeenCalledTimes(1)
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(1)
    })

    it('should ignore shortcuts without modifier keys', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      // Test keys without modifiers
      simulateKeyDown('k')
      simulateKeyDown('n')
      simulateKeyDown('s')
      simulateKeyDown('e')
      simulateKeyDown(',')

      expect(mockCallbacks.onSearch).not.toHaveBeenCalled()
      expect(mockCallbacks.onCreateNew).not.toHaveBeenCalled()
      expect(mockCallbacks.onSave).not.toHaveBeenCalled()
      expect(mockCallbacks.onExport).not.toHaveBeenCalled()
      expect(mockCallbacks.onSettings).not.toHaveBeenCalled()
    })

    it('should handle both Cmd and Ctrl modifiers', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      // Test with both modifiers (should still work)
      simulateKeyDown('k', { metaKey: true, ctrlKey: true })
      expect(mockCallbacks.onSearch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing target element', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          ...mockCallbacks,
        })
      )

      // Create event without target (null target)
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      })

      // Set target to null to simulate edge case
      Object.defineProperty(event, 'target', {
        value: null,
        writable: false,
      })

      expect(() => {
        window.dispatchEvent(event)
      }).not.toThrow()
    })

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })

      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: null,
          onCreateNew: errorCallback,
          onSave: mockCallbacks.onSave,
          onSearch: mockCallbacks.onSearch,
          onExport: mockCallbacks.onExport,
          onSettings: mockCallbacks.onSettings,
        })
      )

      // Should not throw error
      expect(() => {
        simulateKeyDown('n', { metaKey: true })
      }).not.toThrow()
    })

    it('should handle rapid key presses', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      // Rapid key presses
      for (let i = 0; i < 10; i++) {
        simulateKeyDown('s', { metaKey: true })
      }

      expect(mockCallbacks.onSave).toHaveBeenCalledTimes(10)
    })
  })

  describe('Cross-platform Compatibility', () => {
    it('should work on macOS with Cmd key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { metaKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })

    it('should work on Windows/Linux with Ctrl key', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { ctrlKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })

    it('should handle both modifier keys simultaneously', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          currentNote: mockNote,
          ...mockCallbacks,
        })
      )

      simulateKeyDown('s', { metaKey: true, ctrlKey: true })
      expect(mockCallbacks.onSave).toHaveBeenCalledWith(mockNote)
    })
  })
})
