import React from 'react'
import { useSidebarContext } from './SidebarLogicProvider'
import { useSidebarState } from '../../hooks/useSidebarState'
import { useAppStore } from '../../stores/newSimpleStore'
import { Icons } from '../Icons'
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
    handleSettingsClick,
    createNewNote,
    setModal,
    getTagColor,
    updateNotebook,
    createNotebook,
    deleteNotebook,
    handleEmptyTrash
  } = useSidebarContext()
  
  const { showSuccess, showError, removeTagFromAllNotes, renameTagInAllNotes } = useAppStore()

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
      <SettingsButton onClick={handleSettingsClick} />
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Main Navigation Sections */}
        <SidebarSection>
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
        icon={<Icons.FileChartLine size={16} />}
        titleActions={
          <IconButton
            icon={Icons.Plus}
            size={14}
            onClick={createNewNote}
            title="Create new note"
            variant="ghost"
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
        icon={<Icons.Book size={16} />}
        titleActions={
          <IconButton
            icon={Icons.Plus}
            size={14}
            onClick={() => setCreateNotebookModal(true)}
            title="Create new notebook"
            variant="ghost"
          />
        }
      >
        <NotebookTree
          notebooks={notebooksWithCounts}
          activeSection={activeSection}
          expandedNotebooks={expandedNotebooks}
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
        icon={<Icons.Tag size={16} />}
        titleActions={
          <IconButton
            icon={Icons.Plus}
            size={14}
            onClick={() => setModal('tagModal', true)}
            title="Create new tag"
            variant="ghost"
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
      <SidebarSection>
        <MainSections
          sections={systemSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onTrashRightClick={handleTrashRightClick}
        />
      </SidebarSection>
      
        {/* Footer/Bottom spacer */}
        <div className="flex-1" />
      </div>

      {/* Context Menu Manager */}
      <SidebarContextMenuManager
        contextMenuState={{
          tag: tagContextMenu,
          notebook: notebookContextMenu,
          trash: trashContextMenu
        }}
        onCloseAll={closeAllContextMenus}
        onTagRemove={() => {
          if (tagContextMenu.tagName) {
            const confirmMessage = `Are you sure you want to remove the tag "${tagContextMenu.tagName}" from all notes?`
            
            if (window.confirm(confirmMessage)) {
              removeTagFromAllNotes(tagContextMenu.tagName)
              // Success notification is handled by the store function
            }
          }
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
          if (notebookContextMenu.notebook) {
            const notebookName = notebookContextMenu.notebook.name
            const hasNotes = notebookContextMenu.notebook.count > 0
            
            // Confirm deletion
            const confirmMessage = hasNotes 
              ? `Are you sure you want to delete "${notebookName}" and move all its notes to the trash?`
              : `Are you sure you want to delete "${notebookName}"?`
            
            if (window.confirm(confirmMessage)) {
              const success = deleteNotebook(notebookContextMenu.notebook.id)
              if (success) {
                // Show success toast
                showSuccess(`Notebook "${notebookName}" deleted successfully`)
              } else {
                // Show error toast
                showError('Cannot delete the last root notebook')
              }
            }
            closeAllContextMenus()
          }
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
          if (tagSettingsModal.tagName && newName && tagSettingsModal.tagName !== newName) {
            renameTagInAllNotes(tagSettingsModal.tagName, newName)
            showSuccess(`Tag renamed from "${tagSettingsModal.tagName}" to "${newName}" in all notes`)
          }
        }}
        createNotebookModal={createNotebookModal}
        onCreateNotebookClose={() => setCreateNotebookModal(false)}
        onCreateNotebook={(name: string, color: string, parentId?: string | null) => {
          console.log('📝 SidebarContent: Creating notebook with data:', { name, color, parentId })
          const result = createNotebook({ name, color, parentId })
          console.log('📝 SidebarContent: Create notebook result:', result)
          
          if (result === null) {
            console.error('❌ Failed to create notebook - validation failed')
          } else {
            console.log('✅ Notebook created successfully:', result.name)
          }
          
          setCreateNotebookModal(false)
        }}
        existingNotebookNames={notebooksWithCounts.map(n => n.name)}
        availableParents={notebooksWithCounts}
      />

    </SidebarContainer>
  )
}

export default SidebarContent