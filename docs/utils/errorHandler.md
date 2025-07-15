# ErrorHandler Utility

A centralized error management system with automatic classification, severity levels, and user-friendly messaging.

## Import

```typescript
import { ErrorHandler, AppError, ErrorSeverity } from '../utils/errorHandler'
```

## Core Classes

### ErrorHandler (Singleton)

```typescript
class ErrorHandler {
  static getInstance(): ErrorHandler
  handleError(
    error: Error | AppError | string,
    context?: Record<string, any>
  ): AppError
  getErrorHistory(): AppError[]
  clearHistory(): void
  subscribe(listener: (error: AppError) => void): () => void
}
```

### AppError

```typescript
class AppError extends Error {
  public readonly severity: ErrorSeverity
  public readonly userMessage: string
  public readonly timestamp: Date
  public readonly context?: Record<string, any>
  public readonly code?: string
}
```

## Error Severities

```typescript
enum ErrorSeverity {
  LOW = 'low', // Minor issues, logging only
  MEDIUM = 'medium', // User action required
  HIGH = 'high', // Critical errors, immediate attention
  CRITICAL = 'critical', // System failures, emergency handling
}
```

## Basic Usage

### Singleton Instance

```typescript
import { ErrorHandler } from '../utils/errorHandler'

const errorHandler = ErrorHandler.getInstance()

// Handle different types of errors
try {
  await riskyOperation()
} catch (error) {
  const appError = errorHandler.handleError(error, {
    operation: 'saveNote',
    noteId: 'note-123',
  })

  console.log('Error severity:', appError.severity)
  console.log('User message:', appError.userMessage)
}
```

### Creating Custom Errors

```typescript
import { AppError, ErrorSeverity } from '../utils/errorHandler'

// Create specific error types
const validationError = new AppError(
  'Validation failed',
  ErrorSeverity.MEDIUM,
  'Please check your input and try again',
  { field: 'email', value: 'invalid-email' },
  'VALIDATION_ERROR'
)

const networkError = new AppError(
  'Network request failed',
  ErrorSeverity.HIGH,
  'Connection lost. Please check your internet connection',
  { url: '/api/notes', method: 'POST' },
  'NETWORK_ERROR'
)
```

## Error Classification

The ErrorHandler automatically classifies errors based on message content:

### Network Errors (HIGH severity)

- Connection timeout
- Network unavailable
- DNS resolution failed
- Certificate errors

### Permission Errors (MEDIUM severity)

- Access denied
- Insufficient permissions
- Authentication required

### Validation Errors (MEDIUM severity)

- Invalid input format
- Required field missing
- Data type mismatch

### System Errors (CRITICAL severity)

- Out of memory
- Disk full
- System crash

```typescript
// Automatic classification examples
errorHandler.handleError('Network timeout')
// → HIGH severity, "Connection issue detected"

errorHandler.handleError('Permission denied')
// → MEDIUM severity, "Access denied. Please check permissions"

errorHandler.handleError('Validation failed: email required')
// → MEDIUM severity, "Please check your input"

errorHandler.handleError('OutOfMemoryError')
// → CRITICAL severity, "System error occurred"
```

## Advanced Usage

### Error Context and Debugging

```typescript
const handleNoteOperation = async (noteId: string, operation: string) => {
  try {
    await performOperation(noteId, operation)
  } catch (error) {
    const appError = errorHandler.handleError(error, {
      noteId,
      operation,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    // Context is automatically included in error logs
    console.log('Full error context:', appError.context)
  }
}
```

### Error History and Analytics

```typescript
// Get error history for analytics
const errorHistory = errorHandler.getErrorHistory()

// Analyze error patterns
const criticalErrors = errorHistory.filter(
  e => e.severity === ErrorSeverity.CRITICAL
)
const networkErrors = errorHistory.filter(e => e.code === 'NETWORK_ERROR')

// Generate error report
const errorReport = {
  totalErrors: errorHistory.length,
  severityBreakdown: {
    critical: errorHistory.filter(e => e.severity === ErrorSeverity.CRITICAL)
      .length,
    high: errorHistory.filter(e => e.severity === ErrorSeverity.HIGH).length,
    medium: errorHistory.filter(e => e.severity === ErrorSeverity.MEDIUM)
      .length,
    low: errorHistory.filter(e => e.severity === ErrorSeverity.LOW).length,
  },
  commonErrors: getTopErrors(errorHistory, 5),
}
```

### Error Listeners and Notifications

```typescript
// Subscribe to errors for real-time handling
const unsubscribe = errorHandler.subscribe((error: AppError) => {
  // Show toast notification
  if (
    error.severity === ErrorSeverity.HIGH ||
    error.severity === ErrorSeverity.CRITICAL
  ) {
    showToast({
      type: 'error',
      message: error.userMessage,
      duration: 5000,
    })
  }

  // Log to analytics
  analytics.track('error_occurred', {
    severity: error.severity,
    code: error.code,
    context: error.context,
  })

  // Send to error monitoring service
  if (error.severity === ErrorSeverity.CRITICAL) {
    errorMonitoring.captureException(error)
  }
})

// Clean up listener
unsubscribe()
```

