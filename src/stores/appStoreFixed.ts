// Fixed app store without infinite loops
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Note } from '../types'
import { storageService } from '../lib/storage'
import MarkdownProcessor from '../lib/markdown'

interface AppStoreState {
  // Notes state
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
  showSettings: boolean
  showSearch: boolean
  showExportDialog: boolean
  showNotebookManager: boolean
  showPreviewPanel: boolean
  isPreviewVisible: boolean
  isFullscreen: boolean
  layoutMode: 'normal' | 'markdown' | 'preview' | 'focus'
  sidebarWidth: number
  notesListWidth: number
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
  loadingStates: {
    notes: boolean
    save: boolean
    delete: boolean
    search: boolean
  }
  theme: string
}

interface AppStoreActions {
  // Notes actions
  setNotes: (notes: Note[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentNote: (note: Note | null) => void
  setSelectedNoteId: (id: string | null) => void
  setActiveSection: (section: string) => void
  setViewMode: (mode: 'edit' | 'preview') => void
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  createNewNote: () => Note
  updateNote: (note: Note) => void
  deleteNote: (noteId: string) => void
  duplicateNote: (noteId: string) => Note | null
  openEditor: (noteId: string) => void
  closeEditor: () => void
  updateEditorContent: (content: string) => void

  // UI actions
  openModal: (modalName: string) => void
  closeModal: (modalName: string) => void
  closeAllModals: () => void
  setIsPreviewVisible: (visible: boolean) => void
  toggleSection: (section: string) => void
  addToast: (toast: any) => void
  removeToast: (toastId: string) => void
  showSuccess: (message: string, options?: any) => void
  showError: (message: string, options?: any) => void
  showWarning: (message: string, options?: any) => void
  showInfo: (message: string, options?: any) => void
  setTheme: (theme: string) => void
  getIsSidebarVisible: () => boolean
  getIsNotesListVisible: () => boolean
}

type AppStore = AppStoreState & AppStoreActions

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
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
        showSettings: false,
        showSearch: false,
        showExportDialog: false,
        showNotebookManager: false,
        showPreviewPanel: false,
        isPreviewVisible: false,
        isFullscreen: false,
        layoutMode: 'normal',
        sidebarWidth: 250,
        notesListWidth: 300,
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
        loadingStates: {
          notes: false,
          save: false,
          delete: false,
          search: false
        },
        theme: 'dark',

        // Actions
        setNotes: (notes) => set({ notes }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setCurrentNote: (currentNote) => set({ currentNote }),
        setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
        setActiveSection: (activeSection) => set({ activeSection }),
        setViewMode: (viewMode) => set({ viewMode }),
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        setFilterTags: (filterTags) => set({ filterTags }),

        createNewNote: () => {
          const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            notebook: 'personal',
            tags: [],
            status: 'active',
            isPinned: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set((state) => ({
            notes: [newNote, ...state.notes],
            currentNote: newNote,
            selectedNoteId: newNote.id,
            isEditorOpen: true
          }))

          // Save to storage
          try {
            storageService.saveNote(newNote)
          } catch (error) {
            console.error('Error saving new note:', error)
            set({ error: 'Failed to save note' })
          }

          return newNote
        },

        updateNote: (updatedNote) => {
          // Auto-extract title and tags
          const title = MarkdownProcessor.extractTitle(updatedNote.content) || 'Untitled Note'
          const tags = MarkdownProcessor.extractTags(updatedNote.content)
          
          const noteWithMetadata = {
            ...updatedNote,
            title,
            tags,
            updatedAt: new Date().toISOString()
          }

          set((state) => ({
            notes: state.notes.map(note => 
              note.id === noteWithMetadata.id ? noteWithMetadata : note
            ),
            currentNote: state.currentNote?.id === noteWithMetadata.id 
              ? noteWithMetadata 
              : state.currentNote
          }))

          // Save to storage
          try {
            storageService.saveNote(noteWithMetadata)
          } catch (error) {
            console.error('Error updating note:', error)
            set({ error: 'Failed to update note' })
          }
        },

        deleteNote: (noteId) => {
          set((state) => ({
            notes: state.notes.filter(note => note.id !== noteId),
            currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
            selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
            isEditorOpen: state.currentNote?.id === noteId ? false : state.isEditorOpen
          }))

          // Remove from storage
          try {
            storageService.deleteNote(noteId)
          } catch (error) {
            console.error('Error deleting note:', error)
            set({ error: 'Failed to delete note' })
          }
        },

        duplicateNote: (noteId) => {
          const { notes } = get()
          const originalNote = notes.find(note => note.id === noteId)
          
          if (!originalNote) return null

          const duplicatedNote: Note = {
            ...originalNote,
            id: Date.now().toString(),
            title: `${originalNote.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false
          }

          set((state) => ({
            notes: [duplicatedNote, ...state.notes]
          }))

          // Save to storage
          try {
            storageService.saveNote(duplicatedNote)
          } catch (error) {
            console.error('Error duplicating note:', error)
            set({ error: 'Failed to duplicate note' })
          }

          return duplicatedNote
        },

        openEditor: (noteId) => {
          const { notes } = get()
          const note = notes.find(n => n.id === noteId)
          
          if (note) {
            set({
              currentNote: note,
              selectedNoteId: noteId,
              isEditorOpen: true,
              viewMode: 'edit'
            })
          }
        },

        closeEditor: () => {
          set({
            isEditorOpen: false,
            currentNote: null,
            viewMode: 'preview'
          })
        },

        updateEditorContent: (content) => {
          set((state) => {
            if (!state.currentNote) return state
            
            const updatedNote = {
              ...state.currentNote,
              content,
              updatedAt: new Date().toISOString()
            }
            
            return {
              currentNote: updatedNote,
              notes: state.notes.map(note => 
                note.id === updatedNote.id ? updatedNote : note
              )
            }
          })
        },

        // UI Actions
        openModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: true }
          })),

        closeModal: (modalName) =>
          set((state) => ({
            modals: { ...state.modals, [modalName]: false }
          })),

        closeAllModals: () =>
          set({
            modals: {
              settings: false,
              search: false,
              export: false,
              notebookManager: false
            }
          }),

        setIsPreviewVisible: (isPreviewVisible) =>
          set({ isPreviewVisible }),

        toggleSection: (section) =>
          set((state) => ({
            expandedSections: {
              ...state.expandedSections,
              [section]: !state.expandedSections[section as keyof typeof state.expandedSections]
            }
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

        showSuccess: (message, options = {}) => {
          get().addToast({
            type: 'success',
            message,
            duration: 3000,
            ...options
          })
        },

        showError: (message, options = {}) => {
          get().addToast({
            type: 'error',
            message,
            duration: 5000,
            ...options
          })
        },

        showWarning: (message, options = {}) => {
          get().addToast({
            type: 'warning',
            message,
            duration: 4000,
            ...options
          })
        },

        showInfo: (message, options = {}) => {
          get().addToast({
            type: 'info',
            message,
            duration: 3000,
            ...options
          })
        },

        setTheme: (theme) => set({ theme }),

        getIsSidebarVisible: () => {
          const { layoutMode } = get()
          return layoutMode !== 'focus'
        },

        getIsNotesListVisible: () => {
          const { layoutMode } = get()
          return layoutMode !== 'markdown' && layoutMode !== 'focus'
        }
      }),
      {
        name: 'nototo-app-store',
        partialize: (state) => ({
          notes: state.notes,
          theme: state.theme,
          layoutMode: state.layoutMode,
          sidebarWidth: state.sidebarWidth,
          notesListWidth: state.notesListWidth,
          expandedSections: state.expandedSections
        })
      }
    ),
    {
      name: 'nototo-store'
    }
  )
)

// Selector functions to avoid creating new objects on every render
export const selectNotes = (state: AppStore) => state.notes
export const selectCurrentNote = (state: AppStore) => state.currentNote
export const selectIsEditorOpen = (state: AppStore) => state.isEditorOpen
export const selectModals = (state: AppStore) => state.modals
export const selectToasts = (state: AppStore) => state.toasts
export const selectTheme = (state: AppStore) => state.theme

// Helper functions that don't cause infinite loops
export const getFilteredNotes = (
  notes: Note[], 
  activeSection: string, 
  searchQuery: string, 
  filterTags: string[]
): Note[] => {
  let filtered = notes

  // Filter by section
  switch (activeSection) {
    case 'all-notes':
      filtered = notes.filter(note => !note.isTrashed)
      break
    case 'pinned':
      filtered = notes.filter(note => note.isPinned && !note.isTrashed)
      break
    case 'trash':
      filtered = notes.filter(note => note.isTrashed)
      break
    case 'recent':
      filtered = notes
        .filter(note => !note.isTrashed)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
      break
    default:
      if (activeSection.startsWith('status-')) {
        const status = activeSection.replace('status-', '')
        filtered = notes.filter(note => note.status === status && !note.isTrashed)
      } else if (activeSection.startsWith('tag-')) {
        const tag = activeSection.replace('tag-', '')
        filtered = notes.filter(note => note.tags.includes(tag) && !note.isTrashed)
      } else if (activeSection.startsWith('notebook-')) {
        const notebook = activeSection.replace('notebook-', '')
        filtered = notes.filter(note => note.notebook === notebook && !note.isTrashed)
      } else {
        filtered = notes.filter(note => !note.isTrashed)
      }
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query)) ||
      note.notebook.toLowerCase().includes(query)
    )
  }

  // Apply tag filters
  if (filterTags.length > 0) {
    filtered = filtered.filter(note =>
      filterTags.every(tag => note.tags.includes(tag))
    )
  }

  return filtered
}

export const getStats = (notes: Note[]) => {
  return {
    total: notes.filter(note => !note.isTrashed).length,
    pinned: notes.filter(note => note.isPinned && !note.isTrashed).length,
    trashed: notes.filter(note => note.isTrashed).length,
    byStatus: {
      active: notes.filter(note => note.status === 'active' && !note.isTrashed).length,
      'on-hold': notes.filter(note => note.status === 'on-hold' && !note.isTrashed).length,
      completed: notes.filter(note => note.status === 'completed' && !note.isTrashed).length,
      dropped: notes.filter(note => note.status === 'dropped' && !note.isTrashed).length
    }
  }
}

export default useAppStore