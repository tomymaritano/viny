import { useEffect } from 'react'
import { useElectronExport } from '../hooks/useElectronExport'
import { useAppStore } from '../stores/newSimpleStore'
import { useNoteActions } from '../hooks/useNoteActions'

const ElectronExportHandler: React.FC = () => {
  const { exportToHTML, exportToPDF, exportToMarkdown } = useElectronExport()
  const { notes, updateNote, removeNote, setModal, showSuccess, showInfo } = useAppStore()
  const { handleDuplicateNote } = useNoteActions()
  
  useEffect(() => {
    const electronAPI = window.electronAPI as any
    if (!electronAPI?.isElectron) return
    
    const handleExportNote = (noteId: string, format: 'html' | 'markdown' | 'pdf') => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      switch (format) {
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
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      const updatedNote = { ...note, isPinned: !note.isPinned }
      updateNote(updatedNote)
      showSuccess(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned')
    }
    
    const handleDuplicate = (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      handleDuplicateNote(note)
      showSuccess('Note duplicated')
    }
    
    const handleDelete = (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      const updatedNote = { ...note, isTrashed: true }
      updateNote(updatedNote)
      showInfo('Note moved to trash')
    }
    
    const handleRestore = (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return
      
      const updatedNote = { ...note, isTrashed: false }
      updateNote(updatedNote)
      showSuccess('Note restored')
    }
    
    const handlePermanentDelete = (noteId: string) => {
      if (confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
        removeNote(noteId)
        showInfo('Note permanently deleted')
      }
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
  }, [notes, updateNote, removeNote, setModal, exportToHTML, exportToPDF, exportToMarkdown, handleDuplicateNote, showSuccess, showInfo])
  
  return null
}

export default ElectronExportHandler