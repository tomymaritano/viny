/**
 * Lazy loaded components for better performance
 * Only loaded when actually needed
 */
import { lazy } from 'react'

// Heavy editor components
export const MarkdownItEditor = lazy(() => import('./MarkdownItEditor'))
export const SplitEditor = lazy(() => import('./editor/SplitEditor'))
export const InkdropEditor = lazy(() => import('./InkdropEditor'))

// Settings modal - heavy component with many tabs
export const SettingsModal = lazy(() => import('./settings/SettingsModal'))

// Search modal - uses Fuse.js
export const SearchModal = lazy(() => import('./SearchModal'))

// Export dialog - heavy with file operations
export const ExportDialog = lazy(() => import('./ExportDialog'))

// Tag management - complex interactions
export const TagModal = lazy(() => import('./editor/tags/TagModal'))
export const TagSettingsModal = lazy(() => import('./editor/tags/TagSettingsModal'))

// Editor modals
export const EditorOptionsModal = lazy(() => import('./editor/modals/EditorOptionsModal'))

// Complex UI components
export const NotebookContextMenu = lazy(() => import('./ui/NotebookContextMenu'))
export const NoteActionsDropdown = lazy(() => import('./ui/NoteActionsDropdown'))

// Preview components
export const MarkdownPreview = lazy(() => import('./MarkdownPreview'))
export const NotePreview = lazy(() => import('./NotePreview'))