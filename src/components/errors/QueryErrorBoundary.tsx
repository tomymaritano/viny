/**
 * QueryErrorBoundary - Error boundary for TanStack Query layer
 * Handles query and mutation errors with retry logic
 */

import React from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { logger } from '../../utils/logger'
import LoadingSpinner from '../LoadingSpinner'

interface QueryErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const QueryErrorFallback: React.FC<QueryErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false)
  
  // Check if it's a network error
  const isNetworkError = error.message.toLowerCase().includes('network') ||
                        error.message.toLowerCase().includes('fetch') ||
                        error.message.toLowerCase().includes('failed to fetch')
  
  const handleRetry = async () => {
    setIsRetrying(true)
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    resetErrorBoundary()
  }
  
  if (isRetrying) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner text="Retrying..." />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      {isNetworkError ? (
        <>
          <WifiOff className="w-12 h-12 text-theme-text-secondary mb-4" />
          <h2 className="text-lg font-semibold mb-2">Connection Error</h2>
          <p className="text-theme-text-secondary mb-4 max-w-md">
            Unable to connect to the server. Please check your internet connection.
          </p>
        </>
      ) : (
        <>
          <AlertCircle className="w-12 h-12 text-theme-error mb-4" />
          <h2 className="text-lg font-semibold mb-2">Data Loading Error</h2>
          <p className="text-theme-text-secondary mb-4 max-w-md">
            {error.message || 'Failed to load data. Please try again.'}
          </p>
        </>
      )}
      
      <div className="flex gap-3">
        <Button
          onClick={handleRetry}
          variant="primary"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
        
        {isNetworkError && (
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Reload Page
          </Button>
        )}
      </div>
      
      {import.meta.env.DEV && !isNetworkError && (
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

interface QueryErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<QueryErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const QueryErrorBoundaryWrapper: React.FC<QueryErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={fallback || QueryErrorFallback}
          onError={(error, errorInfo) => {
            logger.error('Query Error:', {
              error: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack,
            })
            onError?.(error, errorInfo)
          }}
          onReset={reset}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default QueryErrorBoundaryWrapper