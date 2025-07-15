# Error Boundary Components

A comprehensive set of React Error Boundary components designed to gracefully handle different types of application errors with appropriate recovery strategies and user feedback.

## Available Error Boundaries

```typescript
import ComponentErrorBoundary from '../errors/ComponentErrorBoundary'
import StorageErrorBoundary from '../errors/StorageErrorBoundary'
import SearchErrorBoundary from '../errors/SearchErrorBoundary'
```

## ComponentErrorBoundary

Generic error boundary for wrapping individual components with custom error handling and recovery options.

### Props

```typescript
interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  componentName: string // Name for error identification
  fallback?: React.ReactNode // Custom error UI
  title?: string // Custom error title
  message?: string // Custom error message
  resetLabel?: string // Custom reset button text
  allowReload?: boolean // Show reload page button
  showDetails?: boolean // Show error details (dev mode default)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}
```

### Basic Usage

```typescript
import ComponentErrorBoundary from '../errors/ComponentErrorBoundary'

const MyApp = () => {
  return (
    <ComponentErrorBoundary
      componentName="MarkdownEditor"
      title="Editor Failed to Load"
      message="The markdown editor encountered an error. You can try to reload it."
      onError={(error, errorInfo) => {
        console.log('Editor error:', error)
        // Send to analytics
      }}
    >
      <MarkdownEditor />
    </ComponentErrorBoundary>
  )
}
```

### Advanced Usage

```typescript
const AdvancedErrorHandling = () => {
  const [retryCount, setRetryCount] = useState(0)

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to error monitoring service
    errorMonitoring.captureException(error, {
      tags: { component: 'HeavyComponent', retryCount },
      extra: errorInfo
    })

    setRetryCount(prev => prev + 1)
  }

  const handleReset = () => {
    // Custom reset logic
    clearComponentState()
    setRetryCount(0)
  }

  return (
    <ComponentErrorBoundary
      componentName="HeavyComponent"
      title={retryCount > 2 ? "Component Repeatedly Failing" : "Component Error"}
      message={
        retryCount > 2
          ? "This component has failed multiple times. Consider reloading the page."
          : "The component failed to load. You can try again."
      }
      resetLabel={retryCount > 2 ? "Force Retry" : "Try Again"}
      allowReload={retryCount > 2}
      showDetails={true}
      onError={handleError}
      onReset={handleReset}
    >
      <HeavyComponent />
    </ComponentErrorBoundary>
  )
}
```

### Custom Fallback UI

```typescript
const CustomFallback = ({ error, reset }: { error: Error, reset: () => void }) => (
  <div className="custom-error-container">
    <h2>Oops! Something went wrong</h2>
    <p>Component failed: {error.message}</p>
    <button onClick={reset}>Try Again</button>
    <button onClick={() => window.location.reload()}>Reload Page</button>
  </div>
)

const ComponentWithCustomError = () => {
  return (
    <ComponentErrorBoundary
      componentName="CustomComponent"
      fallback={<CustomFallback />}
    >
      <CustomComponent />
    </ComponentErrorBoundary>
  )
}
```

## StorageErrorBoundary

Specialized error boundary for handling localStorage/storage-related errors with data recovery options.

### Props

```typescript
interface StorageErrorBoundaryProps {
  children: React.ReactNode
  clearStorageOnRetry?: boolean // Clear localStorage on retry
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onRetry?: () => void
}
```

### Basic Usage

```typescript
import StorageErrorBoundary from '../errors/StorageErrorBoundary'

const App = () => {
  return (
    <StorageErrorBoundary
      clearStorageOnRetry={true}
      onError={(error) => {
        console.log('Storage error:', error)
        // Notify user about potential data loss
      }}
      onRetry={() => {
        // Reload app state after storage clear
        window.location.reload()
      }}
    >
      <MainApp />
    </StorageErrorBoundary>
  )
}
```

### Advanced Storage Recovery

```typescript
const AppWithStorageRecovery = () => {
  const [backupData, setBackupData] = useState(null)

  const handleStorageError = (error: Error) => {
    // Try to backup critical data before clearing storage
    try {
      const criticalData = {
        settings: localStorage.getItem('app_settings'),
        drafts: localStorage.getItem('draft_notes')
      }
      setBackupData(criticalData)
    } catch (backupError) {
      console.error('Failed to backup data:', backupError)
    }
  }

  const handleRetry = () => {
    // Restore backed up data after storage clear
    if (backupData) {
      try {
        Object.entries(backupData).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value)
        })
      } catch (restoreError) {
        console.error('Failed to restore backup:', restoreError)
      }
    }

    // Reload app
    window.location.reload()
  }

  return (
    <StorageErrorBoundary
      clearStorageOnRetry={true}
      onError={handleStorageError}
      onRetry={handleRetry}
    >
      <MainApp />
    </StorageErrorBoundary>
  )
}
```

