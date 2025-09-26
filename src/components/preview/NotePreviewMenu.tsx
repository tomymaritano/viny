import React from 'react'
import { Icons } from '../Icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenuRadix'
import type { Note } from '../../types'

interface NotePreviewMenuProps {
  note: Note
  children: React.ReactNode // Trigger element
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
  children,
  onTogglePin,
  onDuplicate,
  onDelete,
  onExport,
  onEdit,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onSetShowExportDialog,
}) => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {!isTrashView ? (
          <>
            <DropdownMenuItem
              onClick={handleEdit}
              icon={<Icons.Edit size={16} />}
            >
              Edit Note
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleTogglePin}
              icon={<Icons.Pin size={16} />}
            >
              {note.isPinned ? 'Unpin Note' : 'Pin Note'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDuplicate}
              icon={<Icons.Copy size={16} />}
            >
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleExport}
              icon={<Icons.Download size={16} />}
            >
              Export
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              icon={<Icons.Trash2 size={16} />}
            >
              Move to Trash
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={handleRestore}
              icon={<Icons.RotateCcw size={16} />}
            >
              Restore Note
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handlePermanentDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              icon={<Icons.Trash2 size={16} />}
            >
              Delete Permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotePreviewMenu
