/**
 * Similar Notes Component
 * Shows notes similar to the current one
 */

import React, { useEffect, useState } from 'react'
import { Icons } from '../Icons'
import type { RAGSystem } from '@/lib/rag'
import { useAppStore } from '@/stores/newSimpleStore'
import { logger } from '@/utils/logger'

interface SimilarNote {
  noteId: string
  title: string
  score: number
}

interface SimilarNotesProps {
  ragSystem: RAGSystem
  noteId: string
  onSelectNote?: (noteId: string) => void
}

export const SimilarNotes: React.FC<SimilarNotesProps> = ({
  ragSystem,
  noteId,
  onSelectNote,
}) => {
  const [similarNotes, setSimilarNotes] = useState<SimilarNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { selectNote } = useAppStore()

  useEffect(() => {
    loadSimilarNotes()
  }, [noteId])

  const loadSimilarNotes = async () => {
    if (!noteId) return

    setIsLoading(true)
    setError(null)

    try {
      const similar = await ragSystem.getSimilarNotes(noteId, 5)
      setSimilarNotes(similar)
    } catch (err) {
      logger.error('Failed to load similar notes:', err)
      setError('Failed to load similar notes')
      setSimilarNotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectNote = (similarNoteId: string) => {
    if (onSelectNote) {
      onSelectNote(similarNoteId)
    } else {
      selectNote(similarNoteId)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Icons.Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Finding similar notes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <Icons.AlertCircle className="w-5 h-5 mx-auto text-red-400" />
        <p className="text-sm text-red-500 mt-2">{error}</p>
      </div>
    )
  }

  if (similarNotes.length === 0) {
    return (
      <div className="p-4 text-center">
        <Icons.FileX className="w-5 h-5 mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">No similar notes found</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Similar Notes
      </h3>

      <div className="space-y-2">
        {similarNotes.map(note => (
          <button
            key={note.noteId}
            onClick={() => handleSelectNote(note.noteId)}
            className="w-full text-left p-3 rounded-lg border dark:border-gray-700
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 
                             truncate"
                >
                  {note.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Icons.BarChart2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(note.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              </div>
              <Icons.ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={loadSimilarNotes}
        className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        Refresh suggestions
      </button>
    </div>
  )
}
