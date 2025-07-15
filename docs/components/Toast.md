# Toast Component System

A comprehensive notification system with Toast components and ToastContainer for displaying user feedback messages.

## Import

```typescript
import { Toast, ToastContainer, useToast } from '../components/ui/Toast'
```

## Components

### Toast Component

Individual toast notification with customizable appearance and actions.

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
  actions?: ToastAction[]
  duration?: number
  onClose?: () => void
  className?: string
}
```

### ToastContainer

Container that manages multiple toast notifications with positioning and animations.

```typescript
interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
  maxToasts?: number
  defaultDuration?: number
}
```

### useToast Hook

React hook for managing toast notifications programmatically.

```typescript
interface UseToastReturn {
  showToast: (config: ToastConfig) => string
  hideToast: (id: string) => void
  clearAll: () => void
  toasts: ToastData[]
}
```

## Basic Usage

### Simple Toast Notifications

```typescript
import { useToast } from '../components/ui/Toast'

const MyComponent = () => {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast({
      type: 'success',
      message: 'Note saved successfully!',
      duration: 3000
    })
  }

  const handleError = () => {
    showToast({
      type: 'error',
      message: 'Failed to save note',
      details: 'Please check your connection and try again',
      duration: 5000
    })
  }

  const handleWarning = () => {
    showToast({
      type: 'warning',
      message: 'Unsaved changes detected',
      actions: [
        { label: 'Save', action: () => saveChanges() },
        { label: 'Discard', action: () => discardChanges() }
      ]
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
    </div>
  )
}
```

### Setting Up ToastContainer

```typescript
// In your App.tsx or root component
import { ToastContainer } from '../components/ui/Toast'

const App = () => {
  return (
    <div className="app">
      {/* Your app content */}
      <MainContent />

      {/* Toast container - usually at the end */}
      <ToastContainer
        position="top-right"
        maxToasts={5}
        defaultDuration={4000}
      />
    </div>
  )
}
```

## Toast Types and Styling

### Success Toasts

```typescript
// Success notification with green styling
const showSuccessToast = () => {
  showToast({
    type: 'success',
    message: 'Operation completed successfully',
    duration: 3000,
  })
}

// Success with details
const showDetailedSuccess = () => {
  showToast({
    type: 'success',
    message: 'Note synchronized',
    details: 'All changes have been saved to the cloud',
    duration: 4000,
  })
}
```

### Error Toasts

```typescript
// Error notification with red styling
const showErrorToast = () => {
  showToast({
    type: 'error',
    message: 'Sync failed',
    details: 'Unable to connect to server. Check your internet connection.',
    duration: 0, // Persistent until manually closed
    actions: [
      { label: 'Retry', action: () => retrySyncOperation() },
      { label: 'Work Offline', action: () => enableOfflineMode() },
    ],
  })
}
```

### Warning Toasts

```typescript
// Warning notification with yellow/orange styling
const showWarningToast = () => {
  showToast({
    type: 'warning',
    message: 'Large file detected',
    details: 'This file is over 10MB and may take longer to sync',
    actions: [
      { label: 'Continue', action: () => proceedWithUpload() },
      { label: 'Compress', action: () => compressFile() },
    ],
  })
}
```

### Info Toasts

```typescript
// Info notification with blue styling
const showInfoToast = () => {
  showToast({
    type: 'info',
    message: 'New features available',
    details: 'Update to the latest version to access new functionality',
    actions: [
      { label: 'Update Now', action: () => triggerUpdate() },
      { label: 'Later', action: () => remindLater() },
    ],
  })
}
```

## Advanced Usage

### Toast with Progress

```typescript
const showProgressToast = () => {
  const toastId = showToast({
    type: 'info',
    message: 'Uploading files...',
    duration: 0, // Don't auto-dismiss
    progress: 0,
  })

  // Update progress
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    updateToast(toastId, {
      message: `Uploading files... ${progress}%`,
      progress,
    })

    if (progress >= 100) {
      clearInterval(interval)
      updateToast(toastId, {
        type: 'success',
        message: 'Upload complete!',
        duration: 3000,
      })
    }
  }, 500)
}
```

### Custom Actions

```typescript
const showConflictToast = (conflict: SyncConflict) => {
  showToast({
    type: 'warning',
    message: 'Sync conflict detected',
    details: `The note "${conflict.localNote.title}" has conflicting changes`,
    duration: 0,
    actions: [
      {
        label: 'Keep Local',
        action: () => resolveConflict(conflict.id, 'keep_local'),
        variant: 'primary',
      },
      {
        label: 'Keep Remote',
        action: () => resolveConflict(conflict.id, 'keep_remote'),
        variant: 'secondary',
      },
      {
        label: 'View Diff',
        action: () => showConflictDiff(conflict),
        variant: 'outline',
      },
    ],
  })
}
```

### Grouped Notifications

```typescript
const showBatchOperationToasts = (results: OperationResult[]) => {
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  if (successful > 0) {
    showToast({
      type: 'success',
      message: `${successful} operations completed successfully`,
    })
  }

  if (failed > 0) {
    const failedResults = results.filter(r => !r.success)
    showToast({
      type: 'error',
      message: `${failed} operations failed`,
      details: failedResults.map(r => r.error).join(', '),
      actions: [
        { label: 'Retry Failed', action: () => retryFailed(failedResults) },
        {
          label: 'View Details',
          action: () => showErrorDetails(failedResults),
        },
      ],
    })
  }
}
```

## ToastContainer Configuration

### Positioning Options

```typescript
// Different container positions
const positions = [
  'top-right',    // Default - top right corner
  'top-left',     // Top left corner
  'top-center',   // Top center
  'bottom-right', // Bottom right corner
  'bottom-left',  // Bottom left corner
  'bottom-center' // Bottom center
]

