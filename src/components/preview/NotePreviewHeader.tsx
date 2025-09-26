import React, { useState } from 'react'
import { Icons } from '../Icons'
import NoteMetadata from '../editor/metadata/NoteMetadata'
import NoteActionsDrawerPortal from '../ui/NoteActionsDrawerPortal'
import type { Note } from '../../types'

interface NotePreviewHeaderProps {
  note: Note
  viewMode: 'preview' | 'edit'
  onViewModeChange?: (mode: 'preview' | 'edit') => void
  onEdit?: (note: Note) => void
  onSave?: (note: Note) => void
  isTrashView?: boolean
  menuTrigger?: React.ReactNode
  onTogglePin?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onDelete?: (note: Note) => void
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  onOpenInNewWindow?: (note: Note) => void
  onViewHistory?: (note: Note) => void
}

const NotePreviewHeader: React.FC<NotePreviewHeaderProps> = ({
  note,
  viewMode,
  onViewModeChange,
  onEdit,
  onSave,
  isTrashView = false,
  menuTrigger,
  onTogglePin,
  onDuplicate,
  onDelete,
  onRestoreNote,
  onPermanentDelete,
  onOpenInNewWindow,
  onViewHistory,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const handleEdit = () => {
    if (onEdit) {
      onEdit(note)
    }
  }

  const handleViewModeToggle = (mode: 'preview' | 'edit') => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    }
  }

  return (
    <div className="p-4 border-b border-theme-border-primary bg-theme-bg-secondary">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1
              className="text-xl font-semibold text-theme-text-primary truncate"
              data-testid="note-title"
            >
              {note.title || 'Untitled Note'}
            </h1>
            {note.isPinned && (
              <Icons.Pin
                size={16}
                className="text-theme-accent-primary flex-shrink-0"
              />
            )}
          </div>
          <div className="mt-2">
            <NoteMetadata 
              note={note}
              onNotebookChange={(notebookValue: string) => {
                console.log('📝 NotePreviewHeader notebook change handler called:', {
                  noteId: note.id,
                  oldNotebook: note.notebook,
                  newNotebook: notebookValue,
                  onSave: typeof onSave,
                  onSaveExists: !!onSave
                })
                
                if (onSave) {
                  const updatedNote = { ...note, notebook: notebookValue }
                  console.log('📝 Calling onSave with updated note:', updatedNote)
                  onSave(updatedNote)
                } else {
                  console.error('❌ NotePreviewHeader: onSave is not provided!')
                }
              }}
              isPreviewMode={true}
            />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {!isTrashView && (
            <div className="flex items-center bg-theme-bg-tertiary rounded-md p-1 space-x-1">
              {onViewModeChange && (
                <button
                  onClick={() => handleViewModeToggle('preview')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-primary/50'
                  }`}
                  title="Preview mode"
                >
                  <Icons.Eye size={16} />
                </button>
              )}

              {onViewModeChange && (
                <button
                  onClick={() => handleViewModeToggle('edit')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-primary/50'
                  }`}
                  title="Edit mode"
                >
                  <Icons.Edit size={16} />
                </button>
              )}
            </div>
          )}

          {menuTrigger || (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded transition-colors"
              title="More options"
            >
              <Icons.MoreHorizontal size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Note Actions Drawer */}
      <NoteActionsDrawerPortal
        note={note}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPinToggle={(e, n) => onTogglePin?.(n)}
        onDelete={(e, n) => onDelete?.(n)}
        onDuplicate={(e, n) => onDuplicate?.(n)}
        onMoveToNotebook={undefined}
        onRestoreNote={(e, n) => onRestoreNote?.(n)}
        onPermanentDelete={(e, n) => onPermanentDelete?.(n)}
        onOpenInNewWindow={(e, n) => onOpenInNewWindow?.(n)}
        onViewHistory={(e, n) => onViewHistory?.(n)}
        isTrashView={isTrashView}
      />
    </div>
  )
}

export default NotePreviewHeader
