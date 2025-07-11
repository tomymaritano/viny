/**
 * Metadata preview component for read-only mode
 */
import React from 'react'
import Icons from '../Icons'
import { formatDate, calculateReadingTime } from '../../utils/dateUtils'

interface Note {
  id: string
  title?: string
  content?: string
  createdAt?: string
  updatedAt?: string
  notebook?: { name: string } | string
  tags?: string[]
  status?: string
}

interface MetadataPreviewProps {
  note: Note
}

const MetadataPreview: React.FC<MetadataPreviewProps> = ({ note }) => {
  const readingTime = calculateReadingTime(note.content || '')
  
  return (
    <div className="p-3 border-b border-theme-border-primary bg-theme-bg-secondary/30">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Reading time and word count */}
          <div className="flex items-center space-x-4 mb-2 text-xs text-theme-text-muted">
            <div className="flex items-center space-x-1">
              <Icons.Clock size={12} />
              <span>{readingTime}</span>
            </div>
            {note.content && (
              <div className="flex items-center space-x-1">
                <Icons.FileText size={12} />
                <span>{note.content.trim().split(/\s+/).length} words</span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-1">
            {note.createdAt && (
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

            {note.updatedAt && (
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

          {/* Notebook info */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-theme-bg-tertiary/50 rounded-full text-sm text-theme-text-secondary mt-2">
            <Icons.FolderOpen
              size={14}
              className="text-theme-accent-orange"
            />
            <span className="font-medium">
              {typeof note.notebook === 'object' 
                ? note.notebook.name 
                : note.notebook || 'No notebook'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetadataPreview