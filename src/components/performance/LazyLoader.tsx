import React, { Suspense, lazy, ComponentType } from 'react'
import LoadingSpinner from '../LoadingSpinner'

interface LazyLoaderProps {
  loader: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error }>
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.props.fallback) {
      const Fallback = this.props.fallback
      return <Fallback error={this.state.error!} />
    }

    if (this.state.hasError) {
      return (
        <div className="p-4 bg-theme-bg-secondary rounded-lg">
          <p className="text-theme-accent-red">Failed to load component</p>
          <p className="text-sm text-theme-text-secondary mt-2">
            {this.state.error?.message}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export function createLazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ReactNode
    errorFallback?: React.ComponentType<{ error: Error }>
    preload?: boolean
  }
): T {
  const LazyComponent = lazy(loader)

  // Preload option for critical components
  if (options?.preload) {
    loader()
  }

  const WrappedComponent = (props: any) => (
    <ErrorBoundary fallback={options?.errorFallback}>
      <Suspense
        fallback={
          options?.fallback || (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )

  return WrappedComponent as T
}

// Utility for creating lazy loaded routes
export function createLazyRoute(
  loader: () => Promise<{ default: ComponentType<any> }>
) {
  return createLazyComponent(loader, {
    fallback: (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
  })
}

// Utility for preloading components
export function preloadComponent(
  loader: () => Promise<{ default: ComponentType<any> }>
) {
  return loader()
}