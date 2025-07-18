import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Note } from './types'
import { useAppStore } from './stores/newSimpleStore'
import SplitEditor from './components/editor/SplitEditor'
import NoteMetadata from './components/editor/metadata/NoteMetadata'
import EditorToolbar from './components/editor/toolbar/EditorToolbar'
import LoadingSpinner from './components/LoadingSpinner'
import { Icons } from './components/Icons'
import IconButton from './components/ui/IconButton'
import { useAppInit } from './hooks/useAppInit'
import { useSettingsEffects } from './hooks/useSettingsEffects'
import { useNotebooks } from './hooks/useNotebooks'
import { useEditorToolbar } from './components/editor/hooks/useEditorToolbar'
import { useNoteSync } from './hooks/useNoteSync'
import { ErrorBoundary } from './components/ErrorBoundary'
import StorageErrorBoundary from './components/errors/StorageErrorBoundary'
import './App.css'

const NoteStandaloneContent: React.FC = () => {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const editorRef = useRef<any>(null)
  const { notes, setNotes, setModal } = useAppStore()
  
  // Get loading state from the store
  const isAppLoading = useAppStore(state => state.isLoading)
  
  // Use note sync hook for real-time synchronization
  const { updateNote } = useNoteSync()
  
  // Initialize notebooks separately
  const { notebooks } = useNotebooks()
  
  // Initialize app data and settings
  const { isInitializing, initError } = useAppInit()
  useSettingsEffects()
  
  // Define handlers before using them
  const handleContentChange = useCallback(async (content: string) => {
    if (!note) return
    
    const updatedNote = {
      ...note,
      content,
      updatedAt: new Date().toISOString()
    }
    
    setNote(updatedNote)
    await updateNote(updatedNote)
  }, [note, updateNote])
  
  // Editor toolbar functionality
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
    insertText,
    handleToggleLineNumbers,
    showLineNumbers,
    isSaving,
    lastSaved,
    saveError
  } = useEditorToolbar(note?.content || '', handleContentChange, editorRef)
  
  // Extract note ID from URL hash
  const noteId = window.location.hash.replace('#/note/', '')
  
  // Debug logging removed for production
  
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        setIsLoading(false)
        return
      }
      
      // Wait for app initialization to complete
      if (isAppLoading) {
        return
      }
      
      // If notes are already loaded, find the note
      if (notes.length > 0) {
        const foundNote = notes.find(n => n.id === noteId)
        if (foundNote) {
          setNote(foundNote)
          setIsLoading(false)
        } else {
          // Note not found
          console.error('Note not found:', noteId)
          setIsLoading(false)
        }
      } else {
        // No notes loaded yet - this shouldn't happen after app init
        console.error('No notes loaded after app initialization')
        setIsLoading(false)
      }
    }
    
    loadNote()
  }, [noteId, notes, isAppLoading])
  
  
  const handleMetadataChange = async (field: keyof Note, value: any) => {
    if (!note) return
    
    const updatedNote = {
      ...note,
      [field]: value,
      updatedAt: new Date().toISOString()
    }
    
    setNote(updatedNote)
    await updateNote(updatedNote)
  }
  
  if (isLoading || isAppLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-theme-bg-primary">
        <LoadingSpinner />
      </div>
    )
  }
  
  if (!note) {
    return (
      <div className="h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-theme-text-primary mb-2">
            Note not found
          </h2>
          <p className="text-theme-text-secondary">
            The note with ID "{noteId}" could not be found.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-theme-bg-primary">
      {/* Title bar for Electron window */}
      <div 
        className="flex-shrink-0 h-8 bg-theme-bg-secondary border-b border-theme-border-primary flex items-center px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-xs text-theme-text-secondary truncate">
          {note.title} - Viny
        </span>
      </div>
      
      {/* Note metadata */}
      <div className="flex-shrink-0 border-b border-theme-border-primary">
        <NoteMetadata
          note={note}
          onTitleChange={(title) => handleMetadataChange('title', title)}
          onNotebookChange={(notebook) => handleMetadataChange('notebook', notebook)}
          onStatusChange={(status) => handleMetadataChange('status', status)}
          onTagsChange={(tags) => handleMetadataChange('tags', tags)}
          isPreviewMode={false}
        />
      </div>
      
      {/* Editor Toolbar */}
      <div className="flex-shrink-0 border-b border-theme-border-primary">
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
      </div>
      
      {/* Editor - takes remaining space with proper flex container */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <SplitEditor
          ref={editorRef}
          value={note.content || ''}
          onChange={handleContentChange}
          selectedNote={note}
          showLineNumbers={showLineNumbers}
        />
        
        {/* Editor Options Menu - moved to not overlap with floating controls */}
        <div className="absolute top-4 left-4 z-10">
          <IconButton
            icon={Icons.MoreVertical}
            onClick={() => setShowOptionsModal(true)}
            title="Editor options"
            size={16}
            variant="default"
            aria-label="Editor options"
            aria-pressed={false}
            aria-keyshortcuts=""
          />
        </div>
      </div>
    </div>
  )
}

// Wrap with error boundaries
export const NoteStandalone: React.FC = () => {
  return (
    <ErrorBoundary>
      <StorageErrorBoundary clearStorageOnRetry={false}>
        <NoteStandaloneContent />
      </StorageErrorBoundary>
    </ErrorBoundary>
  )
}