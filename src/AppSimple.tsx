// Simplified App component using simple store
import React, { Suspense, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppLogic, useNoteActions } from './hooks/useSimpleLogic'
import { useSimpleStore } from './stores/simpleStore'
import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'
import { storageService } from './lib/storage'

// Components
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import StorageErrorBoundary from './components/errors/StorageErrorBoundary'
import ResizableLayout from './components/ResizableLayout'
import SidebarSimple from './components/features/SidebarSimple'
import NotesListSimple from './components/features/NotesListSimple'
import NotePreview from './components/NotePreview'
import ToastContainer from './components/ToastContainer'

// Lazy components
import {
  MarkdownEditor,
  SearchModal,
  ExportDialog,
  NotebookManager
} from './components/features/LazyComponents'
import SettingsView from './components/SettingsView'

import './App.css'

const AppSimple: React.FC = () => {
  // Logic hooks
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

  // UI state from simple store
  const {
    modals,
    toasts,
    isPreviewVisible,
    activeSection,
    setModal,
    removeToast,
    setIsPreviewVisible,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen,
    sortNotes
  } = useSimpleStore()

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

  // Stable reference to avoid debounce recreation
  const saveNoteRef = useRef(handleSaveNote)
  saveNoteRef.current = handleSaveNote

  // Debounced auto-save function with stable reference
  const debouncedAutoSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastSaveTime = 0
    
    return (note: any) => {
      const now = Date.now()
      
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Set new timeout for auto-save
      timeoutId = setTimeout(async () => {
        try {
          console.log('[AutoSave] Starting auto-save for note:', note.title, 'ID:', note.id)
          console.log('[AutoSave] Note content length:', note.content?.length || 0)
          
          const startTime = Date.now()
          await saveNoteRef.current(note)
          const endTime = Date.now()
          
          lastSaveTime = endTime
          console.log('[AutoSave] Auto-save completed successfully in', endTime - startTime, 'ms')
        } catch (error) {
          console.error('[AutoSave] Failed to auto-save note:', error)
          // Don't throw here - auto-save failures shouldn't break the UI
        }
      }, 1000) // Increased to 1 second debounce for auto-save
    }
  }, []) // Empty dependency array to prevent recreation

  // Simple handlers
  const handleOpenNote = (noteId: string) => {
    const note = filteredNotes.find(n => n.id === noteId)
    if (note) {
      setCurrentNote(note)
      setSelectedNoteId(noteId)
      setIsEditorOpen(true)
    }
  }

  const handleContentChange = (newContent: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useSimpleStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { 
        ...latestCurrentNote, 
        content: newContent,
        updatedAt: new Date().toISOString()
      }
      console.log('[ContentChange] Updating note:', updatedNote.title, 'ID:', updatedNote.id)
      setCurrentNote(updatedNote)
      // Trigger debounced auto-save
      debouncedAutoSave(updatedNote)
    } else {
      console.warn('[ContentChange] No current note found in store!')
    }
  }

  const handleNotebookChange = (notebook: string) => {
    // Get the latest currentNote from the store to avoid stale closure issues
    const latestCurrentNote = useSimpleStore.getState().currentNote
    
    if (latestCurrentNote) {
      const updatedNote = { ...latestCurrentNote, notebook }
      console.log('[NotebookChange] Updating note:', updatedNote.title, 'ID:', updatedNote.id)
      setCurrentNote(updatedNote)
      handleSaveNote(updatedNote)
    } else {
      console.warn('[NotebookChange] No current note found in store!')
    }
  }

  // Handler for metadata changes (immediate save, no auto-save)
  const handleMetadataChange = useCallback(async (updatedNote: any) => {
    try {
      console.log('[MetadataChange] Saving metadata for:', updatedNote.title)
      setCurrentNote(updatedNote)
      await handleSaveNote(updatedNote)
    } catch (error) {
      console.error('[MetadataChange] Failed to save metadata:', error)
    }
  }, [handleSaveNote, setCurrentNote])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isTyping = ['input', 'textarea'].includes(
        (e.target as HTMLElement).tagName.toLowerCase()
      )
      
      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setModal('search', true)
      }
      
      // Cmd/Ctrl + N - New note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isTyping) {
        e.preventDefault()
        createNewNote()
      }
      
      // Cmd/Ctrl + S - Save (when in editor)
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && currentNote) {
        e.preventDefault()
        handleSaveNote(currentNote)
      }
      
      // Cmd/Ctrl + E - Export current note
      if ((e.metaKey || e.ctrlKey) && e.key === 'e' && currentNote) {
        e.preventDefault()
        setModal('export', true)
      }
      
      // Cmd/Ctrl + , - Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setModal('settings', true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentNote, createNewNote, handleSaveNote, setModal])

  // Cleanup: flush any pending saves before unmount or page close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('[AppSimple] Page unloading, flushing pending saves...')
      storageService.flushPendingSaves()
      
      // If there are unsaved changes, warn the user
      if (currentNote) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[AppSimple] Page hidden, flushing pending saves...')
        storageService.flushPendingSaves()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      console.log('[AppSimple] Component unmounting, flushing pending saves...')
      storageService.flushPendingSaves()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Remove currentNote dependency to prevent constant remounting

  // Loading state
  if (isLoading) {
    return <LoadingSpinner text="Loading Nototo..." />
  }

  // Settings view
  if (modals.settings) {
    return (
      <ErrorBoundary>
        <div className="app">
          <SettingsView onClose={() => setModal('settings', false)} />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <StorageErrorBoundary
        clearStorageOnRetry={true}
        onError={(error) => {
          console.error('Storage service error:', error)
        }}
        onRetry={() => {
          window.location.reload()
        }}
      >
        <div className="app">
          <ResizableLayout
            settings={settings}
            sidebar={<SidebarSimple />}
            notesList={
              <NotesListSimple
                notes={filteredNotes}
                onOpenNote={handleOpenNote}
                onNewNote={createNewNote}
                selectedNoteId={currentNote?.id || null}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePin}
                currentSection={activeSection}
                onSortNotes={sortNotes}
              />
            }
            mainContent={
              isEditorOpen && currentNote ? (
                <Suspense fallback={<LoadingSpinner text="Loading Editor..." />}>
                  <MarkdownEditor
                    key={currentNote.id}  // Force re-mount when note changes
                    value={currentNote.content || ''}
                    onChange={handleContentChange}
                    onSave={handleMetadataChange}
                    selectedNote={currentNote}
                    onNotebookChange={handleNotebookChange}
                    onExport={() => setModal('export', true)}
                    onTogglePreview={() => setIsPreviewVisible(!isPreviewVisible)}
                    isPreviewVisible={isPreviewVisible}
                    notebooks={notebooks}
                  />
                </Suspense>
              ) : (
                <NotePreview
                  note={selectedNote || currentNote}
                  onEdit={handleOpenNote}
                  onTogglePin={handleTogglePin}
                  onDuplicate={handleDuplicateNote}
                  onDelete={handleDeleteNote}
                />
              )
            }
            previewPanel={null}
            isPreviewVisible={false}
            isSidebarVisible={true}
            isNotesListVisible={true}
          />

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50">
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>

        {/* Search Modal */}
        {modals.search && (
          <SearchModal
            isOpen={modals.search}
            onClose={() => setModal('search', false)}
            onSelectNote={(note) => handleOpenNote(note.id)}
            notes={filteredNotes}
            onPinNote={handleTogglePin}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {/* Export Dialog */}
        {modals.export && currentNote && (
          <ExportDialog
            isOpen={modals.export}
            onClose={() => setModal('export', false)}
            note={currentNote}
          />
        )}

        {/* Notebook Manager */}
        {modals.notebookManager && (
          <NotebookManager
            isVisible={modals.notebookManager}
            onClose={() => setModal('notebookManager', false)}
            onNotebookChange={handleNotebookChange}
          />
        )}

        </div>
      </StorageErrorBoundary>
    </ErrorBoundary>
  )
}

export default AppSimple