import React from 'react'
import { Icons } from '../Icons'
import type { NoteRevision } from '../../types/revision'
import { formatDistanceToNow } from 'date-fns'

interface RevisionTimelineProps {
  revisions: NoteRevision[]
  selectedRevision: NoteRevision | null
  onSelectRevision: (revision: NoteRevision) => void
}

const RevisionTimeline: React.FC<RevisionTimelineProps> = ({
  revisions,
  selectedRevision,
  onSelectRevision,
}) => {
  const getRevisionIcon = (changeType: string) => {
    switch (changeType) {
      case 'auto':
        return <Icons.Clock size={16} />
      case 'restore':
        return <Icons.RotateCcw size={16} />
      default:
        return <Icons.Save size={16} />
    }
  }

  const getRevisionColor = (changeType: string) => {
    switch (changeType) {
      case 'auto':
        return 'bg-gray-500'
      case 'restore':
        return 'bg-blue-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-theme-border-primary" />
      
      {/* Timeline items */}
      <div className="space-y-4">
        {revisions.map((revision, index) => {
          const isSelected = selectedRevision?.id === revision.id
          const isFirst = index === 0
          const isLast = index === revisions.length - 1
          
          return (
            <div
              key={revision.id}
              className="relative flex items-start gap-4 cursor-pointer group"
              onClick={() => onSelectRevision(revision)}
            >
              {/* Timeline dot */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? `${getRevisionColor(revision.changeType)} text-white ring-4 ring-theme-accent-primary/20`
                    : 'bg-theme-bg-secondary border-2 border-theme-border-primary group-hover:border-theme-accent-primary'
                }`}
              >
                {getRevisionIcon(revision.changeType)}
              </div>
              
              {/* Content */}
              <div
                className={`flex-1 p-4 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-theme-accent-primary/10 border border-theme-accent-primary'
                    : 'bg-theme-bg-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-theme-text-primary">
                      {revision.title || 'Untitled'}
                    </h4>
                    <p className="text-sm text-theme-text-muted mt-1">
                      {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true })}
                    </p>
                    {revision.metadata && (
                      <p className="text-xs text-theme-text-muted mt-2">
                        {revision.metadata.wordCount} words
                        {revision.metadata.charactersChanged > 0 && (
                          <span className="ml-2">
                            • {revision.metadata.charactersChanged} chars changed
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    {new Date(revision.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                
                {/* Preview of content changes */}
                <div className="mt-2 text-sm text-theme-text-secondary line-clamp-2">
                  {revision.content.substring(0, 150)}...
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RevisionTimeline