### Storage Quota Handling

```typescript
const StorageQuotaManager = () => {
  const [storageInfo, setStorageInfo] = useState(null)

  useEffect(() => {
    // Check storage quota on mount
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageInfo(estimate)
      })
    }
  }, [])

  const handleStorageError = (error: Error) => {
    if (error.message.includes('QuotaExceededError') ||
        error.message.includes('storage quota')) {
      // Handle quota exceeded specifically
      showQuotaExceededDialog(storageInfo)
    }
  }

  return (
    <StorageErrorBoundary
      clearStorageOnRetry={false} // Don't auto-clear on quota errors
      onError={handleStorageError}
    >
      <NotesApp />
    </StorageErrorBoundary>
  )
}
```

## SearchErrorBoundary

Specialized error boundary for search operations with query clearing and search recovery.

### Props

```typescript
interface SearchErrorBoundaryProps {
  children: React.ReactNode
  fallbackMessage?: string // Custom error message
  showDetails?: boolean // Show error details (dev mode default)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onClearSearch?: () => void // Clear search state
  onClose?: () => void // Close search interface
}
```

### Basic Usage

```typescript
import SearchErrorBoundary from '../errors/SearchErrorBoundary'

const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SearchErrorBoundary
      fallbackMessage="Your search encountered an error. Try simplifying your search terms."
      onClearSearch={() => setSearchQuery('')}
      onClose={() => closeSearchModal()}
      onError={(error) => {
        // Log search errors for analysis
        analytics.track('search_error', {
          query: searchQuery,
          error: error.message
        })
      }}
    >
      <SearchResults query={searchQuery} />
    </SearchErrorBoundary>
  )
}
```

### Complex Search Error Handling

```typescript
const AdvancedSearchInterface = () => {
  const [searchState, setSearchState] = useState({
    query: '',
    filters: {},
    worker: null
  })

  const handleSearchError = (error: Error) => {
    // Classify error types
    if (error.message.includes('worker')) {
      // Web Worker error - fall back to main thread
      setSearchState(prev => ({
        ...prev,
        worker: null,
        useMainThread: true
      }))
    } else if (error.message.includes('timeout')) {
      // Search timeout - simplify query
      showTimeoutSuggestion()
    } else {
      // Generic search error
      logSearchError(error, searchState)
    }
  }

  const clearSearchState = () => {
    setSearchState({
      query: '',
      filters: {},
      worker: null
    })
  }

  return (
    <SearchErrorBoundary
      fallbackMessage="Search failed. Try a simpler query or check your filters."
      onClearSearch={clearSearchState}
      onError={handleSearchError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <SearchWithWorker searchState={searchState} />
    </SearchErrorBoundary>
  )
}
```

## Nested Error Boundaries

### Hierarchical Error Handling

```typescript
const AppWithHierarchicalErrorHandling = () => {
  return (
    // Top-level: Catch critical app errors
    <ComponentErrorBoundary
      componentName="Application"
      title="Application Error"
      message="The application encountered a critical error."
      allowReload={true}
    >
      {/* Storage-level: Handle data persistence errors */}
      <StorageErrorBoundary clearStorageOnRetry={true}>

        {/* Feature-level: Handle specific feature errors */}
        <ComponentErrorBoundary
          componentName="NotesFeature"
          title="Notes Feature Error"
          message="The notes feature failed to load."
        >
          <NotesContainer />
        </ComponentErrorBoundary>

        {/* Search-level: Handle search-specific errors */}
        <SearchErrorBoundary
          onClearSearch={() => clearSearchState()}
        >
          <SearchFeature />
        </SearchErrorBoundary>

      </StorageErrorBoundary>
    </ComponentErrorBoundary>
  )
}
```

### Selective Error Boundaries

```typescript
const SelectiveErrorBoundaries = () => {
  const [features, setFeatures] = useState({
    editor: true,
    search: true,
    sync: true
  })

  const disableFeature = (feature: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: false
    }))
  }

  return (
    <div>
      {features.editor && (
        <ComponentErrorBoundary
          componentName="Editor"
          onError={() => disableFeature('editor')}
        >
          <EditorComponent />
        </ComponentErrorBoundary>
      )}

      {features.search && (
        <SearchErrorBoundary
          onError={() => disableFeature('search')}
        >
          <SearchComponent />
        </SearchErrorBoundary>
      )}

      {features.sync && (
        <ComponentErrorBoundary
          componentName="Sync"
          onError={() => disableFeature('sync')}
        >
          <SyncComponent />
        </ComponentErrorBoundary>
      )}

      {/* Fallback when all features disabled */}
      {!Object.values(features).some(Boolean) && (
        <div>All features disabled. Please reload the page.</div>
      )}
    </div>
  )
}
```

