/**
 * NotebookTree - Recursive tree rendering for notebooks
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'
import NotebookItem from './NotebookItem'

interface Notebook {
  id: string
  name: string
  color: string
  directCount: number
  parentId: string | null
}

interface NotebookTreeProps {
  notebooks: Notebook[]
  expandedNotebooks: Set<string>
  activeSection: string
  editingNotebook: string | null
  editValue: string
  onSectionClick: (sectionId: string) => void
  onToggleExpansion: (notebookId: string) => void
  onRightClick: (e: React.MouseEvent, notebook: Notebook) => void
  onStartEditing: (notebookId: string, currentName: string) => void
  onSaveEdit: (notebookId: string) => void
  onCancelEdit: () => void
  onEditValueChange: (value: string) => void
  getColorClass: (color: string) => string
  getNotebookChildren: (parentId: string) => Notebook[]
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const NotebookTree: React.FC<NotebookTreeProps> = ({
  notebooks,
  expandedNotebooks,
  activeSection,
  editingNotebook,
  editValue,
  onSectionClick,
  onToggleExpansion,
  onRightClick,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  getColorClass,
  getNotebookChildren,
  renderIcon
}) => {
  const renderNotebookTree = (parentId: string | null = null, level: number = 0): React.ReactNode => {
    const children = parentId ? getNotebookChildren(parentId) : notebooks.filter(nb => !nb.parentId)
    
    return children.map((notebook) => {
      const isActive = activeSection === `notebook:${notebook.id}`
      const isExpanded = expandedNotebooks.has(notebook.id)
      const isEditing = editingNotebook === notebook.id
      const hasChildren = getNotebookChildren(notebook.id).length > 0

      return (
        <div key={notebook.id}>
          <NotebookItem
            notebook={notebook}
            level={level}
            isActive={isActive}
            isExpanded={isExpanded}
            isEditing={isEditing}
            editValue={editValue}
            hasChildren={hasChildren}
            onSectionClick={onSectionClick}
            onToggleExpansion={onToggleExpansion}
            onRightClick={onRightClick}
            onStartEditing={onStartEditing}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onEditValueChange={onEditValueChange}
            getColorClass={getColorClass}
            renderIcon={renderIcon}
          />
          
          {/* Render children if expanded */}
          {isExpanded && hasChildren && (
            <div>
              {renderNotebookTree(notebook.id, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="space-y-0.5">
      {notebooks.length > 0 ? (
        renderNotebookTree()
      ) : (
        <div className="px-3 py-4 text-center text-sm text-theme-text-muted italic">
          No notebooks found
        </div>
      )}
    </div>
  )
}

export default NotebookTree
