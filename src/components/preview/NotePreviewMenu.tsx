import React from 'react'
import { Icons } from '../Icons'
import { Note } from '../../types'

interface NotePreviewMenuProps {
  note: Note
  showMenu: boolean
  onTogglePin?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onDelete?: (note: Note) => void
  onExport?: (note: Note) => void
  onEdit?: (note: Note) => void
  isTrashView?: boolean
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  onSetShowExportDialog: (show: boolean) => void
}

const NotePreviewMenu: React.FC<NotePreviewMenuProps> = ({
  note,
  showMenu,
  onTogglePin,
  onDuplicate,
  onDelete,
  onExport,
  onEdit,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onSetShowExportDialog
}) => {
  if (!showMenu) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit(note)
    }
  }

  const handleTogglePin = () => {
    if (onTogglePin) {
      onTogglePin(note)
    }
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(note)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note)
    }
  }

  const handleExport = () => {
    onSetShowExportDialog(true)
  }

  const handleRestore = () => {
    if (onRestoreNote) {
      onRestoreNote(note)
    }
  }

  const handlePermanentDelete = () => {
    if (onPermanentDelete) {
      onPermanentDelete(note)
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg z-50">
      <div className="py-1">
        {!isTrashView ? (
          <>
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary flex items-center space-x-2"
            >
              <Icons.Edit size={16} />
              <span>Edit Note</span>
            </button>
            
            <button
              onClick={handleTogglePin}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary flex items-center space-x-2"
            >
              <Icons.Pin size={16} />
              <span>{note.isPinned ? 'Unpin Note' : 'Pin Note'}</span>
            </button>
            
            <button
              onClick={handleDuplicate}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary flex items-center space-x-2"
            >
              <Icons.Copy size={16} />
              <span>Duplicate</span>
            </button>
            
            <div className="border-t border-theme-border-primary my-1"></div>
            
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary flex items-center space-x-2"
            >
              <Icons.Download size={16} />
              <span>Export</span>
            </button>
            
            <div className="border-t border-theme-border-primary my-1"></div>
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Icons.Trash2 size={16} />
              <span>Move to Trash</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRestore}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-bg-tertiary flex items-center space-x-2"
            >
              <Icons.RotateCcw size={16} />
              <span>Restore Note</span>
            </button>
            
            <div className="border-t border-theme-border-primary my-1"></div>
            
            <button
              onClick={handlePermanentDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <Icons.Trash2 size={16} />
              <span>Delete Permanently</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default NotePreviewMenu