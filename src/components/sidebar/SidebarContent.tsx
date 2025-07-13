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
import SidebarContainer from './SidebarContainer'
import SettingsButton from './SettingsButton'

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
    getTagColor,
    getColorClass,
    updateNotebook,
    handleEmptyTrash
  } = useSidebarContext()

  // State management hook
  const {
    tagContextMenu,
    notebookContextMenu,
    trashContextMenu,
    tagSettingsModal,
    createNotebookModal,
    editingNotebook,
    editValue,
    expandedNotebooks,
    setTagSettingsModal,
    setCreateNotebookModal,
    setEditValue,
    handleTagRightClick,
    handleNotebookRightClick,
    handleTrashRightClick,
    closeAllContextMenus,
    toggleNotebookExpansion,
    startEditingNotebook,
    cancelEditingNotebook
  } = useSidebarState()

  return (
    <SidebarContainer onContextMenuClose={closeAllContextMenus}>
      {/* Settings button at top */}
      <SettingsButton onClick={() => setModal('settings', true)} />
      
      {/* Main Navigation Sections */}
      <section className="space-y-0">
        <MainSections
          sections={mainSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </section>

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
          expandedNotebooks={expandedNotebooks}
          getColorClass={getColorClass}
          onSectionClick={handleSectionClick}
          onNotebookRightClick={handleNotebookRightClick}
          onToggleExpansion={toggleNotebookExpansion}
          editingNotebook={editingNotebook}
          editValue={editValue}
          onEditValueChange={setEditValue}
          onSaveNotebookName={(notebookId: string) => {
            if (editValue.trim()) {
              updateNotebook(notebookId, { name: editValue.trim() })
              cancelEditingNotebook()
            }
          }}
          onCancelEdit={cancelEditingNotebook}
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
          onContextMenu={handleTagRightClick}
          getTagColor={getTagColor}
        />
      </SidebarSection>

      {/* System Sections */}
      <section className="space-y-0">
        <MainSections
          sections={systemSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onTrashRightClick={handleTrashRightClick}
        />
      </section>
      
      {/* Footer/Bottom spacer */}
      <div className="flex-1" />

      {/* Context Menu Manager */}
      <SidebarContextMenuManager
        contextMenuState={{
          tag: tagContextMenu,
          notebook: notebookContextMenu,
          trash: trashContextMenu
        }}
        onCloseAll={closeAllContextMenus}
        onTagRemove={() => {
          // TODO: Implement tag removal
          closeAllContextMenus()
        }}
        onTagSettings={() => {
          setTagSettingsModal({ show: true, tagName: tagContextMenu.tagName })
          closeAllContextMenus()
        }}
        onNotebookRename={() => {
          if (notebookContextMenu.notebook) {
            startEditingNotebook(notebookContextMenu.notebook.id, notebookContextMenu.notebook.name)
            closeAllContextMenus()
          }
        }}
        onNotebookDelete={() => {
          // TODO: Implement notebook deletion
          closeAllContextMenus()
        }}
        onEmptyTrash={() => {
          handleEmptyTrash()
          closeAllContextMenus()
        }}
      />

      {/* Modals */}
      <SidebarModals
        tagSettingsModal={tagSettingsModal}
        onTagSettingsClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        onTagNameChange={(newName: string) => {
          // TODO: Implement tag name change
          updateNote(tagSettingsModal.tagName, { tags: [newName] })
        }}
        createNotebookModal={createNotebookModal}
        onCreateNotebookClose={() => setCreateNotebookModal(false)}
        onCreateNotebook={(name: string, parentId?: string) => {
          // TODO: Implement notebook creation
          setCreateNotebookModal(false)
        }}
        existingNotebookNames={notebooksWithCounts.map(n => n.name)}
        availableParents={notebooksWithCounts}
      />

    </SidebarContainer>
  )
}

export default SidebarContent