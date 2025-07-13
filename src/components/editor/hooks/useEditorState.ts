import { useState, useMemo } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { storageService } from '../../../lib/storage'
import { Note } from '../../../types'

export const useEditorState = (selectedNote: Note | null) => {
  const { addNote, removeNote, addToast } = useAppStore()
  // Tag modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)

  // Line numbers state
  const [showLineNumbers, setShowLineNumbers] = useState(false)

  // Options modal state
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [isOpeningModal, setIsOpeningModal] = useState(false)

  // Get all notes to extract available tags
  const { notes } = useAppStore()

  // Calculate available tags from all notes
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Tag modal handlers
  const handleOpenTagModal = () => {
    setIsTagModalOpen(true)
  }

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false)
  }

  // Line numbers toggle handler
  const handleToggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers)
  }

  // Options modal handlers
  const handleOpenOptionsModal = () => {
    setIsClosingModal(false)
    setShowOptionsModal(true)
    // Trigger opening animation after modal is mounted
    setTimeout(() => {
      setIsOpeningModal(true)
    }, 10)
  }

  const handleCloseOptionsModal = () => {
    setIsOpeningModal(false)
    setIsClosingModal(true)
    setTimeout(() => {
      setShowOptionsModal(false)
      setIsClosingModal(false)
    }, 300) // Match animation duration
  }

  const handleDuplicateNote = () => {
    if (selectedNote) {
      const duplicatedNote = {
        ...selectedNote,
        id: `note-${Date.now()}`,
        title: `${selectedNote.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      // Add duplicated note to store/database
      try {
        addNote(duplicatedNote)
        storageService.saveNote(duplicatedNote)
        addToast({ type: 'success', message: 'Note duplicated successfully' })
      } catch (error) {
        console.error('Error duplicating note:', error)
        addToast({ type: 'error', message: 'Failed to duplicate note' })
      }
      handleCloseOptionsModal()
    }
  }

  const handleDeleteNote = () => {
    if (selectedNote) {
      // Delete note from store/database (move to trash)
      try {
        const trashedNote = {
          ...selectedNote,
          isTrashed: true,
          trashedAt: new Date().toISOString(),
        }
        removeNote(selectedNote.id)
        addNote(trashedNote) // Add back as trashed
        storageService.saveNote(trashedNote)
        addToast({ type: 'success', message: 'Note moved to trash' })
      } catch (error) {
        console.error('Error deleting note:', error)
        addToast({ type: 'error', message: 'Failed to delete note' })
      }
      handleCloseOptionsModal()
    }
  }

  return {
    // Tag modal
    isTagModalOpen,
    handleOpenTagModal,
    handleCloseTagModal,
    availableTags,

    // Line numbers
    showLineNumbers,
    handleToggleLineNumbers,

    // Options modal
    showOptionsModal,
    isClosingModal,
    isOpeningModal,
    handleOpenOptionsModal,
    handleCloseOptionsModal,
    handleDuplicateNote,
    handleDeleteNote,
  }
}
