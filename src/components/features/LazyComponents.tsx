// Lazy-loaded components for better performance
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '../ui/feedback/LoadingSpinner'

// Lazy load heavy components
export const LazyMarkdownEditor = lazy(() => 
  import('../MarkdownItEditor').then(module => ({ default: module.default }))
)

export const LazySettingsPage = lazy(() => 
  import('../SettingsPage').then(module => ({ default: module.default }))
)

export const LazySearchModal = lazy(() => 
  import('../SearchModal').then(module => ({ default: module.default }))
)

export const LazyNotebookManager = lazy(() => 
  import('../NotebookManager').then(module => ({ default: module.default }))
)

export const LazyExportDialog = lazy(() => 
  import('../ExportDialog').then(module => ({ default: module.default }))
)

// HOC for wrapping lazy components with Suspense
export function withSuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense 
        fallback={fallback || <LoadingSpinner size="lg" text="Loading component..." />}
      >
        <Component {...props} />
      </Suspense>
    )
  }
}

// Pre-wrapped components ready to use
export const MarkdownEditor = withSuspense(LazyMarkdownEditor)
export const SettingsPage = withSuspense(LazySettingsPage)
export const SearchModal = withSuspense(LazySearchModal)
export const NotebookManager = withSuspense(LazyNotebookManager)
export const ExportDialog = withSuspense(LazyExportDialog)