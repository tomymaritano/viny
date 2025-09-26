/**

import { logger } from './logger' * Comprehensive Error Handling Utilities
 * Standardized error patterns extracted from useNotebooks.ts, useNoteActions.ts, and useTagManager.ts
 * Provides consistent error handling across all CRUD hooks
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
export const getErrorMessage = (
  error: unknown,
  fallback = 'An error occurred'
): string => {
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
  const { showToast = false, logError = true, rethrow = true } = options

  const errorMessage = getErrorMessage(error, `Failed to ${context}`)

  if (logError) {
    // Use proper logger instead of console.error in production
    import('./logger')
      .then(({ logger }) => {
        logger.error(`Error in ${context}:`, error)
      })
      .catch(() => {
        // Fallback only for critical errors when logger fails
        if (process.env.NODE_ENV === 'development') {
          logger.error(`Error in ${context}:`, error)
        }
      })
  }

  setError(errorMessage)

  if (showToast && typeof window !== 'undefined' && (window as any).showToast) {
    ;(window as any).showToast({
      type: 'error',
      message: errorMessage,
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
    error: null as string | null,
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

/**
 * Standard error types for the application
 */
export enum ErrorType {
  VALIDATION = 'validation',
  REPOSITORY = 'repository',
  NETWORK = 'network',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  DUPLICATE = 'duplicate',
  UNKNOWN = 'unknown',
}

/**
 * Application error with type and context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Validation error for frontend validation
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION, context)
    this.name = 'ValidationError'
  }
}

/**
 * Repository operation error
 */
export class RepositoryError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorType.REPOSITORY, context)
    this.name = 'RepositoryError'
  }
}

/**
 * Duplicate entity error
 */
export class DuplicateError extends AppError {
  constructor(
    entityType: string,
    identifier: string,
    context?: Record<string, any>
  ) {
    super(
      `${entityType} "${identifier}" already exists`,
      ErrorType.DUPLICATE,
      context
    )
    this.name = 'DuplicateError'
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(
    entityType: string,
    identifier: string,
    context?: Record<string, any>
  ) {
    super(
      `${entityType} "${identifier}" not found`,
      ErrorType.NOT_FOUND,
      context
    )
    this.name = 'NotFoundError'
  }
}

/**
 * Frontend validation utilities with consistent error throwing
 */
export class FrontendValidator {
  /**
   * Validate required field
   */
  static required(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} is required`)
    }
  }

  /**
   * Validate non-empty string
   */
  static nonEmptyString(value: string, fieldName: string): void {
    FrontendValidator.required(value, fieldName)
    if (typeof value !== 'string' || !value.trim()) {
      throw new ValidationError(`${fieldName} cannot be empty`)
    }
  }

  /**
   * Validate array index
   */
  static validIndex(
    index: number,
    arrayLength: number,
    fieldName: string
  ): void {
    if (index < 0 || index >= arrayLength) {
      throw new ValidationError(
        `${fieldName} index ${index} is out of bounds (max: ${arrayLength - 1})`
      )
    }
  }

  /**
   * Validate ID format
   */
  static validId(id: string, entityType: string): void {
    FrontendValidator.nonEmptyString(id, `${entityType} ID`)
  }

  /**
   * Validate uniqueness
   */
  static unique<T>(
    items: T[],
    newItem: T,
    getKey: (item: T) => string,
    entityType: string,
    excludeIndex?: number
  ): void {
    const newKey = getKey(newItem).toLowerCase()
    const existingIndex = items.findIndex(
      (item, index) =>
        index !== excludeIndex && getKey(item).toLowerCase() === newKey
    )

    if (existingIndex !== -1) {
      throw new DuplicateError(entityType, getKey(newItem))
    }
  }

  /**
   * Validate entity exists
   */
  static exists<T>(
    items: T[],
    identifier: string,
    getKey: (item: T) => string,
    entityType: string
  ): T {
    const item = items.find(item => getKey(item) === identifier)
    if (!item) {
      throw new NotFoundError(entityType, identifier)
    }
    return item
  }
}
