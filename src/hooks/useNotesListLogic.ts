// Hook for notes list logic and utilities
import { useMemo, useCallback } from 'react'
import { Note } from '../types'
import { formatDate as utilFormatDate } from '../utils/dateUtils'

export const useNotesListLogic = (notes: Note[] | null | undefined) => {
  // Format date utility - using centralized utility
  const formatDate = useCallback((dateString: string) => {
    return utilFormatDate(dateString, { relative: true })
  }, [])

  // Extract preview text from note content
  const getPreviewText = useCallback((content: string, maxLength = 100) => {
    // Strip markdown formatting while preserving structure
    const stripped = content
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/[*`]/g, '') // Remove other markdown characters
      .replace(/```[\s\S]*?```/g, match => match.replace(/```/g, '')) // Remove code block markers
      .replace(/ +/g, ' ') // Normalize multiple spaces (but not newlines)
      .trim()
    
    if (stripped.length <= maxLength) {
      return stripped + '...'
    }
    return stripped.substring(0, maxLength) + '...'
  }, [])

  // Check if notes list is empty
  const isEmpty = useMemo(() => !notes || notes.length === 0, [notes])

  // Get notes count
  const notesCount = useMemo(() => notes?.length || 0, [notes])

  return {
    isEmpty,
    notesCount,
    formatDate,
    getPreviewText
  }
}
