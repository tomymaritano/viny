import { StateCreator } from 'zustand'
import { Note } from '../../types'
import { storageService } from '../../lib/storage'

export interface NotesSlice {
  // Notes state
  notes: Note[]
  currentNote: Note | null
  selectedNoteId: string | null
  isEditorOpen: boolean
  sortBy: 'title' | 'date' | 'updated' | 'notebook'
  sortDirection: 'asc' | 'desc'
  
  // Notes actions
  setNotes: (notes: Note[]) => void
  setCurrentNote: (note: Note | null) => void
  setSelectedNoteId: (id: string | null) => void
  setIsEditorOpen: (open: boolean) => void
  setSortBy: (sortBy: 'title' | 'date' | 'updated' | 'notebook') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  sortNotes: () => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: string) => void
  
  // Tag management actions
  removeTagFromAllNotes: (tagName: string) => number
  renameTagInAllNotes: (oldTagName: string, newTagName: string) => number
}

export const createNotesSlice: StateCreator<NotesSlice> = (set, get) => ({
  // Initial state
  notes: [],
  currentNote: null,
  selectedNoteId: null,
  isEditorOpen: false,
  sortBy: 'updated',
  sortDirection: 'desc',

  // Actions
  setNotes: (notes) => set({ notes }),
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

  addNote: (note) =>
    set((state) => ({ notes: [note, ...state.notes] })),

  updateNote: (updatedNote) =>
    set((state) => ({
      notes: state.notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ),
      currentNote: state.currentNote?.id === updatedNote.id 
        ? updatedNote 
        : state.currentNote
    })),

  removeNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter(note => note.id !== noteId),
      currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
      selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      isEditorOpen: state.currentNote?.id === noteId ? false : state.isEditorOpen
    })),

  removeTagFromAllNotes: (tagName) => {
    const state = get()
    let modifiedCount = 0
    
    const updatedNotes = state.notes.map(note => {
      if (note.tags && note.tags.includes(tagName)) {
        modifiedCount++
        return {
          ...note,
          tags: note.tags.filter(tag => tag !== tagName),
          updatedAt: new Date().toISOString()
        }
      }
      return note
    })
    
    // Update current note if it was affected
    const updatedCurrentNote = state.currentNote && state.currentNote.tags?.includes(tagName)
      ? {
          ...state.currentNote,
          tags: state.currentNote.tags.filter(tag => tag !== tagName),
          updatedAt: new Date().toISOString()
        }
      : state.currentNote
    
    // Save to storage
    storageService.saveNotes(updatedNotes)
    
    // Update state
    set({ 
      notes: updatedNotes,
      currentNote: updatedCurrentNote
    })
    
    // Show success notification
    state.showSuccess(`Tag "${tagName}" removed from all notes`)
    
    return modifiedCount
  },

  renameTagInAllNotes: (oldTagName, newTagName) =>
    set((state) => {
      let modifiedCount = 0
      
      const updatedNotes = state.notes.map(note => {
        if (note.tags && note.tags.includes(oldTagName)) {
          modifiedCount++
          return {
            ...note,
            tags: note.tags.map(tag => tag === oldTagName ? newTagName : tag),
            updatedAt: new Date().toISOString()
          }
        }
        return note
      })
      
      // Update current note if it was affected
      const updatedCurrentNote = state.currentNote && state.currentNote.tags?.includes(oldTagName)
        ? {
            ...state.currentNote,
            tags: state.currentNote.tags.map(tag => tag === oldTagName ? newTagName : tag),
            updatedAt: new Date().toISOString()
          }
        : state.currentNote
      
      // Save to storage
      storageService.saveNotes(updatedNotes)
      
      return { 
        notes: updatedNotes,
        currentNote: updatedCurrentNote
      }
    })
})