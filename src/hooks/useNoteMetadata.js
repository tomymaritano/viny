/**
 * Hook for managing note metadata state and actions
 */
import { useState, useEffect, useCallback } from 'react'

export const useNoteMetadata = (
  note,
  onTitleChange,
  onNotebookChange,
  onStatusChange,
  onTagsChange
) => {
  const [localTitle, setLocalTitle] = useState(note?.title || '')
  const [showNotebookDropdown, setShowNotebookDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // Update local title when note changes
  useEffect(() => {
    setLocalTitle(note?.title || '')
  }, [note?.id, note?.title])

  // Handle title change with local state
  const handleTitleChange = useCallback(
    e => {
      const newTitle = e.target.value
      setLocalTitle(newTitle)
      onTitleChange?.(e)
    },
    [onTitleChange]
  )

  // Handle title blur
  const handleTitleBlur = useCallback(
    e => {
      onTitleChange?.(e)
    },
    [onTitleChange]
  )

  // Handle notebook selection
  const handleNotebookSelect = useCallback(
    notebookId => {
      onNotebookChange?.({ target: { value: notebookId } })
      setShowNotebookDropdown(false)
    },
    [onNotebookChange]
  )

  // Handle status selection
  const handleStatusSelect = useCallback(
    status => {
      onStatusChange?.({ target: { value: status } })
      setShowStatusDropdown(false)
    },
    [onStatusChange]
  )

  // Toggle dropdowns
  const toggleNotebookDropdown = useCallback(() => {
    setShowNotebookDropdown(prev => !prev)
    setShowStatusDropdown(false) // Close other dropdown
  }, [])

  const toggleStatusDropdown = useCallback(() => {
    setShowStatusDropdown(prev => !prev)
    setShowNotebookDropdown(false) // Close other dropdown
  }, [])

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setShowNotebookDropdown(false)
    setShowStatusDropdown(false)
  }, [])

  return {
    // State
    localTitle,
    showNotebookDropdown,
    showStatusDropdown,

    // Actions
    handleTitleChange,
    handleTitleBlur,
    handleNotebookSelect,
    handleStatusSelect,
    toggleNotebookDropdown,
    toggleStatusDropdown,
    closeAllDropdowns,

    // Direct setters for external control
    setLocalTitle,
    setShowNotebookDropdown,
    setShowStatusDropdown,
  }
}
