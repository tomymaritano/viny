/**
 * Tests for useDebounce hook
 * High priority hook for performance optimization
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce, useDebouncedCallback } from '../useDebounce'

// Mock timers
vi.useFakeTimers()

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  describe('useDebounce value hook', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500))

      expect(result.current).toBe('initial')
    })

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      expect(result.current).toBe('initial')

      // Change value
      rerender({ value: 'updated', delay: 500 })

      // Value should still be initial before delay
      expect(result.current).toBe('initial')

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Now value should be updated
      expect(result.current).toBe('updated')
    })

    it('should reset timer on rapid value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      // Rapid changes
      rerender({ value: 'first', delay: 500 })

      act(() => {
        vi.advanceTimersByTime(250)
      })

      rerender({ value: 'second', delay: 500 })

      act(() => {
        vi.advanceTimersByTime(250)
      })

      // Should still be initial because timer was reset
      expect(result.current).toBe('initial')

      // Complete the delay
      act(() => {
        vi.advanceTimersByTime(250)
      })

      // Should now be the latest value
      expect(result.current).toBe('second')
    })

    it('should handle different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      rerender({ value: 'updated', delay: 100 })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(result.current).toBe('updated')
    })

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      )

      rerender({ value: 'updated', delay: 0 })

      act(() => {
        vi.runAllTimers()
      })

      expect(result.current).toBe('updated')
    })

    it('should handle different data types', () => {
      // Test with number
      const { result: numberResult, rerender: numberRerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 0, delay: 100 } }
      )

      numberRerender({ value: 42, delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(numberResult.current).toBe(42)

      // Test with object
      const initialObject = { id: 1, name: 'test' }
      const updatedObject = { id: 2, name: 'updated' }

      const { result: objectResult, rerender: objectRerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: initialObject, delay: 100 } }
      )

      objectRerender({ value: updatedObject, delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(objectResult.current).toEqual(updatedObject)
    })

    it('should handle array values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: ['a', 'b'], delay: 100 } }
      )

      rerender({ value: ['c', 'd'], delay: 100 })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current).toEqual(['c', 'd'])
    })

    it('should cleanup timer on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      rerender({ value: 'updated', delay: 500 })

      // Unmount before timer completes
      unmount()

      // Timer should be cleaned up, no errors should occur
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // This shouldn't throw an error
      expect(() => vi.runAllTimers()).not.toThrow()
    })
  })

  describe('useDebouncedCallback hook', () => {
    it('should debounce function calls', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      // Call the debounced function
      act(() => {
        result.current('test')
      })

      // Should not be called immediately
      expect(mockCallback).not.toHaveBeenCalled()

      // Advance time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Should be called now
      expect(mockCallback).toHaveBeenCalledWith('test')
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous calls on rapid invocations', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      // Rapid calls
      act(() => {
        result.current('first')
      })

      act(() => {
        vi.advanceTimersByTime(250)
      })

      act(() => {
        result.current('second')
      })

      act(() => {
        vi.advanceTimersByTime(250)
      })

      // Should not be called yet
      expect(mockCallback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(250)
      })

      // Should only be called with the latest argument
      expect(mockCallback).toHaveBeenCalledWith('second')
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple arguments', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      act(() => {
        result.current('arg1', 'arg2', 'arg3')
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('should handle no arguments', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      act(() => {
        result.current()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockCallback).toHaveBeenCalledWith()
    })

    it('should handle different delay values', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 100)
      )

      act(() => {
        result.current('test')
      })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(mockCallback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(mockCallback).toHaveBeenCalledWith('test')
    })

    it('should cleanup timer on unmount', () => {
      const mockCallback = vi.fn()
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      act(() => {
        result.current('test')
      })

      // Unmount before timer completes
      unmount()

      // Timer should be cleaned up
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Callback should not be called
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should handle callback function changes', () => {
      const mockCallback1 = vi.fn()
      const mockCallback2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ callback, delay }) => useDebouncedCallback(callback, delay),
        { initialProps: { callback: mockCallback1, delay: 500 } }
      )

      act(() => {
        result.current('test1')
      })

      // Change callback
      rerender({ callback: mockCallback2, delay: 500 })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Original callback should still be called
      expect(mockCallback1).toHaveBeenCalledWith('test1')
      expect(mockCallback2).not.toHaveBeenCalled()
    })

    it('should handle zero delay', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 0))

      act(() => {
        result.current('test')
      })

      act(() => {
        vi.runAllTimers()
      })

      expect(mockCallback).toHaveBeenCalledWith('test')
    })

    it('should preserve function context', () => {
      const mockCallback = vi.fn()
      const { result } = renderHook(() =>
        useDebouncedCallback(mockCallback, 500)
      )

      // Call multiple times with different contexts
      act(() => {
        result.current.call({ context: 'test' }, 'arg')
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockCallback).toHaveBeenCalledWith('arg')
    })
  })

  describe('Performance and edge cases', () => {
    it('should handle rapid value changes efficiently', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )

      // Simulate rapid typing
      const values = ['a', 'ab', 'abc', 'abcd', 'abcde']

      values.forEach(value => {
        rerender({ value, delay: 100 })
        act(() => {
          vi.advanceTimersByTime(50)
        })
      })

      // Should still be initial
      expect(result.current).toBe('initial')

      // Complete the delay
      act(() => {
        vi.advanceTimersByTime(50)
      })

      // Should be the final value
      expect(result.current).toBe('abcde')
    })

    it('should handle concurrent debounced callbacks', () => {
      const mockCallback1 = vi.fn()
      const mockCallback2 = vi.fn()

      const { result: result1 } = renderHook(() =>
        useDebouncedCallback(mockCallback1, 300)
      )
      const { result: result2 } = renderHook(() =>
        useDebouncedCallback(mockCallback2, 500)
      )

      act(() => {
        result1.current('test1')
        result2.current('test2')
      })

      // First callback should fire at 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(mockCallback1).toHaveBeenCalledWith('test1')
      expect(mockCallback2).not.toHaveBeenCalled()

      // Second callback should fire at 500ms
      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(mockCallback2).toHaveBeenCalledWith('test2')
    })

    it('should handle very long delays', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 10000 } }
      )

      rerender({ value: 'updated', delay: 10000 })

      act(() => {
        vi.advanceTimersByTime(9999)
      })

      expect(result.current).toBe('initial')

      act(() => {
        vi.advanceTimersByTime(1)
      })

      expect(result.current).toBe('updated')
    })
  })

  describe('TypeScript type safety', () => {
    it('should maintain type safety for different value types', () => {
      // String type
      const { result: stringResult } = renderHook(() =>
        useDebounce('test', 100)
      )
      expect(typeof stringResult.current).toBe('string')

      // Number type
      const { result: numberResult } = renderHook(() => useDebounce(42, 100))
      expect(typeof numberResult.current).toBe('number')

      // Object type
      const obj = { id: 1, name: 'test' }
      const { result: objectResult } = renderHook(() => useDebounce(obj, 100))
      expect(typeof objectResult.current).toBe('object')
    })

    it('should maintain type safety for callback functions', () => {
      const stringCallback = (str: string) => str.toUpperCase()
      const { result } = renderHook(() =>
        useDebouncedCallback(stringCallback, 100)
      )

      // TypeScript should enforce correct argument types
      expect(typeof result.current).toBe('function')
    })
  })
})
