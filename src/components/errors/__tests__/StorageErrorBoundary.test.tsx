import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import StorageErrorBoundary from '../StorageErrorBoundary'
import { logStorageError } from '../../../services/errorLogger'

// Mock dependencies
vi.mock('../../Icons', () => ({
  default: {
    Database: vi.fn(() => <div data-testid="database-icon">Database Icon</div>),
    Loader2: vi.fn(({ className }: { className?: string }) => (
      <div data-testid="loader-icon" className={className}>Loading...</div>
    )),
    RefreshCw: vi.fn(() => <div data-testid="refresh-icon">Refresh Icon</div>),
    Trash2: vi.fn(() => <div data-testid="trash-icon">Trash Icon</div>)
  }
}))

vi.mock('../../../services/errorLogger', () => ({
  logStorageError: vi.fn()
}))

// Component that throws storage errors
const ThrowStorageError = ({ errorType }: { errorType: 'quota' | 'corruption' | 'generic' }) => {
  if (errorType === 'quota') {
    const error = new Error('QuotaExceededError')
    error.name = 'QuotaExceededError'
    throw error
  } else if (errorType === 'corruption') {
    throw new Error('Failed to read storage: data corrupted')
  } else if (errorType === 'generic') {
    throw new Error('Generic storage error')
  }
  return <div>Child content</div>
}

describe('StorageErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {}
      return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString()
        }),
        removeItem: vi.fn((key) => {
          delete store[key]
        }),
        clear: vi.fn(() => {
          store = {}
        }),
        get length() {
          return Object.keys(store).length
        }
      }
    })()
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children when there is no error', () => {
    render(
      <StorageErrorBoundary>
        <div>Test content</div>
      </StorageErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders storage error UI', () => {
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="quota" />
      </StorageErrorBoundary>
    )
    
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
    expect(screen.getByText(/There was a problem accessing your stored data/)).toBeInTheDocument()
    expect(screen.getByTestId('database-icon')).toBeInTheDocument()
  })

  it('logs storage errors to error logger', () => {
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="quota" />
      </StorageErrorBoundary>
    )
    
    expect(logStorageError).toHaveBeenCalledWith(
      'boundary_catch',
      expect.objectContaining({
        name: 'QuotaExceededError',
        message: 'QuotaExceededError'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it.skip('handles retry with loading state', async () => {
    let attemptCount = 0
    const TestComponent = () => {
      attemptCount++
      if (attemptCount === 1) {
        throw new Error('First attempt fails')
      }
      return <div>Success on retry</div>
    }
    
    render(
      <StorageErrorBoundary>
        <TestComponent />
      </StorageErrorBoundary>
    )
    
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
    
    // Click retry
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)
    
    // Should show loading state
    expect(screen.getByText('Retrying...')).toBeInTheDocument()
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    
    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000)
    
    // After retry, should show success
    expect(screen.getByText('Success on retry')).toBeInTheDocument()
  })

  it('calls onRetry callback when retry is clicked', async () => {
    const onRetry = vi.fn()
    
    render(
      <StorageErrorBoundary onRetry={onRetry}>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Try Again'))
    
    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000)
    
    expect(onRetry).toHaveBeenCalled()
  })

  it('clears storage when clearStorageOnRetry option is true', async () => {
    // Clean localStorage first
    localStorage.clear()
    localStorage.setItem('test-key', 'test-value')
    
    render(
      <StorageErrorBoundary clearStorageOnRetry={true}>
        <ThrowStorageError errorType="corruption" />
      </StorageErrorBoundary>
    )
    
    expect(localStorage.getItem('test-key')).toBe('test-value')
    
    fireEvent.click(screen.getByText('Try Again'))
    
    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000)
    
    expect(localStorage.clear).toHaveBeenCalled()
  })

  it('shows clear all data button and reloads page', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    })
    
    // Add some data to localStorage
    localStorage.clear()
    localStorage.setItem('test1', 'value1')
    localStorage.setItem('test2', 'value2')
    
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="corruption" />
      </StorageErrorBoundary>
    )
    
    const clearButton = screen.getByText('Clear All Data & Restart')
    expect(clearButton).toBeInTheDocument()
    
    // Confirm dialog should appear
    window.confirm = vi.fn(() => true)
    
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalledWith(
      'This will clear all your local data. Are you sure?'
    )
    expect(localStorage.length).toBe(0)
    expect(reloadSpy).toHaveBeenCalled()
  })

  it('does not clear data if user cancels confirmation', () => {
    localStorage.clear()
    localStorage.setItem('test-key', 'test-value')
    window.confirm = vi.fn(() => false)
    
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="corruption" />
      </StorageErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Clear All Data & Restart'))
    
    expect(localStorage.getItem('test-key')).toBe('test-value')
  })

  it('shows error details', () => {
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    // Click to show details
    fireEvent.click(screen.getByText('Error Details'))
    expect(screen.getByText(/Generic storage error/)).toBeInTheDocument()
  })

  it.skip('disables retry button during loading', async () => {
    let attemptCount = 0
    const TestComponent = () => {
      attemptCount++
      // Always throw to stay in error state
      throw new Error('Storage error')
    }
    
    render(
      <StorageErrorBoundary>
        <TestComponent />
      </StorageErrorBoundary>
    )
    
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).not.toBeDisabled()
    
    fireEvent.click(retryButton)
    
    // Button should be disabled during loading
    const loadingButton = screen.getByRole('button', { name: /Retrying/i })
    expect(loadingButton).toBeDisabled()
    expect(screen.getByText('Retrying...')).toBeInTheDocument()
    
    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000)
    
    // After loading, error state shows again with enabled button
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
    const newRetryButton = screen.getByText('Try Again')
    expect(newRetryButton).not.toBeDisabled()
  })

  it('maintains error state through rerenders', () => {
    const { rerender } = render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
    
    // Rerender without fixing the error
    rerender(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    // Should still show error
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
  })

  it('handles async storage operations in retry', async () => {
    const asyncOperation = vi.fn().mockResolvedValue(true)
    
    render(
      <StorageErrorBoundary onRetry={asyncOperation}>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Try Again'))
    
    // Advance timer by 1 second
    await vi.advanceTimersByTimeAsync(1000)
    
    expect(asyncOperation).toHaveBeenCalled()
  })

  it('shows reload page button', () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    })
    
    render(
      <StorageErrorBoundary>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    const reloadButton = screen.getByText('Reload Page')
    expect(reloadButton).toBeInTheDocument()
    
    fireEvent.click(reloadButton)
    expect(reloadSpy).toHaveBeenCalled()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <StorageErrorBoundary onError={onError}>
        <ThrowStorageError errorType="generic" />
      </StorageErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Generic storage error' }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })
})