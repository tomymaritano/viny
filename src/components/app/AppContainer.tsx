// Container component for AppSimple - handles business logic and state management
import React, { useRef, useMemo, useEffect } from 'react'
import { useAppLogic, useNoteActions } from '../../hooks/useSimpleLogic'
import type { Note } from '../../types'
import { useAppStore } from '../../stores/newSimpleStore'
import { useQueryClient } from '@tanstack/react-query'
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
import { ToastProvider, ToastViewport } from '../ui/RadixToast'
import ElectronExportHandler from '../ElectronExportHandler'
import GlobalContextMenuWrapper from '../GlobalContextMenuWrapper'

// Import presentation component
import AppPresentation from './AppPresentation'

/**
 * Container component that handles all business logic and state management
 * This follows the Container/Presentational pattern for better separation of concerns
 */
export const AppContainer: React.FC = () => {
  const queryClient = useQueryClient()
  
  // Logic hooks - business logic and data fetching
  const { currentNote, selectedNote, isEditorOpen, isLoading, filteredNotes } =
    useAppLogic()

  const {
    createNewNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleRestoreNote,
    handlePermanentDelete,
  } = useNoteActions()

  // UI state from store
  const { modals, toasts, activeSection, setModal, removeToast, sortNotes } =
    useAppStore()

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
  
  // Check if AI onboarding should be shown
  React.useEffect(() => {
    if (settings?.ai && !settings.ai.onboardingCompleted && !settings.ai.skipInstallation) {
      // Show AI onboarding after a short delay to let the app initialize
      setTimeout(() => {
        setModal('aiOnboarding', true)
      }, 2000)
    }
  }, [settings?.ai, setModal])

  // Auto-save functionality
  const {
    debouncedAutoSave,
    isSaving: autoSaving,
    hasUnsavedChanges,
  } = useAutoSave({
    onSave: async (note: Note) => {
      await handleSaveNote(note)
    },
    debounceMs: 1000,
  })

  // App handlers for user interactions
  const {
    handleOpenNote,
    handleContentChange,
    handleNotebookChange,
    handleMetadataChange,
  } = useAppHandlers({
    filteredNotes,
    onSaveNote: async (note: Note) => {
      await handleSaveNote(note)
    },
    debouncedAutoSave,
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    currentNote,
    onCreateNew: createNewNote,
    onSave: async () => {
      // Get the latest note from TanStack Query cache
      const noteId = useAppStore.getState().selectedNoteId
      if (!noteId) {
        console.warn('No note selected for save')
        return
      }
      
      // Get the current note from store (has latest content)
      const storeNote = useAppStore.getState().currentNote
      
      // Get fresh metadata from query cache - try individual note first
      const individualCachedNote = queryClient.getQueryData<Note>(['viny', 'notes', noteId])
      
      // If no individual cache, try to find in notes array
      let cachedNote = individualCachedNote
      if (!cachedNote) {
        const cachedNotes = queryClient.getQueryData<Note[]>(['viny', 'notes']) || []
        cachedNote = cachedNotes.find(n => n.id === noteId)
      }
      
      if (storeNote && storeNote.id === noteId) {
        // Use storeNote as base (it should have latest metadata after sync)
        // Only override content and title from current editing state
        const latestNote = {
          ...storeNote,
          updatedAt: new Date().toISOString()
        }
        
        console.log('📝 Keyboard shortcut save:', {
          id: latestNote.id,
          notebook: latestNote.notebook,
          tags: latestNote.tags,
          status: latestNote.status,
          title: latestNote.title,
          hasIndividualCache: !!individualCachedNote,
          hasArrayCache: !!cachedNote,
          fromStore: !!storeNote
        })
        await handleSaveNote(latestNote)
      } else {
        console.warn('No current note found for id:', noteId)
      }
    },
    onSearch: () => setModal('search', true),
    onExport: () => setModal('export', true),
    onSettings: () => setModal('settings', true),
  })

  // Page lifecycle management
  usePageLifecycle({ currentNote })

  // Settings initialization is now handled by the storage service automatically

  // Split memoized props for better performance
  const dataProps = useMemo(
    () => ({
      currentNote,
      selectedNote: selectedNote || null,
      filteredNotes,
      notebooks,
      settings: settings || {},
    }),
    [currentNote, selectedNote, filteredNotes, notebooks, settings]
  )

  const uiStateProps = useMemo(
    () => ({
      isEditorOpen,
      isLoading,
      activeSection,
      modals,
      toasts,
    }),
    [isEditorOpen, isLoading, activeSection, modals, toasts]
  )

  const autoSaveState = useMemo(
    () => ({
      isSaving: autoSaving,
      hasUnsavedChanges,
    }),
    [autoSaving, hasUnsavedChanges]
  )

  const handlerProps = useMemo(
    () => ({
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
      sortNotes,
    }),
    [
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
      sortNotes,
    ]
  )

  const appProps = useMemo(
    () => ({
      ...dataProps,
      ...uiStateProps,
      autoSaveState,
      ...handlerProps,
    }),
    [dataProps, uiStateProps, autoSaveState, handlerProps]
  )

  return (
    <ToastProvider swipeDirection="right">
      <AppPresentation {...appProps} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} maxToasts={5} />
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      <ElectronExportHandler />
      <GlobalContextMenuWrapper />
    </ToastProvider>
  )
}
