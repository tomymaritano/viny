// Main application store with modular slices
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createNotesSlice, NotesSlice } from './slices/notesSlice'
import { UIState } from '../types'

// UI Slice (keeping it simple for now)
interface UISlice {
  // UI State
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

  // UI Actions
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

// Combined store type
type AppStore = NotesSlice & UISlice

// Create the store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        // Notes slice
        ...createNotesSlice(set, get, api),

        // UI slice
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
          // Only persist certain parts of the state
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

// Selectors for better performance
export const useNotes = () => useAppStore(state => state.notes)
export const useCurrentNote = () => useAppStore(state => state.currentNote)
export const useIsEditorOpen = () => useAppStore(state => state.isEditorOpen)
export const useModals = () => useAppStore(state => state.modals)
export const useToasts = () => useAppStore(state => state.toasts)
export const useTheme = () => useAppStore(state => state.theme)

export default useAppStore