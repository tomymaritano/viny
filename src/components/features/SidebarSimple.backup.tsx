// Refactored Sidebar component with improved modularity
import React, { memo, useMemo, useCallback } from 'react'
import { useSidebarLogic } from '../../hooks/useSidebarLogic'
import { useSidebarState } from '../../hooks/useSidebarState'
import { useNoteActions } from '../../hooks/useNoteActions'
import { useAppStore } from '../../stores/newSimpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'

// Import modular sidebar components
import SidebarContainer from '../sidebar/SidebarContainer'
import SettingsButton from '../sidebar/SettingsButton'
import SidebarSection from '../sidebar/SidebarSection'
import MainSections from '../sidebar/MainSections'
import NotebookTree from '../sidebar/NotebookTree'
import TagsList from '../sidebar/TagsList'
import SidebarModals from '../sidebar/SidebarModals'
import SidebarContextMenuManager, { ContextMenuState } from '../sidebar/SidebarContextMenuManager'

// Import types
import { noteLogger as logger } from '../../utils/logger'

const SidebarSimple: React.FC = memo(() => {
  // Logic hooks
  const {
    activeSection,
    expandedSections,
    notes,
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    tagsWithCounts,
    getColorClass,
    handleSectionClick,
    handleToggleSection,
    handleSettingsClick,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    getRootNotebooks,
    getNotebookChildren
  } = useSidebarLogic()

  const { createNewNote, handleEmptyTrash } = useNoteActions()
  const { setModal, updateNote, getTagColor } = useAppStore()

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

  // Handlers
  const handleTagsHeaderRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Don't show context menu for Tags header
  }, [])

  const handleTagSettings = useCallback(() => {
    // Don't allow settings for "Tags" header
    if (tagContextMenu.tagName !== 'Tags') {
      setTagSettingsModal({ show: true, tagName: tagContextMenu.tagName })
    }
    closeAllContextMenus()
  }, [tagContextMenu.tagName, setTagSettingsModal, closeAllContextMenus])

  const handleTagNameChange = useCallback((oldName: string, newName: string) => {
    logger.info('Tag name change requested', { oldName, newName })
    // Implementation would go here
  }, [])

  const handleCreateNotebook = useCallback(() => {
    setCreateNotebookModal(true)
  }, [setCreateNotebookModal])

  const handleCreateNotebookSubmit = useCallback((name: string, color: string, parentId?: string | null) => {
    const result = createNotebook({ name, color, parentId })
    if (result) {
      setCreateNotebookModal(false)
    }
  }, [createNotebook, setCreateNotebookModal])

  const handleRenameNotebook = useCallback(() => {
    if (notebookContextMenu.notebook) {
      startEditingNotebook(notebookContextMenu.notebook.id, notebookContextMenu.notebook.name)
    }
    closeAllContextMenus()
  }, [notebookContextMenu.notebook, startEditingNotebook, closeAllContextMenus])

  const handleDeleteNotebook = useCallback(() => {
    if (notebookContextMenu.notebook) {
      const notesInNotebook = notes.filter(note => note.notebook === notebookContextMenu.notebook?.name)
      
      if (notesInNotebook.length > 0) {
        const confirmDelete = window.confirm(
          `This notebook contains ${notesInNotebook.length} notes. ` +
          `Deleting it will move all notes to the default notebook. Continue?`
        )
        
        if (!confirmDelete) {
          closeAllContextMenus()
          return
        }
        
        notesInNotebook.forEach(note => {
          updateNote({ ...note, notebook: 'personal' })
        })
      }
      
      const success = deleteNotebook(notebookContextMenu.notebook.id)
      if (success && activeSection === `notebook-${notebookContextMenu.notebook.name.toLowerCase()}`) {
        handleSectionClick('all')
      }
    }
    closeAllContextMenus()
  }, [notebookContextMenu.notebook, notes, deleteNotebook, activeSection, handleSectionClick, updateNote, closeAllContextMenus])

  const handleSaveNotebookName = useCallback((notebookId: string) => {
    const notebook = notebooksWithCounts.find(n => n.id === notebookId)
    if (editValue.trim() && editValue !== notebook?.name) {
      const oldName = notebook?.name
      const newName = editValue.trim()
      
      updateNotebook(notebookId, { name: newName })
      
      if (oldName) {
        notes.forEach(note => {
          if (note.notebook === oldName) {
            updateNote({ ...note, notebook: newName })
          }
        })
      }
    }
    cancelEditingNotebook()
  }, [notebooksWithCounts, editValue, updateNotebook, notes, updateNote, cancelEditingNotebook])

  const handleEmptyTrashClick = useCallback(() => {
    if (window.confirm('Are you sure you want to permanently delete all notes in trash? This action cannot be undone.')) {
      handleEmptyTrash()
    }
    closeAllContextMenus()
  }, [handleEmptyTrash, closeAllContextMenus])

  const handleRemoveTag = useCallback(() => {
    // Implement tag removal
    closeAllContextMenus()
  }, [closeAllContextMenus])

  const handleFilterByTag = useCallback(() => {
    handleSectionClick(`tag-${tagContextMenu.tagName.toLowerCase()}`)
    closeAllContextMenus()
  }, [tagContextMenu.tagName, handleSectionClick, closeAllContextMenus])

  // Memoize tag colors
  const getTagColorMemo = useMemo(() => {
    return (tag: string) => {
      const color = getTagColor(tag)
      return {
        bg: `bg-${color}-100`,
        border: `border-${color}-300`
      }
    }
  }, [getTagColor])

  const renderIcon = useCallback((iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }, [])

  // Prepare context menu state
  const contextMenuState: ContextMenuState = {
    tag: tagContextMenu,
    notebook: notebookContextMenu,
    trash: trashContextMenu
  }

  // Enhanced sections with right-click handlers
  const systemSectionsWithHandlers = useMemo(() => {
    return systemSections.map(s => ({
      key: s.id,
      label: s.label,
      icon: s.icon,
      count: s.count,
      onRightClick: s.id === 'trash' ? handleTrashRightClick : undefined
    }))
  }, [systemSections, handleTrashRightClick])

  return (
    <>
      <SidebarContainer onContextMenuClose={closeAllContextMenus}>
        <SettingsButton onClick={handleSettingsClick} />

        {/* Main Sections */}
        <section className="space-y-0">
          <MainSections
            sections={mainSections.map(s => ({ key: s.id, label: s.label, icon: s.icon, count: s.count }))}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </section>

        {/* Status Section */}
        <SidebarSection
          title="Status"
          isExpanded={expandedSections.status}
          onToggle={() => handleToggleSection('status')}
          icon={renderIcon('FileChartLine', 16)}
        >
          <MainSections
            sections={statusSections.map(s => ({ key: s.id, label: s.label, icon: s.icon, count: s.count }))}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </SidebarSection>

        {/* Notebooks Section */}
        <SidebarSection
          title="Notebooks"
          isExpanded={expandedSections.notebooks}
          onToggle={() => handleToggleSection('notebooks')}
          icon={renderIcon('Book', 16)}
          actions={
            <IconButton
              icon={Icons.Plus}
              onClick={handleCreateNotebook}
              title="New Category"
              size={14}
              variant="default"
              className="text-theme-text-muted hover:text-theme-text-tertiary"
            />
          }
        >
          {notebooksWithCounts.length > 0 ? (
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
              onSaveNotebookName={handleSaveNotebookName}
              onCancelEdit={cancelEditingNotebook}
            />
          ) : (
            <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
              No notebooks yet
            </div>
          )}
        </SidebarSection>

        {/* Tags Section */}
        <SidebarSection
          title="Tags"
          isExpanded={expandedSections.tags}
          onToggle={() => handleToggleSection('tags')}
          onHeaderRightClick={handleTagsHeaderRightClick}
          icon={renderIcon('Tag', 16)}
        >
          {tagsWithCounts.length > 0 ? (
            <TagsList
              tags={tagsWithCounts}
              activeSection={activeSection}
              getTagColor={getTagColorMemo}
              onSectionClick={handleSectionClick}
              onTagRightClick={handleTagRightClick}
            />
          ) : (
            <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
              No tags yet
            </div>
          )}
        </SidebarSection>

        {/* System Sections */}
        <section className="space-y-0">
          <MainSections
            sections={systemSectionsWithHandlers}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            onTrashRightClick={handleTrashRightClick}
          />
        </section>

        {/* Footer/Bottom spacer */}
        <div className="flex-1" />
      </SidebarContainer>

      {/* Context Menus */}
      <SidebarContextMenuManager
        contextMenuState={contextMenuState}
        onTagRemove={handleRemoveTag}
        onTagSettings={handleTagSettings}
        onNotebookRename={handleRenameNotebook}
        onNotebookDelete={handleDeleteNotebook}
        onEmptyTrash={handleEmptyTrashClick}
        onCloseAll={closeAllContextMenus}
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
})

SidebarSimple.displayName = 'SidebarSimple'

export default SidebarSimple