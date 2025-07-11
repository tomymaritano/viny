import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import MarkdownIt from 'markdown-it'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// Components
import EditorToolbar from './editor/toolbar/EditorToolbar'
import NoteMetadata from './editor/metadata/NoteMetadata'
import TagModal from './editor/tags/TagModal'
import SplitEditor from './editor/SplitEditor'

// Hooks
import { useMarkdownEditor } from './editor/hooks/useMarkdownEditor'
import { useEditorToolbar } from './editor/hooks/useEditorToolbar'
import { useSimpleStore } from '../stores/simpleStore'
import { useMemo } from 'react'

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
  // Tag modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)

  // Line numbers state
  const [showLineNumbers, setShowLineNumbers] = useState(false)

  // Editor ref for text insertion
  const editorRef = useRef(null)

  // Get all notes to extract available tags
  const { notes } = useSimpleStore()

  // Calculate available tags from all notes
  const availableTags = useMemo(() => {
    const tagSet = new Set()
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Main editor logic
  const {
    isFullscreen,
    setIsFullscreen,
    isSaving,
    saveError,
    lastSaved,
    stats,
    handleTitleChange,
    handleNotebookChange: handleNoteMetadataNotebookChange,
    handleStatusChange,
    handleTagsChange,
    handleManualSave,
    handleKeyDown: handleEditorKeyDown,
    settings,
  } = useMarkdownEditor({
    value,
    onChange,
    onSave,
    selectedNote,
    onNotebookChange,
  })

  // Toolbar logic
  const {
    insertBold,
    insertItalic,
    insertStrikethrough,
    insertCode,
    insertHeading,
    insertLink,
    insertImage,
    insertList,
    insertOrderedList,
    insertCheckbox,
    insertCodeBlock,
    insertQuote,
    insertTable,
    insertHorizontalRule,
    handleKeyDown: handleToolbarKeyDown,
  } = useEditorToolbar(value, onChange, editorRef)

  // Tag modal handlers
  const handleOpenTagModal = () => {
    setIsTagModalOpen(true)
  }

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false)
  }

  // Line numbers toggle handler
  const handleToggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers)
  }

  // Combine keyboard handlers
  useEffect(() => {
    const combinedKeyDown = event => {
      handleEditorKeyDown(event)
      handleToolbarKeyDown(event)
    }

    document.addEventListener('keydown', combinedKeyDown)
    return () => document.removeEventListener('keydown', combinedKeyDown)
  }, [handleEditorKeyDown, handleToolbarKeyDown])

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'
      } flex flex-col`}
      style={{ backgroundColor: '#171617' }}
    >
      {/* Note Metadata */}
      <NoteMetadata
        note={selectedNote}
        notebooks={notebooks}
        onTitleChange={handleTitleChange}
        onNotebookChange={handleNoteMetadataNotebookChange}
        onStatusChange={handleStatusChange}
        onTagsChange={handleTagsChange}
        isPreviewMode={false}
      />

      {/* Toolbar */}
      <EditorToolbar
        onBold={insertBold}
        onItalic={insertItalic}
        onStrikethrough={insertStrikethrough}
        onCode={insertCode}
        onHeading={insertHeading}
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        onLink={insertLink}
        onImage={insertImage}
        onList={insertList}
        onOrderedList={insertOrderedList}
        onCheckbox={insertCheckbox}
        onCodeBlock={insertCodeBlock}
        onQuote={insertQuote}
        onTable={insertTable}
        onHorizontalRule={insertHorizontalRule}
        onTags={handleOpenTagModal}
        onToggleLineNumbers={handleToggleLineNumbers}
        showLineNumbers={showLineNumbers}
      />

      {/* Split Editor with Preview */}
      <SplitEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder="Start writing your markdown here..."
        selectedNote={selectedNote}
        showLineNumbers={showLineNumbers}
      />

      {/* Fullscreen toggle button */}
      {!isFullscreen && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2 theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors opacity-0 hover:opacity-100"
          title="Enter fullscreen mode (Ctrl+Enter)"
        >
          📱
        </button>
      )}

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors"
          title="Exit fullscreen mode (Ctrl+Enter)"
        >
          ❌
        </button>
      )}

      {/* Tag Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={handleCloseTagModal}
        currentTags={selectedNote?.tags || []}
        onTagsChange={handleTagsChange}
        availableTags={availableTags}
      />
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
  onTogglePreview: PropTypes.func.isRequired,
  isPreviewVisible: PropTypes.bool,
  notebooks: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    ])
  ),
}

export default MarkdownItEditor
