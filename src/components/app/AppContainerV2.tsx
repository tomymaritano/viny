/**
 * AppContainerV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2 + UI-only Store
 */

import React, { useRef, useMemo, useEffect, useCallback, memo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useActiveNotesQueryV2, useCreateNoteMutationV2, useUpdateNoteMutationV2, useDeleteNoteMutationV2 } from '../../hooks/queries/useNotesServiceQueryV2'
import { useNotebooksQueryV2 } from '../../hooks/queries/useNotebooksServiceQueryV2'
import { useSettingsQueryV2 } from '../../hooks/queries/useSettingsServiceQueryV2'
import { useFilteredNotesV2 } from '../../hooks/queries/useFilteredNotesV2'
import { useNoteUIStore, useNotebookUIStore, useModalStore, useToastStore, useSettingsUIStore, useUiStore, useEditorStore } from '../../stores/cleanUIStore'
import type { Note } from '../../types'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { usePageLifecycle } from '../../hooks/usePageLifecycle'
import { useAppHandlers } from '../../hooks/useAppHandlers'
import { useSettingsEffects } from '../../hooks/useSettingsEffects'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import { useNoteSync } from '../../hooks/useNoteSync'
import { useToast } from '../../hooks/useToast'
import { setupGlobalErrorHandler } from '../../utils/errorHandler'
import { i18nService } from '../../services/i18nService'
import { ToastContainer } from '../ui/ToastContainer'
import { ToastProvider, ToastViewport } from '../ui/RadixToast'
import ElectronExportHandler from '../ElectronExportHandler'
import GlobalContextMenuWrapper from '../GlobalContextMenuWrapper'
import QueryErrorBoundaryWrapper from '../errors/QueryErrorBoundary'
import UIErrorBoundary from '../errors/UIErrorBoundary'
import CleanArchPerformanceDashboard from '../performance/CleanArchPerformanceDashboard'

// Import presentation component
import AppPresentationV2 from './AppPresentationV2'

/**
 * Container component V2 that uses the clean architecture
 * Fetches data via TanStack Query and manages UI state only
 */
