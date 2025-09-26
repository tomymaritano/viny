/**
 * Lazy loaded components for better performance
 * Only loaded when actually needed
 */
import { createLazyComponent, preloadComponent } from './performance/LazyLoader'

// Heavy editor components
export const MarkdownItEditor = createLazyComponent(
  () => import('./MarkdownItEditor'),
  { preload: true } // Preload since it's the main editor
)
export const SplitEditor = createLazyComponent(
  () => import('./editor/SplitEditor'),
  { preload: true }
)
export const InkdropEditor = createLazyComponent(() => import('./InkdropEditor'))

// Settings modal - heavy component with many tabs
export const SettingsModal = createLazyComponent(() =>
  import('./settings/SettingsModal').then(module => ({
    default: module.SettingsModal,
  }))
)

// Export dialog - heavy with file operations
export const ExportDialog = createLazyComponent(() =>
  import('./ExportDialogWrapper').then(module => ({ default: module.default }))
)

// Tag management - complex interactions
export const TagModal = createLazyComponent(() =>
  import('./editor/tags/TagModalWrapper').then(module => ({
    default: module.default,
  }))
)
export const TagSettingsModal = createLazyComponent(
  () => import('./editor/tags/TagSettingsModal')
)

// Editor modals
export const EditorOptionsModal = createLazyComponent(
  () => import('./editor/modals/EditorOptionsModal')
)

// Complex UI components
export const NotebookContextMenu = createLazyComponent(
  () => import('./ui/NotebookContextMenu')
)
export const NoteActionsDropdown = createLazyComponent(
  () => import('./ui/NoteActionsDropdown')
)

// Preview components
export const MarkdownPreview = createLazyComponent(() =>
  import('./MarkdownPreview').then(module => ({
    default: module.MarkdownPreview,
  }))
)
export const NotePreview = createLazyComponent(() =>
  import('./NotePreview').then(module => ({ default: module.NotePreview }))
)

// Heavy AI/RAG components
export const SearchModalEnhanced = createLazyComponent(
  () => import('./SearchModalEnhanced')
)
export const RelatedNotes = createLazyComponent(
  () => import('./ai/RelatedNotes')
)

// Table and Zen mode - new heavy components
export const TableEditor = createLazyComponent(
  () => import('./editor/TableEditor')
)
export const ZenMode = createLazyComponent(
  () => import('./editor/ZenModeFixed')
)

// Preload critical components after initial render
export function preloadCriticalComponents() {
  // Preload components likely to be used soon
  setTimeout(() => {
    preloadComponent(() => import('./settings/SettingsModal').then(module => ({
      default: module.SettingsModal,
    })))
    preloadComponent(() => import('./SearchModalEnhanced'))
  }, 2000)
}
