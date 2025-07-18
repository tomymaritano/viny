import { StateCreator } from 'zustand'
import { Note } from '../../types'
import { createDocumentRepository, IDocumentRepository, StorageError } from '../../lib/repositories/RepositoryFactory'
import { getCurrentTimestamp } from '../../utils/dateUtils'
import { storageLogger as logger } from '../../utils/logger'

export interface NotesSlice {
  // Notes state
  notes: Note[]
  currentNote: Note | null
  selectedNoteId: string | null
  isEditorOpen: boolean
  sortBy: 'title' | 'date' | 'updated' | 'notebook'
  sortDirection: 'asc' | 'desc'
  loading: boolean
  error: string | null
  
  // Notes actions (now async)
  loadNotes: () => Promise<void>
  setCurrentNote: (note: Note | null) => void
  setSelectedNoteId: (id: string | null) => void
  setIsEditorOpen: (open: boolean) => void
  setSortBy: (sortBy: 'title' | 'date' | 'updated' | 'notebook') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  sortNotes: () => void
  addNote: (note: Note) => Promise<Note | null>
  updateNote: (note: Note) => Promise<void>
  removeNote: (id: string) => Promise<void>
  searchNotes: (query: string) => Promise<Note[]>
  
  // Tag management actions (now async)
  removeTagFromAllNotes: (tagName: string) => Promise<number>
  renameTagInAllNotes: (oldTagName: string, newTagName: string) => Promise<number>
  
  // Internal methods
  _setNotes: (notes: Note[]) => void
  _setError: (error: string | null) => void
  _setLoading: (loading: boolean) => void
}

export const createNotesSlice: StateCreator<NotesSlice, [], [], NotesSlice> = (set, get) => {
  // Initialize repository
  const repository: IDocumentRepository = createDocumentRepository()
  
  // Helper to handle async operations with error handling
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    try {
      set({ loading: true, error: null })
      const result = await operation()
      set({ loading: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof StorageError 
        ? `${operationName} failed: ${error.message}`
        : `${operationName} failed unexpectedly`
      
      logger.error(`Notes ${operationName} error:`, error)
      set({ loading: false, error: errorMessage })
      return null
    }
  }

  return {
    // Initial state
    notes: [],
    currentNote: null,
    selectedNoteId: null,
    isEditorOpen: false,
    sortBy: 'updated',
    sortDirection: 'desc',
    loading: false,
    error: null,

    // Load notes from repository
    loadNotes: async () => {
      const notes = await withErrorHandling(
        () => repository.getNotes(),
        'load'
      )
      
      if (notes) {
        set({ notes })
        logger.debug('Notes loaded successfully')
      }
    },
    setCurrentNote: (currentNote) => set({ currentNote }),
    setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
    setIsEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSortDirection: (sortDirection) => set({ sortDirection }),

    sortNotes: () =>
      set((state) => {
        const sortedNotes = [...state.notes].sort((a, b) => {
          let comparison = 0
          
          switch (state.sortBy) {
            case 'title':
              comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase())
              break
            case 'date':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              break
            case 'updated':
              comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
              break
            case 'notebook':
              comparison = a.notebook.toLowerCase().localeCompare(b.notebook.toLowerCase())
              break
          }
          
          return state.sortDirection === 'asc' ? comparison : -comparison
        })
        
        return { notes: sortedNotes }
      }),

    addNote: async (note) => {
      const savedNote = await withErrorHandling(
        async () => {
          const result = await repository.saveNote(note)
          return result
        },
        'add'
      )
      
      if (savedNote) {
        // Optimistic update
        set((state) => ({ notes: [savedNote, ...state.notes] }))
        logger.debug('Note added successfully', note.id)
      }
      
      return savedNote
    },

    updateNote: async (updatedNote) => {
      const success = await withErrorHandling(
        async () => {
          await repository.saveNote(updatedNote)
          return true
        },
        'update'
      )
      
      if (success) {
        // Optimistic update
        set((state) => ({
          notes: state.notes.map(note => 
            note.id === updatedNote.id ? updatedNote : note
          ),
          currentNote: state.currentNote?.id === updatedNote.id 
            ? updatedNote 
            : state.currentNote
        }))
        
        logger.debug('Note updated successfully', updatedNote.id)
      }
    },

    removeNote: async (noteId) => {
      const success = await withErrorHandling(
        async () => {
          await repository.deleteNote(noteId)
          return true
        },
        'remove'
      )
      
      if (success) {
        // Optimistic update
        set((state) => ({
          notes: state.notes.filter(note => note.id !== noteId),
          currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
          selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
          isEditorOpen: state.currentNote?.id === noteId ? false : state.isEditorOpen
        }))
        
        logger.debug('Note removed successfully', noteId)
      }
    },

    searchNotes: async (query) => {
      const results = await withErrorHandling(
        () => repository.searchNotes(query),
        'search'
      )
      
      return results || []
    },

    removeTagFromAllNotes: async (tagName) => {
      const state = get()
      let modifiedCount = 0
      
      const updatedNotes = state.notes.map(note => {
        if (note.tags && note.tags.includes(tagName)) {
          modifiedCount++
          return {
            ...note,
            tags: note.tags.filter(tag => tag !== tagName),
            updatedAt: getCurrentTimestamp()
          }
        }
        return note
      })
      
      // Update current note if it was affected
      const updatedCurrentNote = state.currentNote && state.currentNote.tags?.includes(tagName)
        ? {
            ...state.currentNote,
            tags: state.currentNote.tags.filter(tag => tag !== tagName),
            updatedAt: getCurrentTimestamp()
          }
        : state.currentNote
      
      // Save to storage
      const success = await withErrorHandling(
        async () => {
          await repository.saveNotes(updatedNotes)
          return true
        },
        'remove tag'
      )
      
      if (success) {
        // Update state
        set({ 
          notes: updatedNotes,
          currentNote: updatedCurrentNote
        })
        
        logger.debug(`Tag "${tagName}" removed from ${modifiedCount} notes`)
      }
      
      return modifiedCount
    },

    renameTagInAllNotes: async (oldTagName, newTagName) => {
      const state = get()
      let modifiedCount = 0
      
      const updatedNotes = state.notes.map(note => {
        if (note.tags && note.tags.includes(oldTagName)) {
          modifiedCount++
          return {
            ...note,
            tags: note.tags.map(tag => tag === oldTagName ? newTagName : tag),
            updatedAt: getCurrentTimestamp()
          }
        }
        return note
      })
      
      // Update current note if it was affected
      const updatedCurrentNote = state.currentNote && state.currentNote.tags?.includes(oldTagName)
        ? {
            ...state.currentNote,
            tags: state.currentNote.tags.map(tag => tag === oldTagName ? newTagName : tag),
            updatedAt: getCurrentTimestamp()
          }
        : state.currentNote
      
      // Save to storage
      const success = await withErrorHandling(
        async () => {
          await repository.saveNotes(updatedNotes)
          return true
        },
        'rename tag'
      )
      
      if (success) {
        // Update state
        set({ 
          notes: updatedNotes,
          currentNote: updatedCurrentNote
        })
        
        logger.debug(`Tag "${oldTagName}" renamed to "${newTagName}" in ${modifiedCount} notes`)
      }
      
      return modifiedCount
    },

    // Internal state management (for compatibility)
    _setNotes: (notes) => set({ notes }),
    _setError: (error) => set({ error }),
    _setLoading: (loading) => set({ loading })
  }
}

// Initialize notes on slice creation
export const initializeNotes = async (slice: NotesSlice) => {
  await slice.loadNotes()
}