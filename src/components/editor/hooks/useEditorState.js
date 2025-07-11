import { useState, useMemo } from 'react'
import { useSimpleStore } from '../../../stores/simpleStore'

export const useEditorState = selectedNote => {
  // Tag modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)

  // Line numbers state
  const [showLineNumbers, setShowLineNumbers] = useState(false)

  // Options modal state
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [isOpeningModal, setIsOpeningModal] = useState(false)

  // Get all notes to extract available tags
  const { notes } = useSimpleStore()

  // Calculate available tags from all notes
  const availableTags = useMemo(() => {
    const tagSet = new Set()
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
      // TODO: Add note to store/database
      console.log('Duplicating note:', duplicatedNote)
      handleCloseOptionsModal()
    }
  }

  const handleDeleteNote = () => {
    if (selectedNote) {
      // TODO: Delete note from store/database
      console.log('Deleting note:', selectedNote.id)
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
