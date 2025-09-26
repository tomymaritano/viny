import React, { useMemo, useState } from 'react'
import { Icons } from '../Icons'
import { DiffService } from '../../services/revision/DiffService'
import type { Note } from '../../types'
import type { NoteRevision } from '../../types/revision'
import { formatDistanceToNow } from 'date-fns'

interface RevisionCompareProps {
  currentNote: Note | null
  revision: NoteRevision | null
  onBack: () => void
  onRestore: () => void
}

const RevisionCompare: React.FC<RevisionCompareProps> = ({
  currentNote,
  revision,
  onBack,
  onRestore,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('unified')
  const diffService = new DiffService()

  const comparison = useMemo(() => {
    if (!currentNote || !revision) return null

    // Create a temporary revision for current note
    const currentRevision: NoteRevision = {
      id: 'current',
      noteId: currentNote.id,
      title: currentNote.title,
      content: currentNote.content,
      notebook: currentNote.notebook,
      tags: currentNote.tags,
      createdAt: currentNote.updatedAt,
      changeType: 'manual',
    }

    return diffService.compareRevisions(revision, currentRevision)
  }, [currentNote, revision])

  if (!comparison) {
    return (
      <div className="flex items-center justify-center h-full text-theme-text-muted">
        <p>No comparison available</p>
      </div>
    )
  }

  const renderDiffLine = (line: string, lineNumber?: number) => {
    const type = line[0]
    const content = line.substring(1)

    switch (type) {
      case '+':
        return (
          <div className="flex bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500">
            {lineNumber !== undefined && (
              <span className="w-12 text-right pr-2 text-xs text-theme-text-muted select-none">
                {lineNumber}
              </span>
            )}
            <span className="w-6 text-center text-green-600 select-none">+</span>
            <span className="flex-1 px-2 py-1 text-sm font-mono text-green-700 dark:text-green-300">
              {content}
            </span>
          </div>
        )
      case '-':
        return (
          <div className="flex bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500">
            {lineNumber !== undefined && (
              <span className="w-12 text-right pr-2 text-xs text-theme-text-muted select-none">
                {lineNumber}
              </span>
            )}
            <span className="w-6 text-center text-red-600 select-none">-</span>
            <span className="flex-1 px-2 py-1 text-sm font-mono text-red-700 dark:text-red-300 line-through opacity-75">
              {content}
            </span>
          </div>
        )
      case '~':
        return (
          <div className="flex bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500">
            {lineNumber !== undefined && (
              <span className="w-12 text-right pr-2 text-xs text-theme-text-muted select-none">
                {lineNumber}
              </span>
            )}
            <span className="w-6 text-center text-yellow-600 select-none">~</span>
            <span className="flex-1 px-2 py-1 text-sm font-mono text-yellow-700 dark:text-yellow-300">
              {content}
            </span>
          </div>
        )
      default:
        return null
    }
  }

  const formatRevisionHash = (id: string) => {
    return id.substring(0, 7)
  }

  return (
    <div className="flex flex-col h-full bg-theme-bg-primary">
      {/* Clean Header */}
      <div className="p-6 border-b border-theme-border-primary">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <Icons.ArrowLeft size={16} />
            Back to timeline
          </button>
          <button
            onClick={onRestore}
            className="px-4 py-2 text-sm font-medium text-white bg-theme-accent-primary hover:bg-theme-accent-primary/90 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icons.RotateCcw size={16} />
            Restore this version
          </button>
        </div>
        
        {/* Comparison Info */}
        <div>
          <h2 className="text-xl font-semibold text-theme-text-primary mb-3">
            Comparing versions
          </h2>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-theme-bg-secondary rounded-lg">
              <code className="font-mono text-xs">{formatRevisionHash(revision.id)}</code>
              <span className="text-theme-text-muted">
                {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true })}
              </span>
            </div>
            <Icons.ArrowRight size={16} className="text-theme-text-muted" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-theme-bg-secondary rounded-lg">
              <code className="font-mono text-xs">current</code>
              <span className="text-theme-text-muted">Latest version</span>
            </div>
          </div>
          
          {/* Stats and View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +{comparison.diff.added.length}
                </span>
                <span className="text-theme-text-secondary">additions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  -{comparison.diff.removed.length}
                </span>
                <span className="text-theme-text-secondary">deletions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  ~{comparison.diff.modified.length}
                </span>
                <span className="text-theme-text-secondary">changes</span>
              </span>
            </div>
            
            {/* View mode toggle */}
            <div className="flex items-center bg-theme-bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'split'
                    ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                <Icons.Columns size={14} className="inline mr-1.5" />
                Split
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                <Icons.FileText size={14} className="inline mr-1.5" />
                Unified
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          /* Split View - Default */
          <div className="flex h-full">
            {/* Old Version */}
            <div className="flex-1 flex flex-col border-r border-theme-border-primary">
              <div className="px-6 py-3 bg-theme-bg-secondary border-b border-theme-border-primary">
                <h4 className="font-medium text-sm text-theme-text-primary flex items-center gap-2">
                  <code className="font-mono text-xs bg-theme-bg-tertiary px-2 py-0.5 rounded">
                    {formatRevisionHash(revision.id)}
                  </code>
                  <span className="text-theme-text-muted font-normal">
                    {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true })}
                  </span>
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-theme-bg-primary">
                <pre className="whitespace-pre-wrap text-sm font-sans text-theme-text-primary leading-relaxed">
                  {comparison.oldRevision.content}
                </pre>
              </div>
            </div>

            {/* Current Version */}
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-3 bg-theme-bg-secondary border-b border-theme-border-primary">
                <h4 className="font-medium text-sm text-theme-text-primary flex items-center gap-2">
                  <code className="font-mono text-xs bg-theme-bg-tertiary px-2 py-0.5 rounded">
                    current
                  </code>
                  <span className="text-theme-text-muted font-normal">Latest version</span>
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-theme-bg-primary">
                <pre className="whitespace-pre-wrap text-sm font-sans text-theme-text-primary leading-relaxed">
                  {comparison.newRevision.content}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="h-full overflow-y-auto bg-theme-bg-primary">
            <div className="max-w-5xl mx-auto p-6">
              {/* File header */}
              <div className="bg-theme-bg-secondary rounded-lg border border-theme-border-primary mb-4">
                <div className="px-4 py-3 border-b border-theme-border-primary">
                  <h3 className="text-sm font-medium text-theme-text-primary flex items-center gap-2">
                    <Icons.FileText size={16} />
                    {comparison.oldRevision.title || 'Untitled'}
                  </h3>
                </div>
              
                {/* Diff content */}
                <div className="">
                  {comparison.diff.added.length === 0 && 
                   comparison.diff.removed.length === 0 && 
                   comparison.diff.modified.length === 0 ? (
                    <div className="text-center py-12 text-theme-text-muted">
                      <Icons.Check size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
                      <p className="text-lg font-medium">No changes</p>
                      <p className="text-sm mt-2">This revision is identical to the current version</p>
                    </div>
                  ) : (
                    <div className="font-mono text-sm">
                      {/* Render all diff lines */}
                      {comparison.diff.removed.map((line, index) => (
                        <div key={`remove-${index}`}>{renderDiffLine(line, index + 1)}</div>
                      ))}
                      {comparison.diff.added.map((line, index) => (
                        <div key={`add-${index}`}>{renderDiffLine(line, comparison.diff.removed.length + index + 1)}</div>
                      ))}
                      {comparison.diff.modified.map((line, index) => (
                        <div key={`modify-${index}`}>{renderDiffLine(line, comparison.diff.removed.length + comparison.diff.added.length + index + 1)}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RevisionCompare