/**
 * NotebooksSection - Complete notebooks management section
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'
import NotebookTree from './NotebookTree'

interface Notebook {
  id: string
  name: string
  color: string
  directCount: number
  parentId: string | null
}

interface NotebooksSectionProps {
  notebooks: Notebook[]
  isExpanded: boolean
  activeSection: string
  expandedNotebooks: Set<string>
  editingNotebook: string | null
  editValue: string
  onToggleExpansion: () => void
  onSectionClick: (sectionId: string) => void
  onCreateNotebook: () => void
  onToggleNotebookExpansion: (notebookId: string) => void
  onNotebookRightClick: (e: React.MouseEvent, notebook: Notebook) => void
  onStartEditing: (notebookId: string, currentName: string) => void
  onSaveEdit: (notebookId: string) => void
  onCancelEdit: () => void
  onEditValueChange: (value: string) => void
  getColorClass: (color: string) => string
  getNotebookChildren: (parentId: string) => Notebook[]
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const NotebooksSection: React.FC<NotebooksSectionProps> = ({
  notebooks,
  isExpanded,
  activeSection,
  expandedNotebooks,
  editingNotebook,
  editValue,
  onToggleExpansion,
  onSectionClick,
  onCreateNotebook,
  onToggleNotebookExpansion,
  onNotebookRightClick,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  getColorClass,
  getNotebookChildren,
  renderIcon
}) => {
  return (
    <div className="px-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onClick={onToggleExpansion}
          className="flex items-center gap-2 text-sm font-medium text-theme-text-muted hover:text-theme-text-secondary transition-colors"
        >
          <span>Notebooks</span>
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            {renderIcon('ChevronDown', 12)}
          </span>
        </button>
        
        <button
          onClick={onCreateNotebook}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-theme-bg-tertiary transition-colors"
          title="Create new notebook"
        >
          {renderIcon('Plus', 12)}
        </button>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="mt-1 max-h-64 overflow-y-auto">
          <NotebookTree
            notebooks={notebooks}
            expandedNotebooks={expandedNotebooks}
            activeSection={activeSection}
            editingNotebook={editingNotebook}
            editValue={editValue}
            onSectionClick={onSectionClick}
            onToggleExpansion={onToggleNotebookExpansion}
            onRightClick={onNotebookRightClick}
            onStartEditing={onStartEditing}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onEditValueChange={onEditValueChange}
            getColorClass={getColorClass}
            getNotebookChildren={getNotebookChildren}
            renderIcon={renderIcon}
          />
        </div>
      )}
    </div>
  )
}

export default NotebooksSection
