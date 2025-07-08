import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Icons from './Icons'
import ExportDialog from './ExportDialog'

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
  const [showMenu, setShowMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const menuRef = useRef(null)

  // Get tag color from localStorage or fallback to predefined colors
  const getTagColor = tag => {
    // Get stored tag colors
    const storedColors = localStorage.getItem('inkrun-tag-colors')
    const customColors = storedColors ? JSON.parse(storedColors) : {}

    // Color mapping
    const colorClasses = {
      default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    }

    // Predefined tag colors for common tags
    const predefinedColors = {
      project: 'blue',
      planning: 'green',
      documentation: 'purple',
      architecture: 'cyan',
      api: 'orange',
      reference: 'pink',
      'user-guide': 'indigo',
      help: 'amber',
      setup: 'emerald',
      development: 'red',
      learning: 'violet',
      vim: 'default',
    }

    // Check custom colors first, then predefined, then default
    const colorKey = customColors[tag] || predefinedColors[tag] || 'default'
    return colorClasses[colorKey] || colorClasses.default
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
      <div className="flex-1 bg-solarized-base03 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-solarized-base2 mb-4">
            No note selected
          </h3>
          <p className="text-solarized-base1 mb-6">
            Select a note from the list to view it here
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-solarized-base1">Create note</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
                  ⌘
                </kbd>
                <span className="text-solarized-base1">+</span>
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
                  N
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <span className="text-solarized-base1">Search notes</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
                  ⌘
                </kbd>
                <span className="text-solarized-base1">+</span>
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
                  F
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <span className="text-solarized-base1">Recent files</span>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
                  ⌘
                </kbd>
                <span className="text-solarized-base1">+</span>
                <kbd className="px-2 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded">
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
    if (!note.content)
      return '<p class="text-solarized-base1">This note is empty</p>'

    const html = marked(note.content, {
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
    })

    return DOMPurify.sanitize(html)
  }

  return (
    <div className="flex-1 bg-solarized-base03 flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-solarized-base01 bg-solarized-base02">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {note.isPinned && (
                <Icons.Star size={16} className="text-solarized-yellow" />
              )}
              <h1 className="text-xl font-semibold text-solarized-base5">
                {note.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-solarized-base01 text-solarized-base2 rounded">
                {note.notebook}
              </span>
              <span className="text-xs text-solarized-base0">{note.date}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Actions Bar */}
            <div className="flex items-center bg-solarized-base01 rounded-md p-1 space-x-1">
              {/* Pin Button */}
              {onTogglePin && !isTrashView && (
                <button
                  onClick={() => onTogglePin(note)}
                  className={`p-1.5 rounded transition-colors ${
                    note.isPinned
                      ? 'text-solarized-yellow hover:text-solarized-orange bg-solarized-base00'
                      : 'text-solarized-base1 hover:text-solarized-yellow hover:bg-solarized-base00'
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
                      ? 'text-solarized-cyan bg-solarized-base00'
                      : 'text-solarized-base1 hover:text-solarized-cyan hover:bg-solarized-base00'
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
                  className="p-1.5 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base00 rounded transition-colors"
                  title="More options"
                >
                  <Icons.MoreVertical size={14} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-solarized-base02 border border-solarized-base01 rounded shadow-lg py-1 w-48 z-10">
                    {isTrashView ? (
                      // Trash view actions
                      <>
                        <button
                          onClick={() => {
                            onRestoreNote?.(note)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-solarized-green hover:bg-solarized-base01 transition-colors"
                        >
                          Restore Note
                        </button>

                        <div className="border-t border-solarized-base01 my-1"></div>

                        <button
                          onClick={() => {
                            onPermanentDelete?.(note)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-solarized-red hover:bg-solarized-base01 transition-colors"
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
                            className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors flex items-center space-x-2"
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
                          className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors flex items-center space-x-2"
                        >
                          <Icons.Download size={14} />
                          <span>Export Note</span>
                        </button>

                        <div className="border-t border-solarized-base01 my-1"></div>

                        {onDelete && (
                          <button
                            onClick={() => {
                              onDelete(note)
                              setShowMenu(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-solarized-red hover:bg-solarized-base01 transition-colors flex items-center space-x-2"
                          >
                            <Icons.Trash size={14} />
                            <span>Delete Note</span>
                          </button>
                        )}
                      </>
                    )}

                    <div className="border-t border-solarized-base01 my-1"></div>

                    <div className="px-3 py-1">
                      <div className="text-xs text-solarized-base0 mb-1">
                        Notebook
                      </div>
                      <div className="text-xs text-solarized-base2">
                        {note.notebook}
                      </div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-xs text-solarized-base0 mb-1">
                        Created
                      </div>
                      <div className="text-xs text-solarized-base2">
                        {note.date}
                      </div>
                    </div>
                    {note.updatedAt && (
                      <div className="px-3 py-1">
                        <div className="text-xs text-solarized-base0 mb-1">
                          Modified
                        </div>
                        <div className="text-xs text-solarized-base2">
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
                className={`text-xs px-2 py-1 rounded border ${getTagColor(tag)}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative bg-solarized-base03">
        <div
          className="p-6 prose prose-invert max-w-none"
          style={{
            color: '#839496',
            lineHeight: '1.7',
          }}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
        />
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 bg-solarized-base02 border-t border-solarized-base01 text-xs text-solarized-base0 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>
            Words:{' '}
            {note.content
              ? note.content.split(/\s+/).filter(word => word.length > 0).length
              : 0}
          </span>
          <span>Characters: {note.content ? note.content.length : 0}</span>
          <span>
            Lines: {note.content ? note.content.split('\n').length : 0}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Last modified: {note.updatedAt || note.date}</span>
        </div>
      </div>

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

export default NotePreview
