import { useState, useEffect, useRef } from 'react'
import { updateTag } from '../utils/tagValidation'

/**
 * Custom hook for managing tag editing functionality
 * @param {string[]} tags - Array of current tags
 * @param {function} onTagsChange - Callback when tags change
 * @returns {object} - Tag editing state and handlers
 */
export const useTagEdit = (tags, onTagsChange) => {
  const [editingTag, setEditingTag] = useState(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef(null)

  // Focus and select text when editing starts
  useEffect(() => {
    if (editingTag !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTag])

  /**
   * Start editing a tag
   * @param {number} tagIndex - Index of the tag to edit
   * @param {string} tagValue - Current value of the tag
   */
  const handleEditTag = (tagIndex, tagValue) => {
    setEditingTag(tagIndex)
    setEditValue(tagValue)
  }

  /**
   * Save the edited tag
   */
  const handleSaveEdit = () => {
    if (editingTag !== null) {
      const updatedTags = updateTag(editValue, editingTag, tags)
      if (updatedTags !== tags) {
        onTagsChange(updatedTags)
      }
    }
    setEditingTag(null)
    setEditValue('')
  }

  /**
   * Cancel editing without saving
   */
  const handleCancelEdit = () => {
    setEditingTag(null)
    setEditValue('')
  }

  /**
   * Handle keyboard events during editing
   * @param {KeyboardEvent} e - The keyboard event
   */
  const handleEditKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  /**
   * Check if a specific tag is being edited
   * @param {number} tagIndex - Index to check
   * @returns {boolean}
   */
  const isEditing = tagIndex => editingTag === tagIndex

  return {
    // State
    editingTag,
    editValue,
    editInputRef,

    // Actions
    handleEditTag,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
    setEditValue,

    // Helpers
    isEditing,
  }
}
