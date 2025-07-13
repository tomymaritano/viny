import React, { useState, useEffect } from 'react'
import TagContextMenu from '../ui/TagContextMenu'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'
import Icons from '../Icons'
import { NotebookWithCounts } from '../../types/notebook'

export interface ContextMenuState {
  tag: {
    isVisible: boolean
    position: { x: number; y: number }
    tagName: string
    showColorPicker: boolean
  }
  notebook: {
    isVisible: boolean
    position: { x: number; y: number }
    notebook: NotebookWithCounts | null
  }
  trash: {
    isVisible: boolean
    position: { x: number; y: number }
  }
}

interface SidebarContextMenuManagerProps {
  contextMenuState: ContextMenuState
  onTagRemove: () => void
  onTagSettings: () => void
  onNotebookRename: () => void
  onNotebookDelete: () => void
  onEmptyTrash: () => void
  onCloseAll: () => void
}

/**
 * Manages all context menus for the sidebar
 */
const SidebarContextMenuManager: React.FC<SidebarContextMenuManagerProps> = ({
  contextMenuState,
  onTagRemove,
  onTagSettings,
  onNotebookRename,
  onNotebookDelete,
  onEmptyTrash,
  onCloseAll
}) => {
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      onCloseAll()
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onCloseAll])

  return (
    <>
      {/* Tag Context Menu */}
      <TagContextMenu
        isVisible={contextMenuState.tag.isVisible}
        position={contextMenuState.tag.position}
        tagName={contextMenuState.tag.tagName}
        onRemove={onTagRemove}
        onClose={onCloseAll}
        onTagSettings={onTagSettings}
      />

      {/* Notebook Context Menu */}
      <NotebookContextMenu
        isVisible={contextMenuState.notebook.isVisible}
        position={contextMenuState.notebook.position}
        notebookName={contextMenuState.notebook.notebook?.name || ''}
        onRename={onNotebookRename}
        onDelete={onNotebookDelete}
        onClose={onCloseAll}
      />

      {/* Trash Context Menu */}
      {contextMenuState.trash.isVisible && (
        <DropdownMenu
          isOpen={contextMenuState.trash.isVisible}
          position="fixed"
          width="min-w-32"
          style={{
            left: contextMenuState.trash.position.x,
            top: contextMenuState.trash.position.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={onEmptyTrash}
            icon={<Icons.Trash size={10} />}
            className="text-theme-accent-red hover:text-theme-accent-red"
          >
            Empty Trash
          </DropdownMenuItem>
        </DropdownMenu>
      )}
    </>
  )
}

export default SidebarContextMenuManager