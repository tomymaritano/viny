/**
 * React hook for centralized error handling with toast notifications.
 *
 * @description
 * This hook provides a unified interface for error handling across the application.
 * It automatically subscribes to the global error handler and displays toast notifications
 * based on error severity. Supports different error types including network, validation,
 * storage, and general application errors.
 *
 * @returns {Object} Error handling utilities
 * @returns {Function} returns.handleError - Handle any type of error with optional context
 * @returns {Function} returns.handleNetworkError - Handle network-specific errors
 * @returns {Function} returns.handleStorageError - Handle storage-related errors
 * @returns {Function} returns.handleValidationError - Handle validation errors
 * @returns {Function} returns.clearErrors - Clear all error notifications
 * @returns {Array<AppError>} returns.errorHistory - Recent error history
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleError, handleNetworkError } = useErrorHandler();
 *
 *   const fetchData = async () => {
 *     try {
 *       const response = await api.getData();
 *       // process response
 *     } catch (error) {
 *       handleNetworkError(error, {
 *         endpoint: '/api/data',
 *         retry: fetchData
 *       });
 *     }
 *   };
 * }
 * ```
 */
import { useEffect, useCallback } from 'react'
import type { AppError } from '../utils/errorHandler'
import { ErrorHandler, ErrorType, ErrorSeverity } from '../utils/errorHandler'
import { useAppStore } from '../stores/newSimpleStore'

export function useErrorHandler() {
  const { showToast } = useAppStore()
  const errorHandler = ErrorHandler.getInstance()

  // Subscribe to errors and show toasts
  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((error: AppError) => {
      // Show toast notification based on error severity
      const toastType = getToastType(error.severity)

      showToast({
        type: toastType,
        message: error.message,
        details: error.details,
        duration: getToastDuration(error.severity),
        dismissible: true,
        actions: getErrorActions(error),
      })
    })

    return unsubscribe
  }, [showToast])

  // Helper function to handle errors
  const handleError = useCallback(
    (error: Error | AppError | string, context?: Record<string, any>) => {
      return errorHandler.handleError(error, context)
    },
    []
  )

  // Specific error handlers
  const handleNetworkError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      return ErrorHandler.handleNetworkError(error, context)
    },
    []
  )

  const handleValidationError = useCallback(
    (message: string, context?: Record<string, any>) => {
      return ErrorHandler.handleValidationError(message, context)
    },
    []
  )

  const handleStorageError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      return ErrorHandler.handleStorageError(error, context)
    },
    []
  )

  const handleSyncError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      return ErrorHandler.handleSyncError(error, context)
    },
    []
  )

  // Async error wrapper
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      errorContext?: Record<string, any>
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleError(error as Error, errorContext)
          return undefined
        }
      }
    },
    [handleError]
  )

  // Sync error wrapper
  const withSyncErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => R,
      errorContext?: Record<string, any>
    ) => {
      return (...args: T): R | undefined => {
        try {
          return fn(...args)
        } catch (error) {
          handleError(error as Error, errorContext)
          return undefined
        }
      }
    },
    [handleError]
  )

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleStorageError,
    handleSyncError,
    withErrorHandling,
    withSyncErrorHandling,
    getErrorHistory: () => errorHandler.getErrorHistory(),
    getErrorsBy: (filter: Partial<Pick<AppError, 'type' | 'severity'>>) =>
      errorHandler.getErrorsBy(filter),
    clearErrorHistory: () => errorHandler.clearErrorHistory(),
  }
}

// Helper functions
function getToastType(
  severity: ErrorSeverity
): 'success' | 'error' | 'warning' | 'info' {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'info'
    case ErrorSeverity.MEDIUM:
      return 'warning'
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      return 'error'
    default:
      return 'error'
  }
}

function getToastDuration(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 3000
    case ErrorSeverity.MEDIUM:
      return 5000
    case ErrorSeverity.HIGH:
      return 8000
    case ErrorSeverity.CRITICAL:
      return 0 // Don't auto-dismiss critical errors
    default:
      return 5000
  }
}

function getErrorActions(error: AppError): Array<{
  label: string
  action: () => void | Promise<void> | Window | null
}> {
  const actions: Array<{
    label: string
    action: () => void | Promise<void> | Window | null
  }> = []

  // Add retry action if available
  if (error.retry) {
    actions.push({
      label: 'Retry',
      action: error.retry,
    })
  }

  // Add dismiss action if available
  if (error.dismiss) {
    actions.push({
      label: 'Dismiss',
      action: error.dismiss,
    })
  }

  // Add type-specific actions
  switch (error.type) {
    case ErrorType.NETWORK:
      actions.push({
        label: 'Check Connection',
        action: () => window.open('https://www.google.com', '_blank'),
      })
      break
    case ErrorType.STORAGE:
      actions.push({
        label: 'Clear Cache',
        action: () => {
          storageService.clear()
          sessionStorage.clear()
          window.location.reload()
        },
      })
      break
    case ErrorType.SYNC:
      actions.push({
        label: 'Sync Now',
        action: () => {
          // Trigger manual sync
          window.dispatchEvent(new CustomEvent('manual-sync'))
        },
      })
      break
  }

  return actions
}
