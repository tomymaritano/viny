/**
 * EditorWrapper - Conditionally renders V1 or V2 editor based on feature flag
 */

import React, { forwardRef } from 'react'
import { featureFlags } from '../../config/featureFlags'
import { lazy, Suspense } from 'react'
import LoadingSpinner from '../LoadingSpinner'
import ComponentErrorBoundary from '../errors/ComponentErrorBoundary'
import type { Note, Notebook } from '../../types'

// Lazy load the FULL editor components (with title, toolbar, etc)
const MarkdownItEditor = lazy(() => import('../MarkdownItEditor'))
const MarkdownItEditorV2 = lazy(() => import('../MarkdownItEditorV2').catch(() => ({
  // If V2 doesn't exist yet, fall back to V1
  default: lazy(() => import('../MarkdownItEditor'))
})))

interface EditorWrapperProps {
  value: string
  onChange: (value: string) => void
  onSave?: (note: Note) => void
  selectedNote?: Note | null
  onNotebookChange?: (noteId: string, notebookId: string) => void
  notebooks?: Notebook[]
  autoSaveState?: {
    isSaving: boolean
    hasUnsavedChanges: boolean
  }
  placeholder?: string
  showLineNumbers?: boolean
}

/**
 * Wrapper component that selects the appropriate Editor implementation
 * based on the feature flag for clean architecture
 */
const EditorWrapper = forwardRef<unknown, EditorWrapperProps>((props, ref) => {
  // For now, always use V1 MarkdownItEditor since V2 doesn't exist yet
  // When V2 is ready, we can switch based on featureFlags.useCleanArchitecture
  const EditorComponent = MarkdownItEditor
  
  return (
    <ComponentErrorBoundary
      componentName="Editor"
      title="Failed to load editor"
      message="The editor failed to load. This might be due to a code error."
      resetLabel="Retry Loading"
    >
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="large" text="Loading editor..." />
          </div>
        }
      >
        <EditorComponent ref={ref} {...props} />
      </Suspense>
    </ComponentErrorBoundary>
  )
})

EditorWrapper.displayName = 'EditorWrapper'

export default EditorWrapper