# useErrorHandler Hook

React hook for integrating with the centralized ErrorHandler system, providing error management capabilities to components.

## Import

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler'
```

## Return Value

```typescript
interface UseErrorHandlerReturn {
  // Error handling functions
  handleError: (
    error: Error | AppError | string,
    context?: Record<string, any>
  ) => AppError
  withErrorHandling: <T extends (...args: any[]) => any>(
    fn: T,
    context?: Record<string, any>
  ) => (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

  // State and history
  errorHistory: AppError[]
  lastError: AppError | null
  hasErrors: boolean

  // Utilities
  clearHistory: () => void
  getErrorsByType: (type: string) => AppError[]
  subscribe: (listener: (error: AppError) => void) => () => void
}
```

## Basic Usage

### Simple Error Handling

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler'

const MyComponent = () => {
  const { handleError, hasErrors, lastError } = useErrorHandler()

  const riskyOperation = async () => {
    try {
      await api.saveData(data)
    } catch (error) {
      handleError(error, {
        component: 'MyComponent',
        operation: 'saveData',
        data: data.id
      })
    }
  }

  return (
    <div>
      <button onClick={riskyOperation}>Save Data</button>
      {hasErrors && (
        <div className="error-banner">
          Last error: {lastError?.userMessage}
        </div>
      )}
    </div>
  )
}
```

### Automatic Error Wrapping

```typescript
const ComponentWithAutoErrorHandling = () => {
  const { withErrorHandling } = useErrorHandler()

  // Automatically wrap async functions with error handling
  const saveNote = withErrorHandling(
    async (noteData: NoteData) => {
      const result = await api.saveNote(noteData)
      showSuccessMessage('Note saved successfully')
      return result
    },
    { component: 'NoteEditor', action: 'save' }
  )

  const deleteNote = withErrorHandling(
    async (noteId: string) => {
      await api.deleteNote(noteId)
      showSuccessMessage('Note deleted')
    },
    { component: 'NoteEditor', action: 'delete' }
  )

  return (
    <div>
      <button onClick={() => saveNote(currentNote)}>Save</button>
      <button onClick={() => deleteNote(currentNote.id)}>Delete</button>
    </div>
  )
}
```

## Advanced Usage

### Error Context and Debugging

```typescript
const FormComponent = () => {
  const { handleError, withErrorHandling } = useErrorHandler()
  const [formData, setFormData] = useState({})

  const submitForm = withErrorHandling(
    async (data: FormData) => {
      await api.submitForm(data)
    },
    {
      component: 'FormComponent',
      formData: formData,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  )

  // Manual error handling with rich context
  const handleValidationError = (field: string, error: string) => {
    handleError(new Error(`Validation failed: ${error}`), {
      component: 'FormComponent',
      field,
      value: formData[field],
      formState: formData,
      validationRules: getValidationRules()
    })
  }

  return (
    <form onSubmit={() => submitForm(formData)}>
      {/* form fields */}
    </form>
  )
}
```

### Error Analytics and Monitoring

```typescript
const ComponentWithErrorAnalytics = () => {
  const {
    errorHistory,
    getErrorsByType,
    subscribe,
    clearHistory
  } = useErrorHandler()

  // Subscribe to new errors for analytics
  useEffect(() => {
    const unsubscribe = subscribe((error: AppError) => {
      // Send to analytics
      analytics.track('error_occurred', {
        severity: error.severity,
        message: error.message,
        userMessage: error.userMessage,
        context: error.context,
        timestamp: error.timestamp
      })

      // Send critical errors to monitoring service
      if (error.severity === ErrorSeverity.CRITICAL) {
        errorMonitoring.captureException(error, {
          tags: {
            component: error.context?.component,
            action: error.context?.action
          }
        })
      }
    })

    return unsubscribe
  }, [subscribe])

  // Generate error report
  const generateErrorReport = () => {
    const networkErrors = getErrorsByType('NETWORK_ERROR')
    const validationErrors = getErrorsByType('VALIDATION_ERROR')

    const report = {
      totalErrors: errorHistory.length,
      networkErrors: networkErrors.length,
      validationErrors: validationErrors.length,
      criticalErrors: errorHistory.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      timeRange: {
        oldest: errorHistory[0]?.timestamp,
        newest: errorHistory[errorHistory.length - 1]?.timestamp
      }
    }

    downloadReport(report)
  }

  return (
    <div>
      <div>Total Errors: {errorHistory.length}</div>
      <button onClick={generateErrorReport}>Download Error Report</button>
      <button onClick={clearHistory}>Clear Error History</button>
    </div>
  )
}
```

### Integration with Toast Notifications

```typescript
const ComponentWithToastIntegration = () => {
  const { handleError, subscribe } = useErrorHandler()
  const { showToast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribe((error: AppError) => {
      // Show toast based on error severity
      const toastConfig = {
        [ErrorSeverity.LOW]: null, // No toast
        [ErrorSeverity.MEDIUM]: {
          type: 'warning' as const,
          duration: 4000
        },
        [ErrorSeverity.HIGH]: {
          type: 'error' as const,
          duration: 6000
        },
        [ErrorSeverity.CRITICAL]: {
          type: 'error' as const,
          duration: 0, // Persistent
          actions: [
            {
              label: 'Reload',
              action: () => window.location.reload()
            }
          ]
        }
      }

      const config = toastConfig[error.severity]
      if (config) {
        showToast({
          ...config,
          message: error.userMessage,
          details: error.message
        })
      }
    })

    return unsubscribe
  }, [subscribe, showToast])

  const performAction = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      // This will trigger the toast notification via subscription
      handleError(error, {
        component: 'ComponentWithToastIntegration',
        action: 'performAction'
      })
    }
  }

  return <button onClick={performAction}>Perform Action</button>
}
```

### Error Recovery and Retry Logic

```typescript
const ComponentWithRetry = () => {
  const { withErrorHandling, handleError } = useErrorHandler()
  const [retryCount, setRetryCount] = useState(0)

  const operationWithRetry = withErrorHandling(
    async (data: any, attempt: number = 1) => {
      try {
        const result = await api.unreliableOperation(data)
        setRetryCount(0) // Reset on success
        return result
      } catch (error) {
        if (attempt < 3) {
          // Retry with exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))

          setRetryCount(attempt)
          return operationWithRetry(data, attempt + 1)
        }

        // Final attempt failed
        throw error
      }
    },
    {
      component: 'ComponentWithRetry',
      maxRetries: 3
    }
  )

  return (
    <div>
      {retryCount > 0 && (
        <div>Retrying... (Attempt {retryCount}/3)</div>
      )}
      <button onClick={() => operationWithRetry(data)}>
        Try Operation
      </button>
    </div>
  )
}
```

### Error Boundaries Integration

```typescript
const ComponentWithErrorBoundary = () => {
  const { handleError } = useErrorHandler()

  // Handle errors that escape to Error Boundary
  const handleComponentError = (error: Error, errorInfo: ErrorInfo) => {
    handleError(error, {
      component: 'ComponentWithErrorBoundary',
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorBoundaryStack: errorInfo.errorStack
    })
  }

  return (
    <ErrorBoundary onError={handleComponentError}>
      <RiskyChildComponent />
    </ErrorBoundary>
  )
}
```

## Form Validation Integration

```typescript
const FormWithValidationErrors = () => {
  const { handleError } = useErrorHandler()
  const { values, errors, validateField } = useFormValidation({...})

  const handleFieldError = (fieldName: string, error: string) => {
    handleError(error, {
      component: 'FormWithValidationErrors',
      field: fieldName,
      value: values[fieldName],
      formErrors: errors,
      validationType: 'field'
    })
  }

  const handleFormError = (formErrors: Record<string, string>) => {
    const errorMessage = Object.entries(formErrors)
      .map(([field, error]) => `${field}: ${error}`)
      .join(', ')

    handleError(`Form validation failed: ${errorMessage}`, {
      component: 'FormWithValidationErrors',
      formErrors,
      formData: values,
      validationType: 'form'
    })
  }

  return (
    <form>
      {/* form fields with validation error handling */}
    </form>
  )
}
```

## Network Error Handling

```typescript
const ComponentWithNetworkHandling = () => {
  const { withErrorHandling, getErrorsByType } = useErrorHandler()

  const fetchData = withErrorHandling(
    async () => {
      const response = await fetch('/api/data')

      if (!response.ok) {
        // Create specific network error
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.name = 'NetworkError'
        throw error
      }

      return response.json()
    },
    {
      component: 'ComponentWithNetworkHandling',
      operation: 'fetchData',
      url: '/api/data'
    }
  )

  // Check for recent network errors
  const hasRecentNetworkErrors = () => {
    const networkErrors = getErrorsByType('NETWORK_ERROR')
    const recentErrors = networkErrors.filter(
      error => Date.now() - error.timestamp.getTime() < 60000 // Last minute
    )
    return recentErrors.length > 0
  }

  return (
    <div>
      {hasRecentNetworkErrors() && (
        <div className="network-warning">
          Network issues detected. Some features may be limited.
        </div>
      )}
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  )
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorHandler } from '../useErrorHandler'

describe('useErrorHandler', () => {
  beforeEach(() => {
    // Clear error handler history before each test
    const errorHandler = ErrorHandler.getInstance()
    errorHandler.clearHistory()
  })

  it('should handle errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler())

    act(() => {
      result.current.handleError('Test error', { test: true })
    })

    expect(result.current.hasErrors).toBe(true)
    expect(result.current.lastError?.message).toBe('Test error')
    expect(result.current.errorHistory).toHaveLength(1)
  })

  it('should wrap functions with error handling', async () => {
    const { result } = renderHook(() => useErrorHandler())
    const mockFn = vi.fn().mockRejectedValue(new Error('Function error'))

    const wrappedFn = result.current.withErrorHandling(mockFn, { test: true })

    await act(async () => {
      await expect(wrappedFn()).rejects.toThrow('Function error')
    })

    expect(result.current.hasErrors).toBe(true)
    expect(result.current.lastError?.context).toEqual({ test: true })
  })

  it('should filter errors by type', () => {
    const { result } = renderHook(() => useErrorHandler())

    act(() => {
      result.current.handleError('Network error')
      result.current.handleError('Validation error')
      result.current.handleError('Another network error')
    })

    const networkErrors = result.current.getErrorsByType('NETWORK_ERROR')
    expect(networkErrors).toHaveLength(2)
  })

  it('should subscribe to new errors', () => {
    const { result } = renderHook(() => useErrorHandler())
    const listener = vi.fn()

    act(() => {
      const unsubscribe = result.current.subscribe(listener)
      result.current.handleError('Test error')
      unsubscribe()
    })

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' })
    )
  })
})
```

## Best Practices

1. **Provide meaningful context** - Include component name, action, and relevant data
2. **Use withErrorHandling for async operations** - Automatic error catching and context
3. **Subscribe for global error handling** - Toast notifications, analytics, monitoring
4. **Handle different error types appropriately** - Network, validation, system errors
5. **Clear error history periodically** - Prevent memory leaks in long-running apps
6. **Test error scenarios** - Verify error handling works as expected
7. **Monitor error patterns** - Use analytics to identify common issues

## Configuration Options

### Custom Error Classification

```typescript
const useCustomErrorHandler = () => {
  const errorHandler = useErrorHandler()

  const customHandleError = (error: Error, context?: Record<string, any>) => {
    // Add custom classification logic
    if (error.message.includes('timeout')) {
      context = { ...context, errorType: 'TIMEOUT' }
    }

    return errorHandler.handleError(error, context)
  }

  return {
    ...errorHandler,
    handleError: customHandleError,
  }
}
```

### Environment-specific Handling

```typescript
const useEnvironmentErrorHandler = () => {
  const errorHandler = useErrorHandler()

  const handleError = (error: Error, context?: Record<string, any>) => {
    const enhancedContext = {
      ...context,
      environment: process.env.NODE_ENV,
      buildVersion: process.env.REACT_APP_VERSION,
      userAgent: navigator.userAgent,
    }

    // In development, show more details
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error, enhancedContext)
    }

    return errorHandler.handleError(error, enhancedContext)
  }

  return { ...errorHandler, handleError }
}
```

## Related Components

- `ErrorHandler` - Core error management system
- `Toast` - UI notifications for errors
- `useFormValidation` - Form validation with error handling
- `useSync` - Sync operations with error handling
