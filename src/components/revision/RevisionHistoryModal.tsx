import React, { useState, useEffect, useCallback } from 'react'
import { StandardModal } from '../ui/StandardModal'
import { Icons } from '../Icons'
import LoadingSpinner from '../LoadingSpinner'
import { RevisionService } from '../../services/revision/RevisionService'
import { DiffService } from '../../services/revision/DiffService'
import type { Note } from '../../types'
import type { NoteRevision } from '../../types/revision'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '../../hooks/useToast'
import RevisionTimeline from './RevisionTimeline'
import RevisionCompare from './RevisionCompare'

interface RevisionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  note: Note | null
  onRestoreRevision?: (restoredNote: Note) => void
}

const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  note,
  onRestoreRevision,
}) => {
  const [revisions, setRevisions] = useState<NoteRevision[]>([])
  const [selectedRevision, setSelectedRevision] = useState<NoteRevision | null>(null)
  const [compareRevision, setCompareRevision] = useState<NoteRevision | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'compare'>('timeline')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const { showToast } = useToast()
  const revisionService = new RevisionService()
  const diffService = new DiffService()

  // Load revisions when modal opens or note changes
  useEffect(() => {
    console.log('[RevisionHistoryModal] Effect triggered:', {
      isOpen,
      hasNote: !!note,
      noteId: note?.id,
      noteTitle: note?.title
    })
    
    if (isOpen && note) {
      loadRevisions()
    }
  }, [isOpen, note?.id])

  const loadRevisions = async () => {
    if (!note) {
      console.log('[RevisionHistoryModal] No note provided, skipping load')
      return
    }
    
    console.log('[RevisionHistoryModal] Loading revisions for note:', note.id)
    setIsLoading(true)
    try {
      const history = await revisionService.getRevisions(note.id)
      console.log('[RevisionHistoryModal] Loaded revisions:', history.length)
      setRevisions(history)
      
      // Auto-select the most recent revision
      if (history.length > 0 && !selectedRevision) {
        setSelectedRevision(history[0])
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('[RevisionHistoryModal] Failed to load revisions:', error)
      showToast('Failed to load revision history', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreRevision = async () => {
    if (!selectedRevision) return

    try {
      const restoredNote = await revisionService.restoreRevision(selectedRevision.id)
      showToast('Revision restored successfully', 'success')
      if (onRestoreRevision) {
        onRestoreRevision(restoredNote)
      }
      onClose()
    } catch (error) {
      console.error('Failed to restore revision:', error)
      showToast('Failed to restore revision', 'error')
    }
  }

  const getRevisionIcon = (changeType: string) => {
    switch (changeType) {
      case 'auto':
        return <Icons.Clock size={16} className="text-theme-text-muted" />
      case 'restore':
        return <Icons.RotateCcw size={16} className="text-blue-500" />
      default:
        return <Icons.GitCommit size={16} className="text-theme-text-secondary" />
    }
  }

  const getRevisionStats = useCallback((revision: NoteRevision) => {
    // Simple heuristic for change stats - in real implementation, 
    // this would come from the diff service
    const wordCount = revision.content.split(/\s+/).length
    const lineCount = revision.content.split('\n').length
    return { wordCount, lineCount }
  }, [])

  const formatRevisionHash = (id: string) => {
    return id.substring(0, 7)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || viewMode !== 'timeline' || revisions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => {
            const newIndex = Math.min(prev + 1, revisions.length - 1)
            setSelectedRevision(revisions[newIndex])
            // Scroll into view
            const element = document.querySelector(`[data-revision-index="${newIndex}"]`)
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            return newIndex
          })
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => {
            const newIndex = Math.max(prev - 1, 0)
            setSelectedRevision(revisions[newIndex])
            // Scroll into view
            const element = document.querySelector(`[data-revision-index="${newIndex}"]`)
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            return newIndex
          })
          break
        case 'Enter':
          e.preventDefault()
          if (selectedRevision) {
            setCompareRevision(selectedRevision)
            setViewMode('compare')
          }
          break
        case 'r':
          e.preventDefault()
          if (selectedRevision && e.metaKey) {
            handleRestoreRevision()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, viewMode, revisions, selectedRevision, selectedIndex, onClose])

  const renderTimelineView = () => (
    <div className="flex h-full">
      {/* Revision List - Simplified */}
      <div className="w-1/3 bg-theme-bg-secondary border-r border-theme-border-primary overflow-y-auto">
        <div className="p-6">
          <h3 className="text-base font-medium text-theme-text-primary mb-4">
            Version History
          </h3>
          <div className="space-y-2">
            {revisions.map((revision, index) => {
              const isSelected = selectedRevision?.id === revision.id
              const isAuto = revision.changeType === 'auto'
              
              return (
                <button
                  key={revision.id}
                  data-revision-index={index}
                  onClick={() => {
                    setSelectedRevision(revision)
                    setSelectedIndex(index)
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-150 ${
                    isSelected
                      ? 'bg-theme-accent-primary/10 border border-theme-accent-primary shadow-sm'
                      : 'bg-theme-bg-primary hover:bg-theme-bg-tertiary border border-theme-border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-theme-text-primary">
                      {revision.title || 'Untitled'}
                    </span>
                    {getRevisionIcon(revision.changeType)}
                  </div>
                  <div className="text-xs text-theme-text-muted">
                    {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true })}
                  </div>
                  {index > 0 && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-green-600 dark:text-green-400">+12</span>
                      <span className="text-xs text-red-600 dark:text-red-400">-3</span>
                      <span className="text-xs text-theme-text-muted">changes</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revision Preview - Improved */}
      <div className="flex-1 flex flex-col bg-theme-bg-primary">
        {selectedRevision ? (
          <>
            {/* Clean Header */}
            <div className="p-6 border-b border-theme-border-primary">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-theme-text-primary mb-2">
                    {selectedRevision.title || 'Untitled Note'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-theme-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Icons.Calendar size={16} />
                      <span>{new Date(selectedRevision.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icons.Clock size={16} />
                      <span>{new Date(selectedRevision.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-xs bg-theme-bg-tertiary px-2 py-1 rounded">
                        {formatRevisionHash(selectedRevision.id)}
                      </code>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="text-theme-text-secondary">
                      {getRevisionStats(selectedRevision).wordCount.toLocaleString()} words
                    </span>
                    <span className="text-theme-text-secondary">
                      {getRevisionStats(selectedRevision).lineCount.toLocaleString()} lines
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <button
                    onClick={() => {
                      setCompareRevision(selectedRevision)
                      setViewMode('compare')
                    }}
                    className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-theme-bg-secondary hover:bg-theme-bg-tertiary border border-theme-border-primary rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Icons.GitCompare size={16} />
                    Compare
                  </button>
                  <button
                    onClick={handleRestoreRevision}
                    className="px-4 py-2 text-sm font-medium text-white bg-theme-accent-primary hover:bg-theme-accent-primary/90 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Icons.RotateCcw size={16} />
                    Restore
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content with better typography */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-8">
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-base text-theme-text-primary leading-relaxed">
                    {selectedRevision.content}
                  </pre>
                </article>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-theme-text-muted gap-4 p-8">
            <Icons.FileText size={64} className="opacity-10" />
            <div className="text-center">
              <p className="text-lg font-medium text-theme-text-secondary mb-2">No revision selected</p>
              <p className="text-sm">Choose a version from the list to preview its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderCompareView = () => (
    <RevisionCompare
      currentNote={note}
      revision={compareRevision}
      onBack={() => setViewMode('timeline')}
      onRestore={handleRestoreRevision}
    />
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="2xl"
      className=""
      showCloseButton={false}
    >
      <div className="flex flex-col h-[85vh]">
        {/* Clean Header with Tabs */}
        <div className="border-b border-theme-border-primary">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-theme-text-primary">
                Revision History
              </h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                aria-label="Close"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setViewMode('timeline')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === 'timeline'
                    ? 'border-theme-accent-primary text-theme-text-primary'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                Timeline View
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === 'compare'
                    ? 'border-theme-accent-primary text-theme-text-primary'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
                }`}
                disabled={!compareRevision}
              >
                Compare Changes
              </button>
              {/* Keyboard hints as tooltip */}
              {viewMode === 'timeline' && (
                <div className="ml-auto text-xs text-theme-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icons.Info size={14} />
                    Press <kbd className="px-1 py-0.5 bg-theme-bg-tertiary rounded text-xs">?</kbd> for shortcuts
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner text="Loading revision history..." />
            </div>
          ) : viewMode === 'timeline' ? (
            renderTimelineView()
          ) : (
            renderCompareView()
          )}
        </div>
      </div>
    </StandardModal>
  )
}

export default RevisionHistoryModal