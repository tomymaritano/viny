/**
 * Tests for useSettingsErrorHandler hook
 * Medium priority hook for handling settings-related errors
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsErrorHandler } from '../useSettingsErrorHandler'

// Mock addToast function
const mockAddToast = vi.fn()

// Mock app store
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    addToast: mockAddToast
  }))
}))

// Mock console.error to avoid test output noise
const originalConsoleError = console.error

describe('useSettingsErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    console.error = originalConsoleError
  })

  describe('Hook initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      expect(result.current.errors).toEqual({})
      expect(result.current.isRecovering).toBe(false)
      expect(result.current.hasErrors).toBe(false)
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      expect(typeof result.current.clearError).toBe('function')
      expect(typeof result.current.clearAllErrors).toBe('function')
      expect(typeof result.current.handleSettingsError).toBe('function')
      expect(typeof result.current.handleRecoveryAction).toBe('function')
      expect(typeof result.current.validateAndHandle).toBe('function')
    })
  })

  describe('Error handling', () => {
    it('should handle error with Error object', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const error = new Error('Test error message')
      
      act(() => {
        result.current.handleSettingsError('testKey', error, 'validation')
      })
      
      expect(result.current.errors.testKey).toEqual({
        key: 'testKey',
        message: 'Test error message',
        type: 'validation',
        timestamp: expect.any(Number)
      })
      expect(result.current.hasErrors).toBe(true)
    })

    it('should handle error with string message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', 'String error message', 'save')
      })
      
      expect(result.current.errors.testKey).toEqual({
        key: 'testKey',
        message: 'String error message',
        type: 'save',
        timestamp: expect.any(Number)
      })
    })

    it('should use default type when not specified', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', 'Error message')
      })
      
      expect(result.current.errors.testKey.type).toBe('unknown')
    })

    it('should show toast when requested', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', 'Error message', 'validation', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith({
        id: expect.stringContaining('settings-error-testKey-'),
        type: 'error',
        message: 'Invalid Test Key: Error message',
        duration: 5000
      })
    })

    it('should not show toast by default', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', 'Error message', 'validation')
      })
      
      expect(mockAddToast).not.toHaveBeenCalled()
    })

    it('should log error to console', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const error = new Error('Test error')
      
      act(() => {
        result.current.handleSettingsError('testKey', error, 'save')
      })
      
      expect(console.error).toHaveBeenCalledWith('Settings error for testKey:', error)
    })

    it('should overwrite existing error for same key', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', 'First error', 'validation')
      })
      
      act(() => {
        result.current.handleSettingsError('testKey', 'Second error', 'save')
      })
      
      expect(result.current.errors.testKey.message).toBe('Second error')
      expect(result.current.errors.testKey.type).toBe('save')
      expect(Object.keys(result.current.errors)).toHaveLength(1)
    })

    it('should handle multiple errors for different keys', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('key1', 'Error 1', 'validation')
        result.current.handleSettingsError('key2', 'Error 2', 'save')
        result.current.handleSettingsError('key3', 'Error 3', 'load')
      })
      
      expect(Object.keys(result.current.errors)).toHaveLength(3)
      expect(result.current.errors.key1.message).toBe('Error 1')
      expect(result.current.errors.key2.message).toBe('Error 2')
      expect(result.current.errors.key3.message).toBe('Error 3')
    })
  })

  describe('Error clearing', () => {
    it('should clear specific error', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('key1', 'Error 1', 'validation')
        result.current.handleSettingsError('key2', 'Error 2', 'save')
      })
      
      expect(Object.keys(result.current.errors)).toHaveLength(2)
      
      act(() => {
        result.current.clearError('key1')
      })
      
      expect(result.current.errors.key1).toBeUndefined()
      expect(result.current.errors.key2).toBeDefined()
      expect(Object.keys(result.current.errors)).toHaveLength(1)
    })

    it('should clear all errors', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('key1', 'Error 1', 'validation')
        result.current.handleSettingsError('key2', 'Error 2', 'save')
        result.current.handleSettingsError('key3', 'Error 3', 'load')
      })
      
      expect(Object.keys(result.current.errors)).toHaveLength(3)
      
      act(() => {
        result.current.clearAllErrors()
      })
      
      expect(result.current.errors).toEqual({})
      expect(result.current.hasErrors).toBe(false)
    })

    it('should handle clearing non-existent error', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('key1', 'Error 1', 'validation')
      })
      
      act(() => {
        result.current.clearError('nonExistentKey')
      })
      
      expect(result.current.errors.key1).toBeDefined()
    })
  })

  describe('Recovery actions', () => {
    it('should handle successful recovery', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockRecoveryFn = vi.fn().mockResolvedValue(undefined)
      
      act(() => {
        result.current.handleSettingsError('key1', 'Error 1', 'validation')
        result.current.handleSettingsError('key2', 'Error 2', 'save')
      })
      
      expect(result.current.hasErrors).toBe(true)
      
      await act(async () => {
        await result.current.handleRecoveryAction(mockRecoveryFn, 'Recovery successful')
      })
      
      expect(mockRecoveryFn).toHaveBeenCalled()
      expect(result.current.errors).toEqual({})
      expect(result.current.hasErrors).toBe(false)
      expect(mockAddToast).toHaveBeenCalledWith({
        id: expect.stringContaining('settings-recovery-'),
        type: 'success',
        message: 'Recovery successful',
        duration: 3000
      })
    })

    it('should handle recovery without success message', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockRecoveryFn = vi.fn().mockResolvedValue(undefined)
      
      await act(async () => {
        await result.current.handleRecoveryAction(mockRecoveryFn)
      })
      
      expect(mockRecoveryFn).toHaveBeenCalled()
      expect(mockAddToast).not.toHaveBeenCalled()
    })

    it('should handle failed recovery', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const recoveryError = new Error('Recovery failed')
      const mockRecoveryFn = vi.fn().mockRejectedValue(recoveryError)
      
      await act(async () => {
        await result.current.handleRecoveryAction(mockRecoveryFn, 'Recovery successful')
      })
      
      expect(mockRecoveryFn).toHaveBeenCalled()
      expect(mockAddToast).toHaveBeenCalledWith({
        id: expect.stringContaining('settings-recovery-failed-'),
        type: 'error',
        message: 'Recovery failed: Recovery failed',
        duration: 5000
      })
    })

    it('should handle failed recovery with non-Error object', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockRecoveryFn = vi.fn().mockRejectedValue('String error')
      
      await act(async () => {
        await result.current.handleRecoveryAction(mockRecoveryFn)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith({
        id: expect.stringContaining('settings-recovery-failed-'),
        type: 'error',
        message: 'Recovery failed: Recovery failed',
        duration: 5000
      })
    })

    it('should set isRecovering during recovery', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      let resolveRecovery: () => void
      const recoveryPromise = new Promise<void>((resolve) => {
        resolveRecovery = resolve
      })
      const mockRecoveryFn = vi.fn().mockReturnValue(recoveryPromise)
      
      expect(result.current.isRecovering).toBe(false)
      
      // Start recovery without awaiting
      act(() => {
        result.current.handleRecoveryAction(mockRecoveryFn)
      })
      
      // Check isRecovering is true during recovery
      expect(result.current.isRecovering).toBe(true)
      
      // Resolve the recovery
      await act(async () => {
        resolveRecovery!()
        await recoveryPromise
      })
      
      expect(result.current.isRecovering).toBe(false)
    })
  })

  describe('Validate and handle', () => {
    it('should handle successful validation and action', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockValidationFn = vi.fn().mockResolvedValue(true)
      const mockActionFn = vi.fn().mockResolvedValue(undefined)
      
      let success
      await act(async () => {
        success = await result.current.validateAndHandle(
          'testKey',
          'testValue',
          mockValidationFn,
          mockActionFn
        )
      })
      
      expect(mockValidationFn).toHaveBeenCalledWith('testValue')
      expect(mockActionFn).toHaveBeenCalledWith('testValue')
      expect(success).toBe(true)
      expect(result.current.errors.testKey).toBeUndefined()
    })

    it('should handle validation failure', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockValidationFn = vi.fn().mockResolvedValue(false)
      const mockActionFn = vi.fn()
      
      let success
      await act(async () => {
        success = await result.current.validateAndHandle(
          'testKey',
          'testValue',
          mockValidationFn,
          mockActionFn
        )
      })
      
      expect(mockValidationFn).toHaveBeenCalledWith('testValue')
      expect(mockActionFn).not.toHaveBeenCalled()
      expect(success).toBe(false)
      expect(result.current.errors.testKey).toEqual({
        key: 'testKey',
        message: 'Invalid value provided',
        type: 'validation',
        timestamp: expect.any(Number)
      })
    })

    it('should handle synchronous validation function', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockValidationFn = vi.fn().mockReturnValue(true)
      const mockActionFn = vi.fn()
      
      let success
      await act(async () => {
        success = await result.current.validateAndHandle(
          'testKey',
          'testValue',
          mockValidationFn,
          mockActionFn
        )
      })
      
      expect(mockValidationFn).toHaveBeenCalledWith('testValue')
      expect(mockActionFn).toHaveBeenCalledWith('testValue')
      expect(success).toBe(true)
    })

    it('should handle action failure', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockValidationFn = vi.fn().mockResolvedValue(true)
      const actionError = new Error('Action failed')
      const mockActionFn = vi.fn().mockRejectedValue(actionError)
      
      let success
      await act(async () => {
        success = await result.current.validateAndHandle(
          'testKey',
          'testValue',
          mockValidationFn,
          mockActionFn
        )
      })
      
      expect(mockValidationFn).toHaveBeenCalledWith('testValue')
      expect(mockActionFn).toHaveBeenCalledWith('testValue')
      expect(success).toBe(false)
      expect(result.current.errors.testKey).toEqual({
        key: 'testKey',
        message: 'Action failed',
        type: 'save',
        timestamp: expect.any(Number)
      })
    })

    it('should clear previous error before validation', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      // Add an initial error
      act(() => {
        result.current.handleSettingsError('testKey', 'Previous error', 'validation')
      })
      
      expect(result.current.errors.testKey).toBeDefined()
      
      const mockValidationFn = vi.fn().mockResolvedValue(true)
      const mockActionFn = vi.fn().mockResolvedValue(undefined)
      
      await act(async () => {
        await result.current.validateAndHandle(
          'testKey',
          'testValue',
          mockValidationFn,
          mockActionFn
        )
      })
      
      expect(result.current.errors.testKey).toBeUndefined()
    })
  })

  describe('Toast message formatting', () => {
    it('should format validation error toast message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('fontSize', 'Must be a number', 'validation', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid Font Size: Must be a number'
        })
      )
    })

    it('should format save error toast message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('editorTheme', 'Network error', 'save', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to save Editor Theme: Network error'
        })
      )
    })

    it('should format load error toast message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('userPreferences', 'File not found', 'load', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to load User Preferences: File not found'
        })
      )
    })

    it('should format unknown error toast message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('someKey', 'Unknown error', 'unknown', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Settings error for Some Key: Unknown error'
        })
      )
    })

    it('should format complex camelCase keys', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('myVeryLongSettingKey', 'Error', 'validation', true)
      })
      
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid My Very Long Setting Key: Error'
        })
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle empty error message', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        result.current.handleSettingsError('testKey', '', 'validation')
      })
      
      expect(result.current.errors.testKey.message).toBe('')
    })

    it('should handle very long error messages', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const longMessage = 'A'.repeat(1000)
      
      act(() => {
        result.current.handleSettingsError('testKey', longMessage, 'validation')
      })
      
      expect(result.current.errors.testKey.message).toBe(longMessage)
    })

    it('should handle rapid error additions', () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.handleSettingsError(`key${i}`, `Error ${i}`, 'validation')
        }
      })
      
      expect(Object.keys(result.current.errors)).toHaveLength(100)
    })

    it('should handle concurrent recovery actions', async () => {
      const { result } = renderHook(() => useSettingsErrorHandler())
      const mockRecoveryFn1 = vi.fn().mockResolvedValue(undefined)
      const mockRecoveryFn2 = vi.fn().mockResolvedValue(undefined)
      
      await act(async () => {
        await Promise.all([
          result.current.handleRecoveryAction(mockRecoveryFn1, 'Recovery 1'),
          result.current.handleRecoveryAction(mockRecoveryFn2, 'Recovery 2')
        ])
      })
      
      expect(mockRecoveryFn1).toHaveBeenCalled()
      expect(mockRecoveryFn2).toHaveBeenCalled()
      expect(mockAddToast).toHaveBeenCalledTimes(2)
    })
  })

  describe('Method stability', () => {
    it('should provide stable method references', () => {
      const { result, rerender } = renderHook(() => useSettingsErrorHandler())
      
      const initialMethods = {
        clearError: result.current.clearError,
        clearAllErrors: result.current.clearAllErrors,
        handleSettingsError: result.current.handleSettingsError,
        handleRecoveryAction: result.current.handleRecoveryAction,
        validateAndHandle: result.current.validateAndHandle
      }
      
      rerender()
      
      expect(result.current.clearError).toBe(initialMethods.clearError)
      expect(result.current.clearAllErrors).toBe(initialMethods.clearAllErrors)
      expect(result.current.handleSettingsError).toBe(initialMethods.handleSettingsError)
      expect(result.current.handleRecoveryAction).toBe(initialMethods.handleRecoveryAction)
      expect(result.current.validateAndHandle).toBe(initialMethods.validateAndHandle)
    })
  })
})