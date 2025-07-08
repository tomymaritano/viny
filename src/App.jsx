import { useState, useEffect, useMemo } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import NotesList from './components/NotesList'
import NotePreview from './components/NotePreview'
import LazyMarkdownEditor from './components/LazyMarkdownEditor'
import PreviewPanel from './components/PreviewPanel'
import ResizableLayout from './components/ResizableLayout'
import Settings from './components/Settings'
import NotebookManager from './components/NotebookManager'
import ToastContainer from './components/ToastContainer'
import DebugPanel from './components/DebugPanel'
import ApiStatus from './components/ApiStatus'
import SearchModal from './components/SearchModal'
import UpdateChecker from './components/UpdateChecker'
import { useNotes } from './hooks/useNotes'
import { useNotesApi } from './hooks/useNotesApi'
import { useToast } from './hooks/useToast'
// import { useSettings } from './hooks/useSettings'
import { useNotebooks } from './hooks/useNotebooks'
// Features config removed for production

function App() {
  const { toasts, removeToast, success, error, warning, info } = useToast()
  // Settings hook removed for now
  const { notebooks } = useNotebooks()
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // API/localStorage toggle state
  const [useApi, setUseApi] = useState(() => {
    const stored = localStorage.getItem('nototo_use_api')
    return stored !== null ? JSON.parse(stored) : false // Default to localStorage
  })
  // Use appropriate hook based on toggle
  const notesApiHook = useNotesApi()
  const notesLocalHook = useNotes()
  const notesHook = useApi ? notesApiHook : notesLocalHook
  const {
    // Data states
    notes,
    currentNote,
    isEditorOpen,
    isLoading,
    error: notesError,
    storageMode,

    // UI states (now from global state)
    selectedNoteId,
    setSelectedNoteId,
    viewMode,
    activeSection,
    showPreviewPanel,
    showNotebookManager,

    // Actions
    openNoteForEdit,
    openNoteForPreview,
    createNewNote,
    saveNote,
    deleteNote,
    togglePin,
    duplicateNote,
    // exportNotes,
    closeEditor,
    navigateToSection,
    toggleNotebookManager,
    togglePreviewPanel,
    closePreviewPanel,
  } = notesHook

  // Toggle between API and localStorage
  const handleToggleApi = () => {
    const newValue = !useApi
    setUseApi(newValue)
    localStorage.setItem('nototo_use_api', JSON.stringify(newValue))

    // Show notification
    if (newValue) {
      success('Switched to API storage')
    } else {
      warning('Switched to localStorage')
    }
  }

  // Show error notifications for API issues
  useEffect(() => {
    if (notesError && useApi) {
      error(`API Error: ${notesError}`)
    }
  }, [notesError, useApi, error])

  const handleOpenNote = noteId => {
    // Always open editor directly when clicking on a note
    openNoteForEdit(noteId)
  }

  const handleSidebarNavigation = section => {
    if (section === 'settings') {
      setShowSettings(true)
      return
    }
    navigateToSection(section)
  }

  const handleCloseEditor = () => {
    closeEditor()
  }

  const handleEditNote = note => {
    openNoteForEdit(note.id)
  }

  const handleViewModeChange = mode => {
    if (mode === 'edit' && selectedNoteId) {
      openNoteForEdit(selectedNoteId)
    } else if (mode === 'preview' && selectedNoteId) {
      openNoteForPreview(selectedNoteId)
    }
  }

  const handleTogglePin = note => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    }
    saveNote(updatedNote)
  }

  // Get all unique tags from all notes
  const getAllTags = () => {
    const allTags = new Set()
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => allTags.add(tag))
      }
    })
    return Array.from(allTags).sort()
  }

  const handleDeleteNote = note => {
    if (
      window.confirm(`Are you sure you want to move "${note.title}" to trash?`)
    ) {
      // Soft delete - move to trash
      const trashedNote = {
        ...note,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
      }
      saveNote(trashedNote)
      setSelectedNoteId(null)
      success(`"${note.title}" moved to trash`)
    }
  }

  const handleSaveNote = noteData => {
    saveNote(noteData)
    success('Note saved successfully')
  }

  const handleDuplicateNote = note => {
    const duplicated = duplicateNote(note.id)
    if (duplicated) {
      setSelectedNoteId(duplicated.id)
      success(`"${note.title}" duplicated`)
    }
  }

  const handleRestoreNote = note => {
    if (window.confirm(`Restore "${note.title}" from trash?`)) {
      const restoredNote = {
        ...note,
        isTrashed: false,
        trashedAt: null,
        updatedAt: new Date().toISOString(),
      }
      saveNote(restoredNote)
      success(`"${note.title}" restored successfully`)
    }
  }

  const handlePermanentDelete = note => {
    if (
      window.confirm(
        `Permanently delete "${note.title}"? This action cannot be undone.`
      )
    ) {
      deleteNote(note.id)
      setSelectedNoteId(null)
      success(`"${note.title}" permanently deleted`)
    }
  }

  const selectedNote = useMemo(() => {
    return notes.find(note => note.id === selectedNoteId)
  }, [notes, selectedNoteId])

  // State tracking removed for production

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      // Only handle shortcuts when not in an input/textarea/editor
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.closest('.monaco-editor')
      ) {
        return
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault()
            createNewNote()
            break
          case 'o':
            e.preventDefault()
            // Show all notes section for file browsing
            navigateToSection('all-notes')
            break
          case 'r':
            e.preventDefault()
            // Show recent notes section
            navigateToSection('recent')
            break
          case ',':
            e.preventDefault()
            setShowSettings(true)
            break
          case 'f':
          case 'k':
            e.preventDefault()
            setShowSearch(true)
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [createNewNote, navigateToSection])

  // Filter notes based on active section and search query
  const getFilteredNotes = () => {
    let filteredNotes

    switch (activeSection) {
      case 'all-notes':
        filteredNotes = notes.filter(note => !note.isTrashed)
        break
      case 'pinned':
        filteredNotes = notes.filter(note => note.isPinned && !note.isTrashed)
        break
      case 'recent':
        filteredNotes = notes
          .filter(note => !note.isTrashed)
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date)
          )
          .slice(0, 10) // Show last 10 recent notes
        break
      case 'trash':
        filteredNotes = notes.filter(note => note.isTrashed)
        break
      case 'personal':
      case 'work':
      case 'projects':
        filteredNotes = notes.filter(
          note =>
            note.notebook.toLowerCase() === activeSection && !note.isTrashed
        )
        break
      default:
        // Handle tag filtering
        if (activeSection.startsWith('tag-')) {
          const tag = activeSection.replace('tag-', '')
          filteredNotes = notes.filter(
            note => note.tags?.includes(tag) && !note.isTrashed
          )
        }
        // Handle notebook filtering
        else if (activeSection.startsWith('notebook-')) {
          const notebook = activeSection.replace('notebook-', '')
          filteredNotes = notes.filter(
            note => note.notebook.toLowerCase() === notebook && !note.isTrashed
          )
        } else {
          filteredNotes = notes.filter(note => !note.isTrashed)
        }
        break
    }

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredNotes = filteredNotes.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          note.notebook.toLowerCase().includes(query)
      )
    }

    return filteredNotes
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="flex-1 bg-solarized-base03 flex items-center justify-center">
          <div className="text-center">
            <div className="text-solarized-base1 text-lg mb-2">
              Loading Nototo...
            </div>
            <div className="text-solarized-base0 text-sm">
              Initializing your notes
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <ResizableLayout
        sidebar={
          <Sidebar
            key={`sidebar-${notebooks.map(n => `${n.id}-${n.color}`).join('-')}`}
            activeSection={activeSection}
            setActiveSection={handleSidebarNavigation}
            onNewNote={createNewNote}
            onManageNotebooks={toggleNotebookManager}
            notes={notes}
            storageMode={storageMode}
            onToggleStorage={handleToggleApi}
          />
        }
        notesList={
          <NotesList
            notes={getFilteredNotes()}
            onOpenNote={handleOpenNote}
            onNewNote={createNewNote}
            selectedNoteId={selectedNoteId}
            isTrashView={activeSection === 'trash'}
            onRestoreNote={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
            onDeleteNote={handleDeleteNote}
          />
        }
        mainContent={
          isEditorOpen ? (
            <LazyMarkdownEditor
              note={currentNote}
              onSave={handleSaveNote}
              onClose={handleCloseEditor}
              toast={{ success, error, warning, info }}
              showPreviewToggle={true}
              onTogglePreview={togglePreviewPanel}
              isPreviewVisible={showPreviewPanel}
              allTags={getAllTags()}
            />
          ) : (
            <NotePreview
              note={selectedNote}
              onEdit={handleEditNote}
              onTogglePin={handleTogglePin}
              onDuplicate={handleDuplicateNote}
              onDelete={handleDeleteNote}
              viewMode={viewMode}
              onViewModeChange={selectedNote ? handleViewModeChange : null}
              isTrashView={activeSection === 'trash'}
              onRestoreNote={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
            />
          )
        }
        previewPanel={
          <PreviewPanel
            note={isEditorOpen ? currentNote : selectedNote}
            isVisible={isEditorOpen ? showPreviewPanel : false}
            onClose={closePreviewPanel}
          />
        }
        isPreviewVisible={isEditorOpen ? showPreviewPanel : false}
      />

      {/* Settings Modal */}
      <Settings
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Notebook Manager Modal */}
      <NotebookManager
        isVisible={showNotebookManager}
        onClose={toggleNotebookManager}
        onNotebookChange={notebook => {
          success(`Notebook "${notebook.name}" created successfully`)
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => {
          setShowSearch(false)
          setSearchQuery('')
        }}
        onSelectNote={note => {
          // Open note for editing and close search
          openNoteForEdit(note.id)
          setShowSearch(false)
          setSearchQuery('')
          success(`Opened "${note.title}"`)
        }}
        onPinNote={note => {
          togglePin(note.id)
          success(`${note.isPinned ? 'Unpinned' : 'Pinned'} "${note.title}"`)
        }}
        onDeleteNote={note => {
          if (
            window.confirm(`Delete "${note.title}"? This cannot be undone.`)
          ) {
            deleteNote(note.id)
            success(`Deleted "${note.title}"`)
          }
        }}
        onMoveNote={note => {
          // For now, just show a notification - move functionality can be implemented later
          info(`Move functionality for "${note.title}" - coming soon!`)
        }}
        notes={notes}
      />

      {/* Toast Container - positioned absolute */}
      <div className="fixed top-4 right-4 z-50">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>

      {/* API Status moved to sidebar */}

      {/* Debug Panel */}
      <DebugPanel />

      {/* Update Checker */}
      <UpdateChecker />
    </div>
  )
}

export default App
