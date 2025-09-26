import type React from 'react'
import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useTagEdit } from './useTagEdit'
import type { Note } from '../types'
import { logger } from '../utils/logger'
import {
  useAddTagMutation,
  useRemoveTagMutation,
  useRenameTagMutation,
  useRemoveTagFromAllNotesMutation,
  useTagsQuery,
} from './queries/useTagsQuery'

interface TagContextMenuState {
  show: boolean
  x: number
  y: number
  tag: string | null
  index: number | null
}

interface TagSettingsModalState {
  show: boolean
  tagName: string
  tagIndex: number | null
}

/**
 * Modern tag manager hook using TanStack Query
 * Fully migrated from Repository Pattern to Query/Mutation pattern
 * Provides optimistic updates and automatic cache invalidation
 */
export function useTagManager(
  note: Note | null,
  onTagsChange: (tags: string[]) => void
) {
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [contextMenu, setContextMenu] = useState<TagContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    tag: null,
    index: null,
  })
  const [tagSettingsModal, setTagSettingsModal] =
    useState<TagSettingsModalState>({
      show: false,
      tagName: '',
      tagIndex: null,
    })

  // TanStack Query hooks
  const tagsQuery = useTagsQuery()
  const addTagMutation = useAddTagMutation()
  const removeTagMutation = useRemoveTagMutation()
  const renameTagMutation = useRenameTagMutation()
  const removeFromAllMutation = useRemoveTagFromAllNotesMutation()

  const { setTagColor, notes, showSuccess, showError } = useAppStore()
  const { suggestions, handleTagEdit } = useTagEdit(notes)

  // Derive loading state from mutations
  const loading = addTagMutation.isLoading ||
                  removeTagMutation.isLoading ||
                  renameTagMutation.isLoading ||
                  removeFromAllMutation.isLoading

  const error = addTagMutation.error ||
                removeTagMutation.error ||
                renameTagMutation.error ||
                removeFromAllMutation.error


  // Filter suggestions based on input and existing tags
  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return []

    const input = tagInput.toLowerCase()
    const existingTags = (note?.tags || []).map((tag: string) =>
      tag.toLowerCase()
    )

    return suggestions
      .filter(
        tag =>
          tag.toLowerCase().includes(input) &&
          !existingTags.includes(tag.toLowerCase())
      )
      .slice(0, 5)
  }, [tagInput, suggestions, note?.tags])

  const handleAddTag = useCallback(async () => {
    // Frontend validation
    if (!note) {
      showError('Cannot add tag without a note')
      return
    }

    const cleanTag = tagInput.trim()
    if (!cleanTag) {
      showError('Tag name cannot be empty')
      return
    }

    // Check for duplicate tags
    if (note.tags?.includes(cleanTag)) {
      showError(`Tag "${cleanTag}" already exists`)
      return
    }

    try {
      // Use TanStack Query mutation
      await addTagMutation.mutateAsync({ noteId: note.id, tag: cleanTag })

      // Update local state
      const newTags = [...(note.tags || []), cleanTag]
      onTagsChange(newTags)
      setTagInput('')
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)

      logger.debug('Tag added successfully:', cleanTag)
    } catch (error) {
      logger.error('Failed to add tag:', error)
      // Error handling is done by the mutation
    }
  }, [
    note,
    tagInput,
    addTagMutation,
    onTagsChange,
    showError,
  ])

  const handleRemoveTag = useCallback(
    async (indexToRemove: number) => {
      // Frontend validation
      if (!note) {
        showError('Cannot remove tag without a note')
        return
      }

      if (indexToRemove < 0 || indexToRemove >= (note.tags?.length || 0)) {
        showError('Invalid tag index')
        return
      }

      const tagToRemove = note.tags?.[indexToRemove]
      if (!tagToRemove) {
        showError('Tag not found at specified index')
        return
      }

      try {
        // Use TanStack Query mutation
        await removeTagMutation.mutateAsync({ noteId: note.id, tag: tagToRemove })

        // Update local state
        const newTags = note.tags?.filter((_, i) => i !== indexToRemove) || []
        onTagsChange(newTags)

        logger.debug('Tag removed at index:', indexToRemove, tagToRemove)
      } catch (error) {
        logger.error('Failed to remove tag:', error)
        // Error handling is done by the mutation
      }
    },
    [note, removeTagMutation, onTagsChange, showError]
  )

  const handleUpdateTag = useCallback(
    async (index: number, newTag: string) => {
      // Frontend validation
      if (!note) {
        showError('Cannot update tag without a note')
        return
      }

      if (index < 0 || index >= (note.tags?.length || 0)) {
        showError('Invalid tag index')
        return
      }

      const cleanNewTag = newTag.trim()
      if (!cleanNewTag) {
        showError('Tag name cannot be empty')
        return
      }

      const oldTag = note.tags?.[index]
      if (!oldTag) {
        showError('Tag not found at specified index')
        return
      }

      // Check for duplicate tags (excluding the current one)
      if (note.tags?.some((tag, i) => i !== index && tag === cleanNewTag)) {
        showError(`Tag "${cleanNewTag}" already exists`)
        return
      }

      try {
        // For single note tag rename, we need to handle this differently
        // First remove the old tag, then add the new one
        await removeTagMutation.mutateAsync({ noteId: note.id, tag: oldTag })
        await addTagMutation.mutateAsync({ noteId: note.id, tag: cleanNewTag })

        // Update local state
        const newTags = note.tags?.map((tag, i) => i === index ? cleanNewTag : tag) || []
        onTagsChange(newTags)

        showSuccess(`Tag updated from "${oldTag}" to "${cleanNewTag}"`)
        logger.debug(
          'Tag updated at index:',
          index,
          'from:',
          oldTag,
          'to:',
          cleanNewTag
        )
      } catch (error) {
        logger.error('Failed to update tag:', error)
        // Error handling is done by the mutations
      }
    },
    [note, removeTagMutation, addTagMutation, onTagsChange, showError, showSuccess]
  )

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (
        selectedSuggestionIndex >= 0 &&
        filteredSuggestions[selectedSuggestionIndex]
      ) {
        // When a suggestion is selected, add it directly instead of updating the input first
        const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex]
        if (!note) return

        // Use the same validation and repository logic as handleAddTag
        const tempInput = tagInput
        setTagInput(selectedSuggestion)
        await handleAddTag()
        if (tagInput === selectedSuggestion) {
          // Success case - input was cleared by handleAddTag
          return
        } else {
          // Restore input if there was an error
          setTagInput(tempInput)
        }
      } else {
        await handleAddTag()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      )
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const handleTagContextMenu = (
    e: React.MouseEvent,
    tag: string,
    index: number
  ) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tag,
      index,
    })
  }

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.tag || contextMenu.index === null) return

    switch (action) {
      case 'edit':
        handleTagEdit(contextMenu.tag, contextMenu.index, handleUpdateTag)
        break
      case 'color':
        setTagSettingsModal({
          show: true,
          tagName: contextMenu.tag,
          tagIndex: contextMenu.index,
        })
        break
      case 'remove':
        handleRemoveTag(contextMenu.index)
        break
    }

    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  const handleTagColorSave = useCallback(
    async (color: string) => {
      // Frontend validation
      if (!tagSettingsModal.tagName) {
        const error = 'No tag selected for color change'
        showError(error)
        throw new Error(error)
      }

      if (!color.trim()) {
        const error = 'Color cannot be empty'
        showError(error)
        throw new Error(error)
      }

      try {
        // Update tag color (this might involve repository operations in the future)
        setTagColor(tagSettingsModal.tagName, color)
        setTagSettingsModal({ show: false, tagName: '', tagIndex: null })

        showSuccess(`Color updated for tag "${tagSettingsModal.tagName}"`)
        logger.debug('Tag color updated:', tagSettingsModal.tagName, color)
      } catch (error) {
        logger.error('Failed to update tag color:', error)
        showError('Failed to update tag color')
      }
    },
    [tagSettingsModal.tagName, setTagColor, showError, showSuccess]
  )

  return {
    // State
    tagInput,
    showTagSuggestions,
    selectedSuggestionIndex,
    contextMenu,
    tagSettingsModal,
    filteredSuggestions,
    loading,
    error,

    // Actions
    setTagInput,
    setShowTagSuggestions,
    setSelectedSuggestionIndex,
    setContextMenu,
    setTagSettingsModal,
    handleAddTag,
    handleRemoveTag,
    handleUpdateTag,
    handleTagKeyDown,
    handleTagContextMenu,
    handleContextMenuAction,
    handleTagColorSave,

    // Note: Using TanStack Query mutations with optimistic updates
  }
}
