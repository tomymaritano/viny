// Hook for all note-related actions and logic
import { useCallback } from 'react'
import { useAppStore } from '../stores/appStoreFixed'
import { Note } from '../types'

export const useNoteActions = () => {
  const {
    updateNote,
    deleteNote,
    duplicateNote,
    openEditor,
    createNewNote,
    showSuccess,
    showError
  } = useAppStore(state => ({
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    duplicateNote: state.duplicateNote,
    openEditor: state.openEditor,
    createNewNote: state.createNewNote,
    showSuccess: state.showSuccess,
    showError: state.showError
  }))

  const handleOpenNote = useCallback((noteId: string) => {
    openEditor(noteId)
  }, [openEditor])

  const handleSaveNote = useCallback(async (noteData: Note) => {
    try {
      updateNote(noteData)
      showSuccess('Note saved successfully')
    } catch (error) {
      showError('Failed to save note')
    }
  }, [updateNote, showSuccess, showError])

  const handleDeleteNote = useCallback(async (note: Note) => {
    if (window.confirm(`Are you sure you want to move "${note.title}" to trash?`)) {
      try {
        const trashedNote = {
          ...note,
          isTrashed: true,
          trashedAt: new Date().toISOString(),
        }
        updateNote(trashedNote)
        showSuccess(`"${note.title}" moved to trash`)
      } catch (error) {
        showError('Failed to delete note')
      }
    }
  }, [updateNote, showSuccess, showError])

  const handleTogglePin = useCallback(async (note: Note) => {
    try {
      const updatedNote = {
        ...note,
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString(),
      }
      updateNote(updatedNote)
    } catch (error) {
      showError('Failed to update note')
    }
  }, [updateNote, showError])

  const handleDuplicateNote = useCallback(async (note: Note) => {
    try {
      const duplicated = duplicateNote(note.id)
      if (duplicated) {
        showSuccess(`"${note.title}" duplicated`)
      }
    } catch (error) {
      showError('Failed to duplicate note')
    }
  }, [duplicateNote, showSuccess, showError])

  const handleCreateNote = useCallback(() => {
    const newNote = createNewNote()
    showSuccess(`Created "${newNote.title}"`)
    return newNote
  }, [createNewNote, showSuccess])

  const handleContentChange = useCallback((note: Note, newContent: string) => {
    const updatedNote = {
      ...note,
      content: newContent,
      updatedAt: new Date().toISOString()
    }
    updateNote(updatedNote)
  }, [updateNote])

  const handleNotebookChange = useCallback((note: Note, notebook: string) => {
    const updatedNote = {
      ...note,
      notebook,
      updatedAt: new Date().toISOString()
    }
    updateNote(updatedNote)
  }, [updateNote])

  return {
    handleOpenNote,
    handleSaveNote,
    handleDeleteNote,
    handleTogglePin,
    handleDuplicateNote,
    handleCreateNote,
    handleContentChange,
    handleNotebookChange
  }
}