import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '../Icons'
import type { NotebookWithCounts } from '../../types/notebook'

interface NotebookTreeProps {
  notebooks: NotebookWithCounts[] // All notebooks for finding children
  rootNotebooks?: NotebookWithCounts[] // Root notebooks to display
  activeSection: string
  expandedNotebooks: Set<string>
  onSectionClick: (section: string) => void
  onNotebookRightClick: (
    e: React.MouseEvent,
    notebook: NotebookWithCounts
  ) => void
  onToggleExpansion: (notebookId: string) => void
  editingNotebook: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveNotebookName: (notebookId: string) => void
  onCancelEdit: () => void
  onCreateNoteInNotebook?: (notebookId: string) => void
  onFocusNotebook?: (notebookId: string) => void
  focusedNotebookId?: string | null
}

const NotebookTree: React.FC<NotebookTreeProps> = ({
  notebooks,
  rootNotebooks,
  activeSection,
  expandedNotebooks,
  onSectionClick,
  onNotebookRightClick,
  onToggleExpansion,
  editingNotebook,
  editValue,
  onEditValueChange,
  onSaveNotebookName,
  onCancelEdit,
  onCreateNoteInNotebook,
  onFocusNotebook,
  focusedNotebookId,
}) => {
  const renderNotebookTree = (
    notebookList: NotebookWithCounts[],
    level = 0
  ): React.ReactNode[] => {
    // Debug logging
    if (level === 0) {
      console.log('🌲 NotebookTree render:', {
        notebookListCount: notebookList.length,
        rootNotebooksCount: rootNotebooks?.length,
        allNotebooksCount: notebooks.length,
        firstNotebook: notebookList[0]
      })
    }
    
    return notebookList.map(notebook => {
      const isExpanded = expandedNotebooks.has(notebook.id)
      const hasChildren = notebook.children && notebook.children.length > 0
      const isActive =
        activeSection === `notebook-${notebook.name.toLowerCase()}`

      return (
        <div key={notebook.id} className="relative">
          <div
            role="treeitem"
            aria-selected={isActive}
            aria-level={level + 1}
            tabIndex={0}
            className={`group w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer rounded ${
              isActive
                ? 'text-theme-text-primary bg-theme-accent-primary/10'
                : 'text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30'
            }`}
            onClick={() => {
              console.log('🔴 NOTEBOOK CLICKED:', {
                notebookId: notebook.id,
                notebookName: notebook.name,
                sectionToSet: `notebook-${notebook.name.toLowerCase()}`,
                notebookData: notebook
              })
              onSectionClick(`notebook-${notebook.name.toLowerCase()}`)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSectionClick(`notebook-${notebook.name.toLowerCase()}`)
              }
            }}
            onContextMenu={e => {
              if (window.electronAPI?.isElectron) {
                e.preventDefault()
                window.electronAPI.showContextMenu('notebook', notebook)
              } else {
                onNotebookRightClick(e, notebook)
              }
            }}
          >
            <div className="flex items-center flex-1 min-w-0 space-x-3">
              {/* Name container with chevron */}
              <div className="flex items-center flex-1 min-w-0 space-x-1">
                {/* Show chevron only if has child notebooks */}
                {hasChildren ? (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onToggleExpansion(notebook.id)
                    }}
                    className="cursor-pointer flex-shrink-0 transition-transform duration-200 p-0"
                    style={{
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${notebook.name}`}
                    type="button"
                  >
                    <Icons.ChevronDown
                      size={16}
                      className="text-theme-text-muted"
                    />
                  </button>
                ) : (
                  <div className="w-4 flex-shrink-0" />
                )}

                {/* Name (editable) */}
                {editingNotebook === notebook.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => onEditValueChange(e.target.value)}
                    onBlur={() => onSaveNotebookName(notebook.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        onSaveNotebookName(notebook.id)
                      } else if (e.key === 'Escape') {
                        onCancelEdit()
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    className="bg-transparent outline-none text-sm w-full border-b border-theme-accent-primary"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm truncate flex-1 min-w-0"
                    title={notebook.path || notebook.name}
                  >
                    {notebook.name.charAt(0).toUpperCase() +
                      notebook.name.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Count badge and buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Add note button - appears on hover */}
              {onCreateNoteInNotebook && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onCreateNoteInNotebook(notebook.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 hover:bg-theme-bg-quaternary rounded"
                  title="Add note to this notebook"
                  aria-label={`Add note to ${notebook.name}`}
                  type="button"
                >
                  <Icons.Plus size={14} className="text-theme-text-muted" />
                </button>
              )}

              {/* Note count and Detail button container */}
              <div className="relative flex items-center w-16">
                {/* Note count - shows by default, hidden on hover */}
                {notebook.totalCount > 0 ? (
                  <span className="text-xs text-theme-text-muted opacity-60 px-2 transition-opacity duration-150 group-hover:opacity-0 absolute right-0">
                    {notebook.totalCount}
                  </span>
                ) : (
                  <span
                    className="text-xs text-theme-text-muted opacity-40 px-2 transition-opacity duration-150 group-hover:opacity-0 absolute right-0"
                    title="Empty notebook"
                  >
                    0
                  </span>
                )}

                {/* Detail button - shows on hover in same position as count */}
                {onFocusNotebook && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onFocusNotebook(notebook.id)
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1.5 py-0.5 text-[10px] rounded flex items-center gap-0.5 border absolute right-0 ${
                      focusedNotebookId === notebook.id
                        ? 'bg-theme-accent-primary text-white border-theme-accent-primary'
                        : 'border-theme-border-secondary hover:bg-theme-bg-quaternary hover:border-theme-border-primary text-theme-text-muted'
                    }`}
                    title={
                      focusedNotebookId === notebook.id
                        ? 'Exit focus mode'
                        : 'Focus on this notebook - hides other content'
                    }
                    aria-label={`${focusedNotebookId === notebook.id ? 'Exit' : 'Enter'} focus mode for ${notebook.name}`}
                    aria-pressed={focusedNotebookId === notebook.id}
                    type="button"
                  >
                    <span className="font-medium">Detail</span>
                    <Icons.ChevronRight size={10} className="opacity-70" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Children (recursive) and Notes */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-1">
                  {/* Sub-notebooks with indentation */}
                  {hasChildren && notebook.children && (
                    <div className="ml-4">
                      {renderNotebookTree(
                        notebooks.filter(nb =>
                          notebook.children.includes(nb.id)
                        ),
                        level + 1
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    })
  }

  return (
    <div role="tree" aria-label="Notebooks navigation">
      {renderNotebookTree(rootNotebooks || notebooks)}
    </div>
  )
}

export default memo(NotebookTree)
