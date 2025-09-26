/**
 * RelatedNotes - Shows semantically related notes using embeddings
 */

import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import { localEmbeddingService } from '../../services/ai'
import { Icons } from '../Icons'
import { cn } from '../../lib/utils'
import { formatRelativeDate } from '../../utils/dateUtils'
import type { Note } from '../../types'
import { logger } from '../../utils/logger'

interface RelatedNotesProps {
  currentNote: Note | null
  onSelectNote: (noteId: string) => void
  className?: string
  maxResults?: number
}

export const RelatedNotes: React.FC<RelatedNotesProps> = ({
  currentNote,
  onSelectNote,
  className,
  maxResults = 5,
}) => {
  const { notes } = useAppStore()
  const [relatedNotes, setRelatedNotes] = useState<
    Array<{
      note: Note
      similarity: number
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentNote || !currentNote.content) {
      setRelatedNotes([])
      return
    }

    findRelatedNotes()
  }, [currentNote?.id, currentNote?.content])

  const findRelatedNotes = async () => {
    if (!currentNote || !currentNote.content) return

    setIsLoading(true)
    setError(null)

    try {
      // Get embedding for current note content
      const queryEmbedding = await localEmbeddingService.generateEmbedding(
        currentNote.content
      )

      // Find similar notes
      const similarities = await Promise.all(
        notes
          .filter(
            note =>
              note.id !== currentNote.id && !note.isTrashed && note.content
          )
          .map(async note => {
            try {
              let noteEmbedding =
                await localEmbeddingService.getCachedEmbedding(note.content)

              if (!noteEmbedding) {
                // Generate embedding if not cached
                const result = await localEmbeddingService.generateEmbedding(
                  note.content
                )
                noteEmbedding = result.embedding
              }

              const similarity =
                await localEmbeddingService.calculateSimilarity(
                  queryEmbedding.embedding,
                  noteEmbedding
                )

              return { note, similarity }
            } catch (err) {
              logger.debug(
                `Failed to calculate similarity for note ${note.id}`,
                err
              )
              return null
            }
          })
      )

      // Filter out nulls and sort by similarity
      const validResults = similarities
        .filter(
          (result): result is { note: Note; similarity: number } =>
            result !== null && result.similarity > 0.5 // Only show notes with >50% similarity
        )
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults)

      setRelatedNotes(validResults)
    } catch (err) {
      logger.error('Failed to find related notes', err)
      setError('Failed to find related notes')
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentNote) {
    return null
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-theme-bg-secondary rounded-lg', className)}>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className={cn('bg-theme-bg-secondary rounded-lg', className)}>
      <div className="p-4 border-b border-theme-border-primary">
        <h3 className="text-sm font-semibold text-theme-text-primary flex items-center gap-2">
          <Icons.Brain className="w-4 h-4" />
          Related Notes
        </h3>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icons.Loader className="w-5 h-5 animate-spin text-theme-text-muted" />
          </div>
        ) : relatedNotes.length === 0 ? (
          <div className="text-sm text-theme-text-muted text-center py-8">
            No related notes found
          </div>
        ) : (
          <div className="space-y-1">
            {relatedNotes.map(({ note, similarity }) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full text-left p-3 rounded hover:bg-theme-bg-tertiary transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-theme-text-primary truncate group-hover:text-theme-accent-primary transition-colors">
                      {note.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-theme-text-muted mt-1 line-clamp-2">
                      {note.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-theme-text-muted">
                        {formatRelativeDate(new Date(note.updatedAt))}
                      </span>
                      <span className="text-xs text-theme-accent-primary">
                        {Math.round(similarity * 100)}% match
                      </span>
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-4 h-4 text-theme-text-muted group-hover:text-theme-text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!isLoading && relatedNotes.length > 0 && (
        <div className="px-4 py-2 border-t border-theme-border-primary">
          <button
            onClick={findRelatedNotes}
            className="text-xs text-theme-text-muted hover:text-theme-text-primary transition-colors flex items-center gap-1"
          >
            <Icons.RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
