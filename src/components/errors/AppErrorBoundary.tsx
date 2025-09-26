/**
 * App-level Error Boundary - Top-level error catching and recovery
 * Provides comprehensive error handling, reporting, and recovery mechanisms
 */

import type { ReactNode } from 'react'
import React, { Component } from 'react'
import { logger, logError } from '../../utils/logger'
import { Icons } from '../Icons'

interface AppErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  enableReporting?: boolean
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  isRetrying: boolean
  retryCount: number
}

const MAX_RETRY_COUNT = 3
const RETRY_DELAY = 1000

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<AppErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error with full context
    logger.error('Application Error Boundary triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      errorBoundary: 'AppErrorBoundary',
    })

    // Enhanced error logging
    logError(error, {
      context: 'AppErrorBoundary',
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Auto-retry for certain types of errors
    if (
      this.shouldAutoRetry(error) &&
      this.state.retryCount < MAX_RETRY_COUNT
    ) {
      this.scheduleRetry()
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Auto-retry for network-related errors, temporary failures
    const retryableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'NetworkError',
      'fetch',
    ]

    return retryableErrors.some(pattern =>
      error.message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  private scheduleRetry = () => {
    this.retryTimeout = setTimeout(
      () => {
        this.handleRetry()
      },
      RETRY_DELAY * (this.state.retryCount + 1)
    ) // Progressive delay
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true })

    try {
      // Clear any cached modules that might be causing issues
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      }

      // Force a small delay to let things settle
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
        retryCount: this.state.retryCount + 1,
      })

      logger.info('Error boundary retry successful', {
        retryCount: this.state.retryCount + 1,
      })
    } catch (retryError) {
      logger.error('Error boundary retry failed', {
        retryError: (retryError as Error).message,
        originalError: this.state.error?.message,
        retryCount: this.state.retryCount,
      })

      this.setState({ isRetrying: false })
    }
  }

  private handleReload = () => {
    logger.info('User triggered page reload from error boundary')
    window.location.reload()
  }

  private handleReport = () => {
    if (!this.state.error) return

    const errorReport = {
      error: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(
      () => {
        alert(
          'Error report copied to clipboard. Please share this with support.'
        )
      },
      () => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = JSON.stringify(errorReport, null, 2)
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert(
          'Error report copied to clipboard. Please share this with support.'
        )
      }
    )

    logger.info('Error report generated and copied', {
      errorId: `error_${Date.now()}`,
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary px-4">
          <div className="max-w-md w-full bg-theme-bg-secondary rounded-lg border border-theme-border-primary p-6">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Icons.AlertTriangle size={24} className="text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-lg font-semibold text-theme-text-primary mb-2">
                Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-sm text-theme-text-secondary mb-4">
                The application encountered an unexpected error. You can try
                refreshing the page or report this issue if it persists.
              </p>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="text-yellow-800">
                    Automatic retry #{this.state.retryCount} attempted
                  </p>
                </div>
              )}

              {/* Error Details (Expandable) */}
              {this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-theme-text-secondary mb-2 hover:text-theme-text-primary transition-colors">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-theme-bg-tertiary rounded border">
                    <div className="text-xs font-mono text-red-600 mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="text-xs font-mono text-theme-text-secondary max-h-32 overflow-y-auto">
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Retry Button */}
                {this.state.retryCount < MAX_RETRY_COUNT && (
                  <button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded transition-colors flex items-center justify-center"
                  >
                    {this.state.isRetrying ? (
                      <>
                        <Icons.Loader2
                          size={16}
                          className="animate-spin mr-2"
                        />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <Icons.RotateCcw size={16} className="mr-2" />
                        Try Again
                      </>
                    )}
                  </button>
                )}

                {/* Reload Button */}
                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center"
                >
                  <Icons.RefreshCw size={16} className="mr-2" />
                  Reload Page
                </button>

                {/* Report Button */}
                {this.props.enableReporting && (
                  <button
                    onClick={this.handleReport}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center"
                  >
                    <Icons.AlertCircle size={16} className="mr-2" />
                    Copy Error Report
                  </button>
                )}
              </div>

              {/* Help Text */}
              <p className="mt-4 text-xs text-theme-text-secondary">
                If this problem persists, try refreshing the page or clearing
                your browser cache.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
