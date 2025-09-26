/**
 * Lazy loaded components for V2 architecture
 * Improves initial load performance
 */

import { lazy, Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'

// Lazy load heavy components
export const SettingsModalV2Lazy = lazy(() => 
  import(/* webpackChunkName: "settings-v2" */ './settings/SettingsModalV2')
)

export const SearchModalV2Lazy = lazy(() => 
  import(/* webpackChunkName: "search-v2" */ './search/SearchModalV2')
)

export const ExportDialogV2Lazy = lazy(() => 
  import(/* webpackChunkName: "export-v2" */ './ExportDialogV2')
)

export const PluginManagerV2Lazy = lazy(() => 
  import(/* webpackChunkName: "plugins-v2" */ './PluginManagerV2')
)

// Other heavy components that can be lazy loaded
export const MarkdownPreviewLazy = lazy(() => 
  import(/* webpackChunkName: "markdown-preview" */ './MarkdownPreview')
)

export const InkdropEditorLazy = lazy(() => 
  import(/* webpackChunkName: "inkdrop-editor" */ './InkdropEditor')
)

export const AIOnboardingModalLazy = lazy(() => 
  import(/* webpackChunkName: "ai-onboarding" */ './ai/AIOnboardingModal')
)

export const SearchModalEnhancedLazy = lazy(() => 
  import(/* webpackChunkName: "search-enhanced" */ './SearchModalEnhanced')
)

export const RevisionHistoryModalLazy = lazy(() => 
  import(/* webpackChunkName: "revision-history" */ './revision/RevisionHistoryModal')
)

// Wrapper component with suspense
export const withSuspense = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  )
}

// Pre-wrapped components
export const SettingsModalV2 = withSuspense(SettingsModalV2Lazy)
export const SearchModalV2 = withSuspense(SearchModalV2Lazy)
export const ExportDialogV2 = withSuspense(ExportDialogV2Lazy)
export const PluginManagerV2 = withSuspense(PluginManagerV2Lazy)
export const MarkdownPreview = withSuspense(MarkdownPreviewLazy)
export const InkdropEditor = withSuspense(InkdropEditorLazy)
export const AIOnboardingModal = withSuspense(AIOnboardingModalLazy)
export const SearchModalEnhanced = withSuspense(SearchModalEnhancedLazy)
export const RevisionHistoryModal = withSuspense(RevisionHistoryModalLazy)