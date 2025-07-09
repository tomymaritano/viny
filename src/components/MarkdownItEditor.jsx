import { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import MarkdownIt from 'markdown-it'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import Icons from './Icons'
import CodeMirrorEditor from './CodeMirrorEditor'
import { useSettings } from '../hooks/useSettings'

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
  const previewRef = useRef(null)
  const [showNotebookSelector, setShowNotebookSelector] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState('')

  // Calculate stats and render preview
  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length
    const chars = value.length
    setWordCount(words)
    setCharCount(chars)

    // Render preview with debounce
    const timer = setTimeout(() => {
      if (!value) {
        setRenderedHtml(
          '<div class="empty-state">Start typing to see your markdown rendered here...</div>'
        )
      } else {
        try {
          const rendered = md.render(value)
          setRenderedHtml(rendered)
        } catch (error) {
          console.error('Markdown render error:', error)
          setRenderedHtml(
            '<div class="empty-state" style="color: var(--color-red);">Error rendering markdown</div>'
          )
        }
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [value])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        onSave?.()
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
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSave, onTogglePreview, onExport, isFullscreen])

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
  const toggleBold = () => {
    insertText('**bold text**')
  }

  const toggleItalic = () => {
    insertText('*italic text*')
  }

  const insertHeading = level => {
    const prefix = '#'.repeat(level) + ' '
    insertText('\n' + prefix + 'Heading\n')
  }

  const insertLink = () => {
    insertText('[link text](https://example.com)')
  }

  const insertImage = () => {
    insertText('![alt text](image-url.jpg)')
  }

  const insertList = () => {
    insertText('\n- Item 1\n- Item 2\n- Item 3\n')
  }

  const insertOrderedList = () => {
    insertText('\n1. Item 1\n2. Item 2\n3. Item 3\n')
  }

  const insertCheckbox = () => {
    insertText('\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n')
  }

  const insertCode = () => {
    insertText('\n```javascript\n// code here\n```\n')
  }

  const insertQuote = () => {
    insertText('\n> Quote text\n')
  }

  const insertTable = () => {
    insertText(
      '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'
    )
  }

  return (
    <div
      className={`flex flex-col h-full theme-bg-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
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
        <div
          className={`flex-1 flex flex-col ${isPreviewVisible ? 'w-1/2' : 'w-full'}`}
        >
          <div className="markdown-editor">
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              className="enhanced-markdown-textarea"
              style={{
                fontFamily: settings?.fontFamily || 'var(--font-family-editor)',
                fontSize: settings?.fontSize || 'var(--font-size-editor)',
                lineHeight: settings?.lineHeight || 'var(--line-height)',
              }}
              placeholder="Start writing your markdown here..."
              spellCheck={settings?.spellCheck !== false}
            />
          </div>
        </div>

        {/* Preview */}
        {isPreviewVisible && (
          <div className="w-1/2 flex flex-col border-l border-theme-border-primary">
            <div
              className="flex-1 overflow-y-auto p-4 prose prose-theme markdown-font"
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{
                fontFamily:
                  settings?.markdownFontFamily || 'var(--font-family-markdown)',
                fontSize:
                  settings?.markdownFontSize || 'var(--font-size-markdown)',
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-theme-border-primary theme-bg-secondary text-xs text-theme-text-muted">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
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
