// Presentation component for AppSimple - handles only UI rendering
import React, { Suspense } from 'react'
import { Note, Notebook, Settings } from '../../types'

// UI Components
import { AppLoading } from '../LoadingStates'
import LoadingSpinner from '../LoadingSpinner'
import { ErrorBoundary } from '../ErrorBoundary'
import StorageErrorBoundary from '../errors/StorageErrorBoundary'
import AppLayout from './AppLayout'
import AppModals from './AppModals'

interface AppPresentationProps {
  // Data
  currentNote: Note | null
  selectedNote: Note | null
  filteredNotes: Note[]
  notebooks: Notebook[]
  settings: Partial<Settings>
  
  // UI State
  isEditorOpen: boolean
  isLoading: boolean
  activeSection: string
  modals: {
    search: boolean
    export: boolean
    settings: boolean
    tagModal: boolean
    notebookManager: boolean
  }
  
  // Handlers
  handleOpenNote: (noteId: string) => void
  handleContentChange: (content: string) => void
  handleNotebookChange: (notebookName: string) => void
  handleMetadataChange: (note: Note) => void
  createNewNote: () => void
  handleSaveNote: (note: Note) => Promise<Note>
  handleDeleteNote: (note: Note) => void | Promise<void>
  handleTogglePin: (note: Note) => void | Promise<void>
  handleDuplicateNote: (note: Note) => void | Promise<void>
  handleRestoreNote: (note: Note) => void | Promise<void>
  handlePermanentDelete: (note: Note) => void | Promise<void>
  setModal: (modalName: string, isOpen: boolean) => void
  sortNotes: (sortBy: string) => void
}

/**
 * Pure presentation component that only handles UI rendering
 * Contains no business logic or state management
 */
const AppPresentation: React.FC<AppPresentationProps> = ({
  // Data
  currentNote,
  selectedNote,
  filteredNotes,
  notebooks,
  settings,
  
  // UI State
  isEditorOpen,
  isLoading,
  activeSection,
  modals,
  
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
  sortNotes
}) => {
  // Loading state
  if (isLoading) {
    return <AppLoading message="Loading Viny..." />
  }


  return (
    <div data-testid="app-container">
      <ErrorBoundary>
        <StorageErrorBoundary
          clearStorageOnRetry={true}
          onError={(error) => {
            // Error is handled by ErrorBoundary
          }}
          onRetry={() => {
            window.location.reload()
          }}
        >
          <AppLayout
          // Data
          currentNote={currentNote}
          selectedNote={selectedNote}
          filteredNotes={filteredNotes}
          notebooks={notebooks}
          settings={settings}
          
          // UI State
          isEditorOpen={isEditorOpen}
          activeSection={activeSection}
          
          // Handlers
          handleOpenNote={handleOpenNote}
          handleContentChange={handleContentChange}
          handleNotebookChange={handleNotebookChange}
          handleMetadataChange={handleMetadataChange}
          createNewNote={createNewNote}
          handleDeleteNote={handleDeleteNote}
          handleTogglePin={handleTogglePin}
          handleDuplicateNote={handleDuplicateNote}
          handleRestoreNote={handleRestoreNote}
          handlePermanentDelete={handlePermanentDelete}
          setModal={setModal}
          sortNotes={sortNotes}
        />

        <AppModals
          modals={modals}
          currentNote={currentNote}
          filteredNotes={filteredNotes}
          handleOpenNote={handleOpenNote}
          handleSaveNote={handleSaveNote}
          setModal={setModal}
          createNewNote={createNewNote}
        />
      </StorageErrorBoundary>
    </ErrorBoundary>
    </div>
  )
}

export default AppPresentation