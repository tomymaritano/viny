/**
 * Tests for useDropdown hook
 * Low priority hook for dropdown component management
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDropdown } from '../useDropdown'

// Helper to create keyboard event
const createKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}) => {
  const preventDefault = vi.fn()
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options
  })
  event.preventDefault = preventDefault
  return event
}

// Helper to create mouse event
const createMouseEvent = (type: string, target?: Element) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true
  })
  if (target) {
    Object.defineProperty(event, 'target', {
      value: target,
      writable: false
    })
  }
  return event
}

describe('useDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clean up any added event listeners
    document.removeEventListener('mousedown', vi.fn(), true)
  })

  describe('Hook initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDropdown())
      
      expect(result.current.isOpen).toBe(false)
      expect(result.current.focusedIndex).toBe(-1)
      expect(result.current.dropdownRef.current).toBe(null)
      expect(result.current.triggerRef.current).toBe(null)
      
      expect(typeof result.current.open).toBe('function')
      expect(typeof result.current.close).toBe('function')
      expect(typeof result.current.toggle).toBe('function')
      expect(typeof result.current.handleKeyDown).toBe('function')
      expect(typeof result.current.setFocusedIndex).toBe('function')
    })

    it('should initialize with custom initial state', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      expect(result.current.isOpen).toBe(true)
    })

    it('should initialize with custom options', () => {
      const options = {
        closeOnEscape: false,
        closeOnClickOutside: false,
        containerSelector: '.custom-container'
      }
      
      const { result } = renderHook(() => useDropdown(false, options))
      
      // Options don't affect initial state, but they're used in event handlers
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('Basic state management', () => {
    it('should open dropdown', () => {
      const { result } = renderHook(() => useDropdown())
      
      act(() => {
        result.current.open()
      })
      
      expect(result.current.isOpen).toBe(true)
      expect(result.current.focusedIndex).toBe(-1)
    })

    it('should close dropdown and return focus', () => {
      const mockFocus = vi.fn()
      const { result } = renderHook(() => useDropdown(true))
      
      // Set up trigger ref
      const triggerElement = document.createElement('button')
      triggerElement.focus = mockFocus
      act(() => {
        result.current.triggerRef.current = triggerElement
      })
      
      act(() => {
        result.current.close()
      })
      
      expect(result.current.isOpen).toBe(false)
      expect(result.current.focusedIndex).toBe(-1)
      expect(mockFocus).toHaveBeenCalled()
    })

    it('should toggle dropdown state', () => {
      const { result } = renderHook(() => useDropdown())
      
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isOpen).toBe(true)
      
      act(() => {
        result.current.toggle()
      })
      expect(result.current.isOpen).toBe(false)
    })

    it('should handle close without trigger ref', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      act(() => {
        result.current.close()
      })
      
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('Keyboard navigation', () => {
    it('should close on Escape key', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('Escape')
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      
      expect(result.current.isOpen).toBe(false)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not close on Escape if closeOnEscape is false', () => {
      const { result } = renderHook(() => useDropdown(true, { closeOnEscape: false }))
      
      const event = createKeyboardEvent('Escape')
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      
      expect(result.current.isOpen).toBe(true)
    })

    it('should navigate down with ArrowDown', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('ArrowDown')
      
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      expect(result.current.focusedIndex).toBe(0)
      
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      expect(result.current.focusedIndex).toBe(1)
      
      // Wrap around at the end
      act(() => {
        result.current.setFocusedIndex(4)
      })
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      expect(result.current.focusedIndex).toBe(0)
    })

    it('should navigate up with ArrowUp', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('ArrowUp')
      
      // Start at 2
      act(() => {
        result.current.setFocusedIndex(2)
      })
      
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      expect(result.current.focusedIndex).toBe(1)
      
      // Wrap around at the beginning
      act(() => {
        result.current.setFocusedIndex(0)
      })
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      expect(result.current.focusedIndex).toBe(4)
    })

    it('should handle Enter key when item is focused', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      act(() => {
        result.current.setFocusedIndex(2)
      })
      
      const event = createKeyboardEvent('Enter')
      let returnValue: number | void
      
      act(() => {
        returnValue = result.current.handleKeyDown(event, 5)
      })
      
      expect(returnValue).toBe(2)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle Space key when item is focused', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      act(() => {
        result.current.setFocusedIndex(1)
      })
      
      const event = createKeyboardEvent(' ')
      let returnValue: number | void
      
      act(() => {
        returnValue = result.current.handleKeyDown(event, 5)
      })
      
      expect(returnValue).toBe(1)
    })

    it('should not return value when no item is focused', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('Enter')
      let returnValue: number | void
      
      act(() => {
        returnValue = result.current.handleKeyDown(event, 5)
      })
      
      expect(returnValue).toBeUndefined()
    })

    it('should go to first item with Home key', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      act(() => {
        result.current.setFocusedIndex(3)
      })
      
      const event = createKeyboardEvent('Home')
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      
      expect(result.current.focusedIndex).toBe(0)
    })

    it('should go to last item with End key', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('End')
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      
      expect(result.current.focusedIndex).toBe(4)
    })

    it('should do nothing when dropdown is closed', () => {
      const { result } = renderHook(() => useDropdown(false))
      
      const event = createKeyboardEvent('ArrowDown')
      act(() => {
        result.current.handleKeyDown(event, 5)
      })
      
      expect(result.current.focusedIndex).toBe(-1)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('should handle empty options list', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('ArrowDown')
      act(() => {
        result.current.handleKeyDown(event, 0)
      })
      
      expect(result.current.focusedIndex).toBe(0)
    })
  })

  describe('Click outside handling', () => {
    it('should close when clicking outside', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      // Set up dropdown ref
      const dropdownElement = document.createElement('div')
      act(() => {
        result.current.dropdownRef.current = dropdownElement
      })
      
      // Click outside
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', outsideElement))
      })
      
      expect(result.current.isOpen).toBe(false)
      
      // Cleanup
      document.body.removeChild(outsideElement)
    })

    it('should not close when clicking inside dropdown', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      // Set up dropdown ref
      const dropdownElement = document.createElement('div')
      const insideElement = document.createElement('button')
      dropdownElement.appendChild(insideElement)
      
      act(() => {
        result.current.dropdownRef.current = dropdownElement
      })
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', insideElement))
      })
      
      expect(result.current.isOpen).toBe(true)
    })

    it('should not close when clicking inside container', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      // Set up container
      const container = document.createElement('div')
      container.className = 'dropdown-container'
      const insideContainer = document.createElement('button')
      container.appendChild(insideContainer)
      document.body.appendChild(container)
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', insideContainer))
      })
      
      expect(result.current.isOpen).toBe(true)
      
      // Cleanup
      document.body.removeChild(container)
    })

    it('should not close when closeOnClickOutside is false', () => {
      const { result } = renderHook(() => useDropdown(true, { closeOnClickOutside: false }))
      
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', outsideElement))
      })
      
      expect(result.current.isOpen).toBe(true)
      
      // Cleanup
      document.body.removeChild(outsideElement)
    })

    it('should use custom container selector', () => {
      const { result } = renderHook(() => 
        useDropdown(true, { containerSelector: '.custom-dropdown' })
      )
      
      // Set up custom container
      const container = document.createElement('div')
      container.className = 'custom-dropdown'
      const insideContainer = document.createElement('button')
      container.appendChild(insideContainer)
      document.body.appendChild(container)
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', insideContainer))
      })
      
      expect(result.current.isOpen).toBe(true)
      
      // Cleanup
      document.body.removeChild(container)
    })
  })

  describe('Focus management', () => {
    it('should focus element at focused index', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      // Set up dropdown with focusable elements
      const dropdownElement = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      const button3 = document.createElement('button')
      
      button1.focus = vi.fn()
      button2.focus = vi.fn()
      button3.focus = vi.fn()
      
      dropdownElement.appendChild(button1)
      dropdownElement.appendChild(button2)
      dropdownElement.appendChild(button3)
      
      act(() => {
        result.current.dropdownRef.current = dropdownElement
      })
      
      // Focus second button
      act(() => {
        result.current.setFocusedIndex(1)
      })
      
      expect(button2.focus).toHaveBeenCalled()
    })

    it('should handle elements with tabindex', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const dropdownElement = document.createElement('div')
      const div1 = document.createElement('div')
      div1.setAttribute('tabindex', '0')
      div1.focus = vi.fn()
      
      const div2 = document.createElement('div')
      div2.setAttribute('tabindex', '-1') // Should be ignored
      div2.focus = vi.fn()
      
      dropdownElement.appendChild(div1)
      dropdownElement.appendChild(div2)
      
      act(() => {
        result.current.dropdownRef.current = dropdownElement
      })
      
      act(() => {
        result.current.setFocusedIndex(0)
      })
      
      expect(div1.focus).toHaveBeenCalled()
      expect(div2.focus).not.toHaveBeenCalled()
    })

    it('should handle no focusable elements', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const dropdownElement = document.createElement('div')
      const span = document.createElement('span') // Not focusable
      dropdownElement.appendChild(span)
      
      act(() => {
        result.current.dropdownRef.current = dropdownElement
      })
      
      // Should not throw
      act(() => {
        result.current.setFocusedIndex(0)
      })
      
      expect(result.current.focusedIndex).toBe(0)
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useDropdown())
      
      const initialMethods = {
        open: result.current.open,
        close: result.current.close,
        toggle: result.current.toggle,
        handleKeyDown: result.current.handleKeyDown
      }
      
      rerender()
      
      expect(result.current.open).toBe(initialMethods.open)
      expect(result.current.close).toBe(initialMethods.close)
      expect(result.current.toggle).toBe(initialMethods.toggle)
      expect(result.current.handleKeyDown).toBe(initialMethods.handleKeyDown)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete dropdown workflow', () => {
      const { result } = renderHook(() => useDropdown())
      
      // Set up refs
      const triggerElement = document.createElement('button')
      const dropdownElement = document.createElement('div')
      const option1 = document.createElement('button')
      const option2 = document.createElement('button')
      const option3 = document.createElement('button')
      
      option1.focus = vi.fn()
      option2.focus = vi.fn()
      option3.focus = vi.fn()
      triggerElement.focus = vi.fn()
      
      dropdownElement.appendChild(option1)
      dropdownElement.appendChild(option2)
      dropdownElement.appendChild(option3)
      
      act(() => {
        result.current.triggerRef.current = triggerElement
        result.current.dropdownRef.current = dropdownElement
      })
      
      // Open dropdown
      act(() => {
        result.current.open()
      })
      expect(result.current.isOpen).toBe(true)
      
      // Navigate with keyboard
      const arrowDown = createKeyboardEvent('ArrowDown')
      act(() => {
        result.current.handleKeyDown(arrowDown, 3)
      })
      expect(result.current.focusedIndex).toBe(0)
      expect(option1.focus).toHaveBeenCalled()
      
      // Select with Enter
      const enter = createKeyboardEvent('Enter')
      let selectedIndex: number | void
      act(() => {
        selectedIndex = result.current.handleKeyDown(enter, 3)
      })
      expect(selectedIndex).toBe(0)
      
      // Close with Escape
      const escape = createKeyboardEvent('Escape')
      act(() => {
        result.current.handleKeyDown(escape, 3)
      })
      expect(result.current.isOpen).toBe(false)
      expect(triggerElement.focus).toHaveBeenCalled()
    })

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useDropdown())
      
      act(() => {
        result.current.open()
        result.current.close()
        result.current.toggle()
        result.current.toggle()
        result.current.open()
      })
      
      expect(result.current.isOpen).toBe(true)
      expect(result.current.focusedIndex).toBe(-1)
    })
  })

  describe('Edge cases', () => {
    it('should handle keyboard events with missing preventDefault', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = new KeyboardEvent('ArrowDown', { key: 'ArrowDown' })
      
      act(() => {
        result.current.handleKeyDown(event, 3)
      })
      
      expect(result.current.focusedIndex).toBe(0)
    })

    it('should handle focus management with null dropdown ref', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      // Should not throw
      act(() => {
        result.current.setFocusedIndex(0)
      })
      
      expect(result.current.focusedIndex).toBe(0)
    })

    it('should handle multiple event listeners', () => {
      const { result: result1 } = renderHook(() => useDropdown(true))
      const { result: result2 } = renderHook(() => useDropdown(true))
      
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      act(() => {
        document.dispatchEvent(createMouseEvent('mousedown', outsideElement))
      })
      
      expect(result1.current.isOpen).toBe(false)
      expect(result2.current.isOpen).toBe(false)
      
      // Cleanup
      document.body.removeChild(outsideElement)
    })

    it('should handle unhandled keys', () => {
      const { result } = renderHook(() => useDropdown(true))
      
      const event = createKeyboardEvent('Tab')
      const initialIndex = result.current.focusedIndex
      
      act(() => {
        result.current.handleKeyDown(event, 3)
      })
      
      expect(result.current.focusedIndex).toBe(initialIndex)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })
})