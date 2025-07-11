import React from 'react'
import PropTypes from 'prop-types'
import Icons from '../Icons'

class StorageErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Storage Error:', error, errorInfo)

    this.setState({
      error: error,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true })

    try {
      // Try to clear localStorage if it's corrupted
      if (this.props.clearStorageOnRetry) {
        localStorage.clear()
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset the error state
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
      })

      if (this.props.onRetry) {
        this.props.onRetry()
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError)
      this.setState({ isRetrying: false })
    }
  }

  handleClearData = () => {
    if (window.confirm('This will clear all your local data. Are you sure?')) {
      try {
        localStorage.clear()
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear storage:', error)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-theme-bg-secondary rounded-lg border border-theme-border-primary max-w-md mx-auto mt-8">
          <div className="text-center">
            <Icons.Database size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
              Storage Error
            </h3>
            <p className="text-theme-text-secondary mb-4 text-sm">
              There was a problem accessing your stored data. This might be due
              to storage quota limits or corrupted data.
            </p>

            {this.state.error && (
              <details className="mb-4 p-3 bg-theme-bg-tertiary rounded border text-left">
                <summary className="cursor-pointer text-sm font-medium text-theme-text-secondary mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-red-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            <div className="flex flex-col space-y-2 w-full">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded transition-colors flex items-center justify-center"
              >
                {this.state.isRetrying ? (
                  <>
                    <Icons.Loader2 size={16} className="animate-spin mr-2" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>

              <button
                onClick={this.handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Clear All Data & Restart
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-quaternary text-theme-text-secondary text-sm rounded transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

StorageErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  clearStorageOnRetry: PropTypes.bool,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
}

StorageErrorBoundary.defaultProps = {
  clearStorageOnRetry: false,
}

export default StorageErrorBoundary
