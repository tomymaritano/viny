// Refactored Sidebar component using modular subcomponents
import React, { memo, useState, useEffect, useMemo } from 'react'
import { useSidebarLogic } from '../../hooks/useSidebarLogic'
import { useNoteActions } from '../../hooks/useNoteActions'
import { useAppStore } from '../../stores/newSimpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import TagContextMenu from '../ui/TagContextMenu'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import CreateNotebookModal from '../ui/CreateNotebookModal'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'
import { getCustomTagColor } from '../../utils/customTagColors'

// Import modular sidebar components
import SidebarSection from '../sidebar/SidebarSection'
import MainSections from '../sidebar/MainSections'
import NotebookTree from '../sidebar/NotebookTree'
import TagsList from '../sidebar/TagsList'

// Import types
import { NotebookWithCounts } from '../../types/notebook'
import { noteLogger as logger } from '../../utils/logger'

const SidebarSimple: React.FC = memo(() => {
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
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '' })
  
  
  // Notebook context menu state
  const [notebookContextMenu, setNotebookContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null as NotebookWithCounts | null
  })
  
  // Editing notebook state
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  
  // Create notebook modal state
  const [createNotebookModal, setCreateNotebookModal] = useState(false)
  
  // Notebook expansion state
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())
  
  
  // Simplified sidebar without workspace view complexity
  
  // Tag modal is now managed by ModalContext

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

  const handleTagsHeaderRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Don't show context menu for Tags header
  }

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false, showColorPicker: false }))
  }

  const closeTrashContextMenu = () => {
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }

  const handleTagSettings = () => {
    // Don't allow settings for "Tags" header
    if (contextMenu.tagName !== 'Tags') {
      setTagSettingsModal({ show: true, tagName: contextMenu.tagName })
    }
    closeContextMenu()
  }

  const handleTagNameChange = (oldName: string, newName: string) => {
    // This would need to be implemented based on how tags are managed in the store
    // For now, we'll just close the modal
    logger.info('Tag name change requested', { oldName, newName })
  }

  const handleCreateNotebook = () => {
    setCreateNotebookModal(true)
  }

  const handleCreateNotebookSubmit = (name: string, color: string, parentId?: string | null) => {
    createNotebook({
      name,
      color,
      parentId
    })
    // Don't navigate to the new notebook, just create it
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

  // Notebook context menu handlers
  const handleNotebookRightClick = (e: React.MouseEvent, notebook: NotebookWithCounts) => {
    e.preventDefault()
    e.stopPropagation()
    setNotebookContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      notebook
    })
  }

  const closeNotebookContextMenu = () => {
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false }))
  }

  const handleRenameNotebook = () => {
    if (notebookContextMenu.notebook) {
      setEditingNotebook(notebookContextMenu.notebook.id)
      setEditValue(notebookContextMenu.notebook.name)
    }
    closeNotebookContextMenu()
  }

  const handleDeleteNotebook = () => {
    if (notebookContextMenu.notebook) {
      // Check if there are notes in this notebook
      const { notes } = useAppStore.getState()
      const notesInNotebook = notes.filter(note => note.notebook === notebookContextMenu.notebook?.name)
      
      if (notesInNotebook.length > 0) {
        // Show warning or move notes to another notebook
        const confirmDelete = window.confirm(
          `This notebook contains ${notesInNotebook.length} notes. ` +
          `Deleting it will move all notes to the default notebook. Continue?`
        )
        
        if (!confirmDelete) {
          closeNotebookContextMenu()
          return
        }
        
        // Move notes to default notebook
        notesInNotebook.forEach(note => {
          updateNote({ ...note, notebook: 'personal' })
        })
      }
      
      const success = deleteNotebook(notebookContextMenu.notebook.id)
      if (success) {
        // If the deleted notebook was active, switch to another one
        if (activeSection === `notebook-${notebookContextMenu.notebook.name.toLowerCase()}`) {
          handleSectionClick('all')
        }
      }
    }
    closeNotebookContextMenu()
  }

  const handleSaveNotebookName = (notebookId: string) => {
    const notebook = notebooksWithCounts.find(n => n.id === notebookId)
    if (editValue.trim() && editValue !== notebook?.name) {
      const oldName = notebook?.name
      const newName = editValue.trim()
      
      // Update the notebook name
      updateNotebook(notebookId, { name: newName })
      
      // Update all notes that belong to this notebook
      if (oldName) {
        const { notes } = useAppStore.getState()
        notes.forEach(note => {
          if (note.notebook === oldName) {
            updateNote({ ...note, notebook: newName })
          }
        })
      }
    }
    setEditingNotebook(null)
    setEditValue('')
  }

  // Trash context menu handlers
  const handleTrashRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTrashContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const handleEmptyTrashClick = () => {
    if (window.confirm('Are you sure you want to permanently delete all notes in trash? This action cannot be undone.')) {
      handleEmptyTrash()
    }
    closeTrashContextMenu()
  }

  const handleRemoveTag = () => {
    // Implement tag removal
    closeContextMenu()
  }

  const handleFilterByTag = () => {
    handleSectionClick(`tag-${contextMenu.tagName.toLowerCase()}`)
    closeContextMenu()
  }




  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all context menus
      closeContextMenu()
      closeNotebookContextMenu()
      closeTrashContextMenu()
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])


  // Memoize tag colors to avoid recalculating on every render
  const getTagColorMemo = React.useMemo(() => {
    return (tag: string) => {
      const color = getTagColor(tag)
      // Convert string color to object format expected by TagsList
      return {
        bg: `bg-${color}-100`,
        border: `border-${color}-300`
      }
    }
  }, [getTagColor])

  // Helper function to cancel notebook editing
  const handleCancelNotebookEdit = () => {
    setEditingNotebook(null)
    setEditValue('')
  }


  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <>
      <nav 
        className="w-full sidebar-modern flex flex-col h-full ui-font bg-theme-bg-secondary border-r border-theme-border-primary"
        onClick={(e) => {
          // Don't close context menus if clicking on context menu items
          if (!(e.target as Element)?.closest('.dropdown-menu')) {
            closeContextMenu()
            closeNotebookContextMenu()
            closeTrashContextMenu()
          }
        }}
      >
      {/* Settings Icon - Top Right */}
      <div className="flex justify-end pr-1">
        <button
          onClick={handleSettingsClick}
          className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          title="Settings"
        >
          <Icons.Settings size={20} />
        </button>
      </div>

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
            onToggleExpansion={handleToggleNotebookExpansion}
            editingNotebook={editingNotebook}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onSaveNotebookName={handleSaveNotebookName}
            onCancelEdit={handleCancelNotebookEdit}
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
          sections={systemSections.map(s => ({ key: s.id, label: s.label, icon: s.icon, count: s.count }))}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onTrashRightClick={handleTrashRightClick}
        />
      </section>

      {/* Footer/Bottom spacer */}
      <div className="flex-1" />
      
      </nav>

      {/* Context Menus */}
      <TagContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        tagName={contextMenu.tagName}
        onRemove={handleRemoveTag}
        onClose={closeContextMenu}
        onTagSettings={handleTagSettings}
      />

      {/* Tag Settings Modal */}
      <TagSettingsModal
        isOpen={tagSettingsModal.show}
        onClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />

      {/* Notebook Context Menu */}
      <NotebookContextMenu
        isVisible={notebookContextMenu.isVisible}
        position={notebookContextMenu.position}
        notebookName={notebookContextMenu.notebook?.name || ''}
        onRename={handleRenameNotebook}
        onDelete={handleDeleteNotebook}
        onClose={closeNotebookContextMenu}
      />

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={createNotebookModal}
        onClose={() => setCreateNotebookModal(false)}
        onCreate={handleCreateNotebookSubmit}
        existingNames={notebooksWithCounts.map(n => n.name)}
        availableParents={notebooksWithCounts}
        maxLevel={3}
      />

      {/* Trash Context Menu */}
      {trashContextMenu.isVisible && (
        <DropdownMenu
          isOpen={trashContextMenu.isVisible}
          position="fixed"
          width="min-w-32"
          style={{
            left: trashContextMenu.position.x,
            top: trashContextMenu.position.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={handleEmptyTrashClick}
            icon={<Icons.Trash size={10} />}
            className="text-theme-accent-red hover:text-theme-accent-red"
          >
            Empty Trash
          </DropdownMenuItem>
        </DropdownMenu>
      )}

    </>
  )
})

SidebarSimple.displayName = 'SidebarSimple'

export default SidebarSimple
