import React, { useEffect, useRef } from 'react'

// Types
import { Note } from '../types'

// Components
import EditorToolbar from './editor/toolbar/EditorToolbar'
import NoteMetadata from './editor/metadata/NoteMetadata'
import TagModal from './editor/tags/TagModal'
import SplitEditor from './editor/SplitEditor'
import EditorOptionsModal from './editor/modals/EditorOptionsModal'
import Icons from './Icons'
import IconButton from './ui/IconButton'

// Hooks
import { useMarkdownEditor } from './editor/hooks/useMarkdownEditor'
import { useEditorToolbar } from './editor/hooks/useEditorToolbar'
import { useEditorState } from './editor/hooks/useEditorState'
import { useAppStore } from '../stores/newSimpleStore'

// Error Boundary
import ComponentErrorBoundary from './errors/ComponentErrorBoundary'


interface MarkdownItEditorProps {
  value?: string
  onChange: (value: string) => void
  onSave?: (note: Note) => void
  selectedNote?: Note
  onNotebookChange?: (noteId: string, notebookId: string) => void
}

const MarkdownItEditor: React.FC<MarkdownItEditorProps> = ({
  value = '',
  onChange,
  onSave,
  selectedNote,
  onNotebookChange,
}) => {
  // Editor ref for text insertion
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  // Modal management
  const { modals, setModal } = useAppStore()

  // Editor state management
  const {
    availableTags,
    showLineNumbers,
    handleToggleLineNumbers,
    showOptionsModal,
    isClosingModal,
    isOpeningModal,
    handleOpenOptionsModal,
    handleCloseOptionsModal,
    handleDuplicateNote,
    handleDeleteNote,
  } = useEditorState(selectedNote || null)

  // Main editor logic
  const {
    isFullscreen,
    isSaving,
    saveError,
    lastSaved,
    handleTitleChange,
    handleNotebookChange: handleNoteMetadataNotebookChange,
    handleStatusChange,
    handleTagsChange,
    handleKeyDown: handleEditorKeyDown,
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
    insertText,
  } = useEditorToolbar(value, onChange, editorRef)

  // Combine keyboard handlers
  useEffect(() => {
    const combinedKeyDown = (event: KeyboardEvent) => {
      handleEditorKeyDown(event)
      handleToolbarKeyDown(event)
    }

    document.addEventListener('keydown', combinedKeyDown)
    return () => document.removeEventListener('keydown', combinedKeyDown)
  }, [handleEditorKeyDown, handleToolbarKeyDown])

  return (
    <ComponentErrorBoundary
      componentName="MarkdownEditor"
      title="Markdown Editor Error"
      message="The markdown editor encountered an error. This might be due to invalid markdown content or a rendering issue."
      onError={(error, errorInfo) => {
        console.error('MarkdownEditor Error:', error, errorInfo)
      }}
    >
      <div
        className={`${
          isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'
        } flex flex-col bg-theme-bg-primary`}
      >
        {/* Note Metadata */}
        <ComponentErrorBoundary
          componentName="NoteMetadata"
          title="Note Metadata Error"
          message="Failed to load note metadata. You can still edit the note content."
        >
          <NoteMetadata
            note={selectedNote}
            onTitleChange={handleTitleChange}
            onNotebookChange={handleNoteMetadataNotebookChange}
            onStatusChange={handleStatusChange}
            onTagsChange={handleTagsChange}
            isPreviewMode={false}
          />
        </ComponentErrorBoundary>

        {/* Toolbar */}
        <ComponentErrorBoundary
          componentName="EditorToolbar"
          title="Editor Toolbar Error"
          message="Failed to load editor toolbar. You can still type in the editor."
        >
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
            onTags={() => setModal('tagModal', true)}
            onToggleLineNumbers={handleToggleLineNumbers}
            showLineNumbers={showLineNumbers}
            insertText={insertText}
          />
        </ComponentErrorBoundary>

        {/* Split Editor with Preview */}
        <ComponentErrorBoundary
          componentName="SplitEditor"
          title="Split Editor Error"
          message="Failed to load the split editor. Try refreshing the page."
        >
          <SplitEditor
            ref={editorRef}
            value={value}
            onChange={onChange}
            placeholder="Start writing your markdown here..."
            selectedNote={selectedNote}
            showLineNumbers={showLineNumbers}
          />
        </ComponentErrorBoundary>

        {/* Editor Options Menu */}
        <div className="absolute top-4 right-4">
          <IconButton
            icon={Icons.MoreVertical}
            onClick={handleOpenOptionsModal}
            title="Editor options"
            size={16}
            variant="default"
            aria-label="Editor options"
            aria-pressed={false}
            aria-keyshortcuts=""
          />
        </div>

        {/* Tag Modal */}
        <ComponentErrorBoundary
          componentName="TagModal"
          title="Tag Modal Error"
          message="Failed to load tag editor. You can still save your note."
        >
          <TagModal
            isOpen={modals.tagModal}
            onClose={() => setModal('tagModal', false)}
            currentTags={selectedNote?.tags || []}
            onTagsChange={handleTagsChange}
            availableTags={availableTags}
          />
        </ComponentErrorBoundary>

        {/* Options Modal */}
        <EditorOptionsModal
          isOpen={showOptionsModal}
          onClose={handleCloseOptionsModal}
          onDuplicate={handleDuplicateNote}
          onDelete={handleDeleteNote}
          isClosing={isClosingModal}
          isOpening={isOpeningModal}
        />
      </div>
    </ComponentErrorBoundary>
  )
}

export default MarkdownItEditor
