/**
 * AISidebar - Combined AI features sidebar with chat and related notes
 */

import React, { useState } from 'react'
import { Icons } from '../Icons'
import { ChatPanel } from './ChatPanel'
import { RelatedNotes } from './RelatedNotes'
import { KnowledgeGraph } from './KnowledgeGraph'
import { useAppStore } from '../../stores/newSimpleStore'
import { cn } from '../../lib/utils'

interface AISidebarProps {
  className?: string
  onClose?: () => void
}

export const AISidebar: React.FC<AISidebarProps> = ({ className, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'related' | 'graph'>(
    'related'
  )
  const { currentNote, setSelectedNoteId, setIsEditorOpen } = useAppStore()

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
    setIsEditorOpen(false)
  }

  return (
    <div className={cn('flex flex-col h-full bg-theme-bg-primary', className)}>
      {/* Header with tabs */}
      <div className="border-b border-theme-border-primary">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Icons.Brain className="w-5 h-5 text-theme-accent-primary" />
            <h2 className="font-semibold text-theme-text-primary">
              AI Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors"
          >
            <Icons.X className="w-4 h-4 text-theme-text-muted" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex px-2">
          <button
            onClick={() => setActiveTab('related')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors relative',
              activeTab === 'related'
                ? 'text-theme-accent-primary'
                : 'text-theme-text-muted hover:text-theme-text-primary'
            )}
          >
            Related Notes
            {activeTab === 'related' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-accent-primary" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors relative',
              activeTab === 'chat'
                ? 'text-theme-accent-primary'
                : 'text-theme-text-muted hover:text-theme-text-primary'
            )}
          >
            Chat
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-accent-primary" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors relative',
              activeTab === 'graph'
                ? 'text-theme-accent-primary'
                : 'text-theme-text-muted hover:text-theme-text-primary'
            )}
          >
            Graph
            {activeTab === 'graph' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-accent-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'related' ? (
          <RelatedNotes
            currentNote={currentNote}
            onSelectNote={handleSelectNote}
            className="h-full overflow-y-auto"
          />
        ) : activeTab === 'chat' ? (
          <ChatPanel className="h-full" />
        ) : (
          <KnowledgeGraph className="h-full" onSelectNote={handleSelectNote} />
        )}
      </div>
    </div>
  )
}

export default AISidebar
