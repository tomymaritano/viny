import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorHandler, ErrorType, ErrorSeverity } from '../errorHandler'

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    // Reset singleton instance for each test
    ErrorHandler['instance'] = undefined as any
    errorHandler = ErrorHandler.getInstance()
  })

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorHandler.getInstance()
      const instance2 = ErrorHandler.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Error classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network request failed')
      const result = errorHandler.handleError(networkError)
      
      expect(result.type).toBe(ErrorType.NETWORK)
      expect(result.severity).toBe(ErrorSeverity.HIGH)
      expect(result.message).toBe('Network connection failed. Please check your internet connection.')
    })

    it('should classify permission errors correctly', () => {
      const permissionError = new Error('Permission denied')
      const result = errorHandler.handleError(permissionError)
      
      expect(result.type).toBe(ErrorType.PERMISSION)
      expect(result.severity).toBe(ErrorSeverity.HIGH)
      expect(result.message).toBe('Permission denied. Please check your access permissions.')
    })

    it('should classify storage errors correctly', () => {
      const storageError = new Error('Storage quota exceeded')
      const result = errorHandler.handleError(storageError)
      
      expect(result.type).toBe(ErrorType.STORAGE)
      expect(result.severity).toBe(ErrorSeverity.HIGH)
      expect(result.message).toBe('Storage quota exceeded. Please free up some space.')
    })

    it('should classify sync errors correctly', () => {
      const syncError = new Error('Synchronization failed')
      const result = errorHandler.handleError(syncError)
      
      expect(result.type).toBe(ErrorType.SYNC)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.message).toBe('Synchronization failed. Your changes are saved locally.')
    })

    it('should classify search errors correctly', () => {
      const searchError = new Error('Search operation failed')
      const result = errorHandler.handleError(searchError)
      
      expect(result.type).toBe(ErrorType.SEARCH)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.message).toBe('Search operation failed. Please try again.')
    })

    it('should classify unknown errors correctly', () => {
      const unknownError = new Error('Some random error')
      const result = errorHandler.handleError(unknownError)
      
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.message).toBe('Some random error')
    })
  })

  describe('Severity determination', () => {
    it('should classify critical errors correctly', () => {
      const criticalError = new Error('Critical system failure')
      const result = errorHandler.handleError(criticalError)
      
      expect(result.severity).toBe(ErrorSeverity.CRITICAL)
    })

    it('should classify low severity errors correctly', () => {
      const warningError = new Error('Warning: deprecated function')
      const result = errorHandler.handleError(warningError)
      
      expect(result.severity).toBe(ErrorSeverity.LOW)
    })
  })

  describe('Error handling with string input', () => {
    it('should handle string errors', () => {
      const result = errorHandler.handleError('Simple error message')
      
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.message).toBe('Simple error message')
      expect(result.details).toBeUndefined()
    })
  })

  describe('Error handling with context', () => {
    it('should include context in error', () => {
      const context = { userId: '123', action: 'save_note' }
      const result = errorHandler.handleError('Context error', context)
      
      expect(result.context).toEqual(context)
    })
  })

  describe('Error listeners', () => {
    it('should notify listeners when error occurs', () => {
      const listener = vi.fn()
      const unsubscribe = errorHandler.subscribe(listener)
      
      const result = errorHandler.handleError('Test error')
      
      expect(listener).toHaveBeenCalledWith(result)
      
      unsubscribe()
    })

    it('should unsubscribe listeners correctly', () => {
      const listener = vi.fn()
      const unsubscribe = errorHandler.subscribe(listener)
      
      unsubscribe()
      
      errorHandler.handleError('Test error')
      
      expect(listener).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      errorHandler.subscribe(listener1)
      errorHandler.subscribe(listener2)
      
      const result = errorHandler.handleError('Test error')
      
      expect(listener1).toHaveBeenCalledWith(result)
      expect(listener2).toHaveBeenCalledWith(result)
    })
  })

  describe('Error history', () => {
    it('should store errors in history', () => {
      errorHandler.handleError('Error 1')
      errorHandler.handleError('Error 2')
      
      const history = errorHandler.getErrorHistory()
      expect(history).toHaveLength(2)
      expect(history[0].message).toBe('Error 2') // Most recent first
      expect(history[1].message).toBe('Error 1')
    })

    it('should filter errors by type', () => {
      errorHandler.handleError(new Error('Network failed'))
      errorHandler.handleError(new Error('Permission denied'))
      
      const networkErrors = errorHandler.getErrorsBy({ type: ErrorType.NETWORK })
      const permissionErrors = errorHandler.getErrorsBy({ type: ErrorType.PERMISSION })
      
      expect(networkErrors).toHaveLength(1)
      expect(permissionErrors).toHaveLength(1)
    })

    it('should filter errors by severity', () => {
      errorHandler.handleError(new Error('Critical failure'))
      errorHandler.handleError(new Error('Warning message'))
      
      const criticalErrors = errorHandler.getErrorsBy({ severity: ErrorSeverity.CRITICAL })
      const lowErrors = errorHandler.getErrorsBy({ severity: ErrorSeverity.LOW })
      
      expect(criticalErrors).toHaveLength(1)
      expect(lowErrors).toHaveLength(1)
    })

    it('should clear error history', () => {
      errorHandler.handleError('Error 1')
      errorHandler.handleError('Error 2')
      
      expect(errorHandler.getErrorHistory()).toHaveLength(2)
      
      errorHandler.clearErrorHistory()
      
      expect(errorHandler.getErrorHistory()).toHaveLength(0)
    })

    it('should limit history size', () => {
      // Create more than max history size errors
      for (let i = 0; i < 150; i++) {
        errorHandler.handleError(`Error ${i}`)
      }
      
      const history = errorHandler.getErrorHistory()
      expect(history.length).toBeLessThanOrEqual(100) // Max history size
    })
  })

  describe('Static helper methods', () => {
    it('should handle network errors with static method', () => {
      const networkError = new Error('Fetch failed')
      const result = ErrorHandler.handleNetworkError(networkError, { url: 'https://api.example.com' })
      
      expect(result.type).toBe(ErrorType.NETWORK)
      expect(result.context).toEqual({ url: 'https://api.example.com', type: ErrorType.NETWORK })
    })

    it('should handle validation errors with static method', () => {
      const result = ErrorHandler.handleValidationError('Invalid email format', { field: 'email' })
      
      expect(result.type).toBe(ErrorType.VALIDATION)
      expect(result.severity).toBe(ErrorSeverity.MEDIUM)
      expect(result.message).toBe('Invalid email format')
      expect(result.context).toEqual({ field: 'email' })
    })

    it('should handle storage errors with static method', () => {
      const storageError = new Error('LocalStorage full')
      const result = ErrorHandler.handleStorageError(storageError, { operation: 'save' })
      
      expect(result.type).toBe(ErrorType.STORAGE)
      expect(result.context).toEqual({ operation: 'save', type: ErrorType.STORAGE })
    })

    it('should handle sync errors with static method', () => {
      const syncError = new Error('Sync conflict')
      const result = ErrorHandler.handleSyncError(syncError, { noteId: '123' })
      
      expect(result.type).toBe(ErrorType.SYNC)
      expect(result.context).toEqual({ noteId: '123', type: ErrorType.SYNC })
    })
  })

  describe('AppError handling', () => {
    it('should handle existing AppError objects', () => {
      const existingError = {
        id: 'existing-error',
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.HIGH,
        message: 'Existing error',
        timestamp: new Date(),
        context: { existing: true }
      }
      
      const result = errorHandler.handleError(existingError)
      
      expect(result).toBe(existingError) // Should return the same object
    })
  })
})