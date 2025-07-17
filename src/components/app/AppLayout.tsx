// Layout component - handles the main app layout structure
import React, { Suspense } from 'react'
import { Note, Notebook, Settings } from '../../types'

// Layout Components  
import TitleBarCompact from '../ui/TitleBarCompact'
import { ResizableLayout } from '../ResizableLayout'
import SidebarSimple from '../features/SidebarSimple'
import NotesListSimple from '../features/NotesListSimple'
import { NotePreview } from '../NotePreview'
import LoadingSpinner from '../LoadingSpinner'

// Lazy components
import { MarkdownEditor } from '../features/LazyComponents'

interface AppLayoutProps {
  // Data
  currentNote: Note | null
  selectedNote: Note | null
  filteredNotes: Note[]
  notebooks: Notebook[]
  settings: Partial<Settings>
  
  // UI State
  isEditorOpen: boolean
  activeSection: string
  
  // Auto-save state
  autoSaveState?: {
    isSaving: boolean
    hasUnsavedChanges: boolean
  }
  
  // Handlers
  handleOpenNote: (noteId: string) => void
  handleContentChange: (content: string) => void
  handleNotebookChange: (notebookName: string) => void
  handleMetadataChange: (note: Note) => void
  createNewNote: () => void
  handleDeleteNote: (note: Note) => void | Promise<void>
  handleTogglePin: (note: Note) => void | Promise<void>
  handleDuplicateNote: (note: Note) => void | Promise<void>
  handleRestoreNote: (note: Note) => void | Promise<void>
  handlePermanentDelete: (note: Note) => void | Promise<void>
  setModal: (modalName: string, isOpen: boolean) => void
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
  activeSection,
  
  // Auto-save state
  autoSaveState,
  
  // Handlers
  handleOpenNote,
  handleContentChange,
  handleNotebookChange,
  handleMetadataChange,
  createNewNote,
  handleDeleteNote,
  handleTogglePin,
  handleDuplicateNote,
  handleRestoreNote,
  handlePermanentDelete,
  setModal,
  sortNotes
}) => {
  // Add general context menu handler
  const handleGeneralContextMenu = (e: React.MouseEvent) => {
    // Check if the click is on an empty area (not on specific elements)
    const target = e.target as HTMLElement
    const isEmptyArea = target.classList.contains('app-container') || 
                       target.classList.contains('notes-list-container') ||
                       target.classList.contains('sidebar-content') ||
                       !target.closest('[data-context-menu]')
    
    const electronAPI = window.electronAPI as any
    if (isEmptyArea && electronAPI?.isElectron) {
      e.preventDefault()
      electronAPI.showContextMenu('general')
    }
  }
  
  return (
    <div className="app-container" onContextMenu={handleGeneralContextMenu}>
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
            selectedNoteId={currentNote?.id || undefined}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onDuplicateNote={handleDuplicateNote}
            onRestoreNote={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
            currentSection={activeSection}
            isTrashView={activeSection === 'trash'}
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
                notebooks={notebooks}
                autoSaveState={autoSaveState}
              />
            </Suspense>
          ) : (
            <NotePreview
              note={selectedNote || currentNote}
              onEdit={(note) => handleOpenNote(note.id)}
              onTogglePin={handleTogglePin}
              onDuplicate={handleDuplicateNote}
              onDelete={handleDeleteNote}
              onRestoreNote={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
              isTrashView={activeSection === 'trash'}
            />
          )
        }
        isSidebarVisible={true}
        isNotesListVisible={true}
      />

    </div>
  )
}

export default AppLayout