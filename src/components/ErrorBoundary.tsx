import React, { ErrorInfo, ReactNode } from 'react'
import Icons from './Icons'
import StyledButton from './ui/StyledButton'

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

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
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
        <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-theme-bg-secondary rounded-lg border border-theme-border-primary p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-theme-accent-red/20 rounded-full flex items-center justify-center mr-4">
                <Icons.AlertTriangle size={24} className="text-theme-accent-red" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-theme-text-primary">
                  Something went wrong
                </h1>
                <p className="text-theme-text-secondary mt-1">
                  An unexpected error occurred in the application
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-theme-text-secondary mb-2">
                  Error Details:
                </h2>
                <div className="bg-theme-bg-primary rounded p-4 border border-theme-border-primary">
                  <code className="text-sm text-theme-accent-red font-mono">
                    {this.state.error.toString()}
                  </code>
                </div>
              </div>
            )}

            {(this.props.showDetails ?? process.env.NODE_ENV === 'development') && this.state.errorInfo && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-theme-text-secondary hover:text-theme-text-primary">
                  View stack trace
                </summary>
                <div className="mt-2 bg-theme-bg-primary rounded p-4 border border-theme-border-primary overflow-x-auto">
                  <pre className="text-xs text-theme-text-muted font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-4">
              <StyledButton
                variant="primary"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <Icons.RefreshCw size={16} />
                Reload Page
              </StyledButton>

              <StyledButton
                variant="default"
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <Icons.RotateCw size={16} />
                Try Again
              </StyledButton>

              <StyledButton
                variant="default"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <Icons.ArrowLeft size={16} />
                Go Back
              </StyledButton>
            </div>

            <div className="mt-6 pt-6 border-t border-theme-border-primary">
              <p className="text-xs text-theme-text-muted">
                If this problem persists, please try clearing your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Default props - using static defaultProps for class components

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
