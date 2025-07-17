/**
 * Tests for useToast hook
 * High priority hook for user feedback and notifications
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '../useToast'

// Mock timers
vi.useFakeTimers()

// Mock ToastAction type
const mockToastAction = {
  label: 'Action',
  onClick: vi.fn()
}

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('Hook Initialization', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast())
      
      expect(result.current.toasts).toEqual([])
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useToast())
      
      expect(result.current).toHaveProperty('toasts')
      expect(result.current).toHaveProperty('showToast')
      expect(result.current).toHaveProperty('dismissToast')
      expect(result.current).toHaveProperty('dismissAllToasts')
      expect(result.current).toHaveProperty('showSuccess')
      expect(result.current).toHaveProperty('showError')
      expect(result.current).toHaveProperty('showWarning')
      expect(result.current).toHaveProperty('showInfo')

      // Check all methods are functions
      expect(typeof result.current.showToast).toBe('function')
      expect(typeof result.current.dismissToast).toBe('function')
      expect(typeof result.current.dismissAllToasts).toBe('function')
      expect(typeof result.current.showSuccess).toBe('function')
      expect(typeof result.current.showError).toBe('function')
      expect(typeof result.current.showWarning).toBe('function')
      expect(typeof result.current.showInfo).toBe('function')
    })
  })

  describe('showToast function', () => {
    it('should add toast to the array', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Test message'
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        message: 'Test message'
      })
    })

    it('should generate unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast())
      
      let id1: string
      let id2: string
      
      act(() => {
        id1 = result.current.showToast({
          type: 'success',
          message: 'First message'
        })
      })
      
      act(() => {
        id2 = result.current.showToast({
          type: 'info',
          message: 'Second message'
        })
      })

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(result.current.toasts[0].id).toBe(id1)
      expect(result.current.toasts[1].id).toBe(id2)
    })

    it('should set default duration based on type', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Success message'
        })
      })
      
      act(() => {
        result.current.showToast({
          type: 'error',
          message: 'Error message'
        })
      })
      
      act(() => {
        result.current.showToast({
          type: 'warning',
          message: 'Warning message'
        })
      })
      
      act(() => {
        result.current.showToast({
          type: 'info',
          message: 'Info message'
        })
      })

      expect(result.current.toasts[0].duration).toBe(3000) // success
      expect(result.current.toasts[1].duration).toBe(6000) // error
      expect(result.current.toasts[2].duration).toBe(5000) // warning
      expect(result.current.toasts[3].duration).toBe(4000) // info
    })

    it('should use custom duration when provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Custom duration',
          duration: 10000
        })
      })

      expect(result.current.toasts[0].duration).toBe(10000)
    })

    it('should set dismissible to true by default', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Test message'
        })
      })

      expect(result.current.toasts[0].dismissible).toBe(true)
    })

    it('should use custom dismissible value when provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Non-dismissible toast',
          dismissible: false
        })
      })

      expect(result.current.toasts[0].dismissible).toBe(false)
    })

    it('should include details when provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'error',
          message: 'Error occurred',
          details: 'Detailed error information'
        })
      })

      expect(result.current.toasts[0].details).toBe('Detailed error information')
    })

    it('should include actions when provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'info',
          message: 'Action required',
          actions: [mockToastAction]
        })
      })

      expect(result.current.toasts[0].actions).toEqual([mockToastAction])
    })

    it('should auto-dismiss toast after duration', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Auto-dismiss test',
          duration: 1000
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should not auto-dismiss when duration is 0', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Persistent toast',
          duration: 0
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should still be there
      expect(result.current.toasts).toHaveLength(1)
    })

    it('should not auto-dismiss when duration is negative', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Persistent toast',
          duration: -1
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should still be there
      expect(result.current.toasts).toHaveLength(1)
    })
  })

  describe('dismissToast function', () => {
    it('should remove toast by ID', () => {
      const { result } = renderHook(() => useToast())
      
      let toastId: string
      
      act(() => {
        toastId = result.current.showToast({
          type: 'success',
          message: 'Test message'
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        result.current.dismissToast(toastId)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should only remove the specified toast', () => {
      const { result } = renderHook(() => useToast())
      
      let toastId1: string
      let toastId2: string
      
      act(() => {
        toastId1 = result.current.showToast({
          type: 'success',
          message: 'First message'
        })
        toastId2 = result.current.showToast({
          type: 'info',
          message: 'Second message'
        })
      })

      expect(result.current.toasts).toHaveLength(2)

      act(() => {
        result.current.dismissToast(toastId1)
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].id).toBe(toastId2)
    })

    it('should handle dismissing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Test message'
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Try to dismiss non-existent toast
      act(() => {
        result.current.dismissToast('non-existent-id')
      })

      // Should still have the original toast
      expect(result.current.toasts).toHaveLength(1)
    })
  })

  describe('dismissAllToasts function', () => {
    it('should remove all toasts', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'First message'
        })
        result.current.showToast({
          type: 'info',
          message: 'Second message'
        })
        result.current.showToast({
          type: 'warning',
          message: 'Third message'
        })
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.dismissAllToasts()
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should handle empty toasts array', () => {
      const { result } = renderHook(() => useToast())
      
      expect(result.current.toasts).toHaveLength(0)

      act(() => {
        result.current.dismissAllToasts()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('Convenience methods', () => {
    describe('showSuccess', () => {
      it('should create success toast', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showSuccess('Success message')
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]).toMatchObject({
          type: 'success',
          message: 'Success message'
        })
      })

      it('should accept additional options', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showSuccess('Success message', {
            duration: 5000,
            details: 'Success details'
          })
        })

        expect(result.current.toasts[0]).toMatchObject({
          type: 'success',
          message: 'Success message',
          duration: 5000,
          details: 'Success details'
        })
      })
    })

    describe('showError', () => {
      it('should create error toast', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showError('Error message')
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]).toMatchObject({
          type: 'error',
          message: 'Error message'
        })
      })

      it('should accept additional options', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showError('Error message', {
            dismissible: false,
            actions: [mockToastAction]
          })
        })

        expect(result.current.toasts[0]).toMatchObject({
          type: 'error',
          message: 'Error message',
          dismissible: false,
          actions: [mockToastAction]
        })
      })
    })

    describe('showWarning', () => {
      it('should create warning toast', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showWarning('Warning message')
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]).toMatchObject({
          type: 'warning',
          message: 'Warning message'
        })
      })

      it('should accept additional options', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showWarning('Warning message', {
            duration: 8000
          })
        })

        expect(result.current.toasts[0]).toMatchObject({
          type: 'warning',
          message: 'Warning message',
          duration: 8000
        })
      })
    })

    describe('showInfo', () => {
      it('should create info toast', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showInfo('Info message')
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]).toMatchObject({
          type: 'info',
          message: 'Info message'
        })
      })

      it('should accept additional options', () => {
        const { result } = renderHook(() => useToast())
        
        act(() => {
          result.current.showInfo('Info message', {
            details: 'Additional info'
          })
        })

        expect(result.current.toasts[0]).toMatchObject({
          type: 'info',
          message: 'Info message',
          details: 'Additional info'
        })
      })
    })
  })

  describe('Multiple toasts management', () => {
    it('should handle multiple toasts correctly', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showSuccess('Success 1')
        result.current.showError('Error 1')
        result.current.showWarning('Warning 1')
        result.current.showInfo('Info 1')
      })

      expect(result.current.toasts).toHaveLength(4)
      
      // Check order (should be in order of creation)
      expect(result.current.toasts[0].message).toBe('Success 1')
      expect(result.current.toasts[1].message).toBe('Error 1')
      expect(result.current.toasts[2].message).toBe('Warning 1')
      expect(result.current.toasts[3].message).toBe('Info 1')
    })

    it('should handle auto-dismiss of multiple toasts', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Quick toast',
          duration: 1000
        })
        result.current.showToast({
          type: 'info',
          message: 'Slow toast',
          duration: 3000
        })
      })

      expect(result.current.toasts).toHaveLength(2)

      // Fast forward 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // First toast should be dismissed
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].message).toBe('Slow toast')

      // Fast forward 2 more seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Second toast should be dismissed
      expect(result.current.toasts).toHaveLength(0)
    })

    it('should handle mixed persistent and auto-dismiss toasts', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Persistent toast',
          duration: 0
        })
        result.current.showToast({
          type: 'info',
          message: 'Auto-dismiss toast',
          duration: 1000
        })
      })

      expect(result.current.toasts).toHaveLength(2)

      // Fast forward 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Only auto-dismiss toast should be gone
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].message).toBe('Persistent toast')
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle very long messages', () => {
      const { result } = renderHook(() => useToast())
      
      const longMessage = 'A'.repeat(1000)
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: longMessage
        })
      })

      expect(result.current.toasts[0].message).toBe(longMessage)
    })

    it('should handle empty message', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: ''
        })
      })

      expect(result.current.toasts[0].message).toBe('')
    })

    it('should handle very large duration values', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Large duration',
          duration: Number.MAX_SAFE_INTEGER
        })
      })

      expect(result.current.toasts[0].duration).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle rapid successive calls', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.showToast({
            type: 'success',
            message: `Toast ${i}`
          })
        }
      })

      expect(result.current.toasts).toHaveLength(100)
      
      // All IDs should be unique
      const ids = result.current.toasts.map(toast => toast.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(100)
    })
  })

  describe('Performance considerations', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useToast())
      
      const initialMethods = {
        showToast: result.current.showToast,
        dismissToast: result.current.dismissToast,
        dismissAllToasts: result.current.dismissAllToasts,
        showSuccess: result.current.showSuccess,
        showError: result.current.showError,
        showWarning: result.current.showWarning,
        showInfo: result.current.showInfo
      }

      // Rerender should not change method references
      rerender()

      expect(result.current.showToast).toBe(initialMethods.showToast)
      expect(result.current.dismissToast).toBe(initialMethods.dismissToast)
      expect(result.current.dismissAllToasts).toBe(initialMethods.dismissAllToasts)
      expect(result.current.showSuccess).toBe(initialMethods.showSuccess)
      expect(result.current.showError).toBe(initialMethods.showError)
      expect(result.current.showWarning).toBe(initialMethods.showWarning)
      expect(result.current.showInfo).toBe(initialMethods.showInfo)
    })
  })

  describe('Integration scenarios', () => {
    it('should work well with typical user interaction flow', () => {
      const { result } = renderHook(() => useToast())
      
      // User performs action, gets success toast
      act(() => {
        result.current.showSuccess('File saved successfully')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].type).toBe('success')

      // User makes an error, gets error toast
      act(() => {
        result.current.showError('Failed to delete file', {
          details: 'File is currently in use'
        })
      })

      expect(result.current.toasts).toHaveLength(2)
      expect(result.current.toasts[1].type).toBe('error')

      // User manually dismisses error toast
      act(() => {
        result.current.dismissToast(result.current.toasts[1].id)
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].type).toBe('success')

      // Success toast auto-dismisses
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })
})