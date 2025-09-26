import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { Icons } from '../Icons'
import MainSections from './MainSections'
import NotebookTree from './NotebookTree'
import TagsList from './TagsList'
import type { NotebookWithCounts } from '../../types/notebook'

interface SidebarSectionsProps {
  // Main sections
  mainSections: any[]
  activeSection: string
  onSectionClick: (section: string) => void
  focusedNotebookId?: string | null

  // Notebooks
  expandedSections: any
  onToggleSection: (section: string) => void
  onCreateNotebookClick: () => void
  notebooks: NotebookWithCounts[]
  displayedNotebooks: NotebookWithCounts[]
  expandedNotebooks: Set<string>
  onNotebookClick: (section: string) => void
  onNotebookRightClick: (
    e: React.MouseEvent,
    notebook: NotebookWithCounts
  ) => void
  onToggleNotebookExpansion: (notebookId: string) => void
  editingNotebook: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onSaveNotebookName: (notebookId: string) => void
  onCancelEdit: () => void
  onCreateNoteInNotebook: (notebookId: string) => Promise<void>
  onFocusNotebook: (notebookId: string) => void

  // Status sections
  statusSections: any[]

  // Tags
  tagsWithCounts: any[]
  onTagRightClick: (
    e: React.MouseEvent,
    x: number,
    y: number,
    tag: string
  ) => void
  getTagColor: (tag: string) => string
  onCreateTagClick: () => void

  // System sections
  systemSections: any[]
  onTrashRightClick: (e: React.MouseEvent) => void
}

