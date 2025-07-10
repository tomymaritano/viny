import { lazy, Suspense } from 'react'

// Lazy load the heavy MarkdownEditor component
const MarkdownEditor = lazy(() => import('./MarkdownEditor'))

// Loading fallback component
const EditorSkeleton = () => (
  <div className="flex-1 theme-bg-primary flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent-primary mx-auto mb-4"></div>
      <div className="text-theme-text-tertiary">Loading editor...</div>
    </div>
  </div>
)

const LazyMarkdownEditor = props => {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <MarkdownEditor {...props} />
    </Suspense>
  )
}

export default LazyMarkdownEditor
