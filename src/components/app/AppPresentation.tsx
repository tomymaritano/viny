// Presentation component for AppSimple - handles only UI rendering
import React, { Suspense } from 'react'
import { Note, Notebook, Settings } from '../../types'
import { Toast } from '../../stores/slices/uiSlice'
import { MarkdownPreviewHandle } from '../MarkdownPreview'

// UI Components
import { AppLoading } from '../LoadingStates'
import LoadingSpinner from '../LoadingSpinner'
import ErrorBoundary from '../ErrorBoundary'
import StorageErrorBoundary from '../errors/StorageErrorBoundary'
import SettingsView from '../SettingsView'
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
  isPreviewVisible: boolean
  activeSection: string
  modals: {
    search: boolean
    export: boolean
    settings: boolean
    tagModal: boolean
    notebookManager: boolean
  }
  toasts: Toast[]
  
  // Refs
  previewRef: React.RefObject<MarkdownPreviewHandle | null>
  
  // Handlers
  handleOpenNote: (noteId: string) => void
  handleContentChange: (content: string) => void
  handleNotebookChange: (notebookName: string) => void
  handleMetadataChange: (note: Note) => void
  createNewNote: () => void
  handleSaveNote: (note: Note) => Promise<Note>
  handleDeleteNote: (note: Note) => void
  handleTogglePin: (note: Note) => void
  handleDuplicateNote: (note: Note) => void
  setModal: (modalName: string, isOpen: boolean) => void
  removeToast: (id: string) => void
  setIsPreviewVisible: (visible: boolean) => void
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
}) => {
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
        <AppLayout
          // Data
          currentNote={currentNote}
          selectedNote={selectedNote}
          filteredNotes={filteredNotes}
          notebooks={notebooks}
          settings={settings}
          
          // UI State
          isEditorOpen={isEditorOpen}
          isPreviewVisible={isPreviewVisible}
          activeSection={activeSection}
          toasts={toasts}
          
          // Refs
          previewRef={previewRef}
          
          // Handlers
          handleOpenNote={handleOpenNote}
          handleContentChange={handleContentChange}
          handleNotebookChange={handleNotebookChange}
          handleMetadataChange={handleMetadataChange}
          createNewNote={createNewNote}
          handleDeleteNote={handleDeleteNote}
          handleTogglePin={handleTogglePin}
          handleDuplicateNote={handleDuplicateNote}
          setModal={setModal}
          removeToast={removeToast}
          setIsPreviewVisible={setIsPreviewVisible}
          sortNotes={sortNotes}
        />

        <AppModals
          modals={modals}
          currentNote={currentNote}
          filteredNotes={filteredNotes}
          handleOpenNote={handleOpenNote}
          handleSaveNote={handleSaveNote}
          setModal={setModal}
        />
      </StorageErrorBoundary>
    </ErrorBoundary>
  )
}

export default AppPresentation