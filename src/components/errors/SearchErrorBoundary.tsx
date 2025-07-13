import React from 'react'
import Icons from '../Icons'
import { logSearchError } from '../../services/errorLogger'

interface SearchErrorBoundaryProps {
  children: React.ReactNode
  fallbackMessage?: string
  showDetails?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onClearSearch?: () => void
  onClose?: () => void
}

interface SearchErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class SearchErrorBoundary extends React.Component<SearchErrorBoundaryProps, SearchErrorBoundaryState> {
  constructor(props: SearchErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SearchErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Search Error:', error, errorInfo)

    this.setState({
      error: error,
    })

    // Log to centralized error service
    logSearchError('unknown_query', error, {
      fallbackMessage: this.props.fallbackMessage,
      showDetails: this.props.showDetails,
      componentStack: errorInfo.componentStack
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })

    // Clear search query if provided
    if (this.props.onClearSearch) {
      this.props.onClearSearch()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-theme-bg-secondary rounded-lg border border-theme-border-primary">
          <div className="text-center max-w-md">
            <Icons.Search size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              Search Error
            </h3>
            <p className="text-theme-text-secondary mb-4 text-sm">
              {this.props.fallbackMessage ||
                'There was a problem with your search. This might be due to complex search terms or filtering criteria.'}
            </p>

            {this.props.showDetails && this.state.error && (
              <details className="mb-4 p-3 bg-theme-bg-tertiary rounded border text-left">
                <summary className="cursor-pointer text-sm font-medium text-theme-text-secondary mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-red-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            <div className="flex space-x-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Clear Search & Retry
              </button>

              {this.props.onClose && (
                <button
                  onClick={this.props.onClose}
                  className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-quaternary text-theme-text-secondary text-sm rounded transition-colors"
                >
                  Close
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
SearchErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development',
}

export default SearchErrorBoundary
