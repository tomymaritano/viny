import React, { useState, useEffect } from 'react'
import { useKnowledgeStore } from '../../stores/knowledgeStore'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import GraphVisualization from './GraphVisualization'
import ChatInterface from './ChatInterface'
import { ResizeHandle } from '../ResizeHandle'
import {
  LayoutGrid,
  MessageSquare,
  Network,
  Plus,
  Settings,
} from 'lucide-react'

export const KnowledgeWorkspace: React.FC = () => {
  const [layout, setLayout] = useState<'chat' | 'graph' | 'split'>('split')
  const [splitRatio, setSplitRatio] = useState(0.5)
  const { windowSize, isMobile, recommendedLayout } = useResponsiveLayout()
  const { createNewConversation, activeConversationId } = useKnowledgeStore()

  // Auto-adjust layout on mobile
  useEffect(() => {
    if (isMobile && layout === 'split') {
      setLayout('chat')
    }
  }, [isMobile, layout])

  const handleNewConversation = () => {
    createNewConversation()
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <WorkspaceHeader
        layout={layout}
        onLayoutChange={setLayout}
        onNewConversation={handleNewConversation}
        hasActiveConversation={!!activeConversationId}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {(layout === 'chat' || layout === 'split') && (
          <div
            className="flex-1 min-w-0"
            style={{
              width: layout === 'split' ? `${splitRatio * 100}%` : '100%',
            }}
          >
            <ChatInterface />
          </div>
        )}

        {layout === 'split' && !isMobile && (
          <ResizeHandle
            onResize={delta => {
              const newRatio = Math.max(
                0.2,
                Math.min(0.8, splitRatio + delta / windowSize.width)
              )
              setSplitRatio(newRatio)
            }}
            orientation="vertical"
          />
        )}

        {(layout === 'graph' || layout === 'split') && (
          <div
            className="flex-1 min-w-0"
            style={{
              width: layout === 'split' ? `${(1 - splitRatio) * 100}%` : '100%',
            }}
          >
            <GraphVisualization />
          </div>
        )}
      </div>
    </div>
  )
}

// Workspace header component
const WorkspaceHeader: React.FC<{
  layout: string
  onLayoutChange: (layout: 'chat' | 'graph' | 'split') => void
  onNewConversation: () => void
  hasActiveConversation: boolean
}> = ({ layout, onLayoutChange, onNewConversation, hasActiveConversation }) => {
  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Knowledge Workspace</h1>

          {/* Layout selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              className={`p-2 rounded ${layout === 'chat' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              onClick={() => onLayoutChange('chat')}
              title="Chat View"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded ${layout === 'split' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              onClick={() => onLayoutChange('split')}
              title="Split View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded ${layout === 'graph' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              onClick={() => onLayoutChange('graph')}
              title="Graph View"
            >
              <Network className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            onClick={onNewConversation}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button className="p-2 hover:bg-accent rounded-lg" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeWorkspace
