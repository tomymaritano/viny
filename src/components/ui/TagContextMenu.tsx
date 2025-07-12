import React from 'react'
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem, DropdownHeader, DropdownDivider } from './DropdownMenu'

interface TagContextMenuProps {
  isVisible: boolean
  position: {
    x: number
    y: number
  }
  tagName: string
  onRemove: () => void
  onClose: () => void
  onTagSettings: () => void
}

const TagContextMenu: React.FC<TagContextMenuProps> = ({
  isVisible,
  position,
  tagName,
  onRemove,
  onClose,
  onTagSettings,
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
        #{tagName}
      </DropdownHeader>

      {/* Tag Settings */}
      <DropdownMenuItem
        onClick={onTagSettings}
        icon={<Icons.Settings size={10} />}
      >
        Tag Settings
      </DropdownMenuItem>

      {/* Separator */}
      <DropdownDivider />

      {/* Remove Tag */}
      <DropdownMenuItem
        onClick={onRemove}
        icon={<Icons.Trash size={10} />}
        className="text-theme-accent-red hover:text-theme-accent-red"
      >
        Remove Tag
      </DropdownMenuItem>
    </DropdownMenu>
  )
}

export default TagContextMenu
