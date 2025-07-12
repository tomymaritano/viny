// Simplified useTagEdit hook for backward compatibility
import { useState, useRef } from 'react'

export const useTagEdit = (tags: string[], onTagsChange: (tags: string[]) => void) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const isEditing = (index?: number) => {
    if (typeof index === 'number') {
      return editingIndex === index
    }
    return editingIndex !== null
  }

  const handleEditTag = (index: number) => {
    setEditingIndex(index)
    setEditValue(tags[index] || '')
    setTimeout(() => {
      editInputRef.current?.focus()
    }, 0)
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newTags = [...tags]
      newTags[editingIndex] = editValue.trim()
      onTagsChange(newTags)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return {
    editingTag: editingIndex !== null ? tags[editingIndex] : null,
    editingIndex,
    editValue,
    editInputRef,
    handleEditTag,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
    setEditValue,
    isEditing
  }
}