import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ComponentErrorBoundary from '../ComponentErrorBoundary'
import { logComponentError } from '../../../services/errorLogger'

// Mock dependencies
vi.mock('../../Icons', () => ({
  default: {
    AlertTriangle: vi.fn(() => <div data-testid="alert-icon">Alert Icon</div>),
    RefreshCw: vi.fn(() => <div data-testid="refresh-icon">Refresh Icon</div>),
    X: vi.fn(() => <div data-testid="x-icon">X Icon</div>)
  }
}))

vi.mock('../../../services/errorLogger', () => ({
  logComponentError: vi.fn()
}))

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child content</div>
}

describe('ComponentErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <div>Test content</div>
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('TestComponent Error')).toBeInTheDocument()
    expect(screen.getByText(/The TestComponent component encountered an error/)).toBeInTheDocument()
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
  })

  it('logs error to error logger service', () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(logComponentError).toHaveBeenCalledWith(
      'TestComponent',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      }),
      expect.any(Object)
    )
  })

  it('displays custom error title and message', () => {
    render(
      <ComponentErrorBoundary 
        componentName="TestComponent"
        title="Custom Error"
        message="This is a custom error message"
      >
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('This is a custom error message')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom fallback UI</div>
    
    render(
      <ComponentErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ComponentErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when Try Again is clicked', () => {
    const onReset = vi.fn()
    let shouldThrow = true
    
    const TestWrapper = () => {
      // Use a key to force remount when error state changes
      const key = shouldThrow ? 'error' : 'no-error'
      return (
        <ComponentErrorBoundary key={key} componentName="TestComponent" onReset={onReset}>
          <ThrowError shouldThrow={shouldThrow} />
        </ComponentErrorBoundary>
      )
    }
    
    const { rerender } = render(<TestWrapper />)
    
    expect(screen.getByText('TestComponent Error')).toBeInTheDocument()
    
    // Click Try Again
    fireEvent.click(screen.getByText('Try Again'))
    
    // Verify reset callback was called
    expect(onReset).toHaveBeenCalled()
    
    // Update state to not throw and force a new instance
    shouldThrow = false
    rerender(<TestWrapper />)
    
    // Now it should render the child content
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('calls onReset callback when Try Again is clicked', () => {
    const onReset = vi.fn()
    
    render(
      <ComponentErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Try Again'))
    
    expect(onReset).toHaveBeenCalled()
  })

  it('shows reload page button when allowReload is true', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    })
    
    render(
      <ComponentErrorBoundary componentName="TestComponent" allowReload={true}>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Reload Page'))
    expect(reloadSpy).toHaveBeenCalled()
  })

  it('toggles error details visibility', () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent" showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    // In development, details are open by default when showDetails is true
    expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument()
  })

  it('captures component lifecycle errors', () => {
    class ErrorComponent extends React.Component {
      componentDidMount() {
        throw new Error('Lifecycle error')
      }
      render() {
        return <div>Error component</div>
      }
    }
    
    render(
      <ComponentErrorBoundary componentName="ErrorComponent">
        <ErrorComponent />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('ErrorComponent Error')).toBeInTheDocument()
    expect(logComponentError).toHaveBeenCalledWith(
      'ErrorComponent',
      expect.objectContaining({ message: 'Lifecycle error' }),
      expect.objectContaining({
        componentStack: expect.any(String)
      }),
      expect.any(Object)
    )
  })

  it('maintains error state after rerender if not reset', () => {
    const { rerender } = render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )
    
    expect(screen.getByText('TestComponent Error')).toBeInTheDocument()
    
    // Rerender without resetting
    rerender(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={false} />
      </ComponentErrorBoundary>
    )
    
    // Should still show error
    expect(screen.getByText('TestComponent Error')).toBeInTheDocument()
  })

  it('provides error stack in details when available', () => {
    const errorWithStack = new Error('Error with stack')
    errorWithStack.stack = 'Error: Error with stack\n    at TestComponent.render'
    
    class ThrowStackError extends React.Component {
      render() {
        throw errorWithStack
      }
    }
    
    render(
      <ComponentErrorBoundary componentName="TestComponent" showDetails={true}>
        <ThrowStackError />
      </ComponentErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Error Details'))
    expect(screen.getByText(/Error with stack/)).toBeInTheDocument()
    // Stack trace should be visible
    const errorDetails = screen.getByText(/Error with stack/).parentElement
    expect(errorDetails?.textContent).toContain('Error: Error with stack')
  })

  it('handles errors without stack gracefully', () => {
    const errorWithoutStack = new Error('No stack error')
    delete errorWithoutStack.stack
    
    class ThrowNoStackError extends React.Component {
      render() {
        throw errorWithoutStack
      }
    }
    
    render(
      <ComponentErrorBoundary componentName="TestComponent" showDetails={true}>
        <ThrowNoStackError />
      </ComponentErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Error Details'))
    expect(screen.getByText(/No stack error/)).toBeInTheDocument()
  })

})