/**
 * SidebarSimple - Refactored into smaller components
 * Main sidebar component that orchestrates all sections
 */

import React, { memo, useState } from 'react'
import { useSidebarLogic } from '../../hooks/useSimpleLogic'
import { useNoteActions } from '../../hooks/useSimpleLogic'
import { useSimpleStore } from '../../stores/simpleStore'
import Icons from '../Icons'
import TagContextMenu from '../ui/TagContextMenu'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import CreateNotebookModal from '../ui/CreateNotebookModal'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'
import { getCustomTagColor } from '../../utils/customTagColors'

// Import extracted components
import {
  SidebarHeader,
  MainNavigationSection,
  StatusSection,
  NotebooksSection,
  TagsSection,
  SystemSection
} from './sidebar'

const SidebarSimple: React.FC = memo(() => {
  // Main logic hooks
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

  const { createNewNote, handleEmptyTrash, handleRemoveTag } = useNoteActions()
  const { tagColors, setModal, updateNote } = useSimpleStore()

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false
  })

  // Trash context menu state
  const [trashContextMenu, setTrashContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  })

  // Tag settings modal state
  const [tagSettingsModal, setTagSettingsModal] = useState({
    show: false,
    tagName: ''
  })

  // Notebook context menu state
  const [notebookContextMenu, setNotebookContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null as any
  })

  // Notebook editing state
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Create notebook modal state
  const [createNotebookModal, setCreateNotebookModal] = useState(false)
  
  // Notebook expansion state
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())

  // Context menu handlers
  const handleTagRightClick = (e: React.MouseEvent, tagName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      tagName,
      showColorPicker: false
    })
  }

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false, showColorPicker: false }))
  }

  const closeTrashContextMenu = () => {
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }

  const handleTagSettings = () => {
    if (contextMenu.tagName !== 'Tags') {
      setTagSettingsModal({ show: true, tagName: contextMenu.tagName })
    }
    closeContextMenu()
  }

  const handleTagNameChange = (oldName: string, newName: string) => {
    console.log('Tag name change:', oldName, '->', newName)
  }

  // Notebook handlers
  const handleNotebookRightClick = (e: React.MouseEvent, notebook: any) => {
    e.preventDefault()
    e.stopPropagation()
    setNotebookContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      notebook
    })
  }

  const closeNotebookContextMenu = () => {
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false, notebook: null }))
  }

  const handleNotebookEdit = (notebook: any) => {
    setEditingNotebook(notebook.id)
    setEditValue(notebook.name)
    closeNotebookContextMenu()
  }

  const handleNotebookDelete = (notebook: any) => {
    if (window.confirm(`Are you sure you want to delete "${notebook.name}"?`)) {
      deleteNotebook(notebook.id)
    }
    closeNotebookContextMenu()
  }

  const handleToggleNotebookExpansion = (notebookId: string) => {
    setExpandedNotebooks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notebookId)) {
        newSet.delete(notebookId)
      } else {
        newSet.add(notebookId)
      }
      return newSet
    })
  }

  const handleStartEditing = (notebookId: string, currentName: string) => {
    setEditingNotebook(notebookId)
    setEditValue(currentName)
  }

  const handleSaveEdit = (notebookId: string) => {
    if (editValue.trim() && editValue !== notebooksWithCounts.find(nb => nb.id === notebookId)?.name) {
      updateNotebook(notebookId, editValue.trim())
    }
    setEditingNotebook(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingNotebook(null)
    setEditValue('')
  }

  // Trash handlers
  const handleTrashRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTrashContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const handleEmptyTrashClick = () => {
    const trashedCount = notes.filter(note => note.isTrashed).length
    if (trashedCount === 0) {
      return
    }
    
    if (window.confirm(`Are you sure you want to permanently delete all ${trashedCount} item(s) in trash? This action cannot be undone.`)) {
      handleEmptyTrash()
    }
    closeTrashContextMenu()
  }

  // Tag color helper
  const getTagColor = (tag: string) => {
    const color = getCustomTagColor(tag, tagColors[tag])
    return {
      bg: color.bg,
      border: color.border,
      text: color.text
    }
  }

  // Icon renderer helper
  const renderIcon = (iconName: string, size: number = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons]
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <div className="sidebar-modern h-full flex flex-col bg-theme-bg-primary border-r border-theme-border-primary">
      {/* Header */}
      <SidebarHeader onSettingsClick={handleSettingsClick} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 py-3">
          {/* Main Navigation */}
          <MainNavigationSection
            sections={mainSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            renderIcon={renderIcon}
          />

          {/* Status Section */}
          <StatusSection
            sections={statusSections}
            isExpanded={expandedSections.status}
            activeSection={activeSection}
            onToggleExpansion={() => handleToggleSection('status')}
            onSectionClick={handleSectionClick}
            renderIcon={renderIcon}
          />

          {/* Notebooks Section */}
          <NotebooksSection
            notebooks={notebooksWithCounts}
            isExpanded={expandedSections.notebooks}
            activeSection={activeSection}
            expandedNotebooks={expandedNotebooks}
            editingNotebook={editingNotebook}
            editValue={editValue}
            onToggleExpansion={() => handleToggleSection('notebooks')}
            onSectionClick={handleSectionClick}
            onCreateNotebook={() => setCreateNotebookModal(true)}
            onToggleNotebookExpansion={handleToggleNotebookExpansion}
            onNotebookRightClick={handleNotebookRightClick}
            onStartEditing={handleStartEditing}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditValueChange={setEditValue}
            getColorClass={getColorClass}
            getNotebookChildren={getNotebookChildren}
            renderIcon={renderIcon}
          />

          {/* Tags Section */}
          <TagsSection
            tags={tagsWithCounts}
            isExpanded={expandedSections.tags}
            activeSection={activeSection}
            tagColors={tagColors}
            onToggleExpansion={() => handleToggleSection('tags')}
            onSectionClick={handleSectionClick}
            onTagRightClick={handleTagRightClick}
            getTagColor={getTagColor}
            renderIcon={renderIcon}
          />

          {/* System Section */}
          <SystemSection
            sections={systemSections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            onTrashRightClick={handleTrashRightClick}
            renderIcon={renderIcon}
          />
        </div>
      </div>

      {/* Context Menus and Modals */}
      <TagContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        tagName={contextMenu.tagName}
        onRemove={() => {
          if (window.confirm(`Are you sure you want to remove the tag "${contextMenu.tagName}" from all notes?`)) {
            handleRemoveTag(contextMenu.tagName)
          }
          closeContextMenu()
        }}
        onClose={closeContextMenu}
        onTagSettings={handleTagSettings}
      />

      <TagSettingsModal
        isOpen={tagSettingsModal.show}
        onClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />

      <NotebookContextMenu
        isVisible={notebookContextMenu.isVisible}
        position={notebookContextMenu.position}
        notebook={notebookContextMenu.notebook}
        onEdit={() => handleNotebookEdit(notebookContextMenu.notebook)}
        onDelete={() => handleNotebookDelete(notebookContextMenu.notebook)}
        onClose={closeNotebookContextMenu}
      />

      <CreateNotebookModal
        isOpen={createNotebookModal}
        onClose={() => setCreateNotebookModal(false)}
        onCreate={(name, color, parentId) => {
          createNotebook(name, color, parentId)
          setCreateNotebookModal(false)
        }}
        existingNames={notebooksWithCounts.map(nb => nb.name)}
        availableParents={notebooksWithCounts}
      />

      {/* Trash Context Menu */}
      <DropdownMenu
        isOpen={trashContextMenu.isVisible}
        position={trashContextMenu.position}
        onClose={closeTrashContextMenu}
      >
        <DropdownMenuItem
          onClick={handleEmptyTrashClick}
          icon={<Icons.Trash size={14} />}
          className="text-theme-accent-red"
        >
          Empty Trash
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
})

SidebarSimple.displayName = 'SidebarSimple'

export default SidebarSimple
