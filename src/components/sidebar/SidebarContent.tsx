import React from 'react'
import { useSidebarContext } from './SidebarLogicProvider'
import { useSidebarState } from '../../hooks/useSidebarState'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import SidebarSection from './SidebarSection'
import MainSections from './MainSections'
import NotebookTree from './NotebookTree'
import TagsList from './TagsList'
import SidebarModals from './SidebarModals'
import SidebarContextMenuManager from './SidebarContextMenuManager'

const SidebarContent: React.FC = () => {
  const {
    activeSection,
    expandedSections,
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    tagsWithCounts,
    handleSectionClick,
    handleToggleSection,
    createNewNote,
    setModal,
    updateNote,
    getTagColor
  } = useSidebarContext()

  // State management hook
  const {
    contextMenu,
    tagSettingsModal,
    createNotebookModal,
    handleContextMenuRequest,
    handleCloseContextMenu,
    setTagSettingsModal,
    setCreateNotebookModal,
    handleTagNameChange,
    handleCreateNotebookSubmit
  } = useSidebarState()

  return (
    <>
      {/* Main Navigation Sections */}
      <SidebarSection isExpanded={true}>
        <MainSections
          sections={mainSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </SidebarSection>

      {/* Status Sections */}
      <SidebarSection
        title="Status"
        isExpanded={expandedSections.status}
        onToggle={() => handleToggleSection('status')}
        titleActions={
          <IconButton
            icon={Icons.Plus}
            size="sm"
            variant="ghost"
            onClick={createNewNote}
            title="Create new note"
          />
        }
      >
        <MainSections
          sections={statusSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </SidebarSection>

      {/* Notebooks Section */}
      <SidebarSection
        title="Notebooks"
        isExpanded={expandedSections.notebooks}
        onToggle={() => handleToggleSection('notebooks')}
        titleActions={
          <IconButton
            icon={Icons.Plus}
            size="sm"
            variant="ghost"
            onClick={() => setCreateNotebookModal(true)}
            title="Create new notebook"
          />
        }
      >
        <NotebookTree
          notebooks={notebooksWithCounts}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onContextMenu={handleContextMenuRequest}
        />
      </SidebarSection>

      {/* Tags Section */}
      <SidebarSection
        title="Tags"
        isExpanded={expandedSections.tags}
        onToggle={() => handleToggleSection('tags')}
        titleActions={
          <IconButton
            icon={Icons.Hash}
            size="sm"
            variant="ghost"
            onClick={() => setModal('tagModal', true)}
            title="Manage tags"
          />
        }
      >
        <TagsList
          tags={tagsWithCounts}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onContextMenu={handleContextMenuRequest}
          getTagColor={getTagColor}
        />
      </SidebarSection>

      {/* System Sections */}
      <SidebarSection isExpanded={true}>
        <MainSections
          sections={systemSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </SidebarSection>

      {/* Context Menu Manager */}
      <SidebarContextMenuManager
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        onTagSettingsOpen={setTagSettingsModal}
        updateNote={updateNote}
      />

      {/* Modals */}
      <SidebarModals
        tagSettingsModal={tagSettingsModal}
        onTagSettingsClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        onTagNameChange={handleTagNameChange}
        createNotebookModal={createNotebookModal}
        onCreateNotebookClose={() => setCreateNotebookModal(false)}
        onCreateNotebook={handleCreateNotebookSubmit}
        existingNotebookNames={notebooksWithCounts.map(n => n.name)}
        availableParents={notebooksWithCounts}
      />
    </>
  )
}

export default SidebarContent