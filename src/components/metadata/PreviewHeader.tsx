import React from 'react'
import { Icons } from '../Icons'

interface Note {
  createdAt?: string
  updatedAt?: string
  notebook?: { name: string } | string
}

interface PreviewHeaderProps {
  note: Note
  formatDate: (dateString: string) => string
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ note, formatDate }) => {
  return (
    <div className="px-4 py-3 bg-theme-bg-secondary/30">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          {/* Creation Date */}
          {note?.createdAt && (
            <div className="flex items-center space-x-2 text-sm text-theme-text-primary">
              <Icons.Plus size={14} className="text-theme-accent-green" />
              <span className="font-medium text-theme-text-secondary">
                Created:
              </span>
              <span className="text-theme-text-primary">
                {formatDate(note.createdAt)}
              </span>
            </div>
          )}

          {/* Update Date - Always show if it exists */}
          {note?.updatedAt && (
            <div className="flex items-center space-x-2 text-sm text-theme-text-primary">
              <Icons.Clock size={14} className="text-theme-accent-cyan" />
              <span className="font-medium text-theme-text-secondary">
                Updated:
              </span>
              <span className="text-theme-text-primary">
                {formatDate(note.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Notebook info in preview */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-theme-bg-tertiary/50 rounded-full text-sm text-theme-text-secondary">
          <Icons.FolderOpen size={14} className="text-theme-accent-orange" />
          <span className="font-medium">
            {note?.notebook?.name || note?.notebook || 'No notebook'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PreviewHeader
