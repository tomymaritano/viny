/**
 * Shared error handling utilities to eliminate duplicated error logic across hooks
 */

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  rethrow?: boolean
}

export interface AsyncErrorHandlerOptions extends ErrorHandlerOptions {
  defaultValue?: any
}

/**
 * Standardized error message extraction
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/**
 * Generic error handler for hooks
 */
export const handleHookError = (
  error: unknown,
  context: string,
  setError: (error: string | null) => void,
  options: ErrorHandlerOptions = {}
): void => {
  const {
    showToast = false,
    logError = true,
    rethrow = true
  } = options

  const errorMessage = getErrorMessage(error, `Failed to ${context}`)
  
  if (logError) {
    console.error(`Error in ${context}:`, error)
  }
  
  setError(errorMessage)
  
  if (showToast && typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast({
      type: 'error',
      message: errorMessage
    })
  }
  
  if (rethrow) {
    throw new Error(errorMessage)
  }
}

/**
 * Async operation wrapper with error handling
 */
export const withAsyncErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  setError: (error: string | null) => void,
  options: AsyncErrorHandlerOptions = {}
): Promise<T | undefined> => {
  try {
    setError(null) // Clear previous errors
    const result = await operation()
    return result
  } catch (error) {
    handleHookError(error, context, setError, options)
    return options.defaultValue
  }
}

/**
 * Sync operation wrapper with error handling
 */
export const withSyncErrorHandling = <T>(
  operation: () => T,
  context: string,
  setError: (error: string | null) => void,
  options: ErrorHandlerOptions = {}
): T | undefined => {
  try {
    setError(null) // Clear previous errors
    return operation()
  } catch (error) {
    handleHookError(error, context, setError, options)
    return undefined
  }
}

/**
 * Standard error state management for hooks
 */
export const createErrorState = () => {
  return {
    loading: false,
    error: null as string | null
  }
}

/**
 * Error boundary for async operations in hooks
 */
export const asyncErrorBoundary = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  setError: (error: string | null) => void
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      setError(null)
      return await fn(...args)
    } catch (error) {
      handleHookError(error, context, setError, { rethrow: false })
      return undefined
    }
  }
}