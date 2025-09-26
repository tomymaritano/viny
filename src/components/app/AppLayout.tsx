// Layout component - handles the main app layout structure
import React, { Suspense, lazy } from 'react'
import type { Note, Notebook, Settings } from '../../types'

// Layout Components
import TitleBarCompact from '../ui/TitleBarCompact'
import { ResizableLayout } from '../ResizableLayout'
import SidebarWrapper from '../features/SidebarWrapper'
import NotesListWrapper from '../features/NotesListWrapper'
import { NotePreview } from '../NotePreview'
import LoadingSpinner from '../LoadingSpinner'
import { useAppStore } from '../../stores/newSimpleStore'

// Lazy components
import { MarkdownItEditor as MarkdownEditor } from '../LazyComponents'
// Removed PluginPanel - plugins only in settings

// Lazy load AI Sidebar
const AISidebar = lazy(() => import('../ai/AISidebar'))

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
  editorContent?: string // Clean Architecture V2: UI state for editor

  // Auto-save state
  autoSaveState?: {
    isSaving: boolean
    hasUnsavedChanges: boolean
  }

  // Handlers
  handleOpenNote: (noteId: string) => void
  handleContentChange: (content: string) => void
  handleNotebookChange: (notebookName: string) => void
  handleMetadataChange: (noteOrUpdates: Note | Partial<Note>) => void
  createNewNote: () => void
  handleDeleteNote: (note: Note) => void | Promise<void>
  handleTogglePin: (note: Note) => void | Promise<void>
  handleDuplicateNote: (note: Note) => void | Promise<void>
  handleRestoreNote: (note: Note) => void | Promise<void>
  handlePermanentDelete: (note: Note) => void | Promise<void>
  handleOpenInNewWindow: (note: Note) => void
  handleViewHistory: (note: Note) => void
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
  editorContent,

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
  handleOpenInNewWindow,
  handleViewHistory,
  setModal,
  sortNotes,
}) => {
  // Get AI Chat state from store
  const { isAIChatOpen } = useAppStore()

  // Add general context menu handler
  const handleGeneralContextMenu = (e: React.MouseEvent) => {
    // Check if the click is on an empty area (not on specific elements)
    const target = e.target as HTMLElement
    const isEmptyArea =
      target.classList.contains('app-container') ||
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
        sidebar={<SidebarWrapper />}
        notesList={
          <NotesListWrapper
            selectedNoteId={currentNote?.id || undefined}
            onOpenNote={handleOpenNote}
            onNewNote={createNewNote}
            onMoveToNotebook={undefined} // Not implemented yet
            onRestoreNote={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
            currentSection={activeSection}
            isTrashView={activeSection === 'trash'}
            onSortNotes={sortNotes}
          />
        }
        mainContent={
          isEditorOpen && currentNote ? (
            <Suspense
              fallback={
                <LoadingSpinner text="Loading Editor..." size="medium" />
              }
            >
              <MarkdownEditor
                key={currentNote.id} // Force re-mount when note changes
                value={editorContent !== undefined ? editorContent : (currentNote.content || '')}
                onChange={handleContentChange}
                onSave={handleMetadataChange}
                selectedNote={currentNote}
                onNotebookChange={(noteId: string, notebookId: string) => {
                  // Convert notebook ID to name for V1 compatibility
                  const notebook = notebooks.find(n => n.id === notebookId)
                  if (notebook) {
                    handleNotebookChange(notebook.name)
                  }
                }}
                notebooks={notebooks}
                autoSaveState={autoSaveState}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onDuplicateNote={handleDuplicateNote}
                onOpenInNewWindow={handleOpenInNewWindow}
                onViewHistory={handleViewHistory}
              />
            </Suspense>
          ) : (
            <NotePreview
              note={selectedNote || currentNote}
              onEdit={note => handleOpenNote(note.id)}
              onSave={handleMetadataChange}
              onTogglePin={handleTogglePin}
              onDuplicate={handleDuplicateNote}
              onDelete={handleDeleteNote}
              onRestoreNote={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
              onOpenInNewWindow={handleOpenInNewWindow}
              onViewHistory={handleViewHistory}
              isTrashView={activeSection === 'trash'}
            />
          )
        }
        aiChat={
          isAIChatOpen && (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-theme-bg-primary">
                  <LoadingSpinner text="Loading AI Chat..." size="medium" />
                </div>
              }
            >
              <AISidebar />
            </Suspense>
          )
        }
        isSidebarVisible={true}
        isNotesListVisible={true}
        isAIChatVisible={isAIChatOpen}
      />
    </div>
  )
}

export default AppLayout
