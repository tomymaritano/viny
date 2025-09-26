import { useState, useCallback, useEffect, useRef } from 'react'
import { useSettings } from '../../../hooks/useSettings'
import { calculateStats } from '../utils/markdownFormatter'
import { useAppStore } from '../../../stores/newSimpleStore'
import { logger } from '../../../utils/logger'
import { featureFlags } from '../../../config/featureFlags'
import { useMarkdownEditorQuery } from './useMarkdownEditorQuery'

export const useMarkdownEditor = ({
  value = '',
  onChange,
  onSave,
  selectedNote,
  onNotebookChange,
}) => {
  // Use query version if feature flag is enabled
  if (featureFlags.useQueryForNotesList) {
    return useMarkdownEditorQuery({
      value,
      onChange,
      selectedNote,
      onNotebookChange,
    })
  }
  const { settings } = useSettings()
  const { addToast } = useAppStore()

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [lastSaved, setLastSaved] = useState(null)

  // Text statistics
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    lines: 0,
  })

  // Calculate stats when content changes
  useEffect(() => {
    const newStats = calculateStats(value)
    setStats({
      words: newStats.words,
      chars: newStats.chars,
      lines: newStats.lines,
    })
  }, [value])

  // Auto-save is handled at the app level in AppSimple.tsx
  // No auto-save logic needed here to prevent conflicts

  // Note metadata handlers
  const handleTitleChange = useCallback(
    e => {
      if (!selectedNote || !onSave) return

      const newTitle = e.target.value

      // Create updated note
      const updatedNote = {
        ...selectedNote,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      }

      // Save immediately
      onSave(updatedNote)
    },
    [selectedNote, onSave]
  )

  const handleNotebookChange = useCallback(
    notebook => {
      // Debug: handleNotebookChange called
      
      if (selectedNote && onSave) {
        // Handle both event objects and direct values
        const notebookValue = notebook?.target?.value || notebook
        // Notebook change: updating metadata only
        
        // IMPORTANT: Only update metadata, NOT content
        // Content is managed separately to avoid conflicts
        const updatedNote = { 
          id: selectedNote.id,
          notebook: notebookValue,
          updatedAt: new Date().toISOString()
        }
        onSave(updatedNote)
        
        // Also call the onNotebookChange callback if provided
        if (onNotebookChange) {
          // Also calling onNotebookChange callback
          onNotebookChange(selectedNote.id, notebookValue)
        }
      } else {
        logger.error('useMarkdownEditor handleNotebookChange missing requirements')
      }
    },
    [selectedNote, onSave, onNotebookChange]
  )

  const handleStatusChange = useCallback(
    e => {
      if (selectedNote && onSave) {
        // Only update metadata, NOT content
        const updatedNote = { 
          id: selectedNote.id,
          status: e.target.value,
          updatedAt: new Date().toISOString()
        }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )

  const handleTagsChange = useCallback(
    tags => {
      if (selectedNote && onSave) {
        // Handle both array input (from TagModal) and event input (from form)
        let processedTags = []

        if (Array.isArray(tags)) {
          processedTags = tags
        } else if (tags?.target?.value !== undefined) {
          // Handle event format - check if it's already an array or string
          const tagValue = tags.target.value
          if (Array.isArray(tagValue)) {
            processedTags = tagValue
          } else if (typeof tagValue === 'string') {
            processedTags = tagValue
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          }
        }

        // Only update metadata, NOT content
        const updatedNote = { 
          id: selectedNote.id,
          tags: processedTags,
          updatedAt: new Date().toISOString()
        }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )

  // Manual save - DEPRECATED: Use global keyboard shortcut handler instead
  // This is kept for backward compatibility but should not be used
  const handleManualSave = useCallback(async () => {
    logger.warn('handleManualSave called - this should use global keyboard handler instead')
    // Do nothing - let the global handler manage saves
  }, [])

  // Keyboard shortcuts (removed Ctrl+S to avoid conflicts with global handler)
  const handleKeyDown = useCallback(
    event => {
      // Fullscreen toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    },
    [isFullscreen]
  )

  return {
    // UI state
    isFullscreen,
    setIsFullscreen,
    isSaving,
    saveError,
    lastSaved,

    // Statistics
    stats,

    // Event handlers
    handleTitleChange,
    handleNotebookChange,
    handleStatusChange,
    handleTagsChange,
    handleManualSave,
    handleKeyDown,

    // Settings
    settings,
  }
}
