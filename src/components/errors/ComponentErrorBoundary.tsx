import React from 'react'
import { Icons } from '../Icons'
import { logComponentError } from '../../services/errorLogger'
import { logger } from '../../utils/logger'

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  componentName: string
  fallback?: React.ReactNode
  title?: string
  message?: string
  resetLabel?: string
  allowReload?: boolean
  showDetails?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}

interface ComponentErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ComponentErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Error in ${this.props.componentName}:`, error, errorInfo)

    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // Log to centralized error service
    logComponentError(this.props.componentName, error, errorInfo, {
      title: this.props.title,
      message: this.props.message,
      allowReload: this.props.allowReload,
      showDetails: this.props.showDetails,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-theme-bg-secondary rounded-lg border border-theme-border-primary">
          <div className="text-center">
            <Icons.AlertTriangle
              size={48}
              className="text-red-500 mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              {this.props.title || `${this.props.componentName} Error`}
            </h3>
            <p className="text-theme-text-secondary mb-4 text-sm">
              {this.props.message ||
                `The ${this.props.componentName} component encountered an error. You can try to recover or reload the page.`}
            </p>

            {this.props.showDetails && this.state.error && (
              <details className="mb-4 p-3 bg-theme-bg-tertiary rounded border text-left">
                <summary className="cursor-pointer text-sm font-medium text-theme-text-secondary mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-red-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </details>
            )}

            <div className="flex space-x-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                {this.props.resetLabel || 'Try Again'}
              </button>

              {this.props.allowReload && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-quaternary text-theme-text-secondary text-sm rounded transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Default props
ComponentErrorBoundary.defaultProps = {
  allowReload: true,
  showDetails: process.env.NODE_ENV === 'development',
}

export default ComponentErrorBoundary
