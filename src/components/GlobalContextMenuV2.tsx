import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useToast } from '../hooks/useToast'
import { 
  useActiveNotesQueryV2, 
  useDeleteNoteMutationV2, 
  useUpdateNoteMutationV2, 
  useDuplicateNoteMutationV2 
} from '../hooks/queries/useNotesServiceQueryV2'
import { useNotebooksQueryV2 } from '../hooks/queries/useNotebooksServiceQueryV2'
import { useNoteUIStore, useModalStore } from '../stores/cleanUIStore'
import RenameModal from './modals/RenameModal'
import ConfirmModal from './modals/ConfirmModal'
import TagColorModal from './modals/TagColorModal'
import { logger } from '../utils/logger'

// For now, use a simplified version that works with existing infrastructure
const GlobalContextMenuV2: React.FC = () => {
  // Use existing store for now
  const { setModal, setActiveSection, removeTagFromAllNotes } = useAppStore()
  
  // TanStack Query hooks
  const { data: notes = [] } = useActiveNotesQueryV2()
  const { data: notebooks = [] } = useNotebooksQueryV2()
  const { showToast } = useToast()
  
  // Mutations
  const deleteNoteMutation = useDeleteNoteMutationV2()
  const updateNoteMutation = useUpdateNoteMutationV2()
  const duplicateNoteMutation = useDuplicateNoteMutationV2()
  
  // UI state
  const { selectedNoteId, setSelectedNoteId } = useNoteUIStore()
  const { setModal: setModalV2 } = useModalStore()
  
  // Store refs to always access latest values
  const notesRef = useRef(notes)
  const notebooksRef = useRef(notebooks)
  const selectedNoteIdRef = useRef(selectedNoteId)
  
  useEffect(() => {
    notesRef.current = notes
    notebooksRef.current = notebooks
    selectedNoteIdRef.current = selectedNoteId
  }, [notes, notebooks, selectedNoteId])

  // Rename modal state
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    type: '' as 'notebook' | 'tag',
    id: '',
    currentName: '',
  })

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'danger' | 'warning' | 'info',
  })

  // Tag color modal state
  const [tagColorModal, setTagColorModal] = useState({
    isOpen: false,
    tagName: '',
  })

  useEffect(() => {
    if (!window.electronAPI?.isElectron) return

    // Handle general context menu actions
    const handleCreateNewNote = async () => {
      logger.info('GlobalContextMenuV2: Creating new note via context menu')
      // For now, use existing functionality
      showToast('Please use the + button to create a new note', 'info')
    }

    const handleOpenSearch = () => {
      logger.info('GlobalContextMenuV2: Opening search modal')
      setModal('search', true)
    }

    const handleOpenSettingsModal = () => {
      setModal('settings', true)
    }

    const handleCreateNewNotebook = () => {
      logger.info('GlobalContextMenuV2: Opening notebook manager for creation')
      setModal('notebookManager', true)
    }

    const handleCollapseAllNotebooks = () => {
      logger.info('GlobalContextMenuV2: Collapsing all notebooks')
      // TODO: Implement with V2 store
      showToast('Collapse all coming soon', 'info')
    }

    const handleExpandAllNotebooks = () => {
      logger.info('GlobalContextMenuV2: Expanding all notebooks')
      // TODO: Implement with V2 store
      showToast('Expand all coming soon', 'info')
    }

    const handleCreateNoteInNotebook = async (notebookId: string) => {
      logger.info('GlobalContextMenuV2: Creating note in specific notebook', {
        notebookId,
      })
      showToast('Create note in notebook coming soon', 'info')
    }

    const handleRenameNotebook = (notebookId: string) => {
      const notebook = notebooksRef.current.find(n => n.id === notebookId)
      if (!notebook) return

      setRenameModal({
        isOpen: true,
        type: 'notebook',
        id: notebookId,
        currentName: notebook.name,
      })
    }

    const handleDeleteNotebook = (notebookId: string) => {
      const notebook = notebooksRef.current.find(n => n.id === notebookId)
      if (!notebook) return

      setConfirmModal({
        isOpen: true,
        title: 'Delete Notebook',
        message: `Are you sure you want to delete the notebook "${notebook.name}"? All notes in this notebook will be moved to trash.`,
        type: 'danger',
        onConfirm: async () => {
          showToast('Delete notebook coming soon', 'info')
        },
      })
    }

    const handleRenameTag = (tagName: string) => {
      setRenameModal({
        isOpen: true,
        type: 'tag',
        id: tagName,
        currentName: tagName,
      })
    }

    const handleChangeTagColor = (tagName: string) => {
      setTagColorModal({
        isOpen: true,
        tagName: tagName,
      })
    }

    const handleRemoveTag = (tagName: string) => {
      setConfirmModal({
        isOpen: true,
        title: 'Remove Tag',
        message: `Are you sure you want to remove the tag "${tagName}" from all notes?`,
        type: 'warning',
        onConfirm: () => {
          const count = removeTagFromAllNotes(tagName)
          showToast(`Tag "${tagName}" removed from ${count} notes`, 'success')
        },
      })
    }

    // Note context menu handlers
    const handleDeleteNote = async (noteId: string) => {
      logger.info('GlobalContextMenuV2: Deleting note via context menu', { noteId })
      try {
        await deleteNoteMutation.mutateAsync({ id: noteId, permanent: false })
        if (selectedNoteIdRef.current === noteId) {
          setSelectedNoteId(null)
        }
      } catch (error) {
        logger.error('GlobalContextMenuV2: Failed to delete note', { noteId, error })
      }
    }
    
    const handleRestoreNote = async (noteId: string) => {
      logger.info('GlobalContextMenuV2: Restoring note via context menu', { noteId })
      try {
        await updateNoteMutation.mutateAsync({ 
          id: noteId, 
          data: { isTrashed: false } 
        })
      } catch (error) {
        logger.error('GlobalContextMenuV2: Failed to restore note', { noteId, error })
      }
    }
    
    const handleTogglePinNote = async (noteId: string) => {
      logger.info('GlobalContextMenuV2: Toggling pin via context menu', { noteId })
      const note = notesRef.current.find(n => n.id === noteId)
      if (!note) return
      
      try {
        await updateNoteMutation.mutateAsync({ 
          id: noteId, 
          data: { isPinned: !note.isPinned } 
        })
      } catch (error) {
        logger.error('GlobalContextMenuV2: Failed to toggle pin', { noteId, error })
      }
    }
    
    const handleDuplicateNote = async (noteId: string) => {
      logger.info('GlobalContextMenuV2: Duplicating note via context menu', { noteId })
      try {
        const newNote = await duplicateNoteMutation.mutateAsync(noteId)
        setSelectedNoteId(newNote.id)
      } catch (error) {
        logger.error('GlobalContextMenuV2: Failed to duplicate note', { noteId, error })
      }
    }
    
    const handlePermanentDeleteNote = async (noteId: string) => {
      logger.info('GlobalContextMenuV2: Permanently deleting note via context menu', { noteId })
      try {
        await deleteNoteMutation.mutateAsync({ id: noteId, permanent: true })
        if (selectedNoteIdRef.current === noteId) {
          setSelectedNoteId(null)
        }
      } catch (error) {
        logger.error('GlobalContextMenuV2: Failed to permanently delete note', { noteId, error })
      }
    }

    const handleEmptyTrash = () => {
      const trashedNotes = notesRef.current.filter(note => note.isTrashed)
      if (trashedNotes.length === 0) {
        showToast('Trash is already empty', 'info')
        return
      }

      setConfirmModal({
        isOpen: true,
        title: 'Empty Trash',
        message: `Are you sure you want to permanently delete ${trashedNotes.length} notes in trash? This action cannot be undone.`,
        type: 'danger',
        onConfirm: async () => {
          showToast('Empty trash coming soon', 'info')
        },
      })
    }

    const handleViewNoteHistory = (noteId: string) => {
      logger.info('GlobalContextMenuV2: Viewing note history via context menu', { noteId })
      // Ensure the note is selected before opening history
      if (selectedNoteIdRef.current !== noteId) {
        setSelectedNoteId(noteId)
      }
      setModalV2('revisionHistory', true)
    }

    // Listen for all context menu events
    window.electronAPI.on('create-new-note', handleCreateNewNote)
    window.electronAPI.on('open-search', handleOpenSearch)
    window.electronAPI.on('open-settings-modal', handleOpenSettingsModal)
    window.electronAPI.on('create-new-notebook', handleCreateNewNotebook)
    window.electronAPI.on('collapse-all-notebooks', handleCollapseAllNotebooks)
    window.electronAPI.on('expand-all-notebooks', handleExpandAllNotebooks)
    window.electronAPI.on('create-note-in-notebook', handleCreateNoteInNotebook)
    window.electronAPI.on('rename-notebook', handleRenameNotebook)
    window.electronAPI.on('delete-notebook', handleDeleteNotebook)
    window.electronAPI.on('rename-tag', handleRenameTag)
    window.electronAPI.on('change-tag-color', handleChangeTagColor)
    window.electronAPI.on('remove-tag', handleRemoveTag)
    window.electronAPI.on('empty-trash', handleEmptyTrash)
    
    // Note context menu events
    window.electronAPI.on('delete-note', handleDeleteNote)
    window.electronAPI.on('restore-note', handleRestoreNote)
    window.electronAPI.on('toggle-pin-note', handleTogglePinNote)
    window.electronAPI.on('duplicate-note', handleDuplicateNote)
    window.electronAPI.on('permanent-delete-note', handlePermanentDeleteNote)
    window.electronAPI.on('view-note-history', handleViewNoteHistory)

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('create-new-note')
        window.electronAPI.removeAllListeners('open-search')
        window.electronAPI.removeAllListeners('open-settings-modal')
        window.electronAPI.removeAllListeners('create-new-notebook')
        window.electronAPI.removeAllListeners('collapse-all-notebooks')
        window.electronAPI.removeAllListeners('expand-all-notebooks')
        window.electronAPI.removeAllListeners('create-note-in-notebook')
        window.electronAPI.removeAllListeners('rename-notebook')
        window.electronAPI.removeAllListeners('delete-notebook')
        window.electronAPI.removeAllListeners('rename-tag')
        window.electronAPI.removeAllListeners('change-tag-color')
        window.electronAPI.removeAllListeners('remove-tag')
        window.electronAPI.removeAllListeners('empty-trash')
        
        // Note context menu events
        window.electronAPI.removeAllListeners('delete-note')
        window.electronAPI.removeAllListeners('restore-note')
        window.electronAPI.removeAllListeners('toggle-pin-note')
        window.electronAPI.removeAllListeners('duplicate-note')
        window.electronAPI.removeAllListeners('permanent-delete-note')
        window.electronAPI.removeAllListeners('view-note-history')
      }
    }
  }, [])

  // Handle rename submission
  const handleRenameSubmit = async (newName: string) => {
    if (renameModal.type === 'notebook') {
      showToast('Notebook rename coming soon', 'info')
      setRenameModal({ isOpen: false, type: '', id: '', currentName: '' })
    } else if (renameModal.type === 'tag') {
      showToast('Tag rename coming soon', 'info')
      setRenameModal({ isOpen: false, type: '', id: '', currentName: '' })
    }
  }

  return (
    <>
      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ ...renameModal, isOpen: false })}
        currentName={renameModal.currentName}
        title={
          renameModal.type === 'notebook' ? 'Rename Notebook' : 'Rename Tag'
        }
        onRename={handleRenameSubmit}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.type === 'danger' ? 'Delete' : 'Confirm'}
      />
      <TagColorModal
        isOpen={tagColorModal.isOpen}
        onClose={() => setTagColorModal({ ...tagColorModal, isOpen: false })}
        tagName={tagColorModal.tagName}
      />
    </>
  )
}

export default GlobalContextMenuV2