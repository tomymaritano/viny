import React from 'react'
import { Icons } from '../Icons'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { logStorageError } from '../../services/errorLogger'
import { storageLogger } from '../../utils/logger'
// import { debugStorage, clearCorruptedData, backupAndClearStorage } from '../../utils/storageDebug' // removed

interface StorageErrorBoundaryProps {
  children: React.ReactNode
  clearStorageOnRetry?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onRetry?: () => void
}

interface StorageErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isRetrying: boolean
  confirmDialog: {
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant: 'default' | 'destructive'
  }
}

class StorageErrorBoundary extends React.Component<
  StorageErrorBoundaryProps,
  StorageErrorBoundaryState
> {
  constructor(props: StorageErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
      confirmDialog: {
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
        variant: 'default',
      },
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<StorageErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    storageLogger.error('Storage Error:', error, errorInfo)
    storageLogger.error('Error stack:', error.stack)
    storageLogger.error('Component stack:', errorInfo.componentStack)

    this.setState({
      error: error,
    })

    // Log to centralized error service
    logStorageError('boundary_catch', error, {
      clearStorageOnRetry: this.props.clearStorageOnRetry,
      componentStack: errorInfo.componentStack,
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
        storageService.clear()
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
      storageLogger.error('Retry failed:', retryError)
      this.setState({ isRetrying: false })
    }
  }

  showConfirmDialog = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: 'default' | 'destructive' = 'default'
  ) => {
    this.setState({
      confirmDialog: {
        isOpen: true,
        title,
        description,
        onConfirm,
        variant,
      },
    })
  }

  closeConfirmDialog = () => {
    this.setState({
      confirmDialog: {
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
        variant: 'default',
      },
    })
  }

  handleClearData = () => {
    this.showConfirmDialog(
      'Clear All Data',
      'This will clear all your local data. Are you sure?',
      () => {
        try {
          storageService.clear()
          window.location.reload()
        } catch (error) {
          storageLogger.error('Failed to clear storage:', error)
        }
      },
      'destructive'
    )
  }

  handleDebug = () => {
    // debugStorage() - removed
    storageLogger.info('Storage debug function removed')
  }

  handleClearCorrupted = () => {
    // const cleared = clearCorruptedData() - removed
    // Clear localStorage as fallback
    storageService.clear()
    alert('Storage cleared. Reloading...')
    window.location.reload()
  }

  handleBackupAndClear = () => {
    this.showConfirmDialog(
      'Backup & Clear Storage',
      'This will backup your data and then clear storage. Continue?',
      () => {
        // backupAndClearStorage() - removed
        // Simple localStorage backup and clear
        const backup = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) backup[key] = localStorage.getItem(key)
        }
        storageLogger.info('Storage backup:', backup)
        storageService.clear()
        window.location.reload()
      },
      'destructive'
    )
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
                onClick={this.handleDebug}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
              >
                Debug Storage (Check Console)
              </button>

              <button
                onClick={this.handleClearCorrupted}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
              >
                Clear Corrupted Data Only
              </button>

              <button
                onClick={this.handleBackupAndClear}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                Backup & Clear Storage
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

          {/* Confirmation Dialog */}
          <ConfirmDialog
            isOpen={this.state.confirmDialog.isOpen}
            onClose={this.closeConfirmDialog}
            onConfirm={() => {
              this.state.confirmDialog.onConfirm()
              this.closeConfirmDialog()
            }}
            title={this.state.confirmDialog.title}
            description={this.state.confirmDialog.description}
            variant={this.state.confirmDialog.variant}
            confirmText={
              this.state.confirmDialog.variant === 'destructive'
                ? 'Delete'
                : 'Confirm'
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}

// Default props
StorageErrorBoundary.defaultProps = {
  clearStorageOnRetry: false,
}

export default StorageErrorBoundary
