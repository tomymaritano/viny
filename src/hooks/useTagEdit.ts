import { useState, useEffect, useRef } from 'react'
import { updateTag } from '../utils/tagValidation'

interface UseTagEditReturn {
  editingTag: number | null
  editValue: string
  editInputRef: React.RefObject<HTMLInputElement>
  handleEditTag: (tagIndex: number, tagValue: string) => void
  handleSaveEdit: () => void
  handleCancelEdit: () => void
  handleEditKeyDown: (e: React.KeyboardEvent) => void
  setEditValue: React.Dispatch<React.SetStateAction<string>>
  isEditing: (tagIndex: number) => boolean
}

/**
 * Custom hook for managing tag editing functionality
 */
export const useTagEdit = (
  tags: string[], 
  onTagsChange: (tags: string[]) => void
): UseTagEditReturn => {
  const [editingTag, setEditingTag] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Focus and select text when editing starts
  useEffect(() => {
    if (editingTag !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTag])

  /**
   * Start editing a tag
   */
  const handleEditTag = (tagIndex: number, tagValue: string) => {
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
   */
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
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
   */
  const isEditing = (tagIndex: number): boolean => editingTag === tagIndex

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
