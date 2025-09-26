/**
 * Modern tag edit hook aligned with Repository Pattern
 * Provides in-place editing functionality for tags
 * Aligned with useNotebooks.ts, useNoteActions.ts, and useTagManager.ts patterns
 */
import { useState, useRef, useCallback, useMemo } from 'react'
import type { Note } from '../types'
import { logger } from '../utils/logger'

// Interface for documentation - not used in implementation
interface _UseTagEditProps {
  notes: Note[]
}

export const useTagEdit = (notes: Note[]) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Extract all unique tags from notes for suggestions
  const suggestions = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  const isEditing = useCallback(
    (index?: number) => {
      if (typeof index === 'number') {
        return editingIndex === index
      }
      return editingIndex !== null
    },
    [editingIndex]
  )

  // Store update callback in a ref to avoid closure issues
  const updateCallbackRef = useRef<
    ((index: number, newTag: string) => Promise<void>) | null
  >(null)

  const handleEditTag = useCallback(
    (
      tagName: string,
      index: number,
      updateCallback: (index: number, newTag: string) => Promise<void>
    ) => {
      // Frontend validation
      if (index < 0) {
        logger.error('Invalid tag index for editing:', index)
        return
      }

      if (!tagName) {
        logger.error('Cannot edit empty tag')
        return
      }

      setEditingIndex(index)
      setEditValue(tagName)
      setError(null)

      // Store the update callback for later use
      updateCallbackRef.current = updateCallback

      logger.debug('Started editing tag:', tagName, 'at index:', index)

      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        editInputRef.current?.focus()
        editInputRef.current?.select()
      }, 0)
    },
    []
  )

  const handleSaveEdit = useCallback(async () => {
    // Frontend validation
    if (editingIndex === null) {
      logger.warn('No tag being edited')
      return
    }

    if (!editValue.trim()) {
      setError('Tag name cannot be empty')
      logger.error('Attempted to save empty tag')
      return
    }

    const cleanValue = editValue.trim()
    const updateCallback = updateCallbackRef.current

    if (!updateCallback) {
      logger.error('No update callback available')
      setError('Cannot save tag - no update method available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      logger.debug('Saving tag edit:', editingIndex, '->', cleanValue)

      // Call the provided update callback (from useTagManager)
      await updateCallback(editingIndex, cleanValue)

      // Clear editing state on success
      setEditingIndex(null)
      setEditValue('')
      setLoading(false)

      logger.debug('Tag edit saved successfully')
    } catch (error) {
      logger.error('Error saving tag edit:', error)
      setError(error instanceof Error ? error.message : 'Failed to save tag')
      setLoading(false)
      // Keep editing state so user can retry
    }
  }, [editingIndex, editValue])

  const handleCancelEdit = useCallback(() => {
    logger.debug('Cancelled tag edit for index:', editingIndex)
    setEditingIndex(null)
    setEditValue('')
    setError(null)
    setLoading(false)
  }, [editingIndex])

  const handleEditKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  return {
    // State
    editingIndex,
    editValue,
    loading,
    error,
    suggestions,

    // Refs
    editInputRef,

    // Actions
    handleEditTag,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyDown,
    setEditValue,
    isEditing,

    // Computed
    editingTag: editingIndex !== null ? editValue : null,
  }
}
