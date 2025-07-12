// Hook for notes list logic and utilities
import { useMemo, useCallback } from 'react'
import { Note } from '../types'

export const useNotesListLogic = (notes: Note[]) => {
  // Format date utility
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }, [])

  // Extract preview text from note content
  const getPreviewText = useCallback((content: string, maxLength = 100) => {
    return content.replace(/[#*`]/g, '').substring(0, maxLength) + '...'
  }, [])

  // Check if notes list is empty
  const isEmpty = useMemo(() => notes.length === 0, [notes.length])

  // Get notes count
  const notesCount = useMemo(() => notes.length, [notes.length])

  return {
    isEmpty,
    notesCount,
    formatDate,
    getPreviewText
  }
}
