/**
 * EmbeddingStatus - Shows embedding generation progress and statistics
 */

import React, { useState, useEffect } from 'react'
import { embeddingManager, type EmbeddingProgress } from '../../services/ai'
import { Icons } from '../Icons'
import { Button } from '../ui/ButtonRadix'
import { cn } from '../../lib/utils'
import { useToast } from '../../hooks/useToast'

interface EmbeddingStatusProps {
  className?: string
}

export const EmbeddingStatus: React.FC<EmbeddingStatusProps> = ({
  className,
}) => {
  const [progress, setProgress] = useState<EmbeddingProgress>({
    total: 0,
    processed: 0,
    current: '',
    isProcessing: false,
  })
  const [stats, setStats] = useState({
    totalNotes: 0,
    notesWithEmbeddings: 0,
    totalChunks: 0,
    queueLength: 0,
    isProcessing: false,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    // Set up progress callback
    embeddingManager.onProgress(setProgress)

    // Load initial stats
    updateStats()

    // Update stats periodically
    const interval = setInterval(updateStats, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const updateStats = () => {
    setStats(embeddingManager.getStatistics())
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    showToast({
      title: 'Generating embeddings',
      description: 'This may take a few minutes...',
      variant: 'default',
    })

    try {
      await embeddingManager.generateEmbeddingsForAllNotes()
      showToast({
        title: 'Embeddings generated',
        description: 'All notes now have embeddings for semantic search',
        variant: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Failed to generate embeddings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      })
    } finally {
      setIsGenerating(false)
      updateStats()
    }
  }

  const handleRegenerateAll = async () => {
    setIsGenerating(true)
    showToast({
      title: 'Regenerating all embeddings',
      description: 'This will update embeddings for all notes...',
      variant: 'default',
    })

    try {
      await embeddingManager.generateEmbeddingsForAllNotes(true)
      showToast({
        title: 'Embeddings regenerated',
        description: 'All embeddings have been updated',
        variant: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Failed to regenerate embeddings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      })
    } finally {
      setIsGenerating(false)
      updateStats()
    }
  }

  const percentComplete =
    stats.totalNotes > 0
      ? Math.round((stats.notesWithEmbeddings / stats.totalNotes) * 100)
      : 0

  return (
    <div className={cn('p-4 bg-theme-bg-secondary rounded-lg', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-text-primary flex items-center gap-2">
          <Icons.Brain className="w-5 h-5" />
          Embedding Status
        </h3>

        <div className="flex gap-2">
          {stats.notesWithEmbeddings < stats.totalNotes && (
            <Button
              size="sm"
              variant="default"
              onClick={handleGenerateAll}
              disabled={isGenerating || stats.isProcessing}
            >
              Generate Missing
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerateAll}
            disabled={isGenerating || stats.isProcessing}
          >
            <Icons.RefreshCw className="w-4 h-4 mr-1" />
            Regenerate All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-theme-text-muted">
            Notes with Embeddings
          </div>
          <div className="text-xl font-semibold text-theme-text-primary">
            {stats.notesWithEmbeddings} / {stats.totalNotes}
          </div>
        </div>

        <div>
          <div className="text-sm text-theme-text-muted">Total Chunks</div>
          <div className="text-xl font-semibold text-theme-text-primary">
            {stats.totalChunks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-theme-text-muted mb-1">
          <span>Coverage</span>
          <span>{percentComplete}%</span>
        </div>
        <div className="w-full bg-theme-bg-tertiary rounded-full h-2">
          <div
            className="bg-theme-accent-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Processing Status */}
      {(stats.isProcessing || progress.isProcessing) && (
        <div className="flex items-center gap-2 text-sm text-theme-text-muted">
          <Icons.Loader className="w-4 h-4 animate-spin" />
          <span>
            Processing: {progress.current || 'Initializing...'}
            {progress.total > 0 && ` (${progress.processed}/${progress.total})`}
          </span>
        </div>
      )}

      {/* Queue Status */}
      {stats.queueLength > 0 && (
        <div className="mt-2 text-sm text-theme-text-muted">
          {stats.queueLength} notes queued for processing
        </div>
      )}
    </div>
  )
}
