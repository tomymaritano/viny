/**
 * Repository Error Handling & Resilience System
 * Provides typed exceptions, retry logic, circuit breaker, and error recovery
 */

import {
  RepositoryError,
  RepositoryErrorCode,
  RetryConfig,
  CircuitBreakerConfig,
  OperationResult
} from '../types/RepositoryTypes'

// =============================================================================
// Enhanced Error Classes
// =============================================================================

export class StorageNotAvailableError extends RepositoryError {
  constructor(operation: string, context?: Record<string, any>) {
    super(
      'Storage system is not available',
      RepositoryErrorCode.STORAGE_NOT_AVAILABLE,
      operation,
      context
    )
  }
}

export class StorageFullError extends RepositoryError {
  constructor(operation: string, usedSpace: number, totalSpace: number) {
    super(
      `Storage is full (${usedSpace}/${totalSpace} bytes used)`,
      RepositoryErrorCode.STORAGE_FULL,
      operation,
      { usedSpace, totalSpace }
    )
  }
}

export class ValidationError extends RepositoryError {
  constructor(operation: string, validationErrors: string[], data?: any) {
    super(
      `Validation failed: ${validationErrors.join(', ')}`,
      RepositoryErrorCode.VALIDATION_ERROR,
      operation,
      { validationErrors, data }
    )
  }
}

export class ConflictError extends RepositoryError {
  constructor(operation: string, entityId: string, conflictDetails?: any) {
    super(
      `Conflict detected for entity ${entityId}`,
      RepositoryErrorCode.CONFLICT_ERROR,
      operation,
      { entityId, conflictDetails }
    )
  }
}

export class NotFoundError extends RepositoryError {
  constructor(operation: string, entityId: string, entityType?: string) {
    super(
      `${entityType || 'Entity'} with ID ${entityId} not found`,
      RepositoryErrorCode.NOT_FOUND,
      operation,
      { entityId, entityType }
    )
  }
}

export class PermissionDeniedError extends RepositoryError {
  constructor(operation: string, resource: string, requiredPermission?: string) {
    super(
      `Permission denied for ${operation} on ${resource}`,
      RepositoryErrorCode.PERMISSION_DENIED,
      operation,
      { resource, requiredPermission }
    )
  }
}

export class EncryptionError extends RepositoryError {
  constructor(operation: string, reason: string) {
    super(
      `Encryption/Decryption failed: ${reason}`,
      RepositoryErrorCode.ENCRYPTION_ERROR,
      operation,
      { reason }
    )
  }
}

