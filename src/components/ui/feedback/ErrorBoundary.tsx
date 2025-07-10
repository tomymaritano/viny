// Enhanced Error Boundary with better UX
import React, { Component, ReactNode } from 'react'
import { ErrorProps } from '../../../types'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorProps>
  onError?: (error: Error, errorInfo: any) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error callback
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error || new Error('Unknown error')}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorProps> = ({ error, onRetry }) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-theme-bg-secondary rounded-lg border border-theme-border-primary p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-theme-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-theme-text-muted mb-4">
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
        </div>

        {isDevelopment && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-theme-text-muted hover:text-theme-text-secondary">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-theme-bg-primary rounded border text-xs font-mono text-red-400 overflow-auto max-h-32">
              {error.message}
              {error.stack && (
                <pre className="mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="space-y-2">
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-theme-accent-primary text-white rounded hover:bg-theme-accent-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 border border-theme-border-primary text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary