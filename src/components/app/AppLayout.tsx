// Layout component - handles the main app layout structure
import React, { Suspense } from 'react'
import { Note, Notebook, Settings } from '../../types'
import { Toast } from '../../stores/slices/uiSlice'
import { MarkdownPreviewHandle } from '../MarkdownPreview'

// Layout Components  
import TitleBarCompact from '../ui/TitleBarCompact'
import ResizableLayout from '../ResizableLayout'
import SidebarSimple from '../features/SidebarSimple'
import NotesListSimple from '../features/NotesListSimple'
import NotePreview from '../NotePreview'
import ToastContainer from '../ToastContainer'
import LoadingSpinner from '../LoadingSpinner'
import LazyWrapper from '../ui/LazyWrapper'

// Lazy components
import { MarkdownEditor } from '../features/LazyComponents'
import * as LazyComponents from '../LazyComponents'

interface AppLayoutProps {
  // Data
  currentNote: Note | null
  selectedNote: Note | null
  filteredNotes: Note[]
  notebooks: Notebook[]
  settings: Partial<Settings>
  
  // UI State
  isEditorOpen: boolean
  isPreviewVisible: boolean
  activeSection: string
  toasts: Toast[]
  
  // Refs
  previewRef: React.RefObject<MarkdownPreviewHandle>
  
  // Handlers
  handleOpenNote: (noteId: string) => void
  handleContentChange: (content: string) => void
  handleNotebookChange: (notebookName: string) => void
  handleMetadataChange: (note: Note) => void
  createNewNote: () => void
  handleDeleteNote: (note: Note) => void
  handleTogglePin: (note: Note) => void
  handleDuplicateNote: (note: Note) => void
  setModal: (modalName: string, isOpen: boolean) => void
  removeToast: (id: string) => void
  setIsPreviewVisible: (visible: boolean) => void
  sortNotes: (sortBy: string) => void
}

/**
 * Layout component that defines the main application structure
 * Handles only layout and composition, no business logic
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  // Data
  currentNote,
  selectedNote,
  filteredNotes,
  notebooks,
  settings,
  
  // UI State
  isEditorOpen,
  isPreviewVisible,
  activeSection,
  toasts,
  
  // Refs
  previewRef,
  
  // Handlers
  handleOpenNote,
  handleContentChange,
  handleNotebookChange,
  handleMetadataChange,
  createNewNote,
  handleDeleteNote,
  handleTogglePin,
  handleDuplicateNote,
  setModal,
  removeToast,
  setIsPreviewVisible,
  sortNotes
}) => {
  return (
    <div className="app-container">
      {/* Compact Electron title bar with manual dragging */}
      <TitleBarCompact title="Viny" />
      
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
            <Suspense fallback={<LoadingSpinner text="Loading Editor..." size="medium" />}>
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
            <LazyWrapper className="h-full">
              <LazyComponents.MarkdownPreview
                ref={previewRef}
                note={currentNote}
                syncScroll={true}
              />
            </LazyWrapper>
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
    </div>
  )
}

export default AppLayout