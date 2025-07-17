import React from 'react'
import { Icons } from '../Icons'
import DropdownMenu, { DropdownMenuItem, DropdownHeader, DropdownDivider } from './DropdownMenu'

interface NotebookContextMenuProps {
  isVisible: boolean
  position: {
    x: number
    y: number
  }
  notebookName: string
  onRename: () => void
  onDelete: () => void
  onClose: () => void
  onMoveTo?: () => void
}

const NotebookContextMenu: React.FC<NotebookContextMenuProps> = ({
  isVisible,
  position,
  notebookName,
  onRename,
  onDelete,
  onClose,
  onMoveTo,
}) => {
  if (!isVisible) return null

  return (
    <DropdownMenu
      isOpen={isVisible}
      position="fixed"
      width="min-w-36"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <DropdownHeader>
        {notebookName}
      </DropdownHeader>

      {/* Rename */}
      <DropdownMenuItem
        onClick={onRename}
        icon={<Icons.Edit size={10} />}
      >
        Rename
      </DropdownMenuItem>

      {/* Move to (if provided) */}
      {onMoveTo && (
        <DropdownMenuItem
          onClick={onMoveTo}
          icon={<Icons.FolderOpen size={10} />}
        >
          Move to...
        </DropdownMenuItem>
      )}

      {/* Separator */}
      <DropdownDivider />

      {/* Delete */}
      <DropdownMenuItem
        onClick={onDelete}
        icon={<Icons.Trash size={10} />}
        className="text-theme-accent-red hover:text-theme-accent-red"
      >
        Delete Notebook
      </DropdownMenuItem>
    </DropdownMenu>
  )
}

export default NotebookContextMenu
