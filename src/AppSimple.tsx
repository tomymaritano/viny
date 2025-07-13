// Simplified App component using simple store - Refactored with custom hooks
import React, { Suspense, useRef } from 'react'
import { useAppLogic, useNoteActions } from './hooks/useSimpleLogic'
import { useAppStore } from './stores/newSimpleStore'
import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { usePageLifecycle } from './hooks/usePageLifecycle'
import { useAppHandlers } from './hooks/useAppHandlers'

// Components
import { AppLoading } from './components/LoadingStates'
import ContentLoader from './components/ui/ContentLoader'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import StorageErrorBoundary from './components/errors/StorageErrorBoundary'
import ResizableLayout from './components/ResizableLayout'
import SidebarSimple from './components/features/SidebarSimple'
import NotesListSimple from './components/features/NotesListSimple'
import NotePreview from './components/NotePreview'
import MarkdownPreview, { MarkdownPreviewHandle } from './components/MarkdownPreview'
import ToastContainer from './components/ToastContainer'
import TitleBar from './components/ui/TitleBar'

// Lazy components
import {
  MarkdownEditor,
  ExportDialog,
  NotebookManager
} from './components/features/LazyComponents'
import SearchModal from './components/SearchModal'
import TagModal from './components/editor/tags/TagModal'
import SettingsView from './components/SettingsView'

import './App.css'

const AppSimple: React.FC = () => {
  // Refs for scroll sync
  const previewRef = useRef<MarkdownPreviewHandle>(null)

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
  } = useAppStore()

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
    return <AppLoading message="Loading Nototo..." />
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
        <div className="app-container">
          {/* Modern Electron title bar with robust dragging */}
          <TitleBar title="Nototo" />
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
                onDuplicateNote={handleDuplicateNote}
                currentSection={activeSection}
                onSortNotes={sortNotes}
              />
            }
            mainContent={
              isEditorOpen && currentNote ? (
                <Suspense fallback={<ContentLoader message="Loading Editor..." compact={true} />}>
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
            previewPanel={
              isPreviewVisible && currentNote ? (
                <MarkdownPreview
                  ref={previewRef}
                  note={currentNote}
                  syncScroll={true}
                />
              ) : null
            }
            isPreviewVisible={isPreviewVisible}
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
            onSelectNote={handleOpenNote}
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
