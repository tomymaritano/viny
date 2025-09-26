/**
 * Comprehensive tests for Repository Error Handling System
 * Tests error classification, retry logic, circuit breaker, and error recovery
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

// Set longer test timeout for async operations
vi.setConfig({ testTimeout: 10000 })
import {
  RepositoryErrorHandler,
  RetryHandler,
  CircuitBreaker,
  ErrorClassifier,
  RepositoryErrorFactory,
  StorageNotAvailableError,
  ValidationError,
  ConflictError,
  NotFoundError,
  PermissionDeniedError,
  EncryptionError,
  TimeoutError,
  isStorageNotAvailableError,
  isValidationError,
  isConflictError,
  isNotFoundError,
} from '../errors/RepositoryErrorHandler'

import type {
  RetryConfig,
  CircuitBreakerConfig,
} from '../types/RepositoryTypes'
import { RepositoryError, RepositoryErrorCode } from '../types/RepositoryTypes'

describe('RepositoryErrorHandler', () => {
  let errorHandler: RepositoryErrorHandler
  let mockOperation: any

  beforeEach(() => {
    const retryConfig: RetryConfig = {
      maxAttempts: 3,
      baseDelayMs: 10, // Fast tests
      maxDelayMs: 100,
      exponentialBackoff: true,
      jitter: false, // Predictable timing for tests
    }

    const circuitBreakerConfig: CircuitBreakerConfig = {
      enabled: true,
      failureThreshold: 2,
      resetTimeoutMs: 100,
      monitoringPeriodMs: 50,
    }

    errorHandler = new RepositoryErrorHandler(retryConfig, circuitBreakerConfig)
    mockOperation = vi.fn()
  })

  describe('Error Classification', () => {
    it('should classify transient errors as retryable', () => {
      const networkError = new RepositoryError(
        'Network failed',
        RepositoryErrorCode.NETWORK_ERROR,
        'test'
      )

      const classification = ErrorClassifier.classifyError(networkError)

      expect(classification.category).toBe('transient')
      expect(classification.isRetryable).toBe(true)
      expect(classification.suggestedAction).toBe(
        'Retry with exponential backoff'
      )
    })

    it('should classify security errors as non-retryable', () => {
      const permissionError = new RepositoryError(
        'Access denied',
        RepositoryErrorCode.PERMISSION_DENIED,
        'test'
      )

      const classification = ErrorClassifier.classifyError(permissionError)

      expect(classification.category).toBe('security')
      expect(classification.isRetryable).toBe(false)
      expect(classification.suggestedAction).toBe(
        'Check authentication and permissions'
      )
    })

    it('should classify permanent errors as non-retryable', () => {
      const validationError = new RepositoryError(
        'Invalid data',
        RepositoryErrorCode.VALIDATION_ERROR,
        'test'
      )

      const classification = ErrorClassifier.classifyError(validationError)

      expect(classification.category).toBe('permanent')
      expect(classification.isRetryable).toBe(false)
      expect(classification.suggestedAction).toBe(
        'Fix data or request parameters'
      )
    })
  })

  describe('Retry Logic', () => {
    it('should retry transient errors with exponential backoff', async () => {
      let attempts = 0
      mockOperation.mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new RepositoryError(
            'Network timeout',
            RepositoryErrorCode.NETWORK_ERROR,
            'test'
          )
        }
        return Promise.resolve('success')
      })

      const result = await errorHandler.executeOperation(
        mockOperation,
        'testOperation'
      )

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
      expect(attempts).toBe(3)
    })

    it('should not retry non-retryable errors', async () => {
      mockOperation.mockRejectedValue(
        new RepositoryError(
          'Validation failed',
          RepositoryErrorCode.VALIDATION_ERROR,
          'test'
        )
      )

      const result = await errorHandler.executeOperation(
        mockOperation,
        'testOperation'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(RepositoryError)
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should give up after max attempts', async () => {
      mockOperation.mockRejectedValue(
        new RepositoryError(
          'Network timeout',
          RepositoryErrorCode.NETWORK_ERROR,
          'test'
        )
      )

      const result = await errorHandler.executeOperation(
        mockOperation,
        'testOperation'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(RepositoryError)
      expect(mockOperation).toHaveBeenCalledTimes(3) // maxAttempts
    })
  })

  describe('Circuit Breaker', () => {
    it('should open circuit after threshold failures', async () => {
      // Cause failures to open circuit
      mockOperation.mockRejectedValue(new Error('Service down'))

      // First failure
      await errorHandler.executeOperation(mockOperation, 'test')
      // Second failure - should open circuit
      await errorHandler.executeOperation(mockOperation, 'test')

      const circuitState = errorHandler.getCircuitBreakerState()
      expect(circuitState?.state).toBe('open')
      expect(circuitState?.failures).toBe(2)
    })

    it('should reject operations when circuit is open', async () => {
      // Open the circuit
      mockOperation.mockRejectedValue(new Error('Service down'))
      await errorHandler.executeOperation(mockOperation, 'test')
      await errorHandler.executeOperation(mockOperation, 'test')

      // Reset mock to succeed
      mockOperation.mockResolvedValue('success')

      // Should still fail due to open circuit
      const result = await errorHandler.executeOperation(mockOperation, 'test')
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Circuit breaker is open')
    })

    it('should reset circuit after timeout', async () => {
      // Open circuit
      mockOperation.mockRejectedValue(new Error('Service down'))
      await errorHandler.executeOperation(mockOperation, 'test')
      await errorHandler.executeOperation(mockOperation, 'test')

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should attempt operation again
      mockOperation.mockResolvedValue('success')
      const result = await errorHandler.executeOperation(mockOperation, 'test')

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
    })
  })

  describe('Error Normalization', () => {
    it('should normalize quota exceeded errors to StorageFullError', async () => {
      const quotaError = new Error('QuotaExceededError')
      quotaError.name = 'QuotaExceededError'
      mockOperation.mockRejectedValue(quotaError)

      const result = await errorHandler.executeOperation(mockOperation, 'test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(RepositoryErrorCode.STORAGE_FULL)
    })

    it('should normalize security errors to PermissionDeniedError', async () => {
      const securityError = new Error('SecurityError: permission denied')
      securityError.name = 'SecurityError'
      mockOperation.mockRejectedValue(securityError)

      const result = await errorHandler.executeOperation(mockOperation, 'test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(RepositoryErrorCode.PERMISSION_DENIED)
    })

    it('should normalize timeout errors', async () => {
      const timeoutError = new Error('Operation timeout')
      timeoutError.name = 'TimeoutError'
      mockOperation.mockRejectedValue(timeoutError)

      const result = await errorHandler.executeOperation(mockOperation, 'test')

      expect(result.success).toBe(false)
      expect(result.error?.code).toBe(RepositoryErrorCode.TIMEOUT_ERROR)
    })
  })
})

describe('RetryHandler', () => {
  let retryHandler: RetryHandler

  beforeEach(() => {
    const config: RetryConfig = {
      maxAttempts: 3,
      baseDelayMs: 10,
      maxDelayMs: 100,
      exponentialBackoff: true,
      jitter: false,
    }
    retryHandler = new RetryHandler(config)
  })

  describe('Delay Calculation', () => {
    it('should calculate exponential backoff delays', async () => {
      const delays: number[] = []
      let attempts = 0

      const mockOperation = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts <= 2) {
          throw new RepositoryError(
            'test',
            RepositoryErrorCode.NETWORK_ERROR,
            'test'
          )
        }
        return Promise.resolve('success')
      })

      const startTime = Date.now()
      await retryHandler.executeWithRetry(mockOperation, 'test')
      const totalTime = Date.now() - startTime

      // Should have taken at least base delay + exponential delay
      expect(totalTime).toBeGreaterThan(10) // First retry delay
      expect(attempts).toBe(3)
    })

    it('should respect maximum delay limit', () => {
      const config: RetryConfig = {
        maxAttempts: 5,
        baseDelayMs: 100,
        maxDelayMs: 200,
        exponentialBackoff: true,
        jitter: false,
      }

      const handler = new RetryHandler(config)

      // Access private method for testing
      const calculateDelay = (handler as any).calculateDelay.bind(handler)

      // High attempt should be capped at maxDelayMs
      const delay = calculateDelay(10)
      expect(delay).toBeLessThanOrEqual(200)
    })
  })

  describe('Timeout Handling', () => {
    it.skip('should timeout long-running operations', async () => {
      const longOperation = () =>
        new Promise(resolve => setTimeout(resolve, 15000))

      await expect(
        retryHandler.executeWithRetry(longOperation, 'longTest')
      ).rejects.toThrow('Operation timed out')
    })
  })
})

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    const config: CircuitBreakerConfig = {
      enabled: true,
      failureThreshold: 2,
      resetTimeoutMs: 100,
      monitoringPeriodMs: 50,
    }
    circuitBreaker = new CircuitBreaker(config)
  })

  it('should track failures and open circuit', async () => {
    const failingOperation = () => Promise.reject(new Error('Service down'))

    // First failure
    await expect(
      circuitBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow()
    expect(circuitBreaker.getState().state).toBe('closed')

    // Second failure - should open circuit
    await expect(
      circuitBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow()
    expect(circuitBreaker.getState().state).toBe('open')
  })

  it.skip('should transition to half-open after timeout', async () => {
    const failingOperation = () => Promise.reject(new Error('Service down'))

    // Open circuit
    await expect(
      circuitBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow()
    await expect(
      circuitBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow()

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 150))

    // Should be half-open and allow next attempt
    const successOperation = () => Promise.resolve('success')
    const result = await circuitBreaker.execute(successOperation, 'test')

    expect(result).toBe('success')
    expect(circuitBreaker.getState().state).toBe('closed')
  })

  it('should be disabled when configured', async () => {
    const config: CircuitBreakerConfig = {
      enabled: false,
      failureThreshold: 1,
      resetTimeoutMs: 100,
      monitoringPeriodMs: 50,
    }

    const disabledBreaker = new CircuitBreaker(config)
    const failingOperation = () => Promise.reject(new Error('Service down'))

    // Should allow all operations through
    await expect(
      disabledBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow('Service down')
    await expect(
      disabledBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow('Service down')
    await expect(
      disabledBreaker.execute(failingOperation, 'test')
    ).rejects.toThrow('Service down')
  })
})

describe('Error Factory', () => {
  it('should create typed errors with proper context', () => {
    const notFoundError = RepositoryErrorFactory.notFound(
      'Note',
      'note-123',
      'getNote'
    )

    expect(notFoundError).toBeInstanceOf(NotFoundError)
    expect(notFoundError.code).toBe(RepositoryErrorCode.NOT_FOUND)
    expect(notFoundError.operation).toBe('getNote')
    expect(notFoundError.context).toEqual({
      entityId: 'note-123',
      entityType: 'Note',
    })
  })

  it('should create validation errors with details', () => {
    const errors = ['Title is required', 'Content too long']
    const data = { title: '', content: 'x'.repeat(10000) }

    const validationError = RepositoryErrorFactory.validationFailed(
      'saveNote',
      errors,
      data
    )

    expect(validationError).toBeInstanceOf(ValidationError)
    expect(validationError.code).toBe(RepositoryErrorCode.VALIDATION_ERROR)
    expect(validationError.context).toEqual({
      validationErrors: errors,
      data,
    })
  })

  it('should create storage errors with usage info', () => {
    const storageError = RepositoryErrorFactory.storageFull(
      'saveNote',
      1000000,
      1048576
    )

    expect(storageError.code).toBe(RepositoryErrorCode.STORAGE_FULL)
    expect(storageError.context).toEqual({
      usedSpace: 1000000,
      totalSpace: 1048576,
    })
  })
})

describe('Type Guards', () => {
  it('should correctly identify error types', () => {
    const storageError = new StorageNotAvailableError('test')
    const validationError = new ValidationError('test', ['error'])
    const conflictError = new ConflictError('test', 'id')
    const notFoundError = new NotFoundError('test', 'id')

    expect(isStorageNotAvailableError(storageError)).toBe(true)
    expect(isStorageNotAvailableError(validationError)).toBe(false)

    expect(isValidationError(validationError)).toBe(true)
    expect(isValidationError(storageError)).toBe(false)

    expect(isConflictError(conflictError)).toBe(true)
    expect(isConflictError(storageError)).toBe(false)

    expect(isNotFoundError(notFoundError)).toBe(true)
    expect(isNotFoundError(storageError)).toBe(false)
  })
})

describe('Error Properties', () => {
  it('should correctly identify retryable errors', () => {
    const networkError = new RepositoryError(
      'test',
      RepositoryErrorCode.NETWORK_ERROR,
      'test'
    )
    const validationError = new RepositoryError(
      'test',
      RepositoryErrorCode.VALIDATION_ERROR,
      'test'
    )

    expect(networkError.isRetryable).toBe(true)
    expect(validationError.isRetryable).toBe(false)
  })

  it('should correctly identify critical errors', () => {
    const encryptionError = new RepositoryError(
      'test',
      RepositoryErrorCode.ENCRYPTION_ERROR,
      'test'
    )
    const networkError = new RepositoryError(
      'test',
      RepositoryErrorCode.NETWORK_ERROR,
      'test'
    )

    expect(encryptionError.isCritical).toBe(true)
    expect(networkError.isCritical).toBe(false)
  })

  it('should preserve error stack traces', () => {
    const cause = new Error('Original error')
    const repositoryError = new RepositoryError(
      'Wrapped error',
      RepositoryErrorCode.UNKNOWN_ERROR,
      'test',
      {},
      cause
    )

    expect(repositoryError.stack).toContain('Caused by:')
    expect(repositoryError.cause).toBe(cause)
  })
})
