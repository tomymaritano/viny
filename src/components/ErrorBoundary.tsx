import React, { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo)

    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-theme-bg-primary text-theme-text-primary p-8">
          <div className="max-w-md w-full bg-theme-bg-secondary rounded-lg p-6 border border-theme-border-primary">
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-xl font-bold text-red-500 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-theme-text-secondary mb-4">
                The editor encountered an unexpected error. Don't worry, your
                notes are safe.
              </p>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mb-4 p-3 bg-theme-bg-tertiary rounded border">
                <summary className="cursor-pointer text-sm font-medium text-theme-text-secondary mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            <div className="flex flex-col space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-theme-bg-tertiary hover:bg-theme-bg-quaternary text-theme-text-secondary font-medium py-2 px-4 rounded transition-colors"
              >
                Reload Page
              </button>

              <div className="text-center">
                <a
                  href="mailto:support@nototo.app?subject=Error Report"
                  className="text-blue-500 hover:text-blue-400 text-sm underline"
                >
                  Report this issue
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Default props
ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development',
}

export default ErrorBoundary

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}