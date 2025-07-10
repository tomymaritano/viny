import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import Editor from '@monaco-editor/react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import * as monaco from 'monaco-editor'
import { initVimMode } from 'monaco-vim'
import TagManager from './TagManager'
import Icons from './Icons'
import ExportDialog from './ExportDialog'
import { useSettings } from '../hooks/useSettings'
import { monacoOptions, initializeMonaco } from '../config/monaco'

const MarkdownEditor = ({
  note,
  onSave,
  onClose,
  toast,
  layoutMode = 'normal',
  onCycleLayoutMode,
  allTags = [],
}) => {
  const { settings } = useSettings()
  const [content, setContent] = useState(note?.content || '')
  const [title, setTitle] = useState(note?.title || 'Untitled Note')

  // Layout modes
  const LAYOUT_MODES = {
    NORMAL: 'normal',
    MARKDOWN: 'markdown',
    PREVIEW: 'preview',
    FOCUS: 'focus',
  }

  // Get layout mode info
  const getLayoutModeInfo = () => {
    const modes = {
      [LAYOUT_MODES.NORMAL]: {
        icon: <Icons.FileText size={12} />,
        label: 'Normal',
        title: 'Switch to Markdown Mode',
        description: 'Sidebar + Notes + Editor',
      },
      [LAYOUT_MODES.MARKDOWN]: {
        icon: <Icons.Markdown size={12} />,
        label: 'Markdown',
        title: 'Switch to Preview Mode',
        description: 'Sidebar + Editor (no notes list)',
      },
      [LAYOUT_MODES.PREVIEW]: {
        icon: <Icons.PanelRight size={12} />,
        label: 'Preview',
        title: 'Switch to Focus Mode',
        description: 'Sidebar + Notes + Editor + Preview Panel',
      },
      [LAYOUT_MODES.FOCUS]: {
        icon: <Icons.Maximize size={12} />,
        label: 'Focus',
        title: 'Switch to Normal Mode',
        description: 'Editor only (fullscreen)',
      },
    }
    return modes[layoutMode] || modes[LAYOUT_MODES.NORMAL]
  }

  // Update content and title when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content || '')
      setTitle(note.title || 'Untitled Note')
    }
  }, [note])
  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen] = useState(false)
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

  // Get CSS color values dynamically
  const getCSSColor = variable => {
    if (typeof window === 'undefined') return '#839496' // fallback for SSR
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim()
    return value || '#839496'
  }

  // Dynamic theme for Monaco with enhanced markdown support
  const getDynamicTheme = () => ({
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Markdown specific tokens
      {
        token: 'heading',
        foreground: getCSSColor('--color-base5'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.1',
        foreground: getCSSColor('--color-base5'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.2',
        foreground: getCSSColor('--color-base4'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.3',
        foreground: getCSSColor('--color-base1'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.4',
        foreground: getCSSColor('--color-base0'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.5',
        foreground: getCSSColor('--color-base0'),
        fontStyle: 'bold',
      },
      {
        token: 'heading.6',
        foreground: getCSSColor('--color-base0'),
        fontStyle: 'bold',
      },

      // Markdown formatting
      {
        token: 'emphasis',
        foreground: getCSSColor('--color-base1'),
        fontStyle: 'italic',
      },
      {
        token: 'strong',
        foreground: getCSSColor('--color-base4'),
        fontStyle: 'bold',
      },
      {
        token: 'markup.bold',
        foreground: getCSSColor('--color-base4'),
        fontStyle: 'bold',
      },
      {
        token: 'markup.italic',
        foreground: getCSSColor('--color-base1'),
        fontStyle: 'italic',
      },
      {
        token: 'markup.strikethrough',
        foreground: getCSSColor('--color-base0'),
        fontStyle: 'strikethrough',
      },

      // Code and quotes
      {
        token: 'markup.inline.raw',
        foreground: getCSSColor('--color-cyan'),
        background: '002B36',
      },
      {
        token: 'markup.fenced_code',
        foreground: getCSSColor('--color-cyan'),
        background: '002B36',
      },
      {
        token: 'markup.quote',
        foreground: getCSSColor('--color-base1'),
        fontStyle: 'italic',
      },

      // Links
      {
        token: 'markup.underline.link',
        foreground: getCSSColor('--color-blue'),
      },
      { token: 'markup.link', foreground: getCSSColor('--color-blue') },
      { token: 'meta.link', foreground: getCSSColor('--color-base0') },

      // Lists
      { token: 'markup.list', foreground: getCSSColor('--color-base4') },
      {
        token: 'markup.list.numbered',
        foreground: getCSSColor('--color-base4'),
      },
      {
        token: 'markup.list.unnumbered',
        foreground: getCSSColor('--color-base4'),
      },

      // General tokens
      {
        token: 'comment',
        foreground: getCSSColor('--color-base0'),
        fontStyle: 'italic',
      },
      { token: 'string', foreground: getCSSColor('--color-cyan') },
      { token: 'number', foreground: getCSSColor('--color-red') },
      { token: 'keyword', foreground: getCSSColor('--color-green') },
      { token: 'delimiter', foreground: getCSSColor('--color-base1') },
      { token: 'punctuation', foreground: getCSSColor('--color-base1') },
    ],
    colors: {
      'editor.background': getCSSColor('--color-base03'),
      'editor.foreground': getCSSColor('--color-base0'),
      'editor.lineHighlightBackground': getCSSColor('--color-base02'),
      'editor.selectionBackground': getCSSColor('--color-base01'),
      'editor.inactiveSelectionBackground': getCSSColor('--color-base02'),
      'editorCursor.foreground': getCSSColor('--color-base1'),
      'editorLineNumber.foreground': getCSSColor('--color-base0'),
      'editorLineNumber.activeForeground': getCSSColor('--color-base1'),
      'editor.selectionHighlightBackground': getCSSColor('--color-base01'),
      'editor.wordHighlightBackground': getCSSColor('--color-base01'),
      'editor.findMatchBackground': getCSSColor('--color-blue'),
      'editor.findMatchHighlightBackground': getCSSColor('--color-cyan'),
      'editorBracketMatch.background': getCSSColor('--color-base01'),
      'editorBracketMatch.border': getCSSColor('--color-blue'),
      'editorIndentGuide.background': getCSSColor('--color-base01'),
      'editorIndentGuide.activeBackground': getCSSColor('--color-blue'),
      'editorRuler.foreground': getCSSColor('--color-base01'),
    },
  })

  useEffect(() => {
    // Define theme when Monaco is available
    const dynamicTheme = getDynamicTheme()
    monaco.editor.defineTheme('dynamic-theme', dynamicTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.theme])

  // Update theme when settings change
  useEffect(() => {
    if (editorRef.current) {
      // Small delay to ensure CSS variables are updated
      setTimeout(() => {
        const dynamicTheme = getDynamicTheme()
        monaco.editor.defineTheme('dynamic-theme', dynamicTheme)
        monaco.editor.setTheme('dynamic-theme')
      }, 100)
    }
  }, [settings.theme])

  const handleSave = useCallback(
    (isAutoSave = false) => {
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
    },
    [note, title, content, selectedNotebook, onSave]
  )

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
    handleSave,
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

    // Initialize Monaco optimizations
    initializeMonaco()

    // Make editor available globally
    window.activeEditor = editor
    window.monaco = monacoInstance
    window.initVimMode = initVimMode

    // Define theme using monaco instance
    const dynamicTheme = getDynamicTheme()
    monacoInstance.editor.defineTheme('dynamic-theme', dynamicTheme)
    monacoInstance.editor.setTheme('dynamic-theme')

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
      return '<p class="text-theme-text-tertiary">Start writing in markdown...</p>'

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

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} theme-bg-primary flex flex-col editor-font`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border-primary theme-bg-secondary">
        <div className="flex items-center space-x-4 flex-1">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-medium bg-transparent text-theme-text-primary border-none outline-none flex-1"
            placeholder="Note title..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative" ref={editorMenuRef}>
            <button
              onClick={() => setShowEditorMenu(!showEditorMenu)}
              className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary hover:theme-bg-tertiary rounded transition-colors"
              title="More options"
            >
              <Icons.MoreVertical size={16} />
            </button>

            {showEditorMenu && (
              <div className="absolute right-0 top-10 theme-bg-secondary border border-theme-border-primary rounded shadow-lg py-1 w-48 z-10">
                <button
                  onClick={() => {
                    handleSave(false)
                    setShowEditorMenu(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    hasUnsavedChanges
                      ? 'text-theme-accent-orange hover:theme-bg-tertiary'
                      : 'text-theme-text-secondary hover:theme-bg-tertiary'
                  }`}
                >
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </button>

                <button
                  onClick={() => {
                    setShowTagManager(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                >
                  Manage Tags
                </button>

                <button
                  onClick={() => {
                    setShowNotebookSelector(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                >
                  Change Notebook
                </button>

                <button
                  onClick={() => {
                    setShowStatusSelector(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                >
                  Change Status
                </button>

                <div className="border-t border-theme-border-primary my-1"></div>

                <button
                  onClick={() => {
                    setShowExportDialog(true)
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                >
                  Export Note
                </button>

                <button
                  onClick={() => {
                    // Copy markdown to clipboard
                    if (
                      typeof navigator !== 'undefined' &&
                      navigator.clipboard
                    ) {
                      navigator.clipboard
                        .writeText(content)
                        .then(() => {
                          toast?.success('Markdown copied to clipboard')
                        })
                        .catch(() => {
                          toast?.error('Failed to copy to clipboard')
                        })
                    } else {
                      toast?.error('Clipboard API not available')
                    }
                    setShowEditorMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
                >
                  Copy Markdown
                </button>

                <div className="border-t border-theme-border-primary my-1"></div>

                {onClose && (
                  <button
                    onClick={() => {
                      onClose()
                      setShowEditorMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:theme-bg-tertiary transition-colors"
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
      <div className="px-4 py-2 theme-bg-secondary border-b border-theme-border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={formatBold}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              onClick={formatItalic}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors italic"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              onClick={formatCode}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors editor-font"
              title="Code"
            >
              Code
            </button>
            <button
              onClick={formatLink}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors"
              title="Link"
            >
              Link
            </button>
            <button
              onClick={formatList}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors"
              title="List"
            >
              List
            </button>
            <button
              onClick={formatQuote}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors"
              title="Quote"
            >
              Quote
            </button>
            <button
              onClick={formatHeading}
              className="px-2 py-1 text-xs border border-theme-border-primary text-theme-text-tertiary hover:theme-bg-tertiary rounded transition-colors"
              title="Heading"
            >
              H
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2">
            {/* Split Preview Toggle */}
            <button
              onClick={togglePreview}
              className={`px-2 py-1 text-xs border border-theme-border-primary rounded transition-colors flex items-center space-x-1 ${
                showPreview
                  ? 'bg-theme-accent-primary text-theme-bg-primary'
                  : 'text-theme-text-tertiary hover:theme-bg-tertiary'
              }`}
              title={showPreview ? 'Hide Split Preview' : 'Show Split Preview'}
            >
              <span>Split</span>
            </button>

            {/* Layout Mode Cycler */}
            {onCycleLayoutMode &&
              (() => {
                const modeInfo = getLayoutModeInfo()
                return (
                  <button
                    onClick={onCycleLayoutMode}
                    className="px-2 py-1 text-xs border border-theme-accent-primary rounded transition-colors flex items-center space-x-1 bg-theme-accent-primary text-theme-bg-primary hover:bg-theme-accent-primary/80"
                    title={modeInfo.title}
                  >
                    {modeInfo.icon}
                    <span>{modeInfo.label}</span>
                  </button>
                )
              })()}
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Editor */}
        <div
          className={`${showPreview ? 'w-1/2 border-r border-theme-border-primary' : 'w-full'} flex flex-col`}
        >
          <div className="flex-1" style={{ minHeight: '400px' }}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={content}
              onChange={value => setContent(value || '')}
              onMount={handleEditorDidMount}
              theme="dynamic-theme"
              options={{
                ...monacoOptions,
                fontSize: settings.fontSize || 14,
                fontFamily: `${settings.fontFamily || 'SF Mono'}, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace`,
                lineNumbers: settings.lineNumbers ? 'on' : 'off',
                minimap: { enabled: settings.minimap || false },
                wordWrap: settings.wordWrap ? 'on' : 'off',
                // Performance optimized settings
                lineHeight: 1.6,
                letterSpacing: 0,
                cursorBlinking: 'solid',
                cursorSmoothCaretAnimation: 'off',
                smoothScrolling: false,
                padding: { top: 10, bottom: 10 },
                renderLineHighlight: 'line',
                selectionHighlight: false,
                occurrencesHighlight: false,
                rulers: [],
                bracketPairColorization: { enabled: false },
                guides: {
                  bracketPairs: false,
                  indentation: false,
                  highlightActiveIndentation: false,
                },
                // Disable heavy features for better performance
                autoIndent: 'none',
                formatOnPaste: false,
                formatOnType: false,
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnCommitCharacter: false,
                acceptSuggestionOnEnter: 'off',
                quickSuggestions: false,
                suggest: {
                  showWords: false,
                  showSnippets: false,
                },
                // Markdown specific - optimized
                wordBasedSuggestions: 'off',
                links: false,
                colorDecorators: false,
                folding: false,
                foldingStrategy: 'auto',
                showFoldingControls: 'never',
                // Performance optimized
                renderWhitespace: 'none',
                renderControlCharacters: false,
                renderIndentGuides: false,
                highlightActiveIndentGuide: false,
              }}
            />
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto theme-bg-primary">
            <div
              key={settings.theme}
              className="p-6 prose max-w-none"
              style={{
                color: 'var(--color-base0)',
                lineHeight: '1.7',
              }}
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        )}

        {/* Removed floating View Mode Toggle - now integrated in toolbar */}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 theme-bg-secondary border-t border-theme-border-primary text-xs text-theme-text-muted flex items-center justify-between flex-shrink-0">
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
                ? 'text-theme-accent-orange'
                : 'text-theme-accent-green'
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
          <div className="theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-theme-text-primary">
                Change Notebook
              </h2>
              <button
                onClick={() => setShowNotebookSelector(false)}
                className="text-theme-text-tertiary hover:text-theme-text-secondary transition-colors border-0 bg-transparent hover:bg-transparent p-1"
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
                      ? 'bg-theme-accent-primary text-theme-text-primary'
                      : 'text-theme-text-secondary hover:theme-bg-tertiary'
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

            <div className="mt-4 pt-4 border-t border-theme-border-primary">
              <button
                onClick={() => setShowNotebookSelector(false)}
                className="w-full px-4 py-2 theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors text-sm border-0"
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
          <div className="theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl w-80 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-theme-text-primary">
                Change Status
              </h3>
              <button
                onClick={() => setShowStatusSelector(false)}
                className="text-theme-text-tertiary hover:text-theme-text-secondary border-0 bg-transparent hover:bg-transparent p-1"
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
                        ? 'bg-theme-accent-primary text-theme-text-primary'
                        : 'text-theme-text-secondary hover:theme-bg-tertiary'
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

            <div className="mt-4 pt-4 border-t border-theme-border-primary">
              <button
                onClick={() => setShowStatusSelector(false)}
                className="w-full px-4 py-2 theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors text-sm border-0"
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

MarkdownEditor.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    notebook: PropTypes.string,
    status: PropTypes.string,
    tags: PropTypes.array,
  }),
  onSave: PropTypes.func,
  onClose: PropTypes.func,
  toast: PropTypes.shape({
    success: PropTypes.func,
    error: PropTypes.func,
    warning: PropTypes.func,
    info: PropTypes.func,
  }),
  layoutMode: PropTypes.oneOf(['normal', 'markdown', 'preview', 'focus']),
  onCycleLayoutMode: PropTypes.func,
  allTags: PropTypes.array,
}

MarkdownEditor.defaultProps = {
  note: null,
  onSave: null,
  onClose: null,
  toast: null,
  layoutMode: 'normal',
  onCycleLayoutMode: null,
  allTags: [],
}

export default MarkdownEditor
