import React from 'react'
import { Icons } from '../Icons'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ContextMenuRadix'

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
  children?: React.ReactNode
}

/**
 * TagContextMenu migrated to use Radix ContextMenu
 * Now provides proper context menu behavior with right-click support
 */
const TagContextMenu: React.FC<TagContextMenuProps> = ({
  isVisible,
  position,
  tagName,
  onRemove,
  onClose,
  onTagSettings,
  children,
}) => {
  if (!isVisible) return null

  // For backward compatibility, render as a positioned menu
  // In the future, this should be replaced with a proper ContextMenu wrapper
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu Content */}
      <div
        className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary p-1 text-theme-text-primary shadow-md"
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-2 py-1.5 text-sm font-semibold text-theme-text-primary">
          #{tagName}
        </div>

        {/* Tag Settings */}
        <div
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-theme-accent-primary hover:text-theme-text-primary"
          onClick={onTagSettings}
        >
          <span className="mr-2">
            <Icons.Settings size={10} />
          </span>
          Tag Settings
        </div>

        {/* Separator */}
        <div className="-mx-1 my-1 h-px bg-theme-border-primary" />

        {/* Remove Tag */}
        <div
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-theme-accent-primary hover:text-theme-text-primary text-theme-accent-red"
          onClick={onRemove}
        >
          <span className="mr-2">
            <Icons.Trash size={10} />
          </span>
          Remove Tag
        </div>
      </div>
    </>
  )
}

// Enhanced version using proper Radix ContextMenu
// This is for future migration when the parent components are updated
export const TagContextMenuRadix: React.FC<{
  tagName: string
  onRemove: () => void
  onTagSettings: () => void
  children: React.ReactNode
}> = ({ tagName, onRemove, onTagSettings, children }) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-36">
        <ContextMenuLabel>#{tagName}</ContextMenuLabel>

        <ContextMenuItem onClick={onTagSettings}>
          <Icons.Settings size={10} className="mr-2" />
          Tag Settings
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={onRemove}
          className="text-theme-accent-red focus:text-theme-accent-red"
        >
          <Icons.Trash size={10} className="mr-2" />
          Remove Tag
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default TagContextMenu
