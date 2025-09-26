import React, { useEffect, useRef, useCallback } from 'react'

// Types
import type { Note } from '../types'

// Components
import EditorToolbar from './editor/toolbar/EditorToolbar'
import NoteMetadata from './editor/metadata/NoteMetadata'
import { TagModal } from './editor/tags/TagModal'
import SplitEditor from './editor/SplitEditor'
import NoteActionsDrawerPortal from './ui/NoteActionsDrawerPortal'
import { Icons } from './Icons'
import IconButton from './ui/IconButton'

// Hooks
import { useMarkdownEditor } from './editor/hooks/useMarkdownEditor'
import { useEditorToolbar } from './editor/hooks/useEditorToolbar'
import { useEditorState } from './editor/hooks/useEditorState'
import { useAppStore } from '../stores/newSimpleStore'
import { useAutocomplete } from '../hooks/useAutocomplete'

// Error Boundary
import ComponentErrorBoundary from './errors/ComponentErrorBoundary'

// Lazy loaded components
import { TableEditor, ZenMode } from './LazyComponents'
import { Autocomplete } from './editor/Autocomplete'
import { editorLogger } from '../utils/logger'

interface MarkdownItEditorProps {
  value?: string
  onChange: (value: string) => void
  onSave?: (note: Note) => void
  selectedNote?: Note
  onNotebookChange?: (noteId: string, notebookId: string) => void
  notebooks?: any[] // Add notebooks prop that was missing
  // Auto-save state from parent
  autoSaveState?: {
    isSaving: boolean
    hasUnsavedChanges: boolean
  }
  // Additional handlers for drawer actions
  onDeleteNote?: (note: Note) => void | Promise<void>
  onTogglePin?: (note: Note) => void | Promise<void>
  onDuplicateNote?: (note: Note) => void | Promise<void>
  onOpenInNewWindow?: (note: Note) => void
  onViewHistory?: (note: Note) => void
}

const MarkdownItEditor: React.FC<MarkdownItEditorProps> = ({
  value = '',
  onChange,
  onSave,
  selectedNote,
  onNotebookChange,
  notebooks,
  autoSaveState,
  onDeleteNote,
  onTogglePin,
  onDuplicateNote,
  onOpenInNewWindow,
  onViewHistory,
}) => {
  // Editor ref for text insertion
  const editorRef = useRef<any>(null)

  // Modal management
  const { modals, setModal } = useAppStore()
  const [showTableEditor, setShowTableEditor] = React.useState(false)
  const [isZenMode, setIsZenMode] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  
  // Autocomplete hook
  const autocomplete = useAutocomplete(editorRef)

  // Editor state management
  const {
    availableTags,
    showLineNumbers,
    handleToggleLineNumbers,
    handleDuplicateNote,
    handleDeleteNote,
    handlePinNote,
    handleExportNote,
    handleOpenInNewWindow,
    handleCopyLink,
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
  
  // Debug logging - commented out
  // console.log('[MarkdownItEditor] handlers:', {
  //   handleNoteMetadataNotebookChange: typeof handleNoteMetadataNotebookChange,
  //   onSave: typeof onSave,
  //   selectedNoteId: selectedNote?.id
  // })

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
    insertTable: originalInsertTable,
    insertHorizontalRule,
    handleKeyDown: handleToolbarKeyDown,
    insertText,
  } = useEditorToolbar(value, onChange, editorRef)
  
  // Override insertTable to show visual editor
  const insertTable = useCallback(() => {
    setShowTableEditor(true)
  }, [])
  
  // Toggle zen mode
  const handleToggleZenMode = useCallback(() => {
    setIsZenMode(!isZenMode)
  }, [isZenMode])

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
        editorLogger.error('MarkdownEditor Error:', error, errorInfo)
      }}
    >
      <ZenMode isActive={isZenMode} onToggle={handleToggleZenMode}>
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
            isSaving={autoSaveState?.isSaving || isSaving}
            lastSaved={
              autoSaveState && !autoSaveState.isSaving
                ? new Date().toISOString()
                : lastSaved
            }
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
            onToggleZenMode={handleToggleZenMode}
            isZenMode={isZenMode}
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
            onClick={() => setIsDrawerOpen(true)}
            title="Editor options"
            size={16}
            variant="default"
            aria-label="Editor options"
            aria-pressed={false}
            aria-keyshortcuts=""
            data-testid="editor-options"
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

        {/* Note Actions Drawer */}
        <NoteActionsDrawerPortal
          note={selectedNote || null}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onPinToggle={async (e, n) => {
            if (onTogglePin && selectedNote) {
              await onTogglePin(selectedNote)
            }
          }}
          onDelete={async (e, n) => {
            if (onDeleteNote && selectedNote) {
              await onDeleteNote(selectedNote)
            }
          }}
          onDuplicate={async (e, n) => {
            if (onDuplicateNote && selectedNote) {
              await onDuplicateNote(selectedNote)
            }
          }}
          onMoveToNotebook={undefined}
          onRestoreNote={undefined}
          onPermanentDelete={undefined}
          onOpenInNewWindow={async (e, n) => {
            if (onOpenInNewWindow && selectedNote) {
              onOpenInNewWindow(selectedNote)
            }
          }}
          onViewHistory={async (e, n) => {
            if (onViewHistory && selectedNote) {
              onViewHistory(selectedNote)
            }
          }}
          isTrashView={false}
        />
        
        {/* Table Editor Modal */}
        <TableEditor
          isOpen={showTableEditor}
          onClose={() => setShowTableEditor(false)}
          onInsert={(markdown) => {
            insertText(markdown)
            setShowTableEditor(false)
          }}
        />
        
        {/* Autocomplete */}
        <Autocomplete
          visible={autocomplete.visible}
          position={autocomplete.position}
          query={autocomplete.query}
          onSelect={autocomplete.onSelect}
          onClose={autocomplete.onClose}
          editorRef={editorRef}
        />
      </div>
      </ZenMode>
    </ComponentErrorBoundary>
  )
}

export default MarkdownItEditor
