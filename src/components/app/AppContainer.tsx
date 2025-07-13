// Container component for AppSimple - handles business logic and state management
import React, { useRef } from 'react'
import { useAppLogic, useNoteActions } from '../../hooks/useSimpleLogic'
import { useAppStore } from '../../stores/newSimpleStore'
import { useSettings } from '../../hooks/useSettings'
import { useNotebooks } from '../../hooks/useNotebooks'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { usePageLifecycle } from '../../hooks/usePageLifecycle'
import { useAppHandlers } from '../../hooks/useAppHandlers'
import { MarkdownPreviewHandle } from '../MarkdownPreview'

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

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

  // Auto-save functionality
  const { debouncedAutoSave } = useAutoSave({ 
    onSave: handleSaveNote,
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
    onSaveNote: handleSaveNote,
    debouncedAutoSave
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    currentNote,
    onCreateNew: createNewNote,
    onSave: handleSaveNote,
    onSearch: () => setModal('search', true),
    onExport: () => setModal('export', true),
    onSettings: () => setModal('settings', true)
  })

  // Page lifecycle management
  usePageLifecycle({ currentNote })

  // Compose all props needed by the presentation component
  const appProps = {
    // Data
    currentNote,
    selectedNote,
    filteredNotes,
    notebooks,
    settings,
    
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
  }

  return <AppPresentation {...appProps} />
}

export default AppContainer