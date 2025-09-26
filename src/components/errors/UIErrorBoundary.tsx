/**
 * UIErrorBoundary - Error boundary for UI components
 * Catches rendering errors and provides graceful fallback
 */

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { XCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '../ui/Button'
import { logger } from '../../utils/logger'

interface UIErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentName?: string
}

const UIErrorFallback: React.FC<UIErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentName,
}) => {
  // Check if it's a React rendering error
  const isRenderError = error.message.includes('Cannot read') ||
                       error.message.includes('Cannot access') ||
                       error.stack?.includes('React')
  
  return (
    <div className="p-6 bg-theme-bg-secondary border border-theme-border rounded-lg">
      <div className="flex items-start gap-4">
        <XCircle className="w-8 h-8 text-theme-error flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            {componentName ? `${componentName} Error` : 'Display Error'}
          </h3>
          <p className="text-theme-text-secondary mb-4">
            {isRenderError
              ? 'This component encountered a rendering error and cannot be displayed.'
              : error.message || 'An unexpected error occurred in the UI.'}
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={resetErrorBoundary}
              variant="primary"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={() => {
                // Navigate to home or safe state
                window.location.hash = '#/'
                window.location.reload()
              }}
              variant="secondary"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-theme-text-secondary hover:text-theme-text">
                Technical Details
              </summary>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-theme-bg rounded text-xs font-mono">
                  <strong>Error:</strong> {error.message}
                </div>
                <pre className="p-3 bg-theme-bg rounded text-xs overflow-auto max-h-64">
                  {error.stack}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

interface UIErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  fallback?: React.ComponentType<UIErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

export const UIErrorBoundary: React.FC<UIErrorBoundaryProps> = ({
  children,
  componentName,
  fallback: CustomFallback,
  onError,
  resetKeys = [],
  resetOnPropsChange = true,
}) => {
  const previousResetKeys = React.useRef(resetKeys)
  
  React.useEffect(() => {
    if (resetOnPropsChange && 
        JSON.stringify(previousResetKeys.current) !== JSON.stringify(resetKeys)) {
      previousResetKeys.current = resetKeys
    }
  }, [resetKeys, resetOnPropsChange])
  
  const FallbackComponent = React.useCallback(
    (props: any) => {
      const Component = CustomFallback || UIErrorFallback
      return <Component {...props} componentName={componentName} />
    },
    [CustomFallback, componentName]
  )
  
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        logger.error(`UI Error in ${componentName || 'Component'}:`, {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        })
        onError?.(error, errorInfo)
      }}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  )
}

export default UIErrorBoundary