## Integration with React Hook

### useErrorHandler Hook

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler'

const MyComponent = () => {
  const { handleError, withErrorHandling, errorHistory } = useErrorHandler()

  // Manually handle errors
  const saveNote = async () => {
    try {
      await api.saveNote(noteData)
    } catch (error) {
      handleError(error, { component: 'MyComponent', action: 'saveNote' })
    }
  }

  // Automatic error handling wrapper
  const deleteNote = withErrorHandling(
    async (noteId: string) => {
      await api.deleteNote(noteId)
      showSuccessMessage('Note deleted successfully')
    },
    { component: 'MyComponent', action: 'deleteNote' }
  )

  return (
    <div>
      <button onClick={saveNote}>Save Note</button>
      <button onClick={() => deleteNote('note-123')}>Delete Note</button>
      {errorHistory.length > 0 && (
        <div>Recent errors: {errorHistory.length}</div>
      )}
    </div>
  )
}
```

## Error Recovery Strategies

### Retry Mechanisms

```typescript
const withRetry = async (operation: () => Promise<any>, maxRetries = 3) => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      const appError = errorHandler.handleError(error, {
        attempt,
        maxRetries,
      })

      // Don't retry on validation errors
      if (
        appError.severity === ErrorSeverity.MEDIUM &&
        appError.code === 'VALIDATION_ERROR'
      ) {
        throw appError
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    }
  }

  throw errorHandler.handleError(lastError!, {
    finalAttempt: true,
    totalAttempts: maxRetries,
  })
}

// Usage
const saveWithRetry = async (data: any) => {
  return withRetry(() => api.save(data))
}
```

### Graceful Degradation

```typescript
const handleFeatureError = (feature: string, error: Error) => {
  const appError = errorHandler.handleError(error, { feature })

  switch (appError.severity) {
    case ErrorSeverity.LOW:
      // Continue with reduced functionality
      console.warn(`Feature ${feature} degraded:`, appError.userMessage)
      break

    case ErrorSeverity.MEDIUM:
      // Disable feature temporarily
      disableFeature(feature)
      showWarning(`${feature} temporarily unavailable`)
      break

    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      // Fall back to safe mode
      enableSafeMode()
      showError('Application running in safe mode')
      break
  }
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler, AppError, ErrorSeverity } from '../errorHandler'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance()
    errorHandler.clearHistory()
  })

  it('should classify network errors correctly', () => {
    const error = errorHandler.handleError('Network timeout occurred')

    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.userMessage).toBe(
      'Connection issue detected. Please try again'
    )
    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('should handle custom AppError instances', () => {
    const customError = new AppError(
      'Custom error',
      ErrorSeverity.MEDIUM,
      'Custom user message',
      { custom: 'context' },
      'CUSTOM_ERROR'
    )

    const result = errorHandler.handleError(customError)

    expect(result).toBe(customError)
    expect(result.context).toEqual({ custom: 'context' })
  })

  it('should maintain error history', () => {
    errorHandler.handleError('Error 1')
    errorHandler.handleError('Error 2')

    const history = errorHandler.getErrorHistory()
    expect(history).toHaveLength(2)
    expect(history[0].message).toBe('Error 1')
    expect(history[1].message).toBe('Error 2')
  })

  it('should notify subscribers', () => {
    const mockListener = vi.fn()
    const unsubscribe = errorHandler.subscribe(mockListener)

    const error = errorHandler.handleError('Test error')

    expect(mockListener).toHaveBeenCalledWith(error)

    unsubscribe()
  })
})
```

## Best Practices

1. **Use appropriate severity levels** - Don't overuse CRITICAL severity
2. **Provide helpful user messages** - Technical details go in the message, user-friendly text in userMessage
3. **Include relevant context** - Add debugging information without exposing sensitive data
4. **Subscribe to errors for monitoring** - Set up proper error tracking and analytics
5. **Implement retry logic** - Handle transient failures gracefully
6. **Test error scenarios** - Write tests for both happy path and error conditions

## Integration with Toast Notifications

```typescript
// Automatic toast notifications based on severity
errorHandler.subscribe((error: AppError) => {
  const toastConfig = {
    [ErrorSeverity.LOW]: null, // No toast for low severity
    [ErrorSeverity.MEDIUM]: { type: 'warning', duration: 4000 },
    [ErrorSeverity.HIGH]: { type: 'error', duration: 6000 },
    [ErrorSeverity.CRITICAL]: { type: 'error', duration: 0 }, // Persistent
  }

  const config = toastConfig[error.severity]
  if (config) {
    showToast({
      ...config,
      message: error.userMessage,
      details: error.message,
      actions:
        error.severity === ErrorSeverity.CRITICAL
          ? [{ label: 'Reload', action: () => window.location.reload() }]
          : undefined,
    })
  }
})
```

## Related Components

- `useErrorHandler` - React hook for error integration
- `Toast` - UI component for error notifications
- `ValidationMessage` - Form validation error display
- `SyncManager` - Handles sync-related errors
