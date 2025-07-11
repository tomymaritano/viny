// Simplified App component using simple store - Refactored with custom hooks
import React, { Suspense } from 'react'
import { useAppLogic, useNoteActions } from './hooks/useSimpleLogic'
import { useSimpleStore } from './stores/simpleStore'
import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePageLifecycle } from './hooks/usePageLifecycle'
import { useAppHandlers } from './hooks/useAppHandlers'

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
import TagModal from './components/editor/tags/TagModal'
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
    sortNotes
  } = useSimpleStore()

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

  // Custom hooks for extracted functionality
  const { debouncedAutoSave } = useAutoSave({ 
    onSave: handleSaveNote,
    debounceMs: 1000
  })

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

        {/* Tag Modal */}
        {modals.tagModal && (
          <TagModal
            isOpen={modals.tagModal}
            onClose={() => setModal('tagModal', false)}
            currentTags={currentNote?.tags || []}
            onTagsChange={(newTags) => {
              if (currentNote) {
                handleSaveNote({ ...currentNote, tags: newTags })
              }
            }}
            availableTags={[...new Set(filteredNotes.flatMap(note => note.tags))]}
          />
        )}

        </div>
      </StorageErrorBoundary>
    </ErrorBoundary>
  )
}

export default AppSimple