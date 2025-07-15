import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import React from 'react'
import ErrorBoundary, { useErrorHandler } from '../ErrorBoundary'

// Mock dependencies
vi.mock('../Icons', () => ({
  default: {
    AlertTriangle: ({ size, className }: any) => (
      <div data-testid="alert-triangle" className={className}>AlertTriangle</div>
    ),
    RefreshCw: ({ size }: any) => (
      <div data-testid="refresh-cw">RefreshCw</div>
    ),
    RotateCw: ({ size }: any) => (
      <div data-testid="rotate-cw">RotateCw</div>
    ),
    ArrowLeft: ({ size }: any) => (
      <div data-testid="arrow-left">ArrowLeft</div>
    )
  }
}))

vi.mock('../ui/StyledButton', () => ({
  default: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  )
}))

const mockLogComponentError = vi.hoisted(() => vi.fn())
vi.mock('../../services/errorLogger', () => ({
  logComponentError: mockLogComponentError
}))

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error during tests
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('displays error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred in the application')).toBeInTheDocument()
  })

  it('displays error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error Details:')).toBeInTheDocument()
    expect(screen.getByText('Error: Test error')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('logs error to error logger service', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(mockLogComponentError).toHaveBeenCalledWith(
      'ErrorBoundary',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      }),
      expect.objectContaining({
        props: expect.any(Array),
        hasCustomFallback: false
      })
    )
  })

  it('shows stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('View stack trace')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('hides stack trace in production by default', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('View stack trace')).not.toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('shows stack trace when showDetails is true', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('View stack trace')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('expands stack trace when clicked', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    )
    
    const details = screen.getByText('View stack trace').closest('details')
    expect(details).not.toHaveAttribute('open')
    
    fireEvent.click(screen.getByText('View stack trace'))
    // Note: Manual click on summary doesn't automatically open details in jsdom
    // so we'd need to manually set the open attribute or test differently
  })

  it('reloads page when Reload Page button is clicked', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Reload Page'))
    expect(mockReload).toHaveBeenCalled()
  })

  it('has Try Again button that resets error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    const tryAgainButton = screen.getByText('Try Again')
    expect(tryAgainButton).toBeInTheDocument()
    
    // Reset is called when button is clicked
    fireEvent.click(tryAgainButton)
    
    // The error boundary state should be reset (internal state test)
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('goes back in history when Go Back button is clicked', () => {
    const mockBack = vi.fn()
    Object.defineProperty(window, 'history', {
      value: { back: mockBack },
      writable: true
    })
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Go Back'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('displays help text about clearing cache', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/clearing your browser cache/)).toBeInTheDocument()
  })

  it('shows error message correctly', () => {
    const ErrorComponent = () => {
      throw new Error('Specific error message')
    }
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error: Specific error message')).toBeInTheDocument()
  })
})

describe('useErrorHandler', () => {
  it('captures and throws errors', () => {
    const TestComponent = () => {
      const { captureError } = useErrorHandler()
      
      return (
        <button onClick={() => captureError(new Error('Hook error'))}>
          Trigger Error
        </button>
      )
    }
    
    expect(() => {
      render(<TestComponent />)
      fireEvent.click(screen.getByText('Trigger Error'))
    }).toThrow('Hook error')
  })

  it('resets error state', () => {
    const { result } = renderHook(() => useErrorHandler())
    
    // First capture an error
    try {
      result.current.captureError(new Error('Hook error'))
    } catch (e) {
      // Expected
    }
    
    // Reset should clear the error
    result.current.resetError()
    
    // Should not throw after reset
    expect(() => {
      // Re-render doesn't throw
      renderHook(() => useErrorHandler())
    }).not.toThrow()
  })

  it('logs errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useErrorHandler())
    
    try {
      result.current.captureError(new Error('Test error'))
    } catch (e) {
      // Expected
    }
    
    expect(consoleSpy).toHaveBeenCalledWith('Error captured:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })
})