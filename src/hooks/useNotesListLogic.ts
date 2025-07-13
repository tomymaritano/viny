// Hook for notes list logic and utilities
import { useMemo, useCallback } from 'react'
import { Note } from '../types'
import { formatDate as utilFormatDate } from '../utils/dateUtils'

export const useNotesListLogic = (notes: Note[]) => {
  // Format date utility - using centralized utility
  const formatDate = useCallback((dateString: string) => {
    return utilFormatDate(dateString, { relative: true })
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
