// Lazy-loaded components for better performance
import { lazy, Suspense } from 'react'
import LoadingSpinner from '../LoadingSpinner'
import ComponentErrorBoundary from '../errors/ComponentErrorBoundary'

// Lazy load heavy components
export const LazyMarkdownEditor = lazy(() => 
  import('../MarkdownItEditor').then(module => ({ default: module.default }))
)


export const LazySearchModal = lazy(() => 
  import('../SearchModal').then(module => ({ default: module.default }))
)

// LazyNotebookManager eliminado - componente NotebookManager no existe

export const LazyExportDialog = lazy(() => 
  import('../ExportDialog').then(module => ({ default: module.default }))
)

export const LazyTemplateModal = lazy(() => 
  import('../TemplateModal').then(module => ({ default: module.default }))
)

// HOC for wrapping lazy components with Suspense and ErrorBoundary
export function withSuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode,
  componentName?: string
) {
  return function SuspenseWrapper(props: P) {
    return (
      <ComponentErrorBoundary 
        componentName={componentName || 'Component'}
        title="Failed to load component"
        message="This component failed to load. This might be due to a network issue or a code error."
        resetLabel="Retry Loading"
      >
        <Suspense 
          fallback={fallback || <LoadingSpinner size="large" text="Loading component..." />}
        >
          <Component {...props} />
        </Suspense>
      </ComponentErrorBoundary>
    )
  }
}

// Pre-wrapped components ready to use
export const MarkdownEditor = withSuspense(LazyMarkdownEditor, undefined, 'MarkdownEditor')
export const SearchModal = withSuspense(LazySearchModal, undefined, 'SearchModal')
// NotebookManager eliminado
export const ExportDialog = withSuspense(LazyExportDialog, undefined, 'ExportDialog')
export const TemplateModal = withSuspense(LazyTemplateModal, undefined, 'TemplateModal')
