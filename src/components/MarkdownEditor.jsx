import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import * as monaco from 'monaco-editor'
import { initVimMode } from 'monaco-vim'
import TagManager from './TagManager'
import Icons from './Icons'
import ExportDialog from './ExportDialog'
import { useSettings } from '../hooks/useSettings'

const MarkdownEditor = ({
  note,
  onSave,
  onClose,
  toast,
  showPreviewToggle = false,
  onTogglePreview,
  isPreviewVisible = false,
  allTags = [],
}) => {
  const { settings } = useSettings()
  const [content, setContent] = useState(note?.content || '')
  const [title, setTitle] = useState(note?.title || 'Untitled Note')

  // Update content and title when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content || '')
      setTitle(note.title || 'Untitled Note')
    }
  }, [note?.id, note?.content, note?.title])
  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showEditorMenu, setShowEditorMenu] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [showNotebookSelector, setShowNotebookSelector] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState(
    note?.notebook || 'Personal'
  )
  const [selectedStatus, setSelectedStatus] = useState(note?.status || 'draft')
  const editorRef = useRef(null)
  const autoSaveTimeoutRef = useRef(null)
  const editorMenuRef = useRef(null)

  // Solarized Dark theme for Monaco with enhanced markdown support
  const solarizedTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Markdown specific tokens
      { token: 'heading', foreground: 'fdf6e3', fontStyle: 'bold' },
      { token: 'heading.1', foreground: 'fdf6e3', fontStyle: 'bold' },
      { token: 'heading.2', foreground: 'eee8d5', fontStyle: 'bold' },
      { token: 'heading.3', foreground: '93a1a1', fontStyle: 'bold' },
      { token: 'heading.4', foreground: '839496', fontStyle: 'bold' },
      { token: 'heading.5', foreground: '657b83', fontStyle: 'bold' },
      { token: 'heading.6', foreground: '586e75', fontStyle: 'bold' },

      // Markdown formatting
      { token: 'emphasis', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'strong', foreground: 'eee8d5', fontStyle: 'bold' },
      { token: 'markup.bold', foreground: 'eee8d5', fontStyle: 'bold' },
      { token: 'markup.italic', foreground: '93a1a1', fontStyle: 'italic' },
      {
        token: 'markup.strikethrough',
        foreground: '586e75',
        fontStyle: 'strikethrough',
      },

      // Code and quotes
      {
        token: 'markup.inline.raw',
        foreground: '2aa198',
        background: '002B36',
      },
      {
        token: 'markup.fenced_code',
        foreground: '2aa198',
        background: '002B36',
      },
      { token: 'markup.quote', foreground: '93a1a1', fontStyle: 'italic' },

      // Links
      { token: 'markup.underline.link', foreground: '268bd2' },
      { token: 'markup.link', foreground: '268bd2' },
      { token: 'meta.link', foreground: '657b83' },

      // Lists
      { token: 'markup.list', foreground: 'eee8d5' },
      { token: 'markup.list.numbered', foreground: 'eee8d5' },
      { token: 'markup.list.unnumbered', foreground: 'eee8d5' },

      // General tokens
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'keyword', foreground: '859900' },
      { token: 'delimiter', foreground: '93a1a1' },
      { token: 'punctuation', foreground: '93a1a1' },
    ],
    colors: {
      'editor.background': '#00141A',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#002B36',
      'editor.selectionBackground': '#073642',
      'editor.inactiveSelectionBackground': '#002B36',
      'editorCursor.foreground': '#93a1a1',
      'editorLineNumber.foreground': '#586e75',
      'editorLineNumber.activeForeground': '#93a1a1',
      'editor.selectionHighlightBackground': '#073642',
      'editor.wordHighlightBackground': '#073642',
      'editor.findMatchBackground': '#268bd2',
      'editor.findMatchHighlightBackground': '#2aa198',
      'editorBracketMatch.background': '#073642',
      'editorBracketMatch.border': '#268bd2',
      'editorIndentGuide.background': '#073642',
      'editorIndentGuide.activeBackground': '#268bd2',
      'editorRuler.foreground': '#073642',
    },
  }

  useEffect(() => {
    // Define theme when Monaco is available
    monaco.editor.defineTheme('solarized-dark', solarizedTheme)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && settings.autoSave) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new timeout for auto-save using settings interval
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave(true) // true indicates auto-save
      }, settings.autoSaveInterval * 1000)
    }

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [
    hasUnsavedChanges,
    content,
    title,
    settings.autoSave,
    settings.autoSaveInterval,
  ])

  // Track content changes
  useEffect(() => {
    const hasChanged =
      content !== (note?.content || '') ||
      title !== (note?.title || 'Untitled Note')
    setHasUnsavedChanges(hasChanged)
  }, [content, title, note])

  // Close editor menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        editorMenuRef.current &&
        !editorMenuRef.current.contains(event.target)
      ) {
        setShowEditorMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Formatting functions
  const insertMarkdown = (prefix, suffix = '', placeholder = 'text') => {
    const editor = editorRef.current
    if (!editor) return

    const model = editor.getModel()
    const selection = editor.getSelection()
    const selectedText = model.getValueInRange(selection) || placeholder

    const replacement = `${prefix}${selectedText}${suffix}`

    editor.executeEdits('markdown-formatting', [
      {
        range: selection,
        text: replacement,
      },
    ])

    // Focus back to editor
    editor.focus()
  }

  const formatBold = () => insertMarkdown('**', '**', 'bold text')
  const formatItalic = () => insertMarkdown('*', '*', 'italic text')
  const formatCode = () => insertMarkdown('`', '`', 'code')
  const formatLink = () => insertMarkdown('[', '](url)', 'link text')
  const formatList = () => insertMarkdown('- ', '', 'list item')
  const formatQuote = () => insertMarkdown('> ', '', 'quote')
  const formatHeading = () => insertMarkdown('# ', '', 'heading')

  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor

    // Make editor available globally
    window.activeEditor = editor
    window.monaco = monacoInstance
    window.initVimMode = initVimMode

    // Define theme using monaco instance
    monacoInstance.editor.defineTheme('solarized-dark', solarizedTheme)
    monacoInstance.editor.setTheme('solarized-dark')

    // Keyboard shortcuts
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        handleSave()
      }
    )
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyB,
      () => {
        formatBold()
      }
    )
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyI,
      () => {
        formatItalic()
      }
    )
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyK,
      () => {
        formatLink()
      }
    )
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyE,
      () => {
        formatCode()
      }
    )

    // Focus editor
    editor.focus()
  }

  const handleSave = (isAutoSave = false) => {
    const noteData = {
      ...note,
      title: title,
      content: content,
      notebook: selectedNotebook,
      updatedAt: new Date().toISOString(),
    }
    onSave?.(noteData)

    if (!isAutoSave) {
      setHasUnsavedChanges(false)
    }
  }

  const handleNotebookChange = notebook => {
    setSelectedNotebook(notebook)
    setShowNotebookSelector(false)
    setShowEditorMenu(false)
    // Trigger auto-save
    setHasUnsavedChanges(true)
    toast?.success(`Notebook changed to "${notebook}"`)
  }

  // Available notebooks (could be moved to a context or prop)
  const availableNotebooks = [
    'Personal',
    'Work',
    'Projects',
    'Learning',
    'Archive',
  ]

  const getPreviewHtml = () => {
    if (!content)
      return '<p class="text-solarized-base1">Start writing in markdown...</p>'

    const html = marked(content, {
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
    })

    return DOMPurify.sanitize(html)
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} bg-solarized-base03 flex flex-col font-mono`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-solarized-base01 bg-solarized-base02">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-medium bg-transparent text-solarized-base5 border-none outline-none flex-1"
            placeholder="Note title..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative" ref={editorMenuRef}>
            <button
              onClick={() => setShowEditorMenu(!showEditorMenu)}
              className="p-2 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01 rounded transition-colors"
              title="More options"
            >
              <Icons.MoreVertical size={16} />
            </button>

            {showEditorMenu && (
              <div className="absolute right-0 top-10 bg-solarized-base02 border border-solarized-base01 rounded shadow-lg py-1 w-48 z-10">
                <button
                  onClick={() => {
                    handleSave(false)
                    setShowEditorMenu(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    hasUnsavedChanges
                      ? 'text-solarized-orange hover:bg-solarized-base01'
                      : 'text-solarized-base3 hover:bg-solarized-base01'
                  }`}
                >
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </button>

                <button
                  onClick={() => {
                    setShowTagManager(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                >
                  Manage Tags
                </button>

                <button
                  onClick={() => {
                    setShowNotebookSelector(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                >
                  Change Notebook
                </button>

                <button
                  onClick={() => {
                    setShowStatusSelector(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                >
                  Change Status
                </button>

                <div className="border-t border-solarized-base01 my-1"></div>

                <button
                  onClick={() => {
                    setShowExportDialog(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                >
                  Export Note
                </button>

                <button
                  onClick={() => {
                    // Copy markdown to clipboard
                    navigator.clipboard
                      .writeText(content)
                      .then(() => {
                        toast?.success('Markdown copied to clipboard')
                      })
                      .catch(() => {
                        toast?.error('Failed to copy to clipboard')
                      })
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                >
                  Copy Markdown
                </button>

                <div className="border-t border-solarized-base01 my-1"></div>

                {onClose && (
                  <button
                    onClick={() => {
                      onClose()
                      setShowEditorMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-solarized-base3 hover:bg-solarized-base01 transition-colors"
                  >
                    Close Editor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-4 py-2 bg-solarized-base02 border-b border-solarized-base01">
        <div className="flex items-center space-x-2">
          <button
            onClick={formatBold}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={formatItalic}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors italic"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={formatCode}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors font-mono"
            title="Code"
          >
            Code
          </button>
          <button
            onClick={formatLink}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors"
            title="Link"
          >
            Link
          </button>
          <button
            onClick={formatList}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors"
            title="List"
          >
            List
          </button>
          <button
            onClick={formatQuote}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors"
            title="Quote"
          >
            Quote
          </button>
          <button
            onClick={formatHeading}
            className="px-2 py-1 text-xs border border-solarized-base01 text-solarized-base1 hover:bg-solarized-base01 rounded transition-colors"
            title="Heading"
          >
            H
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Editor */}
        <div
          className={`${showPreview ? 'w-1/2 border-r border-solarized-base01' : 'w-full'} flex flex-col`}
        >
          <div className="flex-1" style={{ minHeight: '400px' }}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={content}
              onChange={value => setContent(value || '')}
              onMount={handleEditorDidMount}
              theme="solarized-dark"
              options={{
                fontSize: settings.fontSize,
                fontFamily: `${settings.fontFamily}, JetBrains Mono, Monaco, Consolas, monospace`,
                lineNumbers: settings.lineNumbers ? 'on' : 'off',
                minimap: { enabled: settings.minimap },
                scrollBeyondLastLine: false,
                wordWrap: settings.wordWrap ? 'on' : 'off',
                lineHeight: 1.7,
                letterSpacing: 0.3,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 20, bottom: 20 },
                renderLineHighlight: 'all',
                selectionHighlight: true,
                occurrencesHighlight: true,
                rulers: [80, 100],
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true,
                  highlightActiveIndentation: true,
                },
                // IDE-like features
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: true,
                suggest: {
                  showWords: true,
                  showSnippets: true,
                },
                // Markdown specific
                wordBasedSuggestions: 'allDocuments',
                links: true,
                colorDecorators: true,
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                // Performance
                renderWhitespace: 'boundary',
                renderControlCharacters: false,
                renderIndentGuides: true,
                highlightActiveIndentGuide: true,
              }}
            />
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto bg-solarized-base03">
            <div
              className="p-6 prose prose-invert max-w-none"
              style={{
                color: '#839496',
                lineHeight: '1.7',
              }}
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="fixed bottom-6 right-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-2xl p-2 flex flex-col space-y-2 z-20">
          <button
            onClick={togglePreview}
            className={`p-2 transition-colors border-0 bg-transparent hover:bg-transparent ${
              showPreview ? 'text-white' : 'text-white/70'
            }`}
            title={showPreview ? 'Hide Inline Preview' : 'Show Inline Preview'}
          >
            {showPreview ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
          </button>

          {showPreviewToggle && onTogglePreview && (
            <button
              onClick={onTogglePreview}
              className={`p-2 transition-colors border-0 bg-transparent hover:bg-transparent ${
                isPreviewVisible ? 'text-white' : 'text-white/70'
              }`}
              title={
                isPreviewVisible ? 'Hide Preview Panel' : 'Show Preview Panel'
              }
            >
              <Icons.PanelRight size={16} />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 transition-colors border-0 bg-transparent hover:bg-transparent ${
              isFullscreen ? 'text-white' : 'text-white/70'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Icons.Minimize size={16} />
            ) : (
              <Icons.Maximize size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-solarized-base02 border-t border-solarized-base01 text-xs text-solarized-base0 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>Lines: {content.split('\n').length}</span>
          <span>
            Words: {content.split(/\s+/).filter(word => word.length > 0).length}
          </span>
          <span>Characters: {content.length}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Markdown</span>
          <span>UTF-8</span>
          <span
            className={
              hasUnsavedChanges
                ? 'text-solarized-orange'
                : 'text-solarized-green'
            }
          >
            {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
          </span>
        </div>
      </div>

      {/* Tag Manager Modal */}
      {showTagManager && (
        <TagManager
          note={note}
          onSave={onSave}
          onClose={() => setShowTagManager(false)}
          allTags={allTags}
        />
      )}

      {/* Notebook Selector Modal */}
      {showNotebookSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-solarized-base5">
                Change Notebook
              </h2>
              <button
                onClick={() => setShowNotebookSelector(false)}
                className="text-solarized-base1 hover:text-solarized-base3 transition-colors border-0 bg-transparent hover:bg-transparent p-1"
              >
                <Icons.X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {availableNotebooks.map(notebook => (
                <button
                  key={notebook}
                  onClick={() => handleNotebookChange(notebook)}
                  className={`w-full px-3 py-2 text-left rounded transition-colors ${
                    selectedNotebook === notebook
                      ? 'bg-solarized-blue text-solarized-base5'
                      : 'text-solarized-base3 hover:bg-solarized-base01'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icons.FolderOpen size={14} />
                    <span>{notebook}</span>
                    {selectedNotebook === notebook && (
                      <Icons.Check size={14} className="ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-solarized-base01">
              <button
                onClick={() => setShowNotebookSelector(false)}
                className="w-full px-4 py-2 bg-solarized-base01 text-solarized-base3 rounded hover:bg-solarized-base00 transition-colors text-sm border-0"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Selector Modal */}
      {showStatusSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl w-80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-solarized-base5">
                Change Status
              </h3>
              <button
                onClick={() => setShowStatusSelector(false)}
                className="text-solarized-base1 hover:text-solarized-base3 border-0 bg-transparent hover:bg-transparent p-1"
              >
                <Icons.X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {['draft', 'in-progress', 'review', 'completed', 'archived'].map(
                status => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status)
                      const statusUpdate = {
                        ...note,
                        title,
                        content,
                        notebook: selectedNotebook,
                        status: status,
                      }
                      onSave(statusUpdate)
                      setShowStatusSelector(false)
                    }}
                    className={`w-full px-3 py-2 text-left rounded transition-colors ${
                      selectedStatus === status
                        ? 'bg-solarized-blue text-solarized-base5'
                        : 'text-solarized-base3 hover:bg-solarized-base01'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === 'draft'
                            ? 'bg-gray-400'
                            : status === 'in-progress'
                              ? 'bg-yellow-400'
                              : status === 'review'
                                ? 'bg-blue-400'
                                : status === 'completed'
                                  ? 'bg-green-400'
                                  : 'bg-gray-600'
                        }`}
                      />
                      <span className="capitalize">
                        {status.replace('-', ' ')}
                      </span>
                      {selectedStatus === status && (
                        <Icons.Check size={14} className="ml-auto" />
                      )}
                    </div>
                  </button>
                )
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-solarized-base01">
              <button
                onClick={() => setShowStatusSelector(false)}
                className="w-full px-4 py-2 bg-solarized-base01 text-solarized-base3 rounded hover:bg-solarized-base00 transition-colors text-sm border-0"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        isVisible={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        notes={[{ ...note, title, content, notebook: selectedNotebook }]}
        type="single"
      />
    </div>
  )
}

export default MarkdownEditor
