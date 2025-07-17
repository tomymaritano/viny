// Container component for AppSimple - handles business logic and state management
import React, { useRef, useMemo, useEffect } from 'react'
import { useAppLogic, useNoteActions } from '../../hooks/useSimpleLogic'
import { Note } from '../../types'
import { useAppStore } from '../../stores/newSimpleStore'
import { useSettingsService } from '../../hooks/useSettingsService'
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
import { initializeSettings } from '../../services/settings/initialize'
import { getSettingsService } from '../../services/settings'
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

  // Setup global error handler and initialize settings
  useEffect(() => {
    setupGlobalErrorHandler()
    initializeSettings()
  }, [])

  const { settings } = useSettingsService()
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

  // Initialize settings service on startup
  useEffect(() => {
    const initSettings = async () => {
      try {
        await initializeSettings()
        console.log('Settings service initialized')
      } catch (error) {
        console.error('Failed to initialize settings service:', error)
      }
    }
    initSettings()
  }, [])

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
    activeSection,
    modals,
    toasts,
    
    // Auto-save state
    autoSaveState: {
      isSaving: autoSaving,
      hasUnsavedChanges
    },
    
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
    handleRestoreNote,
    handlePermanentDelete,
    setModal,
    removeToast,
    sortNotes
  }), [
    currentNote,
    selectedNote,
    filteredNotes,
    notebooks,
    settings,
    isEditorOpen,
    isLoading,
    activeSection,
    modals,
    toasts,
    autoSaving,
    hasUnsavedChanges,
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