// Example configurations
<ToastContainer position="top-center" />
<ToastContainer position="bottom-left" />
```

### Stacking and Limits

```typescript
// Limit number of visible toasts
<ToastContainer
  maxToasts={3}           // Only show 3 toasts at a time
  defaultDuration={5000}  // Default auto-dismiss time
  stackDirection="up"     // New toasts appear at top
/>

// Alternative stacking
<ToastContainer
  maxToasts={5}
  stackDirection="down"   // New toasts appear at bottom
  spacing={8}             // Spacing between toasts
/>
```

### Custom Styling

```typescript
// Custom container styling
<ToastContainer
  className="custom-toast-container"
  position="top-right"
/>

// CSS
.custom-toast-container {
  top: 100px;     /* Custom positioning */
  right: 20px;
  z-index: 9999;
}
```

## Integration with Error Handler

```typescript
import { ErrorHandler } from '../utils/errorHandler'
import { useToast } from '../components/ui/Toast'

const useErrorToastIntegration = () => {
  const { showToast } = useToast()

  useEffect(() => {
    const errorHandler = ErrorHandler.getInstance()

    const unsubscribe = errorHandler.subscribe(error => {
      const toastConfig = {
        [ErrorSeverity.LOW]: null, // No toast for low severity
        [ErrorSeverity.MEDIUM]: {
          type: 'warning' as const,
          duration: 5000,
        },
        [ErrorSeverity.HIGH]: {
          type: 'error' as const,
          duration: 8000,
        },
        [ErrorSeverity.CRITICAL]: {
          type: 'error' as const,
          duration: 0, // Persistent
          actions: [
            {
              label: 'Reload Page',
              action: () => window.location.reload(),
            },
          ],
        },
      }

      const config = toastConfig[error.severity]
      if (config) {
        showToast({
          ...config,
          message: error.userMessage,
          details: error.message,
        })
      }
    })

    return unsubscribe
  }, [showToast])
}
```

## Accessibility Features

### Keyboard Navigation

```typescript
// Toasts support keyboard navigation
const accessibleToast = () => {
  showToast({
    type: 'info',
    message: 'Keyboard accessible notification',
    actions: [
      {
        label: 'Primary Action',
        action: () => console.log('Primary'),
        accessKey: 'p', // Alt+P shortcut
      },
      {
        label: 'Secondary Action',
        action: () => console.log('Secondary'),
        accessKey: 's', // Alt+S shortcut
      },
    ],
  })
}
```

### Screen Reader Support

```typescript
// ARIA attributes automatically included
const screenReaderToast = () => {
  showToast({
    type: 'error',
    message: 'Form validation failed',
    details: 'Please check the required fields',
    // Automatically includes:
    // role="alert" for errors
    // aria-live="polite" for info/success
    // aria-describedby for details
  })
}
```

## Animation and Transitions

### Custom Animations

```typescript
// CSS for custom animations
.toast-enter {
  opacity: 0;
  transform: translateX(100%);
}

.toast-enter-active {
  opacity: 1;
  transform: translateX(0%);
  transition: all 300ms ease-out;
}

