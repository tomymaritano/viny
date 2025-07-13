// Modals component - handles all modal dialogs in the app
import React, { Suspense } from 'react'
import { Note } from '../../types'

// Modal Components
import SearchModal from '../SearchModal'
import TagModal from '../editor/tags/TagModal'

// Lazy modal components
import { ExportDialog } from '../features/LazyComponents'

interface AppModalsProps {
  modals: {
    search: boolean
    export: boolean
    settings: boolean
    tagModal: boolean
    notebookManager: boolean
  }
  currentNote: Note | null
  filteredNotes: Note[]
  handleOpenNote: (noteId: string) => void
  handleSaveNote: (note: Note) => Promise<Note>
  setModal: (modalName: string, isOpen: boolean) => void
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
  setModal
}) => {
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
            isOpen={modals.export}
            onClose={() => setModal('export', false)}
            note={currentNote}
          />
        </Suspense>
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

      {/* Notebook Manager - Temporalmente deshabilitado (componente eliminado) */}
      {/* {modals.notebookManager && (
        <NotebookManager
          isVisible={modals.notebookManager}
          onClose={() => setModal('notebookManager', false)}
          onNotebookChange={handleNotebookChange}
        />
      )} */}
    </>
  )
}

export default AppModals