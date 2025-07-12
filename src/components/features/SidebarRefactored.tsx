// Refactored Sidebar component - Clean modular version
import React, { memo, useState } from 'react'
import { useSidebarLogic } from '../../hooks/useSidebarLogic'
import { useNoteActions } from '../../hooks/useNoteActions'
import { useAppStore } from '../../stores/newSimpleStore'
import { THEME_CLASSES } from '../../theme/themeConstants'

// Modular sidebar components
import SidebarHeader from './sidebar/SidebarHeader'
import MainNavigationSection from './sidebar/MainNavigationSection'
import NotebooksSection from './sidebar/NotebooksSection'
import StatusSection from './sidebar/StatusSection'
import TagsSection from './sidebar/TagsSection'
import SystemSection from './sidebar/SystemSection'

// Context menus and modals
import TagContextMenu from '../ui/TagContextMenu'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import CreateNotebookModal from '../ui/CreateNotebookModal'

interface ContextMenuState {
  isVisible: boolean
  position: { x: number; y: number }
  tagName: string
}

const SidebarRefactored: React.FC = memo(() => {
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
    ...notebookActions
  } = useSidebarLogic()

  const { createNewNote } = useNoteActions()
  const { setModal } = useAppStore()

  // Context menu state
  const [tagContextMenu, setTagContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: ''
  })

  const [notebookContextMenu, setNotebookContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebookId: '',
    notebookName: ''
  })

  // Handlers for context menus
  const handleTagContextMenu = (e: React.MouseEvent, tagName: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setTagContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      tagName
    })
  }

  const handleNotebookContextMenu = (e: React.MouseEvent, notebookId: string, notebookName: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setNotebookContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      notebookId,
      notebookName
    })
  }

  const closeContextMenus = () => {
    setTagContextMenu(prev => ({ ...prev, isVisible: false }))
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false }))
  }

  // Modal handlers
  const handleOpenTagSettings = () => {
    setModal('tagModal', true)
    closeContextMenus()
  }

  const handleOpenNotebookManager = () => {
    setModal('notebookManager', true)
    closeContextMenus()
  }

  return (
    <div className={`w-64 ${THEME_CLASSES.BG.SECONDARY} border-r ${THEME_CLASSES.BORDER.PRIMARY} flex flex-col h-full overflow-hidden`}>
      {/* Header */}
      <SidebarHeader 
        onNewNote={createNewNote}
        onSettingsClick={handleSettingsClick} 
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-4 p-2">
          {/* Main Navigation */}
          <MainNavigationSection
            sections={mainSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />

          {/* Notebooks Section */}
          <NotebooksSection
            notebooks={notebooksWithCounts}
            activeSection={activeSection}
            expandedSections={expandedSections}
            onSectionClick={handleSectionClick}
            onToggleSection={handleToggleSection}
            onContextMenu={handleNotebookContextMenu}
            notebookActions={notebookActions}
          />

          {/* Status Section */}
          <StatusSection
            sections={statusSections}
            activeSection={activeSection}
            expandedSections={expandedSections}
            onSectionClick={handleSectionClick}
            onToggleSection={handleToggleSection}
          />

          {/* Tags Section */}
          <TagsSection
            tags={tagsWithCounts}
            activeSection={activeSection}
            expandedSections={expandedSections}
            onSectionClick={handleSectionClick}
            onToggleSection={handleToggleSection}
            onContextMenu={handleTagContextMenu}
          />

          {/* System Section */}
          <SystemSection
            sections={systemSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </div>
      </div>

      {/* Context Menus */}
      {tagContextMenu.isVisible && (
        <TagContextMenu
          isVisible={tagContextMenu.isVisible}
          position={tagContextMenu.position}
          tagName={tagContextMenu.tagName}
          onClose={closeContextMenus}
          onEditTag={handleOpenTagSettings}
        />
      )}

      {notebookContextMenu.isVisible && (
        <NotebookContextMenu
          isVisible={notebookContextMenu.isVisible}
          position={notebookContextMenu.position}
          notebookId={notebookContextMenu.notebookId}
          notebookName={notebookContextMenu.notebookName}
          onClose={closeContextMenus}
          onEdit={handleOpenNotebookManager}
          onCreate={() => setModal('notebookManager', true)}
          onDelete={(id) => {
            notebookActions.delete(id)
            closeContextMenus()
          }}
        />
      )}

      {/* Modals */}
      <TagSettingsModal />
      <CreateNotebookModal />
    </div>
  )
})

SidebarRefactored.displayName = 'SidebarRefactored'

export default SidebarRefactored