## Error Recovery Strategies

### Retry with Exponential Backoff

```typescript
const RetryableComponent = () => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleErrorWithRetry = async (error: Error) => {
    if (retryCount < 3) {
      setIsRetrying(true)

      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))

      setRetryCount(prev => prev + 1)
      setIsRetrying(false)

      // Trigger component remount
      forceUpdate()
    }
  }

  return (
    <ComponentErrorBoundary
      componentName="RetryableComponent"
      title={isRetrying ? "Retrying..." : "Component Error"}
      message={
        retryCount >= 3
          ? "Component failed after multiple retries"
          : "Attempting to recover..."
      }
      resetLabel={isRetrying ? "Retrying..." : "Try Again"}
      onError={handleErrorWithRetry}
    >
      <UnstableComponent />
    </ComponentErrorBoundary>
  )
}
```

### Progressive Degradation

```typescript
const ProgressiveDegradationComponent = () => {
  const [degradationLevel, setDegradationLevel] = useState(0)

  const handleError = (error: Error) => {
    setDegradationLevel(prev => prev + 1)
  }

  const ComponentToRender = [
    FullFeaturedComponent,
    ReducedFeaturesComponent,
    BasicComponent,
    FallbackComponent
  ][Math.min(degradationLevel, 3)]

  return (
    <ComponentErrorBoundary
      componentName="ProgressiveComponent"
      title="Feature Degraded"
      message={`Running in ${['full', 'reduced', 'basic', 'fallback'][degradationLevel]} mode`}
      onError={handleError}
    >
      <ComponentToRender />
    </ComponentErrorBoundary>
  )
}
```

## Integration with Error Monitoring

### Sentry Integration

```typescript
import * as Sentry from '@sentry/react'

const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => <div>{children}</div>,
  {
    fallback: ({ error, resetError }) => (
      <ComponentErrorBoundary
        componentName="SentryWrapped"
        title="Application Error"
        message="An unexpected error occurred. Our team has been notified."
        onReset={resetError}
      >
        <div>Error: {error.message}</div>
      </ComponentErrorBoundary>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true)
      scope.setContext('errorInfo', errorInfo)
    }
  }
)
```

### Custom Error Reporting

```typescript
const ErrorReportingBoundary = ({ children }) => {
  const handleError = async (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to custom error service
    try {
      await errorReportingService.report({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: errorInfo.errorBoundary
        },
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  return (
    <ComponentErrorBoundary
      componentName="ErrorReporting"
      onError={handleError}
    >
      {children}
    </ComponentErrorBoundary>
  )
}
```

## Testing Error Boundaries

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComponentErrorBoundary from '../ComponentErrorBoundary'

// Component that throws error for testing
const ThrowError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ComponentErrorBoundary', () => {
  it('should catch and display error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError />
      </ComponentErrorBoundary>
    )

    expect(screen.getByText(/TestComponent Error/)).toBeInTheDocument()
    expect(screen.getByText(/Try Again/)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should call onError when error occurs', () => {
    const onError = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ComponentErrorBoundary
        componentName="TestComponent"
        onError={onError}
      >
        <ThrowError />
      </ComponentErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )

    consoleSpy.mockRestore()
  })

  it('should reset error state when reset button clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )

    expect(screen.getByText(/TestComponent Error/)).toBeInTheDocument()

    // Click reset and re-render with no error
    fireEvent.click(screen.getByText('Try Again'))

    rerender(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={false} />
      </ComponentErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
```

## Best Practices

1. **Use specific error boundaries** - Different types for different error scenarios
2. **Provide clear error messages** - Help users understand what went wrong
3. **Offer recovery options** - Reset, reload, or clear data as appropriate
4. **Log errors appropriately** - Send to monitoring services for analysis
5. **Test error scenarios** - Verify error boundaries work correctly
6. **Implement fallback UI** - Always provide alternative interface
7. **Handle nested errors** - Use hierarchy for progressive error handling

## Error Boundary Hierarchy

```
Application Level (ComponentErrorBoundary)
├── Storage Level (StorageErrorBoundary)
│   ├── Feature Level (ComponentErrorBoundary)
│   │   ├── Search Level (SearchErrorBoundary)
│   │   └── Editor Level (ComponentErrorBoundary)
│   └── Sync Level (ComponentErrorBoundary)
└── Network Level (ComponentErrorBoundary)
```

## Related Components

- `ErrorHandler` - Centralized error management system
- `useErrorHandler` - Hook for error handling integration
- `Toast` - User notifications for errors
- `LazyComponents` - Error boundaries for lazy-loaded components
