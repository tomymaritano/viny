/**
 * RepositoryErrorBoundary - Error boundary for repository layer
 * Catches errors from data operations and provides recovery options
 */

import React from 'react'
import { ErrorBoundary, type ErrorBoundaryProps } from 'react-error-boundary'
import { AlertCircle, RefreshCw, Database } from 'lucide-react'
import { Button } from '../ui/Button'
import { logger } from '../../utils/logger'

interface RepositoryErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const RepositoryErrorFallback: React.FC<RepositoryErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <Database className="w-16 h-16 text-theme-error mb-4" />
      <h2 className="text-xl font-semibold mb-2">Database Error</h2>
      <p className="text-theme-text-secondary mb-4 max-w-md">
        {error.message || 'An error occurred while accessing the database.'}
      </p>
      
      <div className="flex gap-3">
        <Button
          onClick={() => {
            // Clear local storage and retry
            if (window.confirm('This will clear your local data and reload the app. Continue?')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
          variant="secondary"
          size="sm"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Clear Data & Reload
        </Button>
        
        <Button
          onClick={resetErrorBoundary}
          variant="primary"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
      
      {import.meta.env.DEV && (
        <details className="mt-6 text-left max-w-2xl">
          <summary className="cursor-pointer text-sm text-theme-text-secondary">
            Error Details
          </summary>
          <pre className="mt-2 p-3 bg-theme-bg-secondary rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

interface RepositoryErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const RepositoryErrorBoundary: React.FC<RepositoryErrorBoundaryProps> = ({
  children,
  onError,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Repository Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    
    onError?.(error, errorInfo)
  }
  
  return (
    <ErrorBoundary
      FallbackComponent={RepositoryErrorFallback}
      onError={handleError}
      onReset={() => {
        // Optionally reinitialize repository
        window.location.reload()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default RepositoryErrorBoundary