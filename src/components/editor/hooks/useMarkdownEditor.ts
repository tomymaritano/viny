import { useState, useCallback, useEffect, useRef } from 'react'
import { useSettings } from '../../../hooks/useSettings'
import { calculateStats } from '../utils/markdownFormatter'
import { useAppStore } from '../../../stores/newSimpleStore'

export const useMarkdownEditor = ({
  value = '',
  onChange,
  onSave,
  selectedNote,
  onNotebookChange,
}) => {
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
    e => {
      if (onNotebookChange) {
        onNotebookChange(e.target.value)
      }
    },
    [onNotebookChange]
  )

  const handleStatusChange = useCallback(
    e => {
      if (selectedNote && onSave) {
        const updatedNote = { ...selectedNote, status: e.target.value }
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
          const value = tags.target.value
          if (Array.isArray(value)) {
            processedTags = value
          } else if (typeof value === 'string') {
            processedTags = value
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          }
        }

        const updatedNote = { ...selectedNote, tags: processedTags }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )


  // Manual save
  const handleManualSave = useCallback(async () => {
    if (selectedNote && onSave) {
      try {
        setIsSaving(true)
        setSaveError(null)

        const updatedNote = {
          ...selectedNote,
          content: value,
          updatedAt: new Date().toISOString(),
        }

        await onSave(updatedNote)
        setLastSaved(new Date().toISOString())
      } catch (error) {
        setSaveError(error.message || 'Failed to save')
        console.error('Manual save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }, [selectedNote, onSave, value])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    event => {
      // Save shortcut
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleManualSave()
      }

      // Fullscreen toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    },
    [handleManualSave, isFullscreen]
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
