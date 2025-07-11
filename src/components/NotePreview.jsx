import { useState, useRef, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import Icons from './Icons'
import ExportDialog from './ExportDialog'
import NoteMetadata from './editor/metadata/NoteMetadata'
import { useSettings } from '../hooks/useSettings'
import { useSimpleStore } from '../stores/simpleStore'
import TaskProgress from './ui/TaskProgress'
import { renderMarkdownToHtml } from '../utils/markdownRenderer'

const NotePreview = ({
  note,
  onEdit: _onEdit,
  onTogglePin,
  onDuplicate,
  onDelete,
  viewMode = 'preview',
  onViewModeChange,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onExport: _onExport,
}) => {
  const { settings } = useSettings()
  const { getTagColor } = useSimpleStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const menuRef = useRef(null)

  // Get tag style from centralized system
  const getTagStyle = tag => {
    return getTagColor(tag)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  if (!note) {
    return (
      <div className="flex-1 theme-bg-primary flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-theme-text-secondary mb-4">
            No note selected
          </h3>
          <p className="text-theme-text-tertiary mb-6">
            Select a note from the list to view it here
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-theme-text-tertiary">Create note</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  ⌘
                </kbd>
                <span className="text-theme-text-tertiary">+</span>
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  N
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <span className="text-theme-text-tertiary">Search notes</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  ⌘
                </kbd>
                <span className="text-theme-text-tertiary">+</span>
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  F
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <span className="text-theme-text-tertiary">Recent files</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  ⌘
                </kbd>
                <span className="text-theme-text-tertiary">+</span>
                <kbd className="px-2 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded">
                  R
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getPreviewHtml = () => {
    return renderMarkdownToHtml(note.content)
  }

  return (
    <div className="flex-1 theme-bg-primary flex flex-col markdown-font">
      {/* Note Metadata in Preview Mode */}
      <NoteMetadata
        note={note}
        notebooks={[]}
        onTitleChange={() => {}} // No-op in preview mode
        onNotebookChange={() => {}} // No-op in preview mode
        onStatusChange={() => {}} // No-op in preview mode
        onTagsChange={() => {}} // No-op in preview mode
        isPreviewMode={true}
      />

      {/* Header */}
      <div className="p-4 border-b border-theme-border-primary theme-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {note.isPinned && (
                <Icons.Star size={16} className="text-theme-accent-yellow" />
              )}
              <h1 className="text-xl font-semibold text-theme-text-primary">
                {note.title}
              </h1>
            </div>

            {/* Task Progress */}
            <div className="mt-2">
              <TaskProgress content={note.content} size="sm" />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Actions Bar */}
            <div className="flex items-center theme-bg-tertiary rounded-md p-1 space-x-1">
              {/* Pin Button */}
              {onTogglePin && !isTrashView && (
                <button
                  onClick={() => onTogglePin(note)}
                  className={`p-1.5 rounded transition-colors ${
                    note.isPinned
                      ? 'text-theme-accent-yellow hover:text-theme-accent-orange bg-theme-bg-quaternary'
                      : 'text-theme-text-tertiary hover:text-theme-accent-yellow hover:theme-bg-quaternary'
                  }`}
                  title={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Icons.Star size={14} />
                </button>
              )}

              {/* View Mode Toggle */}
              {onViewModeChange && !isTrashView && (
                <button
                  onClick={() =>
                    onViewModeChange(
                      viewMode === 'preview' ? 'edit' : 'preview'
                    )
                  }
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'edit'
                      ? 'text-theme-accent-cyan bg-theme-bg-quaternary'
                      : 'text-theme-text-tertiary hover:text-theme-accent-cyan hover:theme-bg-quaternary'
                  }`}
                  title={
                    viewMode === 'edit' ? 'Switch to preview' : 'Switch to edit'
                  }
                >
                  {viewMode === 'edit' ? (
                    <Icons.EditActive size={14} />
                  ) : (
                    <Icons.Edit size={14} />
                  )}
                </button>
              )}

              {/* More Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-theme-text-tertiary hover:text-theme-text-secondary hover:theme-bg-quaternary rounded transition-colors"
                  title="More options"
                >
                  <Icons.MoreVertical size={14} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 w-48 z-10">
                    {isTrashView ? (
                      // Trash view actions
                      <>
                        <button
                          onClick={() => {
                            onRestoreNote?.(note)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-theme-accent-green hover:theme-bg-tertiary transition-colors"
                        >
                          Restore Note
                        </button>

                        <div className="border-t border-theme-border-primary my-1"></div>

                        <button
                          onClick={() => {
                            onPermanentDelete?.(note)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-theme-accent-red hover:theme-bg-tertiary transition-colors"
                        >
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      // Normal view actions
                      <>
                        {onDuplicate && (
                          <button
                            onClick={() => {
                              onDuplicate(note)
                              setShowMenu(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
                          >
                            <Icons.Copy size={14} />
                            <span>Duplicate Note</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowExportDialog(true)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
                        >
                          <Icons.Download size={14} />
                          <span>Export Note</span>
                        </button>

                        <div className="border-t border-theme-border-primary my-1"></div>

                        {onDelete && (
                          <button
                            onClick={() => {
                              onDelete(note)
                              setShowMenu(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-theme-accent-red hover:theme-bg-tertiary transition-colors flex items-center space-x-2"
                          >
                            <Icons.Trash size={14} />
                            <span>Delete Note</span>
                          </button>
                        )}
                      </>
                    )}

                    <div className="border-t border-theme-border-primary my-1"></div>

                    <div className="px-3 py-1">
                      <div className="text-xs text-theme-text-muted mb-1">
                        Notebook
                      </div>
                      <div className="text-xs text-theme-text-secondary">
                        {note.notebook}
                      </div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-xs text-theme-text-muted mb-1">
                        Created
                      </div>
                      <div className="text-xs text-theme-text-secondary">
                        {note.date}
                      </div>
                    </div>
                    {note.updatedAt && (
                      <div className="px-3 py-1">
                        <div className="text-xs text-theme-text-muted mb-1">
                          Modified
                        </div>
                        <div className="text-xs text-theme-text-secondary">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center space-x-2 mt-3">
            {note.tags.map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-xl border ${getTagStyle(tag)}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative theme-bg-primary custom-scrollbar">
        <div
          key={settings.theme}
          className="p-6 markdown-content"
          style={{
            color: 'var(--color-base0)',
            lineHeight: '1.4',
            maxWidth: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
        />
      </div>

      {/* Footer removed - stats shown in editor status bar */}

      {/* Export Dialog */}
      <ExportDialog
        isVisible={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        notes={[note]}
        type="single"
      />
    </div>
  )
}

NotePreview.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    notebook: PropTypes.string,
    tags: PropTypes.array,
    isPinned: PropTypes.bool,
    date: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onTogglePin: PropTypes.func,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  viewMode: PropTypes.oneOf(['preview', 'edit']),
  onViewModeChange: PropTypes.func,
  isTrashView: PropTypes.bool,
  onRestoreNote: PropTypes.func,
  onPermanentDelete: PropTypes.func,
  onExport: PropTypes.func,
}

NotePreview.defaultProps = {
  onEdit: null,
  onTogglePin: null,
  onDuplicate: null,
  onDelete: null,
  viewMode: 'preview',
  onViewModeChange: null,
  isTrashView: false,
  onRestoreNote: null,
  onPermanentDelete: null,
  onExport: null,
}

// Memoize the component to prevent unnecessary re-renders
export default memo(NotePreview, (prevProps, nextProps) => {
  return (
    prevProps.note?.id === nextProps.note?.id &&
    prevProps.note?.content === nextProps.note?.content &&
    prevProps.note?.title === nextProps.note?.title &&
    prevProps.note?.updatedAt === nextProps.note?.updatedAt &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isTrashView === nextProps.isTrashView
  )
})
