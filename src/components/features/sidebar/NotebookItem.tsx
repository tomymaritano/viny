/**
 * NotebookItem - Individual notebook item with inline editing
 * Extracted from SidebarSimple.tsx
 */

import React, { useRef, useEffect } from 'react'

interface Notebook {
  id: string
  name: string
  color: string
  directCount: number
  parentId: string | null
}

interface NotebookItemProps {
  notebook: Notebook
  level: number
  isActive: boolean
  isExpanded: boolean
  isEditing: boolean
  editValue: string
  hasChildren: boolean
  onSectionClick: (sectionId: string) => void
  onToggleExpansion: (notebookId: string) => void
  onRightClick: (e: React.MouseEvent, notebook: Notebook) => void
  onStartEditing: (notebookId: string, currentName: string) => void
  onSaveEdit: (notebookId: string) => void
  onCancelEdit: () => void
  onEditValueChange: (value: string) => void
  getColorClass: (color: string) => string
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const NotebookItem: React.FC<NotebookItemProps> = ({
  notebook,
  level,
  isActive,
  isExpanded,
  isEditing,
  editValue,
  hasChildren,
  onSectionClick,
  onToggleExpansion,
  onRightClick,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  getColorClass,
  renderIcon
}) => {
  const editInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit(notebook.id)
    } else if (e.key === 'Escape') {
      onCancelEdit()
    }
  }

  const paddingLeft = 12 + (level * 16)

  return (
    <div className="relative">
      <button
        onClick={() => onSectionClick(`notebook:${notebook.id}`)}
        onContextMenu={(e) => onRightClick(e, notebook)}
        onDoubleClick={() => onStartEditing(notebook.id, notebook.name)}
        className={`
          w-full flex items-center justify-between py-2 pr-3 text-sm transition-colors
          ${isActive
            ? 'bg-theme-bg-secondary text-theme-text-primary'
            : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Expansion Toggle */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpansion(notebook.id)
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-theme-bg-secondary rounded transition-colors"
            >
              <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                {renderIcon('ChevronRight', 10)}
              </span>
            </button>
          )}
          
          {/* Color Indicator */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getColorClass(notebook.color)}`} />
          
          {/* Name or Edit Input */}
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => onSaveEdit(notebook.id)}
              className="flex-1 bg-theme-bg-tertiary text-theme-text-primary border border-theme-border-primary rounded px-1 py-0.5 text-sm min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="font-medium truncate">{notebook.name}</span>
          )}
        </div>
        
        {/* Count Badge */}
        {notebook.directCount > 0 && (
          <span className="text-xs bg-theme-bg-tertiary text-theme-text-muted px-1.5 py-0.5 rounded flex-shrink-0">
            {notebook.directCount}
          </span>
        )}
      </button>
    </div>
  )
}

export default NotebookItem
