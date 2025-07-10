// Modern App component - purely presentational
import React, { Suspense } from 'react'
import { useAppLogic } from './hooks/useAppLogic'
import { useNoteActions } from './hooks/useNoteActions'
import { useModalLogic } from './hooks/useModalLogic'
import { useAppStore } from './stores/appStoreFixed'
import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'

// Components
import { LoadingPage } from './components/ui/feedback/LoadingSpinner'
import ErrorBoundary from './components/ui/feedback/ErrorBoundary'
import ResizableLayout from './components/ResizableLayout'
import SidebarV3 from './components/features/SidebarV3'
import NotesListV3 from './components/features/NotesListV3'
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

const App: React.FC = () => {
  // All logic extracted to hooks
  const { 
    currentNote, 
    selectedNote, 
    isEditorOpen, 
    isLoading, 
    filteredNotes 
  } = useAppLogic()

  const {
    handleOpenNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleCreateNote,
    handleContentChange,
    handleNotebookChange
  } = useNoteActions()

  const {
    modals,
    handleCloseSettings,
    handleOpenExport,
    handleCloseSearch,
    handleCloseNotebookManager,
    handleCloseExport
  } = useModalLogic()

  // UI state
  const {
    toasts,
    isPreviewVisible,
    getIsSidebarVisible,
    getIsNotesListVisible,
    removeToast,
    showSuccess,
    setIsPreviewVisible
  } = useAppStore(state => ({
    toasts: state.toasts,
    isPreviewVisible: state.isPreviewVisible,
    getIsSidebarVisible: state.getIsSidebarVisible,
    getIsNotesListVisible: state.getIsNotesListVisible,
    removeToast: state.removeToast,
    showSuccess: state.showSuccess,
    setIsPreviewVisible: state.setIsPreviewVisible
  }))

  const { settings } = useSettings()
  const { notebooks } = useNotebooks()

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
            <SettingsPage onClose={handleCloseSettings} />
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
          sidebar={<SidebarV3 />}
          notesList={
            <NotesListV3
              notes={filteredNotes}
              onOpenNote={handleOpenNote}
              onNewNote={handleCreateNote}
              selectedNoteId={currentNote?.id || null}
              onDeleteNote={handleDeleteNote}
            />
          }
          mainContent={
            isEditorOpen ? (
              <Suspense fallback={<LoadingPage text="Loading Editor..." />}>
                <MarkdownEditor
                  value={currentNote?.content || ''}
                  onChange={(newContent) => {
                    if (currentNote) {
                      handleContentChange(currentNote, newContent)
                    }
                  }}
                  onSave={handleSaveNote}
                  selectedNote={currentNote}
                  onNotebookChange={(notebook) => {
                    if (currentNote) {
                      handleNotebookChange(currentNote, notebook)
                    }
                  }}
                  onExport={handleOpenExport}
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
          isSidebarVisible={getIsSidebarVisible()}
          isNotesListVisible={getIsNotesListVisible()}
        />

        {/* Modals */}
        <Suspense fallback={null}>
          <NotebookManager
            isVisible={modals.notebookManager}
            onClose={handleCloseNotebookManager}
            onNotebookChange={(notebook) => {
              showSuccess(`Notebook "${notebook.name}" created successfully`)
            }}
          />

          <SearchModal
            isOpen={modals.search}
            onClose={handleCloseSearch}
            onSelectNote={(note) => {
              handleOpenNote(note.id)
              handleCloseSearch()
              showSuccess(`Opened "${note.title}"`)
            }}
            onPinNote={handleTogglePin}
            onDeleteNote={handleDeleteNote}
            notes={filteredNotes}
          />

          {modals.export && currentNote && (
            <ExportDialog
              isOpen={modals.export}
              onClose={handleCloseExport}
              note={currentNote}
              onExport={(format) => {
                console.log('Exporting as:', format)
                handleCloseExport()
              }}
            />
          )}
        </Suspense>

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50">
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App