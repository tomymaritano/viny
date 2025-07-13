import React from 'react'
import TaskProgress from '../ui/TaskProgress'
import { renderMarkdownToHtml } from '../../utils/markdownRenderer'

interface Note {
  id: string
  title: string
  content: string
  notebook: string
  tags?: string[]
  isPinned?: boolean
  date: string
  updatedAt?: string
}

interface Settings {
  markdownFontFamily?: string
  markdownFontSize?: string
}

interface NotePreviewContentProps {
  note: Note
  settings: Settings | null
  getTagColor: (tagName: string) => string
}

const NotePreviewContent: React.FC<NotePreviewContentProps> = ({
  note,
  settings,
  getTagColor
}) => {
  const markdownHtml = renderMarkdownToHtml(note.content || '')

  const markdownStyles = {
    fontFamily: settings?.markdownFontFamily || 'ui-serif, Georgia, Cambria, serif',
    fontSize: settings?.markdownFontSize || '16px',
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {/* Task Progress */}
        <div className="mb-6">
          <TaskProgress content={note.content} />
        </div>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors"
                  style={{
                    backgroundColor: getTagColor(tag),
                    borderColor: getTagColor(tag),
                    color: 'var(--color-text-primary)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Markdown Content */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none"
          style={markdownStyles}
          dangerouslySetInnerHTML={{ __html: markdownHtml }}
        />
      </div>
    </div>
  )
}

export default NotePreviewContent