export class TimeoutError extends RepositoryError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation timed out after ${timeoutMs}ms`,
      RepositoryErrorCode.TIMEOUT_ERROR,
      operation,
      { timeoutMs }
    )
  }
}

// =============================================================================
// Retry Logic with Exponential Backoff
// =============================================================================

export class RetryHandler {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 100,
    maxDelayMs: 5000,
    exponentialBackoff: true,
    jitter: true
  }

  constructor(private config: RetryConfig = RetryHandler.DEFAULT_CONFIG) {}

  /**
   * Execute operation with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    isRetryable: (error: Error) => boolean = (error) => error instanceof RepositoryError && error.isRetryable
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await this.withTimeout(operation(), operationName)
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on last attempt or if error is not retryable
        if (attempt === this.config.maxAttempts || !isRetryable(lastError)) {
          throw this.wrapError(lastError, operationName, attempt)
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt)
        
        console.warn(
          `Repository operation '${operationName}' failed (attempt ${attempt}/${this.config.maxAttempts}). Retrying in ${delay}ms...`,
          { error: lastError.message, attempt, delay }
        )
        
        await this.sleep(delay)
      }
    }
    
    throw this.wrapError(lastError!, operationName, this.config.maxAttempts)
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(attempt: number): number {
    let delay: number
    
    if (this.config.exponentialBackoff) {
      // Exponential backoff: baseDelay * 2^(attempt-1)
      delay = this.config.baseDelayMs * Math.pow(2, attempt - 1)
    } else {
      // Linear backoff
      delay = this.config.baseDelayMs * attempt
    }
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelayMs)
    
    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1 // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount
    }
    
    return Math.max(delay, 0)
  }

  /**
   * Add timeout to operation
   */
  private async withTimeout<T>(promise: Promise<T>, operationName: string): Promise<T> {
    const timeoutMs = 10000 // 10 second default timeout
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(operationName, timeoutMs))
      }, timeoutMs)
    })
    
    return Promise.race([promise, timeoutPromise])
  }

  /**
   * Wrap error with retry context
   */
  private wrapError(error: Error, operationName: string, attempts: number): RepositoryError {
    if (error instanceof RepositoryError) {
      // Add retry context to existing RepositoryError
      error.context = {
        ...error.context,
        retryAttempts: attempts,
        finalAttempt: true
      }
      return error
    }
    
    // Wrap other errors
    return new RepositoryError(
      `Operation '${operationName}' failed after ${attempts} attempts: ${error.message}`,
      RepositoryErrorCode.UNKNOWN_ERROR,
      operationName,
      { retryAttempts: attempts, originalError: error.message },
      error
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// =============================================================================
// Circuit Breaker Pattern
// =============================================================================

export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    if (!this.config.enabled) {
      return operation()
    }

    // Check if circuit should be opened
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.config.resetTimeoutMs) {
        throw new RepositoryError(
          'Circuit breaker is open - operation not allowed',
          RepositoryErrorCode.UNKNOWN_ERROR,
          operationName,
          { circuitState: this.state, failures: this.failures }
        )
      } else {
        // Try to reset circuit
        this.state = 'half-open'
      }
    }

    try {
      const result = await operation()
      
      // Operation succeeded - reset circuit
      if (this.state === 'half-open') {
        this.reset()
      }
      
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open'
      console.warn(
        `Circuit breaker opened after ${this.failures} failures`,
        { threshold: this.config.failureThreshold, resetTimeout: this.config.resetTimeoutMs }
      )
    }
  }

  private reset(): void {
    this.failures = 0
    this.lastFailureTime = 0
    this.state = 'closed'
    console.info('Circuit breaker reset - service restored')
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// =============================================================================
// Error Classification and Recovery
// =============================================================================

export class ErrorClassifier {
  /**
   * Classify error and determine recovery strategy
   */
  static classifyError(error: Error): {
    category: 'transient' | 'permanent' | 'security' | 'unknown'
    isRetryable: boolean
    suggestedAction: string
  } {
    if (error instanceof RepositoryError) {
      switch (error.code) {
        case RepositoryErrorCode.NETWORK_ERROR:
        case RepositoryErrorCode.TIMEOUT_ERROR:
        case RepositoryErrorCode.STORAGE_FULL:
          return {
            category: 'transient',
            isRetryable: true,
            suggestedAction: 'Retry with exponential backoff'
          }
        
        case RepositoryErrorCode.CONFLICT_ERROR:
          return {
            category: 'transient',
            isRetryable: true,
            suggestedAction: 'Retry with latest data version'
          }
        
        case RepositoryErrorCode.PERMISSION_DENIED:
        case RepositoryErrorCode.ENCRYPTION_ERROR:
          return {
            category: 'security',
            isRetryable: false,
            suggestedAction: 'Check authentication and permissions'
          }
        
        case RepositoryErrorCode.VALIDATION_ERROR:
        case RepositoryErrorCode.SCHEMA_ERROR:
        case RepositoryErrorCode.NOT_FOUND:
          return {
            category: 'permanent',
            isRetryable: false,
            suggestedAction: 'Fix data or request parameters'
          }
        
        case RepositoryErrorCode.STORAGE_NOT_AVAILABLE:
        case RepositoryErrorCode.INITIALIZATION_ERROR:
          return {
            category: 'permanent',
            isRetryable: false,
            suggestedAction: 'Check system configuration'
          }
      }
    }
    
    return {
      category: 'unknown',
      isRetryable: false,
      suggestedAction: 'Investigate error details'
    }
  }
}

// =============================================================================
// Comprehensive Error Handler
// =============================================================================

export class RepositoryErrorHandler {
  private retryHandler: RetryHandler
  private circuitBreaker?: CircuitBreaker

  constructor(
    retryConfig?: RetryConfig,
    circuitBreakerConfig?: CircuitBreakerConfig
  ) {
    this.retryHandler = new RetryHandler(retryConfig)
    
    if (circuitBreakerConfig?.enabled) {
      this.circuitBreaker = new CircuitBreaker(circuitBreakerConfig)
    }
  }

  /**
   * Execute operation with full error handling, retry, and circuit breaker
   */
  async executeOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<OperationResult<T>> {
    const startTime = Date.now()
    
    try {
      const executor = this.circuitBreaker
        ? () => this.circuitBreaker!.execute(operation, operationName)
        : operation

      const result = await this.retryHandler.executeWithRetry(
        executor,
        operationName
      )

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
        operationId: this.generateOperationId(operationName)
      }
    } catch (error) {
      const repositoryError = this.normalizeError(error as Error, operationName)
      const classification = ErrorClassifier.classifyError(repositoryError)
      
      // Log error based on classification
      this.logError(repositoryError, classification, Date.now() - startTime)
      
      return {
        success: false,
        error: repositoryError,
        timestamp: Date.now(),
        operationId: this.generateOperationId(operationName)
      }
    }
  }

  /**
   * Normalize any error to RepositoryError
   */
  private normalizeError(error: Error, operationName: string): RepositoryError {
    if (error instanceof RepositoryError) {
      return error
    }

    // Map common error types
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      return new StorageFullError(operationName, 0, 0)
    }

    if (error.name === 'SecurityError' || error.message.includes('permission')) {
      return new PermissionDeniedError(operationName, 'storage')
    }

    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return new TimeoutError(operationName, 10000)
    }

    // Generic error wrapping
    return new RepositoryError(
      error.message,
      RepositoryErrorCode.UNKNOWN_ERROR,
      operationName,
      { originalErrorName: error.name },
      error
    )
  }

  /**
   * Log error based on classification and criticality
   */
  private logError(
    error: RepositoryError,
    classification: ReturnType<typeof ErrorClassifier.classifyError>,
    duration: number
  ): void {
    const logData = {
      operation: error.operation,
      code: error.code,
      category: classification.category,
      isRetryable: classification.isRetryable,
      duration,
      context: error.isCritical ? '[REDACTED]' : error.context
    }

    if (classification.category === 'security' || error.isCritical) {
      console.error('Security-related repository error:', logData)
    } else if (classification.category === 'permanent') {
      console.error('Permanent repository error:', logData)
    } else {
      console.warn('Repository error:', logData)
    }
  }

  private generateOperationId(operationName: string): string {
    return `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get circuit breaker state for monitoring
   */
  getCircuitBreakerState() {
    return this.circuitBreaker?.getState() || null
  }
}

// =============================================================================
// Error Factory for Common Scenarios
// =============================================================================

export class RepositoryErrorFactory {
  static notFound(entityType: string, id: string, operation: string): NotFoundError {
    return new NotFoundError(operation, id, entityType)
  }

  static validationFailed(operation: string, errors: string[], data?: any): ValidationError {
    return new ValidationError(operation, errors, data)
  }

  static storageNotAvailable(operation: string): StorageNotAvailableError {
    return new StorageNotAvailableError(operation)
  }

  static storageFull(operation: string, used: number, total: number): StorageFullError {
    return new StorageFullError(operation, used, total)
  }

  static conflict(operation: string, entityId: string, details?: any): ConflictError {
    return new ConflictError(operation, entityId, details)
  }

  static permissionDenied(operation: string, resource: string): PermissionDeniedError {
    return new PermissionDeniedError(operation, resource)
  }

  static encryptionFailed(operation: string, reason: string): EncryptionError {
    return new EncryptionError(operation, reason)
  }

  static timeout(operation: string, timeoutMs: number): TimeoutError {
    return new TimeoutError(operation, timeoutMs)
  }
}

// =============================================================================
// Type Guards
// =============================================================================

export function isStorageNotAvailableError(error: unknown): error is StorageNotAvailableError {
  return error instanceof StorageNotAvailableError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError
}

export function isEncryptionError(error: unknown): error is EncryptionError {
  return error instanceof EncryptionError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}