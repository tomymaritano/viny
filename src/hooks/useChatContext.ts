import { useState, useCallback, useEffect } from 'react'
import type { ChatMessage } from '../types/knowledge'
import { useAppStore } from './useAppStore'

export const useChatContext = (conversationId: string) => {
  const [context, setContext] = useState<ChatMessage['context']>({
    noteIds: [],
    notebookIds: [],
    tags: [],
  })

  const { notes, notebooks } = useAppStore()

  // Auto-detect context from selected notes
  useEffect(() => {
    const selectedNotes = notes.filter(n => n.isSelected)
    if (selectedNotes.length > 0) {
      setContext(prev => ({
        ...prev,
        noteIds: selectedNotes.map(n => n.id),
        notebookIds: [
          ...new Set(selectedNotes.map(n => n.notebookId).filter(Boolean)),
        ],
        tags: [...new Set(selectedNotes.flatMap(n => n.tags))],
      }))
    }
  }, [notes])

  const addNoteToContext = useCallback(
    (noteId: string) => {
      const note = notes.find(n => n.id === noteId)
      if (!note) return

      setContext(prev => ({
        noteIds: [...new Set([...prev.noteIds, noteId])],
        notebookIds: note.notebookId
          ? [...new Set([...prev.notebookIds, note.notebookId])]
          : prev.notebookIds,
        tags: [...new Set([...prev.tags, ...note.tags])],
      }))
    },
    [notes]
  )

  const removeNoteFromContext = useCallback((noteId: string) => {
    setContext(prev => ({
      ...prev,
      noteIds: prev.noteIds.filter(id => id !== noteId),
    }))
  }, [])

  const addNotebookToContext = useCallback(
    (notebookId: string) => {
      const notebookNotes = notes.filter(n => n.notebookId === notebookId)

      setContext(prev => ({
        noteIds: [
          ...new Set([...prev.noteIds, ...notebookNotes.map(n => n.id)]),
        ],
        notebookIds: [...new Set([...prev.notebookIds, notebookId])],
        tags: [
          ...new Set([...prev.tags, ...notebookNotes.flatMap(n => n.tags)]),
        ],
      }))
    },
    [notes]
  )

  const addTagToContext = useCallback(
    (tag: string) => {
      const taggedNotes = notes.filter(n => n.tags.includes(tag))

      setContext(prev => ({
        noteIds: [...new Set([...prev.noteIds, ...taggedNotes.map(n => n.id)])],
        notebookIds: [
          ...new Set([
            ...prev.notebookIds,
            ...taggedNotes.map(n => n.notebookId).filter(Boolean),
          ]),
        ],
        tags: [...new Set([...prev.tags, tag])],
      }))
    },
    [notes]
  )

  const clearContext = useCallback(() => {
    setContext({ noteIds: [], notebookIds: [], tags: [] })
  }, [])

  const toggleNoteInContext = useCallback(
    (noteId: string) => {
      if (context.noteIds.includes(noteId)) {
        removeNoteFromContext(noteId)
      } else {
        addNoteToContext(noteId)
      }
    },
    [context.noteIds, addNoteToContext, removeNoteFromContext]
  )

  const getContextSummary = useCallback(() => {
    const noteCount = context.noteIds.length
    const notebookCount = context.notebookIds.length
    const tagCount = context.tags.length

    if (noteCount === 0 && notebookCount === 0 && tagCount === 0) {
      return 'No context selected'
    }

    const parts = []
    if (noteCount > 0)
      parts.push(`${noteCount} note${noteCount > 1 ? 's' : ''}`)
    if (notebookCount > 0)
      parts.push(`${notebookCount} notebook${notebookCount > 1 ? 's' : ''}`)
    if (tagCount > 0) parts.push(`${tagCount} tag${tagCount > 1 ? 's' : ''}`)

    return parts.join(', ')
  }, [context])

  return {
    context,
    addNoteToContext,
    removeNoteFromContext,
    addNotebookToContext,
    addTagToContext,
    clearContext,
    toggleNoteInContext,
    getContextSummary,
  }
}
