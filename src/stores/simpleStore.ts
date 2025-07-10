// Simplified store without any computed functions to avoid infinite loops
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Note } from '../types'

interface SimpleAppStore {
  // Basic state only - no computed functions
  notes: Note[]
  currentNote: Note | null
  selectedNoteId: string | null
  isEditorOpen: boolean
  isLoading: boolean
  error: string | null
  activeSection: string
  viewMode: 'edit' | 'preview'
  searchQuery: string
  filterTags: string[]

  // UI state
  isPreviewVisible: boolean
  expandedSections: {
    notebooks: boolean
    status: boolean
    tags: boolean
  }
  modals: {
    settings: boolean
    search: boolean
    export: boolean
    notebookManager: boolean
  }
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
    timestamp: string
  }>
  theme: string

  // Simple setters only
  setNotes: (notes: Note[]) => void
  setCurrentNote: (note: Note | null) => void
  setSelectedNoteId: (id: string | null) => void
  setIsEditorOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActiveSection: (section: string) => void
  setViewMode: (mode: 'edit' | 'preview') => void
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  setIsPreviewVisible: (visible: boolean) => void
  setExpandedSection: (section: string, expanded: boolean) => void
  setModal: (modal: string, open: boolean) => void
  addToast: (toast: any) => void
  removeToast: (id: string) => void
  setTheme: (theme: string) => void

  // Basic note operations
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: string) => void
}

export const useSimpleStore = create<SimpleAppStore>()(
  devtools(
    (set) => ({
      // Initial state
      notes: [],
      currentNote: null,
      selectedNoteId: null,
      isEditorOpen: false,
      isLoading: false,
      error: null,
      activeSection: 'all-notes',
      viewMode: 'edit',
      searchQuery: '',
      filterTags: [],
      isPreviewVisible: false,
      expandedSections: {
        notebooks: true,
        status: false,
        tags: false
      },
      modals: {
        settings: false,
        search: false,
        export: false,
        notebookManager: false
      },
      toasts: [],
      theme: 'dark',

      // Simple setters
      setNotes: (notes) => set({ notes }),
      setCurrentNote: (currentNote) => set({ currentNote }),
      setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
      setIsEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setActiveSection: (activeSection) => set({ activeSection }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterTags: (filterTags) => set({ filterTags }),
      setIsPreviewVisible: (isPreviewVisible) => set({ isPreviewVisible }),
      
      setExpandedSection: (section, expanded) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [section]: expanded }
        })),

      setModal: (modal, open) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: open }
        })),

      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...toast
          }]
        })),

      removeToast: (toastId) =>
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== toastId)
        })),

      setTheme: (theme) => set({ theme }),

      // Basic note operations
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
        }))
    }),
    { name: 'simple-store' }
  )
)

export default useSimpleStore