const SidebarSections: React.FC<SidebarSectionsProps> = ({
  mainSections,
  activeSection,
  onSectionClick,
  focusedNotebookId,
  expandedSections,
  onToggleSection,
  onCreateNotebookClick,
  notebooks,
  displayedNotebooks,
  expandedNotebooks,
  onNotebookClick,
  onNotebookRightClick,
  onToggleNotebookExpansion,
  editingNotebook,
  editValue,
  onEditValueChange,
  onSaveNotebookName,
  onCancelEdit,
  onCreateNoteInNotebook,
  onFocusNotebook,
  statusSections,
  tagsWithCounts,
  onTagRightClick,
  getTagColor,
  onCreateTagClick,
  systemSections,
  onTrashRightClick,
}) => {
  return (
    <>
      {/* Main Sections (All Notes, Pinned) - Hidden in focus mode */}
      {!focusedNotebookId && (
        <div className="space-y-1">
          {mainSections.map(section => {
            const IconComponent = Icons[section.icon as keyof typeof Icons]
            return (
              <div
                key={section.id}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer rounded ${
                  activeSection === section.id
                    ? 'text-theme-text-primary bg-theme-accent-primary/10'
                    : 'text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30'
                }`}
                onClick={() => onSectionClick(section.id)}
              >
                {IconComponent && (
                  <IconComponent size={16} className="flex-shrink-0" />
                )}
                <span>{section.label}</span>
                {section.count !== undefined && section.count > 0 && (
                  <span className="ml-auto text-xs opacity-60">
                    {section.count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Notebooks Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <button
            className="flex items-center gap-1 cursor-pointer text-left w-full p-0"
            onClick={() => onToggleSection('notebooks')}
            aria-expanded={expandedSections.notebooks}
            aria-controls="notebooks-section"
            aria-label="Toggle notebooks section"
            type="button"
          >
            <Icons.ChevronDown
              size={12}
              className={`text-theme-text-muted transition-transform duration-200 ${expandedSections.notebooks ? '' : '-rotate-90'}`}
            />
            <span className="text-xs font-medium text-theme-text-muted uppercase">
              Notebooks {notebooks.length > 0 && `(${notebooks.length})`}
            </span>
          </button>
          <button
            onClick={onCreateNotebookClick}
            className="p-0.5 hover:bg-theme-bg-tertiary/30 rounded transition-colors duration-150"
            title="Create new notebook"
          >
            <Icons.Plus size={14} className="text-theme-text-muted" />
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.notebooks && (
            <div className="overflow-hidden">
              {/* Debug: Log notebook data */}
              {console.log('📂 SidebarSections notebooks debug:', {
                expandedSections,
                notebooksCount: notebooks.length,
                displayedNotebooksCount: displayedNotebooks.length,
                displayedNotebooks: displayedNotebooks
              })}
              <NotebookTree
                notebooks={notebooks}
                rootNotebooks={displayedNotebooks}
                activeSection={activeSection}
                expandedNotebooks={expandedNotebooks}
                onSectionClick={onNotebookClick}
                onNotebookRightClick={onNotebookRightClick}
                onToggleExpansion={onToggleNotebookExpansion}
                editingNotebook={editingNotebook}
                editValue={editValue}
                onEditValueChange={onEditValueChange}
                onSaveNotebookName={onSaveNotebookName}
                onCancelEdit={onCancelEdit}
                onCreateNoteInNotebook={onCreateNoteInNotebook}
                onFocusNotebook={onFocusNotebook}
                focusedNotebookId={focusedNotebookId}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Section */}
      <div className="space-y-1">
        <button
          className="flex items-center justify-between px-2 py-1 cursor-pointer w-full text-left"
          onClick={() => onToggleSection('status')}
          aria-expanded={expandedSections.status}
          aria-controls="status-section"
          aria-label="Toggle status section"
          type="button"
        >
          <div className="flex items-center gap-1">
            <Icons.ChevronDown
              size={12}
              className={`text-theme-text-muted transition-transform duration-200 ${expandedSections.status ? '' : '-rotate-90'}`}
            />
            <span className="text-xs font-medium text-theme-text-muted uppercase">
              Status
            </span>
          </div>
        </button>
        <AnimatePresence>
          {expandedSections.status && (
            <div className="overflow-hidden">
              <div className="space-y-1">
                {statusSections.map(section => {
                  const IconComponent =
                    Icons[section.icon as keyof typeof Icons]
                  return (
                    <div
                      key={section.id}
                      className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors duration-150 cursor-pointer rounded ${
                        activeSection === section.id
                          ? 'text-theme-text-primary bg-theme-accent-primary/10'
                          : 'text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30'
                      }`}
                      onClick={() => onSectionClick(section.id)}
                    >
                      {IconComponent && (
                        <IconComponent size={16} className="flex-shrink-0" />
                      )}
                      <span>{section.label}</span>
                      {section.count !== undefined && section.count > 0 && (
                        <span className="ml-auto text-xs opacity-60">
                          {section.count}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <button
            className="flex items-center gap-1 cursor-pointer text-left w-full p-0"
            onClick={() => onToggleSection('tags')}
            aria-expanded={expandedSections.tags}
            aria-controls="tags-section"
            aria-label="Toggle tags section"
            type="button"
          >
            <Icons.ChevronDown
              size={12}
              className={`text-theme-text-muted transition-transform duration-200 ${expandedSections.tags ? '' : '-rotate-90'}`}
            />
            <span className="text-xs font-medium text-theme-text-muted uppercase">
              Tags
            </span>
          </button>
          <button
            onClick={onCreateTagClick}
            className="p-0.5 hover:bg-theme-bg-tertiary/30 rounded transition-colors duration-150"
            title="Create new tag"
          >
            <Icons.Plus size={14} className="text-theme-text-muted" />
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.tags && (
            <div className="overflow-hidden">
              <TagsList
                tags={tagsWithCounts}
                activeSection={activeSection}
                onSectionClick={onSectionClick}
                onContextMenu={onTagRightClick}
                getTagColor={getTagColor}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* System Sections (Trash) - Hidden in focus mode */}
      {!focusedNotebookId && (
        <div className="space-y-1">
          {systemSections.map(section => {
            const IconComponent = Icons[section.icon as keyof typeof Icons]
            return (
              <div
                key={section.id}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors duration-150 cursor-pointer rounded ${
                  activeSection === section.id
                    ? 'text-theme-text-primary bg-theme-accent-primary/10'
                    : 'text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30'
                }`}
                onClick={() => onSectionClick(section.id)}
                onContextMenu={e => {
                  if (
                    section.id === 'trash' &&
                    window.electronAPI?.isElectron
                  ) {
                    e.preventDefault()
                    window.electronAPI.showContextMenu('trash')
                  } else if (section.id === 'trash') {
                    onTrashRightClick(e)
                  }
                }}
              >
                {IconComponent && (
                  <IconComponent size={16} className="flex-shrink-0" />
                )}
                <span>{section.label}</span>
                {section.count !== undefined && section.count > 0 && (
                  <span className="ml-auto text-xs opacity-60">
                    {section.count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default SidebarSections
