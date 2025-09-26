import { useState, useCallback, useEffect } from 'react'
import { useSettings } from '../../../hooks/useSettings'
import { calculateStats } from '../utils/markdownFormatter'
import { useAppStore } from '../../../stores/newSimpleStore'
import { logger } from '../../../utils/logger'
import { useUpdateNoteMutationV2 } from '../../../hooks/queries/useNotesServiceQueryV2'
import type { Note } from '../../../types'

interface UseMarkdownEditorQueryProps {
  value?: string
  onChange: (value: string) => void
  selectedNote?: Note
  onNotebookChange?: (noteId: string, notebookId: string) => void
}

export const useMarkdownEditorQuery = ({
  value = '',
  onChange,
  selectedNote,
  onNotebookChange,
}: UseMarkdownEditorQueryProps) => {
  const { settings } = useSettings()
  const { addToast } = useAppStore()
  
  // Use TanStack Query V2 mutation for updating (supports partial updates)
  const updateMutation = useUpdateNoteMutationV2()

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

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

  // Update last saved when mutation succeeds
  useEffect(() => {
    if (updateMutation.isSuccess) {
      setLastSaved(new Date().toISOString())
    }
  }, [updateMutation.isSuccess])

  // Note metadata handlers with mutations
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedNote) return

      const newTitle = e.target.value

      // Only update the title field
      updateMutation.mutate({
        id: selectedNote.id,
        data: {
          title: newTitle,
          updatedAt: new Date().toISOString()
        }
      })
      // Saving title change
    },
    [selectedNote, updateMutation]
  )

  const handleNotebookChange = useCallback(
    (notebookOrEvent: string | React.ChangeEvent<HTMLSelectElement>) => {
      // Debug: handleNotebookChange called
      
      if (!selectedNote || !notebookOrEvent) {
        return
      }
      
      // Handle both direct string values and event objects
      const notebookValue = typeof notebookOrEvent === 'string' 
        ? notebookOrEvent 
        : notebookOrEvent.target?.value || ''
      
      if (notebookValue) {
        // Updating notebook to: notebookValue
        
        // Use the update mutation to persist ONLY the notebook change
        updateMutation.mutate({
          id: selectedNote.id,
          data: {
            notebook: notebookValue,
            updatedAt: new Date().toISOString()
          }
        }, {
          onSuccess: () => {
            // Notebook change saved successfully
            // Also call the callback if provided
            if (onNotebookChange) {
              onNotebookChange(selectedNote.id, notebookValue)
            }
          },
          onError: (error) => {
            logger.error('Failed to save notebook change:', error)
            addToast({
              type: 'error',
              message: 'Failed to change notebook'
            })
          }
        })
      }
    },
    [selectedNote, onNotebookChange, updateMutation, addToast]
  )

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (selectedNote) {
        // Only update the status field
        updateMutation.mutate({
          id: selectedNote.id,
          data: {
            status: e.target.value as Note['status'],
            updatedAt: new Date().toISOString()
          }
        }, {
          onSuccess: (savedNote) => {
            // Status change saved successfully
          },
          onError: (error) => {
            console.error('❌ Failed to save status change:', error)
          }
        })
        console.log('📝 Saving status change via mutation:', {
          noteId: updatedNote.id,
          newStatus: updatedNote.status
        })
      }
    },
    [selectedNote, updateMutation]
  )

  const handleTagsChange = useCallback(
    (tags: string[] | React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNote) {
        // Handle both array input (from TagModal) and event input (from form)
        let processedTags: string[] = []

        if (Array.isArray(tags)) {
          processedTags = tags
        } else if (tags?.target?.value !== undefined) {
          // Handle event format
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

        // Only update the tags field
        updateMutation.mutate({
          id: selectedNote.id,
          data: {
            tags: processedTags,
            updatedAt: new Date().toISOString()
          }
        })
        // Saving tags change
      }
    },
    [selectedNote, updateMutation]
  )

  // Manual save
  const handleManualSave = useCallback(async () => {
    if (selectedNote) {
      // Only update the content field
      updateMutation.mutate({
        id: selectedNote.id,
        data: {
          content: value,
          updatedAt: new Date().toISOString()
        }
      })
    }
  }, [selectedNote, value, updateMutation])

  // Keyboard shortcuts (removed Ctrl+S to avoid conflicts with global handler)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Fullscreen toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    },
    [isFullscreen]
  )

  return {
    // State
    isFullscreen,
    setIsFullscreen,
    stats,
    
    // Save state from mutation
    isSaving: updateMutation.isPending,
    saveError: updateMutation.error?.message || null,
    lastSaved,
    
    // Handlers
    handleTitleChange,
    handleNotebookChange,
    handleStatusChange,
    handleTagsChange,
    handleManualSave,
    handleKeyDown,
  }
}