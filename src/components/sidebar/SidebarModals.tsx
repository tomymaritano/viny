import React from 'react'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import CreateNotebookModal from '../ui/CreateNotebookModal'
import type { NotebookWithCounts } from '../../types/notebook'

interface SidebarModalsProps {
  // Tag settings modal
  tagSettingsModal: { show: boolean; tagName: string }
  onTagSettingsClose: () => void
  onTagNameChange: (oldName: string, newName: string) => void

  // Create notebook modal
  createNotebookModal: boolean
  onCreateNotebookClose: () => void
  onCreateNotebook: (
    name: string,
    color: string,
    parentId?: string | null
  ) => void
  existingNotebookNames: string[]
  availableParents: NotebookWithCounts[]
  defaultParentId?: string | null
}

/**
 * Container for all sidebar-related modals
 */
const SidebarModals: React.FC<SidebarModalsProps> = ({
  tagSettingsModal,
  onTagSettingsClose,
  onTagNameChange,
  createNotebookModal,
  onCreateNotebookClose,
  onCreateNotebook,
  existingNotebookNames,
  availableParents,
  defaultParentId,
}) => {
  return (
    <>
      {/* Tag Settings Modal */}
      <TagSettingsModal
        isOpen={tagSettingsModal.show}
        onClose={onTagSettingsClose}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={onTagNameChange}
      />

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={createNotebookModal}
        onClose={onCreateNotebookClose}
        onCreate={onCreateNotebook}
        existingNames={existingNotebookNames}
        availableParents={availableParents}
        maxLevel={3}
        defaultParentId={defaultParentId}
      />
    </>
  )
}

export default SidebarModals
