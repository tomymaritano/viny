import type React from 'react'
import { useEffect } from 'react'
import { useElectronExport } from '../hooks/useElectronExport'
import { useAppStore } from '../stores/newSimpleStore'
import { useNoteActions } from '../hooks/useNoteActions'
import {
  useActiveNotesQueryV2,
  useUpdateNoteMutationV2,
  useTogglePinMutationV2,
  useMoveToTrashMutationV2,
  useRestoreNoteMutationV2,
  useDeleteNotePermanentlyMutationV2,
} from '../hooks/queries/useNotesServiceQueryV2'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import type { Note } from '../types'

const ElectronExportHandler: React.FC = () => {
  const { exportToHTML, exportToPDF, exportToMarkdown } = useElectronExport()
  const { setModal, showSuccess, showInfo } = useAppStore()
  const { handleDuplicateNote } = useNoteActions()

  // TanStack Query V2 hooks
  const { data: notes = [] } = useActiveNotesQueryV2()
  const updateNoteMutation = useUpdateNoteMutationV2()
  const togglePinMutation = useTogglePinMutationV2()
  const moveToTrashMutation = useMoveToTrashMutationV2()
  const restoreNoteMutation = useRestoreNoteMutationV2()
  const deletePermanentlyMutation = useDeleteNotePermanentlyMutationV2()
  const { showConfirm } = useConfirmDialog()

  useEffect(() => {
    const electronAPI = window.electronAPI
    if (!electronAPI?.isElectron) return

    const handleExportNote = (
      noteIdOrData: string | { note: Note; format: 'html' | 'markdown' | 'pdf' },
      format?: 'html' | 'markdown' | 'pdf'
    ) => {
      let note: Note | undefined
      let exportFormat: 'html' | 'markdown' | 'pdf'
      
      // Handle both formats: legacy (noteId, format) and new ({note, format})
      if (typeof noteIdOrData === 'string') {
        // Legacy format: (noteId, format)
        note = notes.find(n => n.id === noteIdOrData)
        exportFormat = format!
      } else if (noteIdOrData && typeof noteIdOrData === 'object' && 'note' in noteIdOrData) {
        // New format: {note, format}
        note = noteIdOrData.note
        exportFormat = noteIdOrData.format
      } else {
        return
      }
      
      if (!note) {
        return
      }

      switch (exportFormat) {
        case 'html':
          exportToHTML(note)
          break
        case 'markdown':
          exportToMarkdown(note)
          break
        case 'pdf':
          exportToPDF(note)
          break
      }
    }

    const handleTogglePin = (noteId: string) => {
      togglePinMutation.mutate(noteId)
    }

    const handleDuplicate = async (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return

      await handleDuplicateNote(note)
    }

    const handleDelete = (noteId: string) => {
      moveToTrashMutation.mutate(noteId)
    }

    const handleRestore = (noteId: string) => {
      restoreNoteMutation.mutate(noteId)
    }

    const handlePermanentDelete = async (noteId: string) => {
      await showConfirm({
        title: 'Delete Note Permanently',
        message: 'Are you sure you want to permanently delete this note? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete Permanently',
        onConfirm: () => {
          deletePermanentlyMutation.mutate(noteId)
        }
      })
    }

    const handleMoveToNotebook = (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return

      // Store the note ID for the modal to use
      window.localStorage.setItem('temp-move-note-id', noteId)
      setModal('notebookManager', true)
    }

    // Listen for all events from context menu
    electronAPI.on('export-note', handleExportNote)
    electronAPI.on('toggle-pin-note', handleTogglePin)
    electronAPI.on('duplicate-note', handleDuplicate)
    electronAPI.on('delete-note', handleDelete)
    electronAPI.on('restore-note', handleRestore)
    electronAPI.on('permanent-delete-note', handlePermanentDelete)
    electronAPI.on('move-to-notebook', handleMoveToNotebook)

    return () => {
      if (electronAPI) {
        electronAPI.removeAllListeners('export-note')
        electronAPI.removeAllListeners('toggle-pin-note')
        electronAPI.removeAllListeners('duplicate-note')
        electronAPI.removeAllListeners('delete-note')
        electronAPI.removeAllListeners('restore-note')
        electronAPI.removeAllListeners('permanent-delete-note')
        electronAPI.removeAllListeners('move-to-notebook')
      }
    }
  }, [
    notes,
    setModal,
    exportToHTML,
    exportToPDF,
    exportToMarkdown,
    handleDuplicateNote,
    togglePinMutation,
    moveToTrashMutation,
    restoreNoteMutation,
    deletePermanentlyMutation,
    showConfirm,
  ])

  return null
}

export default ElectronExportHandler
