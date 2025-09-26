/**
 * ServiceErrorBoundary - Error boundary for service layer
 * Catches business logic errors and provides appropriate recovery
 */

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import { logger } from '../../utils/logger'
import { useToast } from '../../hooks/useToast'

interface ServiceErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ServiceErrorFallback: React.FC<ServiceErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { showToast } = useToast()
  
  // Check if it's a known business logic error
  const isBusinessError = error.message.includes('required') || 
                         error.message.includes('already exists') ||
                         error.message.includes('not found') ||
                         error.message.includes('Cannot')
  
  if (isBusinessError) {
    // For business logic errors, show a simpler UI
    return (
      <div className="p-4 bg-theme-warning-bg border border-theme-warning rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-theme-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-theme-text">Operation Failed</h3>
            <p className="text-sm text-theme-text-secondary mt-1">
              {error.message}
            </p>
            <Button
              onClick={() => {
                resetErrorBoundary()
                showToast('Please try again', 'info')
              }}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // For unexpected errors
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-theme-warning mb-4" />
      <h2 className="text-lg font-semibold mb-2">Service Error</h2>
      <p className="text-theme-text-secondary mb-4 max-w-md">
        An unexpected error occurred in the business logic layer.
      </p>
      
      <Button
        onClick={resetErrorBoundary}
        variant="primary"
        size="sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry Operation
      </Button>
      
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

interface ServiceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ServiceErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const ServiceErrorBoundary: React.FC<ServiceErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Service Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
    
    onError?.(error, errorInfo)
  }
  
  return (
    <ErrorBoundary
      FallbackComponent={fallback || ServiceErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ServiceErrorBoundary