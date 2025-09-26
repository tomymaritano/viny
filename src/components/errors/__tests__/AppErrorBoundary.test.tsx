/**
 * Comprehensive tests for AppErrorBoundary
 * Tests error catching, auto-retry, and graceful degradation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppErrorBoundary } from '../AppErrorBoundary'

// Mock console methods to avoid noise in test output
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
  vi.clearAllTimers()
  vi.useFakeTimers()
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Mock service worker for cache refresh tests
const mockServiceWorker = {
  getRegistration: vi.fn(),
  register: vi.fn(),
}

Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    userAgent: 'Test Browser',
  },
  writable: true,
})

// Test component that can throw errors
const ThrowingComponent: React.FC<{
  shouldThrow?: boolean
  errorMessage?: string
}> = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div data-testid="working-component">Component is working</div>
}

// Test component that simulates network errors
const NetworkErrorComponent: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = false,
}) => {
  if (shouldThrow) {
    const error = new Error('Network request failed')
    error.name = 'NetworkError'
    throw error
  }
  return <div data-testid="network-component">Network component working</div>
}

describe('AppErrorBoundary', () => {
  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </AppErrorBoundary>
      )

      expect(screen.getByTestId('working-component')).toBeInTheDocument()
      expect(screen.getByText('Component is working')).toBeInTheDocument()
    })

    it('should not interfere with normal component lifecycle', () => {
      const { rerender } = render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </AppErrorBoundary>
      )

      expect(screen.getByTestId('working-component')).toBeInTheDocument()

      rerender(
        <AppErrorBoundary>
          <div data-testid="updated-component">Updated content</div>
        </AppErrorBoundary>
      )

      expect(screen.getByTestId('updated-component')).toBeInTheDocument()
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    })
  })

  describe('Error Catching', () => {
    it('should catch and display JavaScript errors', () => {
      render(
        <AppErrorBoundary>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Custom error message"
          />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      expect(screen.getByText(/Custom error message/)).toBeInTheDocument()
      expect(screen.getByText(/Try Again/)).toBeInTheDocument()
    })

    it('should display different UI for network errors', () => {
      render(
        <AppErrorBoundary>
          <NetworkErrorComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Network Error/)).toBeInTheDocument()
      expect(screen.getByText(/connection issue/)).toBeInTheDocument()
      expect(screen.getByText(/Retry/)).toBeInTheDocument()
    })

    it('should capture error details for debugging', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Debug error" />
        </AppErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'AppErrorBoundary caught an error:',
        expect.objectContaining({
          message: 'Debug error',
        }),
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })

    it('should handle errors without error boundaries in children', () => {
      const NestedThrowingComponent = () => {
        throw new Error('Nested error')
      }

      render(
        <AppErrorBoundary>
          <div>
            <NestedThrowingComponent />
          </div>
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      expect(screen.getByText(/Nested error/)).toBeInTheDocument()
    })
  })

  describe('Auto-Retry Mechanism', () => {
    it('should automatically retry after network errors', async () => {
      let shouldThrow = true
      const RetryComponent = () => {
        if (shouldThrow) {
          const error = new Error('Network timeout')
          error.name = 'NetworkError'
          throw error
        }
        return <div data-testid="retry-success">Retry successful</div>
      }

      render(
        <AppErrorBoundary>
          <RetryComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Network Error/)).toBeInTheDocument()

      // Simulate network recovery
      shouldThrow = false

      // Wait for auto-retry (should happen after 1 second)
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(screen.getByTestId('retry-success')).toBeInTheDocument()
      })
    })

    it('should implement progressive delay for retries', async () => {
      let attemptCount = 0
      const MultiRetryComponent = () => {
        attemptCount++
        if (attemptCount <= 2) {
          const error = new Error('Network error')
          error.name = 'NetworkError'
          throw error
        }
        return <div data-testid="final-success">Finally successful</div>
      }

      render(
        <AppErrorBoundary>
          <MultiRetryComponent />
        </AppErrorBoundary>
      )

      // First error - should show error UI
      expect(screen.getByText(/Network Error/)).toBeInTheDocument()

      // First retry after 1 second
      vi.advanceTimersByTime(1000)
      await waitFor(() => {
        expect(attemptCount).toBe(2)
      })

      // Still showing error, second retry after 2 more seconds (progressive delay)
      vi.advanceTimersByTime(2000)
      await waitFor(() => {
        expect(screen.getByTestId('final-success')).toBeInTheDocument()
      })
    })

    it('should stop retrying after maximum attempts', async () => {
      let attemptCount = 0
      const AlwaysFailingComponent = () => {
        attemptCount++
        const error = new Error('Persistent network error')
        error.name = 'NetworkError'
        throw error
      }

      render(
        <AppErrorBoundary>
          <AlwaysFailingComponent />
        </AppErrorBoundary>
      )

      // Initial error
      expect(screen.getByText(/Network Error/)).toBeInTheDocument()

      // Advance through all retry attempts (3 total: 1s, 2s, 4s)
      vi.advanceTimersByTime(1000)
      await waitFor(() => expect(attemptCount).toBe(2))

      vi.advanceTimersByTime(2000)
      await waitFor(() => expect(attemptCount).toBe(3))

      vi.advanceTimersByTime(4000)
      await waitFor(() => expect(attemptCount).toBe(4))

      // Should show final error state
      expect(screen.getByText(/failed to recover/)).toBeInTheDocument()
      expect(screen.queryByText(/Retrying/)).not.toBeInTheDocument()
    })
  })

  describe('Manual Retry', () => {
    it('should allow manual retry via button', async () => {
      let shouldThrow = true
      const ManualRetryComponent = () => {
        if (shouldThrow) {
          throw new Error('Manual retry test')
        }
        return <div data-testid="manual-retry-success">Manual retry worked</div>
      }

      render(
        <AppErrorBoundary>
          <ManualRetryComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click retry button
      const retryButton = screen.getByText(/Try Again/)
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByTestId('manual-retry-success')).toBeInTheDocument()
      })
    })

    it('should reset retry count on manual retry', async () => {
      let attemptCount = 0
      const ResetCountComponent = () => {
        attemptCount++
        if (attemptCount <= 2) {
          throw new Error('Reset count test')
        }
        return <div data-testid="reset-success">Reset successful</div>
      }

      render(
        <AppErrorBoundary>
          <ResetCountComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

      // Manual retry should reset attempt count
      const retryButton = screen.getByText(/Try Again/)
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(attemptCount).toBe(2)
      })

      // Another manual retry
      fireEvent.click(screen.getByText(/Try Again/))

      await waitFor(() => {
        expect(screen.getByTestId('reset-success')).toBeInTheDocument()
      })
    })
  })

  describe('Service Worker Cache Refresh', () => {
    it('should attempt cache refresh on network errors', async () => {
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
      }
      mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration)

      render(
        <AppErrorBoundary>
          <NetworkErrorComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      await waitFor(() => {
        expect(mockServiceWorker.getRegistration).toHaveBeenCalled()
        expect(mockRegistration.update).toHaveBeenCalled()
      })
    })

    it('should handle service worker unavailability gracefully', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(null)

      render(
        <AppErrorBoundary>
          <NetworkErrorComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      // Should not throw additional errors when service worker is unavailable
      await waitFor(() => {
        expect(screen.getByText(/Network Error/)).toBeInTheDocument()
      })
    })
  })

  describe('Error Reporting', () => {
    it('should provide error details for copy to clipboard', async () => {
      const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText')

      render(
        <AppErrorBoundary>
          <ThrowingComponent
            shouldThrow={true}
            errorMessage="Clipboard test error"
          />
        </AppErrorBoundary>
      )

      const copyButton = screen.getByText(/Copy Error Details/)
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockClipboard).toHaveBeenCalledWith(
          expect.stringContaining('Clipboard test error')
        )
      })

      expect(mockClipboard).toHaveBeenCalledWith(
        expect.stringContaining('User Agent:')
      )
    })

    it('should handle clipboard API unavailability', async () => {
      // Temporarily remove clipboard API
      const originalClipboard = navigator.clipboard
      ;(navigator as any).clipboard = undefined

      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      const copyButton = screen.getByText(/Copy Error Details/)
      fireEvent.click(copyButton)

      // Should not throw error when clipboard is unavailable
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

      // Restore clipboard
      ;(navigator as any).clipboard = originalClipboard
    })

    it('should include comprehensive error information', async () => {
      const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText')

      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Detailed error" />
        </AppErrorBoundary>
      )

      const copyButton = screen.getByText(/Copy Error Details/)
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockClipboard).toHaveBeenCalledWith(
          expect.stringMatching(/Error: Detailed error/)
        )
      })

      const copiedText = mockClipboard.mock.calls[0][0]
      expect(copiedText).toContain('Timestamp:')
      expect(copiedText).toContain('User Agent:')
      expect(copiedText).toContain('URL:')
      expect(copiedText).toContain('Stack trace:')
    })
  })

  describe('Accessibility', () => {
    it('should provide proper ARIA labels for error UI', () => {
      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      const errorRegion = screen.getByRole('alert')
      expect(errorRegion).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(
        <AppErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      const retryButton = screen.getByText(/Try Again/)
      const copyButton = screen.getByText(/Copy Error Details/)

      expect(retryButton).toHaveAttribute('tabIndex', '0')
      expect(copyButton).toHaveAttribute('tabIndex', '0')
    })

    it('should announce retry attempts to screen readers', async () => {
      render(
        <AppErrorBoundary>
          <NetworkErrorComponent shouldThrow={true} />
        </AppErrorBoundary>
      )

      // Should have aria-live region for retry announcements
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not impact performance when no errors occur', () => {
      const startTime = performance.now()

      render(
        <AppErrorBoundary>
          {Array(100)
            .fill(0)
            .map((_, i) => (
              <div key={i}>Component {i}</div>
            ))}
        </AppErrorBoundary>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(100) // Should render quickly
      expect(screen.getByText('Component 0')).toBeInTheDocument()
      expect(screen.getByText('Component 99')).toBeInTheDocument()
    })

    it('should handle rapid error state changes efficiently', async () => {
      let errorState = true
      const RapidChangeComponent = () => {
        if (errorState) {
          throw new Error('Rapid change error')
        }
        return <div data-testid="rapid-success">Rapid change success</div>
      }

      const { rerender } = render(
        <AppErrorBoundary>
          <RapidChangeComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

      // Rapidly change error state
      errorState = false
      fireEvent.click(screen.getByText(/Try Again/))

      await waitFor(() => {
        expect(screen.getByTestId('rapid-success')).toBeInTheDocument()
      })

      // Change back to error state
      errorState = true
      rerender(
        <AppErrorBoundary>
          <RapidChangeComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
  })
})
