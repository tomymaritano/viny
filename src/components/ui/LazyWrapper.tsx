/**
 * Higher-order component for wrapping lazy components with Suspense
 */
import type { ComponentType } from 'react'
import React, { Suspense } from 'react'
import LoadingSpinner from '../LoadingSpinner'

interface LazyWrapperProps {
  fallback?: React.ReactNode
  className?: string
}

/**
 * HOC to wrap lazy components with Suspense and a loading fallback
 */
export function withLazyWrapper<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = (props: P & LazyWrapperProps) => {
    const { className, ...componentProps } = props

    const defaultFallback = (
      <div
        className={`flex items-center justify-center py-8 ${className || ''}`}
      >
        <LoadingSpinner size="sm" />
      </div>
    )

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...(componentProps as P)} />
      </Suspense>
    )
  }

  LazyComponent.displayName = `LazyWrapper(${Component.displayName || Component.name})`

  return LazyComponent
}

/**
 * Simple wrapper component for inline use
 */
interface LazyWrapperComponentProps extends LazyWrapperProps {
  children: React.ReactNode
}

export const LazyWrapper: React.FC<LazyWrapperComponentProps> = ({
  children,
  fallback,
  className,
}) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center py-8 ${className || ''}`}>
      <LoadingSpinner size="sm" />
    </div>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}

export default LazyWrapper
