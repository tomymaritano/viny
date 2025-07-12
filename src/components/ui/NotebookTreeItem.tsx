import React, { useState } from 'react'
import { NotebookWithCounts } from '../../types/notebook'
import Icons from '../Icons'

interface NotebookTreeItemProps {
  notebook: NotebookWithCounts
  children: NotebookWithCounts[]
  isActive: boolean
  isExpanded: boolean
  onSelect: (notebookName: string) => void
  onToggleExpansion: (notebookId: string) => void
  onContextMenu: (e: React.MouseEvent, notebook: NotebookWithCounts) => void
  onStartEdit: (notebookId: string) => void
  editingNotebook: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveEdit: (notebookId: string) => void
  onCancelEdit: () => void
  getColorClass: (color: string) => string
  level?: number
}

const NotebookTreeItem: React.FC<NotebookTreeItemProps> = ({
  notebook,
  children,
  isActive,
  isExpanded,
  onSelect,
  onToggleExpansion,
  onContextMenu,
  onStartEdit,
  editingNotebook,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  getColorClass,
  level = 0
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const hasChildren = children.length > 0
  const paddingLeft = 16 + (level * 20) // Increase indentation for each level

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', notebook.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const draggedNotebookId = e.dataTransfer.getData('text/plain')
    if (draggedNotebookId !== notebook.id) {
      // TODO: Implement move logic
      console.log(`Move ${draggedNotebookId} to ${notebook.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit(notebook.id)
    } else if (e.key === 'Escape') {
      onCancelEdit()
    }
  }

  return (
    <div className="relative">
      {/* Main notebook item */}
      <div
        className={`relative group transition-all duration-200 ${
          isDragOver ? 'bg-theme-accent-primary/10 border-l-2 border-theme-accent-primary' : ''
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          className={`w-full flex items-center justify-between py-2 text-sm text-left transition-all duration-200 ${
            isActive
              ? 'text-theme-text-primary bg-[#323D4B] relative'
              : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
          }`}
          onClick={() => onSelect(`notebook-${notebook.name.toLowerCase()}`)}
          onContextMenu={(e) => onContextMenu(e, notebook)}
          style={{
            paddingLeft: `${paddingLeft}px`,
            paddingRight: '12px',
            ...(isActive ? { boxShadow: 'inset 4px 0 0 #ED6E3F' } : {})
          }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Expansion toggle */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpansion(notebook.id)
                }}
                className="flex-shrink-0 p-1 hover:bg-theme-bg-tertiary rounded transition-colors"
              >
                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                  <Icons.ChevronRight size={12} />
                </div>
              </button>
            )}
            
            {/* Color indicator */}
            <div 
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getColorClass(notebook.color).replace('text-', 'bg-')}`} 
            />
            
            {/* Name (editable) */}
            {editingNotebook === notebook.id ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                onBlur={() => onSaveEdit(notebook.id)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent outline-none text-sm w-full border-b border-theme-accent-primary"
                autoFocus
              />
            ) : (
              <span 
                className="text-sm truncate flex-1 min-w-0"
                title={notebook.path}
              >
                {notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1)}
              </span>
            )}
          </div>
          
          {/* Count badges */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {notebook.directCount > 0 && (
              <span 
                className="text-xs px-1.5 py-0.5 bg-theme-accent-primary/20 text-theme-accent-primary rounded"
                title={`${notebook.directCount} notes in this category`}
              >
                {notebook.directCount}
              </span>
            )}
            {notebook.totalCount !== notebook.directCount && (
              <span 
                className="text-xs opacity-75"
                title={`${notebook.totalCount} total notes (including subcategories)`}
              >
                ({notebook.totalCount})
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {children.map((child) => (
            <NotebookTreeItem
              key={child.id}
              notebook={child}
              children={[]} // Will be populated by parent component
              isActive={isActive} // This would need to be calculated for each child
              isExpanded={false} // This would need to be tracked for each child
              onSelect={onSelect}
              onToggleExpansion={onToggleExpansion}
              onContextMenu={onContextMenu}
              onStartEdit={onStartEdit}
              editingNotebook={editingNotebook}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              getColorClass={getColorClass}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NotebookTreeItem