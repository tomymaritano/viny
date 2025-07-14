import React from 'react'
import Icons from '../Icons'
import { NotebookWithCounts } from '../../types/notebook'

interface NotebookTreeProps {
  notebooks: NotebookWithCounts[]
  activeSection: string
  expandedNotebooks: Set<string>
  onSectionClick: (section: string) => void
  onNotebookRightClick: (e: React.MouseEvent, notebook: NotebookWithCounts) => void
  onToggleExpansion: (notebookId: string) => void
  editingNotebook: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveNotebookName: (notebookId: string) => void
  onCancelEdit: () => void
}

const NotebookTree: React.FC<NotebookTreeProps> = ({
  notebooks,
  activeSection,
  expandedNotebooks,
  onSectionClick,
  onNotebookRightClick,
  onToggleExpansion,
  editingNotebook,
  editValue,
  onEditValueChange,
  onSaveNotebookName,
  onCancelEdit
}) => {
  const renderNotebookTree = (parentId: string | null = null, level = 0): React.ReactNode[] => {
    const childNotebooks = notebooks.filter(n => n.parentId === parentId)
    
    return childNotebooks.map(notebook => {
      const isExpanded = expandedNotebooks.has(notebook.id)
      const hasChildren = notebooks.some(n => n.parentId === notebook.id)
      const isActive = activeSection === `notebook-${notebook.name.toLowerCase()}`
      const paddingLeft = 12 + (level * 16)

      return (
        <div key={notebook.id} className="relative">
          <button
            className={`w-full flex items-center justify-between py-2 text-sm text-left transition-all duration-200 ${
              isActive
                ? 'text-theme-text-primary relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            onClick={() => onSectionClick(`notebook-${notebook.name.toLowerCase()}`)}
            onContextMenu={(e) => onNotebookRightClick(e, notebook)}
            style={{
              paddingLeft: `${paddingLeft}px`,
              paddingRight: '12px',
              ...(isActive ? {
                backgroundColor: 'var(--color-active-bg)',
                boxShadow: 'inset 3px 0 0 var(--color-active-border)'
              } : {})
            }}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Triangle expand/collapse control */}
              {hasChildren ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpansion(notebook.id)
                  }}
                  className={`w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                >
                  <Icons.ChevronRight size={12} className="text-theme-text-muted hover:text-theme-text-secondary" />
                </div>
              ) : (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              
              {/* Notebook icon */}
              <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${
                isActive ? 'text-theme-accent-primary' : 'text-theme-text-muted'
              }`}>
                <Icons.Book size={14} />
              </div>
              
              {/* Name (editable) */}
              {editingNotebook === notebook.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onBlur={() => onSaveNotebookName(notebook.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveNotebookName(notebook.id)
                    } else if (e.key === 'Escape') {
                      onCancelEdit()
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
              {renderNotebookTree(notebook.id, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div>
      {renderNotebookTree()}
    </div>
  )
}

export default NotebookTree