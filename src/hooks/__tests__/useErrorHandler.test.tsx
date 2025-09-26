/**
 * Tests for useErrorHandler hook
 * Critical system for error handling and toast notifications
 */

import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Create mock functions that will be accessible throughout the test
const mockSubscribe = vi.fn()
const mockHandleError = vi.fn()
const mockGetErrorHistory = vi.fn()
const mockGetErrorsBy = vi.fn()
const mockClearErrorHistory = vi.fn()
const mockHandleNetworkError = vi.fn()
const mockHandleValidationError = vi.fn()
const mockHandleStorageError = vi.fn()
const mockHandleSyncError = vi.fn()
const mockShowToast = vi.fn()

// Mock the app store
vi.mock('../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}))

// Mock ErrorHandler with accessible functions
vi.mock('../../utils/errorHandler', () => ({
  ErrorHandler: {
    getInstance: vi.fn(() => ({
      subscribe: mockSubscribe,
      handleError: mockHandleError,
      getErrorHistory: mockGetErrorHistory,
      getErrorsBy: mockGetErrorsBy,
      clearErrorHistory: mockClearErrorHistory,
    })),
    handleNetworkError: mockHandleNetworkError,
    handleValidationError: mockHandleValidationError,
    handleStorageError: mockHandleStorageError,
    handleSyncError: mockHandleSyncError,
  },
  ErrorType: {
    VALIDATION: 'validation',
    NETWORK: 'network',
    PERMISSION: 'permission',
    STORAGE: 'storage',
    SYNC: 'sync',
    IMPORT_EXPORT: 'import_export',
    SEARCH: 'search',
    FILE_SYSTEM: 'file_system',
    UNKNOWN: 'unknown',
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
}))

// Mock global functions that will be used in error actions
const mockWindowOpen = vi.fn()
const mockLocationReload = vi.fn()
const mockDispatchEvent = vi.fn()
const mockLocalStorageClear = vi.fn()
const mockSessionStorageClear = vi.fn()

// Setup global mocks
vi.stubGlobal('window', {
  ...global.window,
  open: mockWindowOpen,
  dispatchEvent: mockDispatchEvent,
  location: {
    ...global.window?.location,
    reload: mockLocationReload,
  },
})

vi.stubGlobal('localStorage', {
  ...global.localStorage,
  clear: mockLocalStorageClear,
})

vi.stubGlobal('sessionStorage', {
  ...global.sessionStorage,
  clear: mockSessionStorageClear,
})

describe('useErrorHandler', () => {
  let useErrorHandler: any
  let mockUnsubscribe: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()
    mockSubscribe.mockReturnValue(mockUnsubscribe)

    // Reset modules
    vi.resetModules()

    // Import fresh hook
    const module = await import('../useErrorHandler')
    useErrorHandler = module.useErrorHandler
  })

  describe('Hook Initialization', () => {
    it('should subscribe to error handler on mount', () => {
      renderHook(() => useErrorHandler())

      expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should unsubscribe on unmount', () => {
      const { unmount } = renderHook(() => useErrorHandler())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should handle hook dependency changes correctly', () => {
      const { result } = renderHook(() => useErrorHandler())

      // Verify hook returns all expected methods
      expect(result.current).toHaveProperty('handleError')
      expect(result.current).toHaveProperty('withErrorHandling')
      expect(result.current).toHaveProperty('withSyncErrorHandling')

      // Initial subscription should be called once
      expect(mockSubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Subscription and Toast Display', () => {
    it('should show toast for low severity errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const testError = {
        id: 'test-1',
        type: 'validation',
        severity: 'low',
        message: 'Validation warning',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(testError)
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'info',
        message: 'Validation warning',
        details: undefined,
        duration: 3000,
        dismissible: true,
        actions: [],
      })
    })

    it('should show toast for medium severity errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const mediumSeverityError = {
        id: 'test-2',
        type: 'unknown',
        severity: 'medium',
        message: 'Something went wrong',
        details: 'Error details here',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(mediumSeverityError)
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Something went wrong',
        details: 'Error details here',
        duration: 5000,
        dismissible: true,
        actions: [],
      })
    })

    it('should show toast for high severity errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const highSeverityError = {
        id: 'test-3',
        type: 'storage',
        severity: 'high',
        message: 'Storage error occurred',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(highSeverityError)
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Storage error occurred',
        details: undefined,
        duration: 8000,
        dismissible: true,
        actions: [
          {
            label: 'Clear Cache',
            action: expect.any(Function),
          },
        ],
      })
    })

    it('should show toast for critical severity errors with no auto-dismiss', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const criticalError = {
        id: 'test-4',
        type: 'network',
        severity: 'critical',
        message: 'Critical network failure',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(criticalError)
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Critical network failure',
        details: undefined,
        duration: 0, // No auto-dismiss for critical errors
        dismissible: true,
        actions: [
          {
            label: 'Check Connection',
            action: expect.any(Function),
          },
        ],
      })
    })
  })

  describe('Error Actions', () => {
    it('should provide retry action when error has retry function', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const retryFunction = vi.fn()
      const errorWithRetry = {
        id: 'test-retry',
        type: 'network',
        severity: 'medium',
        message: 'Network error',
        timestamp: new Date(),
        retry: retryFunction,
      }

      act(() => {
        errorCallback(errorWithRetry)
      })

      const toastCall = mockShowToast.mock.calls[0][0]
      expect(toastCall.actions).toContainEqual({
        label: 'Retry',
        action: retryFunction,
      })
    })

    it('should provide dismiss action when error has dismiss function', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const dismissFunction = vi.fn()
      const errorWithDismiss = {
        id: 'test-dismiss',
        type: 'validation',
        severity: 'low',
        message: 'Validation error',
        timestamp: new Date(),
        dismiss: dismissFunction,
      }

      act(() => {
        errorCallback(errorWithDismiss)
      })

      const toastCall = mockShowToast.mock.calls[0][0]
      expect(toastCall.actions).toContainEqual({
        label: 'Dismiss',
        action: dismissFunction,
      })
    })

    it('should provide network-specific actions for network errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const networkError = {
        id: 'test-network',
        type: 'network',
        severity: 'high',
        message: 'Network connection failed',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(networkError)
      })

      const toastCall = mockShowToast.mock.calls[0][0]
      const checkConnectionAction = toastCall.actions.find(
        (action: any) => action.label === 'Check Connection'
      )

      expect(checkConnectionAction).toBeDefined()

      // Test the action
      act(() => {
        checkConnectionAction.action()
      })

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com',
        '_blank'
      )
    })

    it('should provide storage-specific actions for storage errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const storageError = {
        id: 'test-storage',
        type: 'storage',
        severity: 'high',
        message: 'Storage quota exceeded',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(storageError)
      })

      const toastCall = mockShowToast.mock.calls[0][0]
      const clearCacheAction = toastCall.actions.find(
        (action: any) => action.label === 'Clear Cache'
      )

      expect(clearCacheAction).toBeDefined()

      // Test the action
      act(() => {
        clearCacheAction.action()
      })

      expect(mockLocalStorageClear).toHaveBeenCalled()
      expect(mockSessionStorageClear).toHaveBeenCalled()
      expect(mockLocationReload).toHaveBeenCalled()
    })

    it('should provide sync-specific actions for sync errors', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const syncError = {
        id: 'test-sync',
        type: 'sync',
        severity: 'medium',
        message: 'Sync failed',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(syncError)
      })

      const toastCall = mockShowToast.mock.calls[0][0]
      const syncNowAction = toastCall.actions.find(
        (action: any) => action.label === 'Sync Now'
      )

      expect(syncNowAction).toBeDefined()

      // Test the action
      act(() => {
        syncNowAction.action()
      })

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'manual-sync',
        })
      )
    })
  })

  describe('Hook Return Values', () => {
    it('should return all expected error handling methods', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current).toHaveProperty('handleError')
      expect(result.current).toHaveProperty('handleNetworkError')
      expect(result.current).toHaveProperty('handleValidationError')
      expect(result.current).toHaveProperty('handleStorageError')
      expect(result.current).toHaveProperty('handleSyncError')
      expect(result.current).toHaveProperty('withErrorHandling')
      expect(result.current).toHaveProperty('withSyncErrorHandling')
      expect(result.current).toHaveProperty('getErrorHistory')
      expect(result.current).toHaveProperty('getErrorsBy')
      expect(result.current).toHaveProperty('clearErrorHistory')

      // Check all are functions
      Object.values(result.current).forEach(value => {
        expect(typeof value).toBe('function')
      })
    })
  })

  describe('Error Handling Methods', () => {
    it('should call ErrorHandler.handleError with correct parameters', () => {
      const { result } = renderHook(() => useErrorHandler())

      const error = new Error('Test error')
      const context = { source: 'test' }

      act(() => {
        result.current.handleError(error, context)
      })

      expect(mockHandleError).toHaveBeenCalledWith(error, context)
    })

    it('should call ErrorHandler.handleNetworkError for network errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      const error = new Error('Network failed')
      const context = { source: 'api' }

      act(() => {
        result.current.handleNetworkError(error, context)
      })

      expect(mockHandleNetworkError).toHaveBeenCalledWith(error, context)
    })

    it('should call ErrorHandler.handleValidationError for validation errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      const message = 'Validation failed'
      const context = { field: 'email' }

      act(() => {
        result.current.handleValidationError(message, context)
      })

      expect(mockHandleValidationError).toHaveBeenCalledWith(message, context)
    })

    it('should call ErrorHandler.handleStorageError for storage errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      const error = new Error('Storage full')
      const context = { operation: 'save' }

      act(() => {
        result.current.handleStorageError(error, context)
      })

      expect(mockHandleStorageError).toHaveBeenCalledWith(error, context)
    })

    it('should call ErrorHandler.handleSyncError for sync errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      const error = new Error('Sync failed')
      const context = { attemptNumber: 3 }

      act(() => {
        result.current.handleSyncError(error, context)
      })

      expect(mockHandleSyncError).toHaveBeenCalledWith(error, context)
    })
  })

  describe('Error Wrapper Functions', () => {
    it('should handle async function errors with withErrorHandling', async () => {
      const { result } = renderHook(() => useErrorHandler())

      const asyncFunction = vi.fn().mockRejectedValue(new Error('Async error'))
      const context = { operation: 'fetch' }

      const wrappedFunction = result.current.withErrorHandling(
        asyncFunction,
        context
      )

      const returnValue = await act(async () => {
        return await wrappedFunction('arg1', 'arg2')
      })

      expect(asyncFunction).toHaveBeenCalledWith('arg1', 'arg2')
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), context)
      expect(returnValue).toBeUndefined()
    })

    it('should return result when async function succeeds', async () => {
      const { result } = renderHook(() => useErrorHandler())

      const asyncFunction = vi.fn().mockResolvedValue('success result')

      const wrappedFunction = result.current.withErrorHandling(asyncFunction)

      const returnValue = await act(async () => {
        return await wrappedFunction('arg1')
      })

      expect(asyncFunction).toHaveBeenCalledWith('arg1')
      expect(mockHandleError).not.toHaveBeenCalled()
      expect(returnValue).toBe('success result')
    })

    it('should handle sync function errors with withSyncErrorHandling', () => {
      const { result } = renderHook(() => useErrorHandler())

      const syncFunction = vi.fn().mockImplementation(() => {
        throw new Error('Sync error')
      })
      const context = { operation: 'calculate' }

      const wrappedFunction = result.current.withSyncErrorHandling(
        syncFunction,
        context
      )

      let returnValue: any
      act(() => {
        returnValue = wrappedFunction('arg1', 'arg2')
      })

      expect(syncFunction).toHaveBeenCalledWith('arg1', 'arg2')
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), context)
      expect(returnValue).toBeUndefined()
    })

    it('should return result when sync function succeeds', () => {
      const { result } = renderHook(() => useErrorHandler())

      const syncFunction = vi.fn().mockReturnValue('sync result')

      const wrappedFunction = result.current.withSyncErrorHandling(syncFunction)

      let returnValue: any
      act(() => {
        returnValue = wrappedFunction('arg1')
      })

      expect(syncFunction).toHaveBeenCalledWith('arg1')
      expect(mockHandleError).not.toHaveBeenCalled()
      expect(returnValue).toBe('sync result')
    })
  })

  describe('History Management', () => {
    it('should delegate getErrorHistory to ErrorHandler', () => {
      const { result } = renderHook(() => useErrorHandler())

      const mockHistory = [
        {
          id: '1',
          type: 'network',
          severity: 'high',
          message: 'Error 1',
          timestamp: new Date(),
        },
      ]
      mockGetErrorHistory.mockReturnValue(mockHistory)

      const history = result.current.getErrorHistory()

      expect(mockGetErrorHistory).toHaveBeenCalled()
      expect(history).toBe(mockHistory)
    })

    it('should delegate getErrorsBy to ErrorHandler with filter', () => {
      const { result } = renderHook(() => useErrorHandler())

      const filter = { type: 'network', severity: 'high' }
      const mockFilteredErrors = [
        {
          id: '1',
          type: 'network',
          severity: 'high',
          message: 'Network Error',
          timestamp: new Date(),
        },
      ]
      mockGetErrorsBy.mockReturnValue(mockFilteredErrors)

      const filteredErrors = result.current.getErrorsBy(filter)

      expect(mockGetErrorsBy).toHaveBeenCalledWith(filter)
      expect(filteredErrors).toBe(mockFilteredErrors)
    })

    it('should delegate clearErrorHistory to ErrorHandler', () => {
      const { result } = renderHook(() => useErrorHandler())

      result.current.clearErrorHistory()

      expect(mockClearErrorHistory).toHaveBeenCalled()
    })
  })

  describe('Core Functionality', () => {
    it('should handle complete error flow from subscription to toast display', () => {
      renderHook(() => useErrorHandler())

      // Simulate error from ErrorHandler
      const errorCallback = mockSubscribe.mock.calls[0][0]
      const testError = {
        id: 'integration-test',
        type: 'validation',
        severity: 'medium',
        message: 'Integration test error',
        details: 'Error occurred during integration test',
        timestamp: new Date(),
        retry: vi.fn(),
      }

      act(() => {
        errorCallback(testError)
      })

      // Verify toast was shown with correct parameters
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Integration test error',
        details: 'Error occurred during integration test',
        duration: 5000,
        dismissible: true,
        actions: [
          {
            label: 'Retry',
            action: testError.retry,
          },
        ],
      })
    })

    it('should handle errors without optional properties', () => {
      renderHook(() => useErrorHandler())

      const errorCallback = mockSubscribe.mock.calls[0][0]
      const simpleError = {
        id: 'simple-error',
        type: 'unknown',
        severity: 'medium',
        message: 'Simple error',
        timestamp: new Date(),
      }

      act(() => {
        errorCallback(simpleError)
      })

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Simple error',
        details: undefined,
        duration: 5000,
        dismissible: true,
        actions: [],
      })
    })
  })
})