export const AppContainerV2: React.FC = memo(() => {
  // Query client for accessing cache
  const queryClient = useQueryClient()
  
  // Data queries
  const { data: notebooks = [] } = useNotebooksQueryV2()
  const { data: settings } = useSettingsQueryV2()
  
  // Mutations
  const createNoteMutation = useCreateNoteMutationV2()
  const updateNoteMutation = useUpdateNoteMutationV2()
  const deleteNoteMutation = useDeleteNoteMutationV2()
  
  // UI state from clean stores
  const {
    selectedNoteId,
    setSelectedNoteId,
    isEditorOpen,
    openEditor,
    closeEditor,
    sortBy,
    sortDirection,
  } = useNoteUIStore()
  
  const {
    editorContent,
    setEditorContent,
  } = useEditorStore()
  
  const {
    selectedNotebookId,
    setSelectedNotebookId,
  } = useNotebookUIStore()
  
  const {
    activeSection,
    setActiveSection,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
  } = useUiStore()
  
  const {
    modals,
    setModal,
  } = useModalStore()
  
  const {
    toasts = [],
    removeToast,
  } = useToastStore()
  
  const { showToast } = useToast()
  
  // Use optimized filtered notes hook
  const { notes: filteredNotes, isLoading: notesLoading, counts } = useFilteredNotesV2({
    activeSection,
    selectedNotebookId,
    selectedTag,
    searchQuery,
    sortBy,
    sortDirection,
    showPinnedFirst: settings?.showPinnedFirst ?? true
  })
  
  // Get current note from filtered notes for better performance
  const selectedNote = selectedNoteId
    ? filteredNotes.find(note => note.id === selectedNoteId)
    : null
    
  const currentNote = selectedNote || filteredNotes[0] || null
  
  // Debug logging - commented out for performance
  // useEffect(() => {
  //   console.log('[AppContainerV2] State:', {
  //     activeSection,
  //     selectedNotebookId,
  //     filteredNotesCount: filteredNotes.length
  //   })
  // }, [activeSection, selectedNotebookId, filteredNotes.length])
  
  // Debug logging - commented out for performance
  // useEffect(() => {
  //   console.log('[AppContainerV2] State:', {
  //     selectedNoteId,
  //     isEditorOpen,
  //     currentNote: currentNote?.title,
  //     filteredNotesCount: filteredNotes.length
  //   })
  // }, [selectedNoteId, isEditorOpen, currentNote, filteredNotes.length])
  
  // Auto-select first note if none selected and notes are available
  useEffect(() => {
    if (!selectedNoteId && filteredNotes.length > 0 && !notesLoading) {
      setSelectedNoteId(filteredNotes[0].id)
      openEditor() // Open editor when auto-selecting first note
    }
  }, [selectedNoteId, filteredNotes, notesLoading, setSelectedNoteId, openEditor])
  
  // Refs
  const unsavedChangesRef = useRef(false)
  const editorRef = useRef<any>(null)
  
  // Auto-save hook
  const { debouncedAutoSave, isSaving: autoSaving, hasUnsavedChanges } = useAutoSave({
    onSave: async (note: Note) => {
      if (note && editorContent !== note.content) {
        await updateNoteMutation.mutateAsync({
          id: note.id,
          data: { content: editorContent, updatedAt: new Date().toISOString() }
        })
        unsavedChangesRef.current = false
      }
    },
    enabled: settings?.autoSave ?? true,
    debounceMs: 1000,
  })
  
  // Note actions
  const createNewNote = useCallback(async () => {
    // Find notebook name from ID
    let notebookName = 'default'
    if (selectedNotebookId && notebooks) {
      const notebook = notebooks.find(nb => nb.id === selectedNotebookId)
      if (notebook) {
        notebookName = notebook.name
      }
    }
    
    const newNote = await createNoteMutation.mutateAsync({
      title: 'New Note',
      content: '',
      notebook: notebookName,
      tags: selectedTag ? [selectedTag] : [],
    })
    setSelectedNoteId(newNote.id)
    openEditor()
    return newNote
  }, [createNoteMutation, selectedNotebookId, selectedTag, setSelectedNoteId, openEditor, notebooks])
  
  const handleSaveNote = useCallback(async (id: string, updates: Partial<Note>) => {
    await updateNoteMutation.mutateAsync({ id, data: updates })
    showToast('Note saved', 'success')
  }, [updateNoteMutation, showToast])
  
  const handleDeleteNote = useCallback(async (id: string, permanent = false) => {
    try {
      await deleteNoteMutation.mutateAsync({ id, permanent })
      if (selectedNoteId === id) {
        setSelectedNoteId(null)
      }
      showToast(permanent ? 'Note permanently deleted' : 'Note moved to trash', 'success')
    } catch (error) {
      console.error('[AppContainerV2] Delete mutation failed:', error)
      throw error
    }
  }, [deleteNoteMutation, selectedNoteId, setSelectedNoteId, showToast])
  
  const handleTogglePin = useCallback(async (id: string) => {
    const note = filteredNotes.find(n => n.id === id)
    if (note) {
      await updateNoteMutation.mutateAsync({
        id,
        data: { isPinned: !note.isPinned }
      })
    }
  }, [filteredNotes, updateNoteMutation])
  
  const handleDuplicateNote = useCallback(async (id: string) => {
    const note = filteredNotes.find(n => n.id === id)
    if (note) {
      const newNote = await createNoteMutation.mutateAsync({
        title: `${note.title} (Copy)`,
        content: note.content,
        notebook: note.notebook,
        tags: [...note.tags],
      })
      setSelectedNoteId(newNote.id)
      showToast('Note duplicated', 'success')
    }
  }, [filteredNotes, createNoteMutation, setSelectedNoteId, showToast])
  
  const handleRestoreNote = useCallback(async (id: string) => {
    await updateNoteMutation.mutateAsync({
      id,
      data: { isTrashed: false }
    })
    showToast('Note restored', 'success')
  }, [updateNoteMutation, showToast])
  
  const handlePermanentDelete = useCallback(async (id: string) => {
    await deleteNoteMutation.mutateAsync({ id, permanent: true })
    showToast('Note permanently deleted', 'success')
  }, [deleteNoteMutation, showToast])
  
  const handleOpenInNewWindow = useCallback((id: string) => {
    if (window.electronAPI?.isElectron && window.electronAPI?.openNoteInNewWindow) {
      window.electronAPI.openNoteInNewWindow(id)
    }
  }, [])
  
  const handleViewHistory = useCallback((id: string) => {
    console.log('[AppContainerV2] handleViewHistory called with id:', id)
    console.log('[AppContainerV2] Current state:', {
      selectedNoteId,
      currentNote: currentNote?.id,
      currentNoteTitle: currentNote?.title
    })
    
    // Show a toast to confirm the action was triggered
    showToast('Opening revision history...', 'info')
    
    // Ensure the note is selected before opening history
    if (selectedNoteId !== id) {
      setSelectedNoteId(id)
    }
    setModal('revisionHistory', true)
    
    console.log('[AppContainerV2] Modal should be open now')
  }, [selectedNoteId, setSelectedNoteId, setModal, currentNote, showToast])
  
  // Effects
  useSettingsEffects(settings || {})
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: createNewNote,
    onSaveNote: currentNote
      ? async () => {
          // Use the mutation directly to ensure we only update content
          // This follows Clean Architecture: mutations handle the data layer
          await updateNoteMutation.mutateAsync({
            id: currentNote.id,
            data: { 
              content: editorContent,
              updatedAt: new Date().toISOString()
            }
          })
        }
      : undefined,
    onDeleteNote: currentNote
      ? () => handleDeleteNote(currentNote.id)
      : undefined,
    onTogglePin: currentNote
      ? () => handleTogglePin(currentNote.id)
      : undefined,
    onDuplicateNote: currentNote
      ? () => handleDuplicateNote(currentNote.id)
      : undefined,
    onSearch: () => setModal('search', true),
    onViewHistory: currentNote
      ? () => handleViewHistory(currentNote.id)
      : undefined,
    onEscape: () => {
      // Close all modals
      Object.keys(modals).forEach(key => setModal(key, false))
    },
  })
  
  // Page lifecycle
  usePageLifecycle({
    onShow: () => {
      // Refresh data when page becomes visible
    },
    onHide: () => {
      // Handle unsaved changes
      if (unsavedChangesRef.current && currentNote) {
        handleSaveNote(currentNote.id, { content: editorContent })
      }
    },
  })
  
  // Global error handler
  useEffect(() => {
    const cleanup = setupGlobalErrorHandler()
    return cleanup
  }, [])
  
  // Error handling
  const { handleError } = useErrorHandler()
  
  // Note sync (if needed)
  useNoteSync({
    notes: filteredNotes,
    onNoteCreated: (note: Note) => {
      // Handle remote note creation
    },
    onNoteUpdated: (note: Note) => {
      // Handle remote note update
    },
    onNoteDeleted: (id: string) => {
      // Handle remote note deletion
    },
  })
  
  // Language initialization
  useEffect(() => {
    if (settings?.language) {
      i18nService.changeLanguage(settings.language)
    }
  }, [settings?.language])
  
  // Update editor content when note changes
  useEffect(() => {
    if (currentNote) {
      setEditorContent(currentNote.content)
    }
  }, [currentNote, setEditorContent])
  
  // Handle content changes with auto-save
  const handleContentChange = useCallback((content: string) => {
    setEditorContent(content)
    if (currentNote && settings?.autoSave) {
      debouncedAutoSave({ ...currentNote, content })
    }
  }, [currentNote, setEditorContent, debouncedAutoSave, settings?.autoSave])
  
  const isLoading = notesLoading || !settings
  
  return (
    <QueryErrorBoundaryWrapper>
      <UIErrorBoundary componentName="AppContainerV2">
        <ToastProvider>
          <AppPresentationV2
            // State
            notes={filteredNotes}
            notebooks={notebooks}
            currentNote={currentNote}
            selectedNote={selectedNote}
            editorContent={editorContent}
            isEditorOpen={isEditorOpen}
            isLoading={isLoading}
            
            // Handlers
            onCreateNote={createNewNote}
            onSaveNote={handleSaveNote}
            onDeleteNote={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleDeleteNote(id)
            }}
            onTogglePin={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleTogglePin(id)
            }}
            onDuplicateNote={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleDuplicateNote(id)
            }}
            onRestoreNote={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleRestoreNote(id)
            }}
            onPermanentDelete={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handlePermanentDelete(id)
            }}
            onOpenInNewWindow={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleOpenInNewWindow(id)
            }}
            onViewHistory={(noteOrId: string | Note) => {
              const id = typeof noteOrId === 'string' ? noteOrId : noteOrId.id
              handleViewHistory(id)
            }}
            onSelectNote={(noteId: string) => {
              setSelectedNoteId(noteId)
              openEditor()
            }}
            onEditorChange={handleContentChange}
            onCloseEditor={useCallback(() => closeEditor(), [closeEditor])}
            
            // UI State
            modals={modals}
            toasts={toasts}
            activeSection={activeSection}
            selectedNotebookId={selectedNotebookId}
            searchQuery={searchQuery}
            onModalChange={setModal}
            onToastRemove={removeToast}
            
            // Settings
            settings={settings}
            
            // Refs
            editorRef={editorRef}
            unsavedChangesRef={unsavedChangesRef}
          />
          
          {/* Global components */}
          <ToastContainer />
          <ToastViewport />
          <ElectronExportHandler />
          <GlobalContextMenuWrapper />
          <CleanArchPerformanceDashboard />
        </ToastProvider>
      </UIErrorBoundary>
    </QueryErrorBoundaryWrapper>
  )
})

AppContainerV2.displayName = 'AppContainerV2'