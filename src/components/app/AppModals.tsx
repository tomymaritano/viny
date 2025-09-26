// Modals component - handles all modal dialogs in the app
import React, { Suspense } from 'react'
import type { Note } from '../../types'
import { useAppStore } from '../../stores/newSimpleStore'

// Modal Components
import { SearchModalWrapper as SearchModal } from '../SearchModalWrapper'
import { TagModal } from '../editor/tags/TagModal'
import { SettingsModal } from '../settings/SettingsModal'
import { AIOnboardingModal } from '../ai/AIOnboardingModal'
import RevisionHistoryModal from '../revision/RevisionHistoryModal'

// Lazy modal components
import { ExportDialog } from '../LazyComponents'

interface AppModalsProps {
  modals: {
    search: boolean
    export: boolean
    settings: boolean
    tagModal: boolean
    notebookManager: boolean
    aiOnboarding: boolean
    revisionHistory: boolean
  }
  currentNote: Note | null
  filteredNotes: Note[]
  handleOpenNote: (noteId: string) => void
  handleSaveNote: (note: Note) => Promise<Note>
  setModal: (modalName: string, isOpen: boolean) => void
  createNewNote: () => void
}

/**
 * Component that manages all modal dialogs in the application
 * Provides centralized modal management and lazy loading
 */
const AppModals: React.FC<AppModalsProps> = ({
  modals,
  currentNote,
  filteredNotes,
  handleOpenNote,
  handleSaveNote,
  setModal,
  createNewNote,
}) => {
  // Get store functions for creating notes with tags
  const { addNote, setCurrentNote, setSelectedNoteId, setIsEditorOpen } =
    useAppStore()

  // Helper function to create a new note with specific tags
  const createNewNoteWithTags = (tags: string[]) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      notebook: 'personal',
      tags: tags, // Set the tags directly
      status: 'draft',
      isPinned: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addNote(newNote)
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setIsEditorOpen(true)
  }
  return (
    <>
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
        <Suspense fallback={<div>Loading Export Dialog...</div>}>
          <ExportDialog
            isVisible={modals.export}
            onClose={() => setModal('export', false)}
            notes={[currentNote]}
            type="single"
          />
        </Suspense>
      )}

      {/* Settings Modal */}
      {modals.settings && (
        <SettingsModal
          isOpen={modals.settings}
          onClose={() => setModal('settings', false)}
        />
      )}

      {/* Tag Modal */}
      {modals.tagModal && (
        <TagModal
          isOpen={modals.tagModal}
          onClose={() => setModal('tagModal', false)}
          currentTags={currentNote?.tags || []}
          mode={currentNote ? 'note' : 'global'}
          filteredNotes={filteredNotes}
          onTagsChange={newTags => {
            if (currentNote) {
              // Edit existing note
              handleSaveNote({ ...currentNote, tags: newTags })
            } else {
              // Global mode - just close modal (tags are managed via individual actions)
              setModal('tagModal', false)
            }
          }}
          availableTags={[...new Set(filteredNotes.flatMap(note => note.tags))]}
        />
      )}

      {/* Notebook Manager - Temporalmente deshabilitado (componente eliminado) */}
      {/* {modals.notebookManager && (
        <NotebookManager
          isVisible={modals.notebookManager}
          onClose={() => setModal('notebookManager', false)}
          onNotebookChange={handleNotebookChange}
        />
      )} */}

      {/* AI Onboarding Modal */}
      {modals.aiOnboarding && (
        <AIOnboardingModal
          isOpen={modals.aiOnboarding}
          onClose={() => setModal('aiOnboarding', false)}
          onComplete={() => {
            setModal('aiOnboarding', false)
            // Refresh AI availability in search modal
            window.location.reload()
          }}
        />
      )}

      {/* Revision History Modal */}
      {modals.revisionHistory && (
        <RevisionHistoryModal
          isOpen={modals.revisionHistory}
          onClose={() => setModal('revisionHistory', false)}
          note={currentNote}
          onRestoreRevision={handleSaveNote}
        />
      )}
    </>
  )
}

export default AppModals
