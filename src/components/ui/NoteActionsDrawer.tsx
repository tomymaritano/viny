import React, { useEffect } from 'react'
import type { Note } from '../../types'
import { Icons } from '../Icons'
import { useElectronExport } from '../../hooks/useElectronExport'
import { cn } from '../../lib/utils'
import { noteLogger } from '../../utils/logger'

interface NoteActionsDrawerProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onPinToggle: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onDelete: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onDuplicate?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onMoveToNotebook?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onRestoreNote?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onPermanentDelete?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  isTrashView?: boolean
}

const NoteActionsDrawer: React.FC<NoteActionsDrawerProps> = ({
  note,
  isOpen,
  onClose,
  onPinToggle,
  onDelete,
  onDuplicate,
  onMoveToNotebook,
  onRestoreNote,
  onPermanentDelete,
  isTrashView = false,
}) => {
  const { exportToHTML, exportToPDF, exportToMarkdown } = useElectronExport()
  
  // Debug logging
  useEffect(() => {
    console.log('[NoteActionsDrawer] Drawer state changed:', { isOpen, noteId: note?.id })
  }, [isOpen, note?.id])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const drawer = document.getElementById('note-actions-drawer')
      if (drawer && !drawer.contains(e.target as Node)) {
        onClose()
      }
    }

    // Add a small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!note) return null

  const handleAction = async (
    e: React.MouseEvent,
    action: (e: React.MouseEvent, note: Note) => void | Promise<void>
  ) => {
    e.stopPropagation()
    try {
      await action(e, note)
      onClose()
    } catch (error) {
      noteLogger.error('Error executing note action:', error)
    }
  }

  const handleExport = async (
    e: React.MouseEvent,
    exportFn: (note: Note) => Promise<void>
  ) => {
    e.stopPropagation()
    try {
      await exportFn(note)
      onClose()
    } catch (error) {
      noteLogger.error('Error exporting note:', error)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        id="note-actions-drawer"
        className={cn(
          'fixed right-0 top-0 h-full w-64 bg-theme-bg-primary shadow-2xl z-50',
          'transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
            <h3 className="text-sm font-medium text-theme-text-primary">
              Note Actions
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-theme-bg-secondary rounded text-theme-text-muted hover:text-theme-text-primary transition-colors"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex-1 overflow-y-auto py-2">
            {isTrashView ? (
              <>
                {/* Trash actions */}
                <button
                  onClick={(e) => handleAction(e, onRestoreNote!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                  data-testid="restore-note-button"
                >
                  <Icons.RotateCcw size={18} />
                  <span className="text-sm">Restore Note</span>
                </button>
                
                <div className="h-px bg-theme-border-primary mx-4 my-2" />
                
                <button
                  onClick={(e) => handleAction(e, onPermanentDelete!)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                  data-testid="permanent-delete-button"
                >
                  <Icons.Trash size={18} />
                  <span className="text-sm">Delete Permanently</span>
                </button>
              </>
            ) : (
              <>
                {/* Normal actions */}
                <button
                  onClick={(e) => handleAction(e, onPinToggle)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                  data-testid="pin-note-button"
                >
                  <Icons.Pin
                    size={18}
                    className={note.isPinned ? 'text-theme-accent-primary' : ''}
                  />
                  <span className="text-sm">
                    {note.isPinned ? 'Unpin note' : 'Pin to top'}
                  </span>
                </button>

                {onDuplicate && (
                  <button
                    onClick={(e) => handleAction(e, onDuplicate)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                    data-testid="duplicate-note-button"
                  >
                    <Icons.Copy size={18} />
                    <span className="text-sm">Duplicate note</span>
                  </button>
                )}

                {onMoveToNotebook && (
                  <button
                    onClick={(e) => handleAction(e, onMoveToNotebook)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                    data-testid="move-note-button"
                  >
                    <Icons.Move size={18} />
                    <span className="text-sm">Move to notebook</span>
                  </button>
                )}

                <div className="h-px bg-theme-border-primary mx-4 my-2" />

                {/* Export actions */}
                <div className="px-4 py-2">
                  <p className="text-xs text-theme-text-muted uppercase tracking-wider mb-2">
                    Export
                  </p>
                </div>

                <button
                  onClick={(e) => handleExport(e, exportToHTML)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                  data-testid="export-html-button"
                >
                  <Icons.Download size={18} />
                  <span className="text-sm">Export as HTML</span>
                </button>

                <button
                  onClick={(e) => handleExport(e, exportToPDF)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                  data-testid="export-pdf-button"
                >
                  <Icons.FileText size={18} />
                  <span className="text-sm">Export as PDF</span>
                </button>

                <button
                  onClick={(e) => handleExport(e, exportToMarkdown)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-bg-secondary transition-colors text-theme-text-primary"
                  data-testid="export-markdown-button"
                >
                  <Icons.Code size={18} />
                  <span className="text-sm">Export as Markdown</span>
                </button>

                <div className="h-px bg-theme-border-primary mx-4 my-2" />

                <button
                  onClick={(e) => handleAction(e, onDelete)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                  data-testid="delete-note-button"
                >
                  <Icons.Trash size={18} />
                  <span className="text-sm">Move to trash</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default NoteActionsDrawer