import { StateCreator } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  timestamp: string
}

export interface UiSlice {
  // UI state
  isLoading: boolean
  error: string | null
  activeSection: string
  viewMode: 'edit' | 'preview'
  searchQuery: string
  filterTags: string[]
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
    template: boolean
    tagModal: boolean
  }
  toasts: Toast[]

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActiveSection: (section: string) => void
  setViewMode: (mode: 'edit' | 'preview') => void
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  setIsPreviewVisible: (visible: boolean) => void
  setExpandedSection: (section: string, expanded: boolean) => void
  setModal: (modal: string, open: boolean) => void
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  // Initial state
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
    notebookManager: false,
    template: false,
    tagModal: false
  },
  toasts: [],

  // Actions
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

  clearAllToasts: () => set({ toasts: [] })
})