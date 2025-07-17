import { useState, useMemo } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useTagEdit } from './useTagEdit'
import { addTag, removeTag, updateTag } from '../utils/tagValidation'
import { logger } from '../utils/logger'

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

export function useTagManager(note: any, onTagsChange: (tags: string[]) => void) {
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
  const [tagSettingsModal, setTagSettingsModal] = useState<TagSettingsModalState>({
    show: false,
    tagName: '',
    tagIndex: null
  })

  const { setTagColor, notes } = useAppStore()
  const { suggestions, handleTagEdit } = useTagEdit(notes)

  // Filter suggestions based on input and existing tags
  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim()) return []
    
    const input = tagInput.toLowerCase()
    const existingTags = (note?.tags || []).map((tag: string) => tag.toLowerCase())
    
    return suggestions
      .filter(tag => 
        tag.toLowerCase().includes(input) && 
        !existingTags.includes(tag.toLowerCase())
      )
      .slice(0, 5)
  }, [tagInput, suggestions, note?.tags])

  const handleAddTag = () => {
    if (!note || !tagInput.trim()) return
    
    try {
      const newTags = addTag(note.tags || [], tagInput.trim())
      onTagsChange(newTags)
      setTagInput('')
      setShowTagSuggestions(false)
      setSelectedSuggestionIndex(-1)
      logger.debug('Tag added successfully:', tagInput.trim())
    } catch (error) {
      logger.error('Failed to add tag:', error)
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    if (!note) return
    
    try {
      const newTags = removeTag(note.tags || [], indexToRemove)
      onTagsChange(newTags)
      logger.debug('Tag removed at index:', indexToRemove)
    } catch (error) {
      logger.error('Failed to remove tag:', error)
    }
  }

  const handleUpdateTag = (index: number, newTag: string) => {
    if (!note) return
    
    try {
      const newTags = updateTag(note.tags || [], index, newTag)
      onTagsChange(newTags)
      logger.debug('Tag updated at index:', index, 'to:', newTag)
    } catch (error) {
      logger.error('Failed to update tag:', error)
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        // When a suggestion is selected, add it directly instead of updating the input first
        const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex]
        if (!note) return
        
        try {
          const newTags = addTag(note.tags || [], selectedSuggestion)
          onTagsChange(newTags)
          setTagInput('')
          setShowTagSuggestions(false)
          setSelectedSuggestionIndex(-1)
          logger.debug('Tag added successfully:', selectedSuggestion)
        } catch (error) {
          logger.error('Failed to add tag:', error)
        }
      } else {
        handleAddTag()
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

  const handleTagContextMenu = (e: React.MouseEvent, tag: string, index: number) => {
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
          tagIndex: contextMenu.index
        })
        break
      case 'remove':
        handleRemoveTag(contextMenu.index)
        break
    }
    
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
  }

  const handleTagColorSave = (color: string) => {
    if (tagSettingsModal.tagName) {
      setTagColor(tagSettingsModal.tagName, color)
      setTagSettingsModal({ show: false, tagName: '', tagIndex: null })
    }
  }

  return {
    // State
    tagInput,
    showTagSuggestions,
    selectedSuggestionIndex,
    contextMenu,
    tagSettingsModal,
    filteredSuggestions,
    
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
  }
}