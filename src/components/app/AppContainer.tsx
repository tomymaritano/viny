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
import { useNoteSync } from '../../hooks/useNoteSync'
import { setupGlobalErrorHandler } from '../../utils/errorHandler'
import { i18nService } from '../../services/i18nService'
// import { initializeSettings } from '../../services/settings/initialize' - removed
// import { getSettingsService } from '../../services/settings' - removed
import { ToastContainer } from '../ui/ToastContainer'
import ElectronExportHandler from '../ElectronExportHandler'
import GlobalContextMenu from '../GlobalContextMenu'

// Import presentation component
import AppPresentation from './AppPresentation'

/**
 * Container component that handles all business logic and state management
 * This follows the Container/Presentational pattern for better separation of concerns
 */
export const AppContainer: React.FC = () => {

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
    handleDuplicateNote,
    handleRestoreNote,
    handlePermanentDelete
  } = useNoteActions()

  // UI state from store
  const {
    modals,
    toasts,
    activeSection,
    setModal,
    removeToast,
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
  
  // Initialize note synchronization for real-time updates between windows
  useNoteSync()

  // Initialize i18n service on mount
  React.useEffect(() => {
    i18nService.initialize()
  }, [])

  // Auto-save functionality
  const { debouncedAutoSave, isSaving: autoSaving, hasUnsavedChanges } = useAutoSave({ 
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

  // Settings initialization is now handled by the storage service automatically

  // Split memoized props for better performance
  const dataProps = useMemo(() => ({
    currentNote,
    selectedNote: selectedNote || null,
    filteredNotes,
    notebooks,
    settings: settings || {}
  }), [currentNote, selectedNote, filteredNotes, notebooks, settings])

  const uiStateProps = useMemo(() => ({
    isEditorOpen,
    isLoading,
    activeSection,
    modals,
    toasts
  }), [isEditorOpen, isLoading, activeSection, modals, toasts])

  const autoSaveState = useMemo(() => ({
    isSaving: autoSaving,
    hasUnsavedChanges
  }), [autoSaving, hasUnsavedChanges])

  const handlerProps = useMemo(() => ({
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleRestoreNote,
    handlePermanentDelete,
    setModal,
    removeToast,
    sortNotes
  }), [
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleRestoreNote,
    handlePermanentDelete,
    setModal,
    removeToast,
    sortNotes
  ])

  const appProps = useMemo(() => ({
    ...dataProps,
    ...uiStateProps,
    autoSaveState,
    ...handlerProps
  }), [dataProps, uiStateProps, autoSaveState, handlerProps])

  return (
    <>
      <AppPresentation {...appProps} />
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position="top-right"
        maxToasts={5}
      />
      <ElectronExportHandler />
      <GlobalContextMenu />
    </>
  )
}

