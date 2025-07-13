import React from 'react'
import TagContextMenu from '../ui/TagContextMenu'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import CreateNotebookModal from '../ui/CreateNotebookModal'

interface ContextMenuState {
  show: boolean
  x: number
  y: number
  tagName?: string
  notebookId?: string
}

interface SidebarContextMenusProps {
  // Tag context menu
  tagContextMenu: ContextMenuState
  onCloseTagContextMenu: () => void
  onDeleteTag: (tagName: string) => void
  onShowTagSettings: (tagName: string) => void

  // Notebook context menu  
  notebookContextMenu: ContextMenuState
  onCloseNotebookContextMenu: () => void
  onEditNotebook: (notebookId: string) => void
  onDeleteNotebook: (notebookId: string) => void

  // Tag settings modal
  tagSettingsModal: { show: boolean; tagName: string }
  onCloseTagSettings: () => void

  // Create notebook modal
  createNotebookModal: boolean
  onCloseCreateNotebook: () => void
  onCreateNotebook: (name: string, parentId?: string) => void
}

const SidebarContextMenus: React.FC<SidebarContextMenusProps> = ({
  tagContextMenu,
  onCloseTagContextMenu,
  onDeleteTag,
  onShowTagSettings,
  notebookContextMenu,
  onCloseNotebookContextMenu,
  onEditNotebook,
  onDeleteNotebook,
  tagSettingsModal,
  onCloseTagSettings,
  createNotebookModal,
  onCloseCreateNotebook,
  onCreateNotebook
}) => {
  return (
    <>
      {/* Tag Context Menu */}
      {tagContextMenu.show && (
        <TagContextMenu
          show={tagContextMenu.show}
          x={tagContextMenu.x}
          y={tagContextMenu.y}
          tagName={tagContextMenu.tagName || ''}
          onClose={onCloseTagContextMenu}
          onDelete={onDeleteTag}
          onSettings={onShowTagSettings}
        />
      )}

      {/* Notebook Context Menu */}
      {notebookContextMenu.show && (
        <NotebookContextMenu
          show={notebookContextMenu.show}
          x={notebookContextMenu.x}
          y={notebookContextMenu.y}
          notebookId={notebookContextMenu.notebookId || ''}
          onClose={onCloseNotebookContextMenu}
          onEdit={onEditNotebook}
          onDelete={onDeleteNotebook}
        />
      )}

      {/* Tag Settings Modal */}
      {tagSettingsModal.show && (
        <TagSettingsModal
          show={tagSettingsModal.show}
          tagName={tagSettingsModal.tagName}
          onClose={onCloseTagSettings}
        />
      )}

      {/* Create Notebook Modal */}
      {createNotebookModal && (
        <CreateNotebookModal
          show={createNotebookModal}
          onClose={onCloseCreateNotebook}
          onCreate={onCreateNotebook}
        />
      )}
    </>
  )
}

export default SidebarContextMenus