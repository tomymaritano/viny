// Simplified Sidebar component - RESTORED ORIGINAL UI
import React, { memo, useState, useEffect } from 'react'
import { useSidebarLogic } from '../../hooks/useSimpleLogic'
import { useNoteActions } from '../../hooks/useSimpleLogic'
import { useSimpleStore } from '../../stores/simpleStore'
import Icons from '../Icons'
import IconButton from '../ui/IconButton'
import TagContextMenu from '../ui/TagContextMenu'
import TagSettingsModal from '../editor/tags/TagSettingsModal'
import NotebookContextMenu from '../ui/NotebookContextMenu'
import CreateNotebookModal from '../ui/CreateNotebookModal'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'
import { getCustomTagColor } from '../../utils/customTagColors'

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

  const { createNewNote } = useNoteActions()
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
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '' })
  
  
  // Notebook context menu state
  const [notebookContextMenu, setNotebookContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null as any
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
    console.log('Tag name change:', oldName, '->', newName)
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
      const { notes } = useSimpleStore.getState()
      const notesInNotebook = notes.filter(note => note.notebook === notebookContextMenu.notebook.name)
      
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
        const { notes } = useSimpleStore.getState()
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

  const handleEmptyTrash = () => {
    // TODO: Implement empty trash functionality
    console.log('Empty trash clicked')
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
    return (tag: string) => getCustomTagColor(tag, tagColors)
  }, [tagColors])

  // Render notebook tree with simple, clean navigation
  const renderNotebookTree = (notebooks: any[], parentId: string | null = null, level = 0): React.ReactNode[] => {
    const childNotebooks = notebooks.filter(n => n.parentId === parentId)
    
    return childNotebooks.map(notebook => {
      const isExpanded = expandedNotebooks.has(notebook.id)
      const hasChildren = notebooks.some(n => n.parentId === notebook.id)
      const isActive = activeSection === `notebook-${notebook.name.toLowerCase()}`
      const paddingLeft = 12 + (level * 16)

      return (
        <div key={notebook.id} className="relative">
            <button
              className={`w-full flex items-center justify-between py-1.5 text-sm text-left transition-all duration-200 ${
                isActive
                  ? 'text-theme-text-primary bg-[#323D4B] relative'
                  : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
              }`}
              onClick={() => handleSectionClick(`notebook-${notebook.name.toLowerCase()}`)}
              onContextMenu={(e) => handleNotebookRightClick(e, notebook)}
              style={{
                paddingLeft: `${paddingLeft}px`,
                paddingRight: '8px',
                ...(isActive ? { boxShadow: 'inset 3px 0 0 #ED6E3F' } : {})
              }}
            >
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                {/* Triangle expand/collapse control */}
                {hasChildren ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleNotebookExpansion(notebook.id)
                    }}
                    className={`w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                  >
                    <Icons.ChevronRight size={10} className="text-theme-text-muted hover:text-theme-text-secondary" />
                  </div>
                ) : (
                  <div className="w-4 h-4 flex-shrink-0" />
                )}
                
                {/* Color indicator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getColorClass(notebook.color).replace('text-', 'bg-')}`} />
                
                {/* Name (editable) */}
                {editingNotebook === notebook.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveNotebookName(notebook.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveNotebookName(notebook.id)
                      } else if (e.key === 'Escape') {
                        setEditingNotebook(null)
                        setEditValue('')
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none text-sm w-full border-b border-theme-accent-primary"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-sm truncate flex-1 min-w-0"
                    title={notebook.path || notebook.name}
                  >
                    {notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1)}
                  </span>
                )}
              </div>
              
              {/* Count badge */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {notebook.directCount > 0 && (
                  <span 
                    className="text-xs px-1.5 py-0.5 bg-theme-accent-primary/20 text-theme-accent-primary rounded-full min-w-[20px] text-center"
                    title={`${notebook.directCount} notes in this category`}
                  >
                    {notebook.directCount}
                  </span>
                )}
              </div>
            </button>
          {/* Children (recursive) */}
          {hasChildren && isExpanded && (
            <div className="relative">
              {renderNotebookTree(notebooks, notebook.id, level + 1)}
            </div>
          )}
        </div>
      )
    })
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
        {mainSections.map(section => (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              activeSection === section.id
                ? 'text-theme-text-primary bg-[#323D4B] relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            onClick={() => handleSectionClick(section.id)}
            style={activeSection === section.id ? {
              boxShadow: 'inset 4px 0 0 #ED6E3F'
            } : {}}
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">
                {renderIcon(section.icon)}
              </span>
              <span>{section.label}</span>
            </div>
            <span className="text-sm opacity-75">{section.count}</span>
          </button>
        ))}
      </section>

      {/* Status Section */}
      <section>
        <button
          onClick={() => handleToggleSection('status')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('FileChartLine', 16)}
            <span>Status</span>
          </div>
          <div className={`transition-transform duration-200 ${expandedSections.status ? 'rotate-90' : ''}`}>
            {renderIcon('ChevronRight', 16)}
          </div>
        </button>
        
        {expandedSections.status && (
          <div className="space-y-0 mt-1">
            {statusSections.map(status => (
              <button
                key={status.id}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                  activeSection === status.id
                    ? 'text-theme-text-primary bg-theme-bg-tertiary'
                    : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
                onClick={() => handleSectionClick(status.id)}
              >
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`opacity-75 ${status.color || 'text-theme-text-secondary'}`}>
                    {renderIcon(status.icon, 16)}
                  </span>
                  <span className="text-sm">{status.label}</span>
                </div>
                <span className="text-sm opacity-75">{status.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Notebooks Section */}
      <section>
        <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium">
          <button
            onClick={() => handleToggleSection('notebooks')}
            className="flex items-center space-x-2 hover:text-theme-text-tertiary transition-colors"
          >
            {renderIcon('Book', 16)}
            <span>Notebooks</span>
          </button>
          <IconButton
            icon={Icons.Plus}
            onClick={handleCreateNotebook}
            title="New Category"
            size={14}
            variant="default"
            className="text-theme-text-muted hover:text-theme-text-tertiary"
          />
        </div>
        
        {expandedSections.notebooks && (
          <div className="space-y-0 mt-1">
            {notebooksWithCounts.length > 0 ? (
              renderNotebookTree(notebooksWithCounts)
            ) : (
              <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
                No notebooks yet
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tags Section */}
      <section>
        <button
          onClick={() => handleToggleSection('tags')}
          onContextMenu={handleTagsHeaderRightClick}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Tag', 16)}
            <span>Tags</span>
          </div>
          <div className={`transition-transform duration-200 ${expandedSections.tags ? 'rotate-90' : ''}`}>
            {renderIcon('ChevronRight', 16)}
          </div>
        </button>
        
        {expandedSections.tags && (
          <div className="space-y-0 mt-1">
            {tagsWithCounts.length > 0 ? (
              tagsWithCounts.map((tag) => {
                const tagColor = getTagColorMemo(tag.tag)
                const isActive = activeSection === `tag-${tag.tag.toLowerCase()}`
                
                return (
                  <div key={tag.tag} className="relative dropdown-container">
                    <button
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                        isActive
                          ? 'text-theme-text-primary bg-[#323D4B] relative'
                          : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
                      }`}
                      onClick={() => handleSectionClick(`tag-${tag.tag.toLowerCase()}`)}
                      onContextMenu={(e) => handleTagRightClick(e, tag.tag)}
                      style={isActive ? {
                        boxShadow: 'inset 4px 0 0 #ED6E3F'
                      } : {}}
                    >
                      <div className="flex items-center space-x-2 ml-4">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ 
                            backgroundColor: tagColor.bg,
                            outline: `1px solid ${tagColor.border}`,
                            outlineOffset: '-1px'
                          }}
                        />
                        <span className="text-sm">#{tag.tag}</span>
                      </div>
                    <span className="text-sm opacity-75">{tag.count}</span>
                  </button>
                </div>
              )
            })
            ) : (
              <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
                No tags yet
              </div>
            )}
          </div>
        )}
      </section>

      {/* System Sections */}
      <section className="space-y-0">
        {systemSections.map(section => (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              activeSection === section.id
                ? 'text-theme-text-primary bg-[#323D4B] relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            onClick={() => handleSectionClick(section.id)}
            onContextMenu={section.id === 'trash' ? handleTrashRightClick : undefined}
            style={activeSection === section.id ? {
              boxShadow: 'inset 4px 0 0 #ED6E3F'
            } : {}}
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">{renderIcon(section.icon)}</span>
              <span>{section.label}</span>
            </div>
            <span className="text-sm opacity-75">{section.count}</span>
          </button>
        ))}
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
            onClick={handleEmptyTrash}
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