.toast-exit {
  opacity: 1;
  transform: translateX(0%);
}

.toast-exit-active {
  opacity: 0;
  transform: translateX(100%);
  transition: all 300ms ease-in;
}
```

### Stagger Animations

```typescript
// Staggered entrance for multiple toasts
const showMultipleToasts = () => {
  const messages = [
    'First notification',
    'Second notification',
    'Third notification',
  ]

  messages.forEach((message, index) => {
    setTimeout(() => {
      showToast({
        type: 'info',
        message,
        duration: 4000,
      })
    }, index * 200) // 200ms delay between toasts
  })
}
```

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toast, ToastContainer, useToast } from '../Toast'

describe('Toast System', () => {
  it('should display toast message', () => {
    render(
      <Toast
        type="success"
        message="Test message"
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should auto-dismiss after duration', async () => {
    const onClose = vi.fn()

    render(
      <Toast
        type="info"
        message="Auto-dismiss test"
        duration={1000}
        onClose={onClose}
      />
    )

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    }, { timeout: 1500 })
  })

  it('should handle action clicks', () => {
    const mockAction = vi.fn()

    render(
      <Toast
        type="warning"
        message="Action test"
        actions={[
          { label: 'Test Action', action: mockAction }
        ]}
        onClose={() => {}}
      />
    )

    fireEvent.click(screen.getByText('Test Action'))
    expect(mockAction).toHaveBeenCalled()
  })
})
```

## Performance Considerations

### Memory Management

```typescript
// Automatic cleanup of old toasts
const useToastCleanup = () => {
  const MAX_TOAST_HISTORY = 50

  const cleanupOldToasts = useCallback(() => {
    // Remove old toasts from memory
    const now = Date.now()
    const cutoff = now - 5 * 60 * 1000 // 5 minutes

    setToasts(currentToasts =>
      currentToasts.filter(toast => toast.timestamp > cutoff)
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(cleanupOldToasts, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cleanupOldToasts])
}
```

### Batch Operations

```typescript
// Batch multiple toasts for better performance
const useBatchToasts = () => {
  const [pendingToasts, setPendingToasts] = useState<ToastConfig[]>([])

  const batchToasts = useCallback((toasts: ToastConfig[]) => {
    setPendingToasts(prev => [...prev, ...toasts])
  }, [])

  useEffect(() => {
    if (pendingToasts.length > 0) {
      const timer = setTimeout(() => {
        // Process batch
        pendingToasts.forEach((toast, index) => {
          setTimeout(() => showToast(toast), index * 100)
        })
        setPendingToasts([])
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pendingToasts])

  return { batchToasts }
}
```

## Best Practices

1. **Use appropriate types** - Match toast type to message severity
2. **Keep messages concise** - Primary message should be brief and clear
3. **Provide actionable details** - Include helpful information in details
4. **Limit persistent toasts** - Only use duration: 0 for critical errors
5. **Group related notifications** - Combine similar messages when possible
6. **Test with screen readers** - Ensure accessibility compliance
7. **Handle rapid-fire toasts** - Implement batching for better UX

## Integration Examples

### Form Validation

```typescript
const FormWithToasts = () => {
  const { showToast } = useToast()
  const { values, errors, handleSubmit } = useFormValidation({...})

  const onSubmit = async (data: FormData) => {
    try {
      await saveForm(data)
      showToast({
        type: 'success',
        message: 'Form saved successfully'
      })
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to save form',
        details: error.message
      })
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

### Sync Operations

```typescript
const SyncWithToasts = () => {
  const { showToast } = useToast()
  const { performSync } = useSync()

  const handleSync = async () => {
    const toastId = showToast({
      type: 'info',
      message: 'Synchronizing...',
      duration: 0
    })

    try {
      const result = await performSync()

      hideToast(toastId)
      showToast({
        type: 'success',
        message: `Sync complete`,
        details: `${result.changes} changes synchronized`
      })
    } catch (error) {
      hideToast(toastId)
      showToast({
        type: 'error',
        message: 'Sync failed',
        details: error.message,
        actions: [
          { label: 'Retry', action: handleSync }
        ]
      })
    }
  }

  return <button onClick={handleSync}>Sync</button>
}
```

## Related Components

- `ErrorHandler` - Centralized error management
- `ValidationMessage` - Form-specific error display
- `useErrorHandler` - Error handling hook
- `SyncStatusIndicator` - Sync status display
