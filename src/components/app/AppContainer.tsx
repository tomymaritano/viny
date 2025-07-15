// Container component for AppSimple - handles business logic and state management
import React, { useRef, useMemo, useEffect } from 'react'
import { useAppLogic, useNoteActions } from '../../hooks/useSimpleLogic'
import { Note } from '../../types'
import { useAppStore } from '../../stores/newSimpleStore'
import { useSettings } from '../../hooks/useSettings'
import { useNotebooks } from '../../hooks/useNotebooks'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { usePageLifecycle } from '../../hooks/usePageLifecycle'
import { useAppHandlers } from '../../hooks/useAppHandlers'
import { useSettingsEffects } from '../../hooks/useSettingsEffects'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import { setupGlobalErrorHandler } from '../../utils/errorHandler'
import { i18nService } from '../../services/i18nService'
import { MarkdownPreviewHandle } from '../MarkdownPreview'
import ToastContainer from '../ui/ToastContainer'

// Import presentation component
import AppPresentation from './AppPresentation'

/**
 * Container component that handles all business logic and state management
 * This follows the Container/Presentational pattern for better separation of concerns
 */
const AppContainer: React.FC = () => {
  // Refs for scroll sync
  const previewRef = useRef<MarkdownPreviewHandle>(null)

  // Logic hooks - business logic and data fetching
  const { 
    currentNote, 
    selectedNote, 
    isEditorOpen, 
    isLoading, 
    filteredNotes 
  } = useAppLogic()

  const {
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote
  } = useNoteActions()

  // UI state from store
  const {
    modals,
    toasts,
    isPreviewVisible,
    activeSection,
    setModal,
    removeToast,
    setIsPreviewVisible,
    sortNotes
  } = useAppStore()

  // Error handling
  const errorHandler = useErrorHandler()

  // Setup global error handler
  useEffect(() => {
    setupGlobalErrorHandler()
  }, [])

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

  // Apply settings effects
  useSettingsEffects()

  // Initialize i18n service on mount
  React.useEffect(() => {
    i18nService.initialize()
  }, [])

  // Auto-save functionality
  const { debouncedAutoSave } = useAutoSave({ 
    onSave: async (note: Note) => {
      await handleSaveNote(note)
    },
    debounceMs: 1000
  })

  // App handlers for user interactions
  const {
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange
  } = useAppHandlers({
    filteredNotes,
    onSaveNote: async (note: Note) => {
      await handleSaveNote(note)
    },
    debouncedAutoSave
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    currentNote,
    onCreateNew: createNewNote,
    onSave: async (note: Note) => {
      await handleSaveNote(note)
    },
    onSearch: () => setModal('search', true),
    onExport: () => setModal('export', true),
    onSettings: () => setModal('settings', true)
  })

  // Page lifecycle management
  usePageLifecycle({ currentNote })

  // Memoized props to prevent unnecessary re-renders
  const appProps = useMemo(() => ({
    // Data
    currentNote,
    selectedNote: selectedNote || null,
    filteredNotes,
    notebooks,
    settings: settings || {},
    
    // UI State
    isEditorOpen,
    isLoading,
    isPreviewVisible,
    activeSection,
    modals,
    toasts,
    
    // Refs
    previewRef,
    
    // Handlers
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    setModal,
    removeToast,
    setIsPreviewVisible,
    sortNotes
  }), [
    currentNote,
    selectedNote,
    filteredNotes,
    notebooks,
    settings,
    isEditorOpen,
    isLoading,
    isPreviewVisible,
    activeSection,
    modals,
    toasts,
    previewRef,
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    setModal,
    removeToast,
    setIsPreviewVisible,
    sortNotes
  ])

  return (
    <>
      <AppPresentation {...appProps} />
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position="top-right"
        maxToasts={5}
      />
    </>
  )
}

export default AppContainer