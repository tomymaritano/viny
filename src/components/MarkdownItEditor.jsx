import { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import MarkdownIt from 'markdown-it'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import Icons from './Icons'
import InkdropEditor from './InkdropEditor'
import LoadingSpinner from './LoadingSpinner'
import { useSettings } from '../hooks/useSettings'
import { useAutoSave } from '../hooks/useAutoSave'

// Configure markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  },
})
  .use(markdownItEmoji)
  .use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })

const MarkdownItEditor = ({
  value = '',
  onChange,
  onSave,
  selectedNote,
  onNotebookChange,
  onExport,
  onTogglePreview,
  isPreviewVisible = false,
  notebooks = [],
}) => {
  const { settings } = useSettings()
  // previewRef removed - preview now handled externally
  const [showNotebookSelector, setShowNotebookSelector] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // renderedHtml removed - preview now handled externally
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [lastSaved, setLastSaved] = useState(null)

  // Memoize all callbacks to prevent re-renders
  const handleTitleChange = useCallback(
    e => {
      if (selectedNote && onSave) {
        const updatedNote = { ...selectedNote, title: e.target.value }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )

  const handleNotebookChange = useCallback(
    e => {
      if (onNotebookChange) {
        onNotebookChange(e.target.value)
      }
    },
    [onNotebookChange]
  )

  const handleStatusChange = useCallback(
    e => {
      if (selectedNote && onSave) {
        const updatedNote = { ...selectedNote, status: e.target.value }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )

  const handleTagsChange = useCallback(
    e => {
      if (selectedNote && onSave) {
        const tags = e.target.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)
        const updatedNote = { ...selectedNote, tags }
        onSave(updatedNote)
      }
    },
    [selectedNote, onSave]
  )

  // Auto-save implementation with debounce
  const autoSaveFunction = useCallback(
    async content => {
      if (selectedNote && onSave && content !== undefined) {
        try {
          const updatedNote = { ...selectedNote, content }
          await onSave(updatedNote)
          setLastSaved(new Date())
          setSaveError(null)
        } catch (error) {
          setSaveError(error.message || 'Failed to save')
          throw error
        }
      }
    },
    [selectedNote, onSave]
  )

  // Use auto-save hook
  const { saveNow, hasUnsavedChanges } = useAutoSave(
    autoSaveFunction,
    value,
    2000, // 2 second debounce
    {
      enabled: !!selectedNote,
      onSaveStart: () => setIsSaving(true),
      onSaveComplete: () => setIsSaving(false),
      onSaveError: error => {
        setIsSaving(false)
        setSaveError(error.message || 'Auto-save failed')
      },
    }
  )

  const handleKeyDown = useCallback(
    e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveNow() // Use the auto-save function for manual save
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        onTogglePreview?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        onExport?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    },
    [selectedNote, saveNow, onTogglePreview, onExport, isFullscreen]
  )

  // Calculate stats and render preview
  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
    const chars = value.length
    setWordCount(words)
    setCharCount(chars)

    // Preview rendering now handled by external PreviewPanel
  }, [value])

  // Handle keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Insert text at cursor - simplified for CodeMirror
  const insertText = useCallback(
    text => {
      // For now, just append the text at the end
      // TODO: Implement proper cursor position handling with CodeMirror
      onChange(value + text)
    },
    [value, onChange]
  )

  // Toolbar actions
  const toggleBold = useCallback(() => {
    insertText('**bold text**')
  }, [insertText])

  const toggleItalic = useCallback(() => {
    insertText('*italic text*')
  }, [insertText])

  const insertHeading = useCallback(
    level => {
      const prefix = '#'.repeat(level) + ' '
      insertText('\n' + prefix + 'Heading\n')
    },
    [insertText]
  )

  const insertLink = useCallback(() => {
    insertText('[link text](https://example.com)')
  }, [insertText])

  const insertImage = useCallback(() => {
    insertText('![alt text](image-url.jpg)')
  }, [insertText])

  const insertList = useCallback(() => {
    insertText('\n- Item 1\n- Item 2\n- Item 3\n')
  }, [insertText])

  const insertOrderedList = useCallback(() => {
    insertText('\n1. Item 1\n2. Item 2\n3. Item 3\n')
  }, [insertText])

  const insertCheckbox = useCallback(() => {
    insertText('\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n')
  }, [insertText])

  const insertCode = useCallback(() => {
    insertText('\n```javascript\n// code here\n```\n')
  }, [insertText])

  const insertQuote = useCallback(() => {
    insertText('\n> Quote text\n')
  }, [insertText])

  const insertTable = useCallback(() => {
    insertText(
      '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'
    )
  }, [insertText])

  return (
    <div
      className={`flex flex-col h-full theme-bg-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Note Header */}
      {selectedNote && (
        <div className="px-4 py-3 border-b border-theme-border-primary theme-bg-secondary">
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={selectedNote.title || ''}
              onChange={handleTitleChange}
              className="text-lg font-semibold bg-transparent border-none outline-none text-theme-text-primary flex-1 mr-4"
              placeholder="Note title..."
            />
            <div className="flex items-center space-x-2 text-sm text-theme-text-muted">
              <select
                value={selectedNote.notebook || ''}
                onChange={handleNotebookChange}
                className="bg-transparent border border-theme-border-primary rounded px-2 py-1 text-theme-text-secondary"
              >
                <option value="">No notebook</option>
                {notebooks.map(notebook => (
                  <option key={notebook.id} value={notebook.name}>
                    {notebook.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedNote.status || 'active'}
                onChange={handleStatusChange}
                className="bg-transparent border border-theme-border-primary rounded px-2 py-1 text-theme-text-secondary"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={(selectedNote.tags || []).join(', ')}
              onChange={handleTagsChange}
              className="bg-transparent border border-theme-border-primary rounded px-2 py-1 text-sm text-theme-text-secondary flex-1"
              placeholder="Tags (comma separated)..."
            />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-theme-border-primary theme-bg-secondary">
        <div className="flex items-center space-x-1">
          {/* Formatting buttons */}
          <button
            onClick={toggleBold}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Icons.Bold size={16} />
          </button>
          <button
            onClick={toggleItalic}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Icons.Italic size={16} />
          </button>

          <div className="w-px h-6 bg-theme-border-primary mx-1" />

          {/* Headings */}
          <button
            onClick={() => insertHeading(1)}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors text-xs font-bold"
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => insertHeading(2)}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors text-xs font-bold"
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => insertHeading(3)}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors text-xs font-bold"
            title="Heading 3"
          >
            H3
          </button>

          <div className="w-px h-6 bg-theme-border-primary mx-1" />

          {/* Lists */}
          <button
            onClick={insertList}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Bullet List"
          >
            <Icons.List size={16} />
          </button>
          <button
            onClick={insertOrderedList}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Numbered List"
          >
            <Icons.ListOrdered size={16} />
          </button>
          <button
            onClick={insertCheckbox}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Task List"
          >
            <Icons.CheckSquare size={16} />
          </button>

          <div className="w-px h-6 bg-theme-border-primary mx-1" />

          {/* Insert elements */}
          <button
            onClick={insertLink}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Insert Link"
          >
            <Icons.Link size={16} />
          </button>
          <button
            onClick={insertImage}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Insert Image"
          >
            <Icons.Image size={16} />
          </button>
          <button
            onClick={insertCode}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Insert Code"
          >
            <Icons.Code size={16} />
          </button>
          <button
            onClick={insertQuote}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Insert Quote"
          >
            <Icons.Quote size={16} />
          </button>
          <button
            onClick={insertTable}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Insert Table"
          >
            <Icons.Table size={16} />
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePreview}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Toggle Preview (Ctrl+P)"
          >
            {isPreviewVisible ? (
              <Icons.EyeOff size={16} />
            ) : (
              <Icons.Eye size={16} />
            )}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded hover:theme-bg-tertiary transition-colors"
            title="Toggle Fullscreen (Ctrl+Shift+F)"
          >
            {isFullscreen ? (
              <Icons.Minimize size={16} />
            ) : (
              <Icons.Maximize size={16} />
            )}
          </button>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded hover:theme-bg-tertiary transition-colors"
              title="Exit Fullscreen"
            >
              <Icons.X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col w-full">
          <div className="markdown-editor">
            <InkdropEditor
              value={value}
              onChange={onChange}
              placeholder="Start writing your markdown here..."
            />
          </div>
        </div>

        {/* Preview removed - now handled by external PreviewPanel */}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-theme-border-primary theme-bg-secondary text-xs text-theme-text-muted">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>

          {/* Save status */}
          {isSaving && (
            <div className="flex items-center space-x-1">
              <LoadingSpinner size="small" color="secondary" />
              <span>Saving...</span>
            </div>
          )}

          {saveError && <span className="text-red-500">⚠ {saveError}</span>}

          {lastSaved && !isSaving && !saveError && (
            <span className="text-green-500">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {hasUnsavedChanges && !isSaving && (
            <span className="text-yellow-500">• Unsaved changes</span>
          )}

          {selectedNote && (
            <>
              <span>•</span>
              <span>
                Modified{' '}
                {new Date(
                  selectedNote.updatedAt || selectedNote.date
                ).toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedNote && (
            <div className="relative">
              <button
                onClick={() => setShowNotebookSelector(!showNotebookSelector)}
                className="flex items-center space-x-1 px-2 py-1 rounded hover:theme-bg-tertiary transition-colors"
              >
                <Icons.Book size={12} />
                <span>{selectedNote.notebook || 'No notebook'}</span>
                <Icons.ChevronDown size={12} />
              </button>

              {showNotebookSelector && (
                <div className="absolute bottom-full right-0 mb-1 w-48 theme-bg-primary border border-theme-border-primary rounded shadow-lg">
                  {notebooks.map(notebook => (
                    <button
                      key={notebook.id}
                      onClick={() => {
                        onNotebookChange?.(notebook.name)
                        setShowNotebookSelector(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:theme-bg-tertiary transition-colors ${
                        selectedNote.notebook === notebook.name
                          ? 'theme-bg-tertiary'
                          : ''
                      }`}
                    >
                      {notebook.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

MarkdownItEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  selectedNote: PropTypes.object,
  onNotebookChange: PropTypes.func,
  onExport: PropTypes.func,
  onTogglePreview: PropTypes.func,
  isPreviewVisible: PropTypes.bool,
  notebooks: PropTypes.array,
}

export default MarkdownItEditor
