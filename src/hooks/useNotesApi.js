import { useState, useEffect } from 'react'
import { notesApi, migrationApi, ApiError } from '../services/api'

// Storage utilities for localStorage backup/migration
const storage = {
  load: () => {
    try {
      const stored = localStorage.getItem('nototo_notes')
      if (!stored) return null

      const data = JSON.parse(stored)
      return data.notes || data // Handle both old and new formats
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error)
      return null
    }
  },

  save: notes => {
    try {
      const data = {
        version: '1.0.0',
        notes,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem('nototo_notes', JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error)
      return false
    }
  },

  clear: () => {
    try {
      localStorage.removeItem('nototo_notes')
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  },
}

export const useNotesApi = () => {
  // IMPORTANT: All hooks must be declared at the top level and in the same order every time
  // Data states
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI states
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [viewMode, setViewMode] = useState('preview')
  const [activeSection, setActiveSection] = useState('all-notes')
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)

  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showNotebookManager, setShowNotebookManager] = useState(false)

  // Storage mode state - determines if we're using API or localStorage
  const [storageMode, setStorageMode] = useState('api') // 'api' or 'localStorage'

  // Load notes from API on mount, with fallback to localStorage migration
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if API is available by testing environment
        const isApiDisabled = import.meta.env.VITE_API_BASE_URL === 'disabled'

        if (isApiDisabled) {
          setStorageMode('localStorage')
          const localNotes = storage.load()
          setNotes(localNotes || [])
          setIsLoading(false)
          return
        }

        // Try to load from API first
        const apiNotes = await notesApi.getAll()
        setStorageMode('api')

        if (apiNotes.length === 0) {
          // No notes in API, check if we have localStorage data to migrate
          const localNotes = storage.load()
          if (localNotes && localNotes.length > 0) {
            // Found localStorage notes, migrating to database

            try {
              await migrationApi.importFromLocalStorage(localNotes)
              const migratedNotes = await notesApi.getAll()
              setNotes(migratedNotes)
              // Successfully migrated notes to database

              // Optionally clear localStorage after successful migration
              // storage.clear()
            } catch (migrationError) {
              console.error(
                'Migration failed, falling back to localStorage:',
                migrationError
              )
              setStorageMode('localStorage')
              setNotes(localNotes)
            }
          } else {
            setNotes([])
          }
        } else {
          setNotes(apiNotes)
        }
      } catch (error) {
        console.error(
          'Failed to load notes from API, falling back to localStorage:',
          error
        )
        setError(null) // Don't show error in UI when falling back gracefully
        setStorageMode('localStorage')

        // Fallback to localStorage
        const localNotes = storage.load()
        setNotes(localNotes || [])
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // API wrapper with error handling
  const apiCall = async (apiFunction, fallbackFunction = null) => {
    try {
      setError(null)
      const result = await apiFunction()
      return result
    } catch (error) {
      console.error('API call failed:', error)
      setError(error.message)

      if (fallbackFunction) {
        return fallbackFunction()
      }

      throw error
    }
  }

  // Sync currentNote with selectedNoteId when in edit mode
  useEffect(() => {
    if (selectedNoteId && viewMode === 'edit' && isEditorOpen) {
      const note = notes.find(n => n.id === selectedNoteId)
      if (note && (!currentNote || currentNote.id !== selectedNoteId)) {
        setCurrentNote(note)
      }
    }
  }, [selectedNoteId, notes, viewMode, isEditorOpen, currentNote])

  // Centralized UI actions
  const openNoteForEdit = noteId => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNoteId(noteId)
      setCurrentNote(note)
      setViewMode('edit')
      setIsEditorOpen(true)
    } else {
      console.warn('Note not found:', noteId)
    }
  }

  const openNoteForPreview = noteId => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNoteId(noteId)
      setViewMode('preview')
      if (isEditorOpen) {
        setIsEditorOpen(false)
        setCurrentNote(null)
      }
      setShowPreviewPanel(false)
    }
  }

  const createNewNote = async () => {
    try {
      const newNoteData = {
        title: 'Untitled Note',
        content: '',
        notebook: 'Personal',
        status: 'draft',
        isPinned: false,
        tags: [],
      }

      let newNote

      if (storageMode === 'localStorage') {
        // Create note locally
        newNote = {
          ...newNoteData,
          id: Date.now(),
          preview: '',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          trashedAt: null,
          isTrashed: false,
        }
        const updatedNotes = [newNote, ...notes]
        setNotes(updatedNotes)
        storage.save(updatedNotes)
      } else {
        // Try API first, with localStorage fallback
        newNote = await apiCall(
          () => notesApi.create(newNoteData),
          () => {
            // Fallback: create note locally
            const localNote = {
              ...newNoteData,
              id: Date.now(),
              preview: '',
              date: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              trashedAt: null,
              isTrashed: false,
            }
            const updatedNotes = [localNote, ...notes]
            setNotes(updatedNotes)
            storage.save(updatedNotes)
            return localNote
          }
        )

        // Update local state
        setNotes(prev => [newNote, ...prev])
      }

      setCurrentNote(newNote)
      setSelectedNoteId(newNote.id)
      setViewMode('edit')
      setIsEditorOpen(true)
      setShowPreviewPanel(false)

      return newNote
    } catch (error) {
      console.error('Failed to create note:', error)
      return null
    }
  }

  const saveNote = async noteData => {
    try {
      let savedNote

      if (noteData.id) {
        // Update existing note
        if (storageMode === 'localStorage') {
          // Update locally
          const updatedNotes = notes.map(n =>
            n.id === noteData.id
              ? {
                  ...noteData,
                  preview:
                    noteData.content.substring(0, 100) +
                    (noteData.content.length > 100 ? '...' : ''),
                  updatedAt: new Date().toISOString(),
                }
              : n
          )
          setNotes(updatedNotes)
          storage.save(updatedNotes)
          savedNote = updatedNotes.find(n => n.id === noteData.id)
        } else {
          // Try API first, with localStorage fallback
          savedNote = await apiCall(
            () => notesApi.update(noteData.id, noteData),
            () => {
              // Fallback: update locally
              const updatedNotes = notes.map(n =>
                n.id === noteData.id
                  ? {
                      ...noteData,
                      preview:
                        noteData.content.substring(0, 100) +
                        (noteData.content.length > 100 ? '...' : ''),
                      updatedAt: new Date().toISOString(),
                    }
                  : n
              )
              setNotes(updatedNotes)
              storage.save(updatedNotes)
              return updatedNotes.find(n => n.id === noteData.id)
            }
          )

          // Update local state
          setNotes(prev =>
            prev.map(n => (n.id === savedNote.id ? savedNote : n))
          )
        }
      } else {
        // Create new note
        savedNote = await createNewNote()
        if (savedNote) {
          // Update with the provided data
          savedNote = await saveNote({ ...savedNote, ...noteData })
        }
      }

      if (currentNote?.id === savedNote?.id) {
        setCurrentNote(savedNote)
      }

      return savedNote
    } catch (error) {
      console.error('Failed to save note:', error)
      throw error
    }
  }

  const deleteNote = async noteId => {
    try {
      await apiCall(
        () => notesApi.delete(noteId),
        () => {
          // Fallback: delete locally
          const updatedNotes = notes.filter(n => n.id !== noteId)
          setNotes(updatedNotes)
          storage.save(updatedNotes)
        }
      )

      // Update local state
      setNotes(prev => prev.filter(n => n.id !== noteId))

      if (currentNote?.id === noteId) {
        setCurrentNote(null)
        setIsEditorOpen(false)
      }

      if (selectedNoteId === noteId) {
        setSelectedNoteId(null)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const togglePin = async noteId => {
    try {
      const targetNote = notes.find(n => n.id === noteId)
      if (!targetNote) return

      const updatedNote = {
        ...targetNote,
        isPinned: !targetNote.isPinned,
        updatedAt: new Date().toISOString(),
      }

      await apiCall(
        () => notesApi.update(noteId, { isPinned: updatedNote.isPinned }),
        () => {
          // Fallback: update locally
          const updatedNotes = notes.map(n =>
            n.id === noteId ? updatedNote : n
          )
          setNotes(updatedNotes)
          storage.save(updatedNotes)
        }
      )

      // Update local state
      setNotes(prev =>
        prev.map(note => (note.id === noteId ? updatedNote : note))
      )

      // Update current note if it's the one being pinned/unpinned
      if (currentNote?.id === noteId) {
        setCurrentNote(updatedNote)
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      return null
    }
  }

  const duplicateNote = async noteId => {
    const originalNote = notes.find(n => n.id === noteId)
    if (originalNote) {
      try {
        const duplicatedData = {
          title: `${originalNote.title} (Copy)`,
          content: originalNote.content,
          notebook: originalNote.notebook,
          status: originalNote.status,
          isPinned: false,
          tags: originalNote.tags || [],
        }

        const duplicatedNote = await apiCall(
          () => notesApi.create(duplicatedData),
          () => {
            // Fallback: create locally
            const localNote = {
              ...duplicatedData,
              id: Date.now(),
              preview:
                duplicatedData.content.substring(0, 100) +
                (duplicatedData.content.length > 100 ? '...' : ''),
              date: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              trashedAt: null,
              isTrashed: false,
            }
            const updatedNotes = [...notes, localNote]
            setNotes(updatedNotes)
            storage.save(updatedNotes)
            return localNote
          }
        )

        setNotes(prev => [duplicatedNote, ...prev])
        return duplicatedNote
      } catch (error) {
        console.error('Failed to duplicate note:', error)
        return null
      }
    }
    return null // If note not found
  }

  const exportNotes = async () => {
    try {
      const exportData = await apiCall(
        () => migrationApi.exportAll(),
        () => {
          // Fallback: export from local state
          return {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            notes: notes,
            totalNotes: notes.length,
          }
        }
      )

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `nototo-notes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Failed to export notes:', error)
      return false
    }
  }

  const importNotes = async file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async e => {
        try {
          const importedData = JSON.parse(e.target.result)

          if (!importedData.notes || !Array.isArray(importedData.notes)) {
            reject(new Error('Invalid notes data format'))
            return
          }

          // Import via API
          const result = await apiCall(
            () => migrationApi.importFromLocalStorage(importedData.notes),
            () => {
              // Fallback: merge locally
              const existingIds = new Set(notes.map(n => n.id))
              const newNotes = importedData.notes.filter(
                note => !existingIds.has(note.id)
              )

              if (newNotes.length > 0) {
                const updatedNotes = [...notes, ...newNotes]
                setNotes(updatedNotes)
                storage.save(updatedNotes)
              }

              return {
                imported: newNotes.length,
                total: importedData.notes.length,
              }
            }
          )

          // Refresh notes from API
          const refreshedNotes = await notesApi.getAll()
          setNotes(refreshedNotes)

          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse notes file: ' + error.message))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setCurrentNote(null)
    setViewMode('preview')
    setShowPreviewPanel(false)
  }

  const navigateToSection = section => {
    setActiveSection(section)
    if (isEditorOpen) {
      closeEditor()
    }
  }

  // Legacy function for backward compatibility
  const openNote = openNoteForEdit

  // Modal actions
  const toggleSettings = () => setShowSettings(prev => !prev)
  const toggleNotebookManager = () => setShowNotebookManager(prev => !prev)
  const togglePreviewPanel = () => setShowPreviewPanel(prev => !prev)
  const closePreviewPanel = () => {
    if (isEditorOpen) {
      setShowPreviewPanel(false)
    } else {
      setSelectedNoteId(null)
      setViewMode('preview')
    }
  }

  return {
    // Data states
    notes,
    currentNote,
    isEditorOpen,
    isLoading,
    error,
    storageMode, // 'api' or 'localStorage'

    // UI states
    selectedNoteId,
    setSelectedNoteId,
    viewMode,
    activeSection,
    showPreviewPanel,
    showSettings,
    showNotebookManager,

    // Core note actions
    openNote,
    openNoteForEdit,
    openNoteForPreview,
    createNewNote,
    saveNote,
    deleteNote,
    togglePin,
    duplicateNote,
    exportNotes,
    importNotes,
    closeEditor,

    // UI actions
    navigateToSection,
    toggleSettings,
    toggleNotebookManager,
    togglePreviewPanel,
    closePreviewPanel,

    // Note editing
    setCurrentNote,

    // Utilities
    storage,

    // API utilities
    refreshNotes: async () => {
      try {
        setIsLoading(true)
        const refreshedNotes = await notesApi.getAll()
        setNotes(refreshedNotes)
      } catch (error) {
        console.error('Failed to refresh notes:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    clearError: () => setError(null),
  }
}
