// Simplified App component using simple store
import React, { Suspense } from 'react'
import { useAppLogic, useNoteActions } from './hooks/useSimpleLogic'
import { useSimpleStore } from './stores/simpleStore'
import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'

// Components
import { LoadingPage } from './components/ui/feedback/LoadingSpinner'
import ErrorBoundary from './components/ui/feedback/ErrorBoundary'
import ResizableLayout from './components/ResizableLayout'
import SidebarSimple from './components/features/SidebarSimple'
import NotesListSimple from './components/features/NotesListSimple'
import NotePreview from './components/NotePreview'
import PreviewPanel from './components/PreviewPanel'
import ToastContainer from './components/ToastContainer'

// Lazy components
import {
  MarkdownEditor,
  SettingsPage,
  SearchModal,
  NotebookManager,
  ExportDialog
} from './components/features/LazyComponents'

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
    setModal,
    removeToast,
    setIsPreviewVisible,
    setCurrentNote,
    setSelectedNoteId,
    setIsEditorOpen
  } = useSimpleStore()

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

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
    if (currentNote) {
      const updatedNote = { ...currentNote, content: newContent }
      setCurrentNote(updatedNote)
    }
  }

  const handleNotebookChange = (notebook: string) => {
    if (currentNote) {
      const updatedNote = { ...currentNote, notebook }
      setCurrentNote(updatedNote)
      handleSaveNote(updatedNote)
    }
  }

  // Loading state
  if (isLoading) {
    return <LoadingPage text="Loading Nototo..." />
  }

  // Settings view
  if (modals.settings) {
    return (
      <ErrorBoundary>
        <div className="app">
          <Suspense fallback={<LoadingPage text="Loading Settings..." />}>
            <SettingsPage onClose={() => setModal('settings', false)} />
          </Suspense>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
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
            />
          }
          mainContent={
            isEditorOpen ? (
              <Suspense fallback={<LoadingPage text="Loading Editor..." />}>
                <MarkdownEditor
                  value={currentNote?.content || ''}
                  onChange={handleContentChange}
                  onSave={handleSaveNote}
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
                note={selectedNote}
                onEdit={handleOpenNote}
                onTogglePin={handleTogglePin}
                onDuplicate={handleDuplicateNote}
                onDelete={handleDeleteNote}
              />
            )
          }
          previewPanel={
            <PreviewPanel
              note={isEditorOpen ? currentNote : selectedNote}
              isVisible={isEditorOpen && isPreviewVisible}
              onClose={() => setIsPreviewVisible(false)}
            />
          }
          isPreviewVisible={isEditorOpen && isPreviewVisible}
          isSidebarVisible={true}
          isNotesListVisible={true}
        />

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50">
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AppSimple