import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// UI Store - Maneja todo el estado de la interfaz
const useUIStore = create()(
  devtools(
    (set, get) => ({
      // Estados de la UI
      showSettings: false,
      showSearch: false,
      showExportDialog: false,
      showNotebookManager: false,
      showPreviewPanel: false,
      isPreviewVisible: false,
      isFullscreen: false,

      // Layout
      layoutMode: 'normal', // 'normal' | 'markdown' | 'preview' | 'focus'
      sidebarWidth: 250,
      notesListWidth: 300,

      // Sidebar state
      expandedSections: {
        notebooks: true,
        status: false,
        tags: false,
      },

      // Modales y overlays
      modals: {
        settings: false,
        search: false,
        export: false,
        notebookManager: false,
      },

      // Toast notifications
      toasts: [],

      // Loading states
      loadingStates: {
        notes: false,
        save: false,
        delete: false,
        search: false,
      },

      // Theme
      theme: 'dark',

      // Acciones para modales
      openModal: modalName =>
        set(
          state => ({
            modals: { ...state.modals, [modalName]: true },
          }),
          false,
          'openModal'
        ),

      closeModal: modalName =>
        set(
          state => ({
            modals: { ...state.modals, [modalName]: false },
          }),
          false,
          'closeModal'
        ),

      closeAllModals: () =>
        set(
          {
            modals: {
              settings: false,
              search: false,
              export: false,
              notebookManager: false,
            },
          },
          false,
          'closeAllModals'
        ),

      // Acciones para la UI
      setShowSettings: show =>
        set({ showSettings: show }, false, 'setShowSettings'),

      setShowSearch: show => set({ showSearch: show }, false, 'setShowSearch'),

      setShowExportDialog: show =>
        set({ showExportDialog: show }, false, 'setShowExportDialog'),

      setShowNotebookManager: show =>
        set({ showNotebookManager: show }, false, 'setShowNotebookManager'),

      setShowPreviewPanel: show =>
        set({ showPreviewPanel: show }, false, 'setShowPreviewPanel'),

      setIsPreviewVisible: visible =>
        set({ isPreviewVisible: visible }, false, 'setIsPreviewVisible'),

      setIsFullscreen: fullscreen =>
        set({ isFullscreen: fullscreen }, false, 'setIsFullscreen'),

      // Layout
      setLayoutMode: mode => set({ layoutMode: mode }, false, 'setLayoutMode'),

      setSidebarWidth: width =>
        set({ sidebarWidth: width }, false, 'setSidebarWidth'),

      setNotesListWidth: width =>
        set({ notesListWidth: width }, false, 'setNotesListWidth'),

      // Sidebar
      toggleSection: section =>
        set(
          state => ({
            expandedSections: {
              ...state.expandedSections,
              [section]: !state.expandedSections[section],
            },
          }),
          false,
          'toggleSection'
        ),

      setExpandedSections: sections =>
        set({ expandedSections: sections }, false, 'setExpandedSections'),

      // Toast notifications
      addToast: toast =>
        set(
          state => ({
            toasts: [
              ...state.toasts,
              {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...toast,
              },
            ],
          }),
          false,
          'addToast'
        ),

      removeToast: toastId =>
        set(
          state => ({
            toasts: state.toasts.filter(toast => toast.id !== toastId),
          }),
          false,
          'removeToast'
        ),

      clearToasts: () => set({ toasts: [] }, false, 'clearToasts'),

      // Toast helpers
      showSuccess: (message, options = {}) => {
        get().addToast({
          type: 'success',
          message,
          duration: 3000,
          ...options,
        })
      },

      showError: (message, options = {}) => {
        get().addToast({
          type: 'error',
          message,
          duration: 5000,
          ...options,
        })
      },

      showWarning: (message, options = {}) => {
        get().addToast({
          type: 'warning',
          message,
          duration: 4000,
          ...options,
        })
      },

      showInfo: (message, options = {}) => {
        get().addToast({
          type: 'info',
          message,
          duration: 3000,
          ...options,
        })
      },

      // Loading states
      setLoading: (key, loading) =>
        set(
          state => ({
            loadingStates: { ...state.loadingStates, [key]: loading },
          }),
          false,
          'setLoading'
        ),

      // Theme
      setTheme: theme => set({ theme }, false, 'setTheme'),

      toggleTheme: () =>
        set(
          state => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
          }),
          false,
          'toggleTheme'
        ),

      // Layout helpers
      togglePreview: () =>
        set(
          state => ({
            isPreviewVisible: !state.isPreviewVisible,
          }),
          false,
          'togglePreview'
        ),

      cycleLayoutMode: () =>
        set(
          state => {
            const modes = ['normal', 'markdown', 'preview', 'focus']
            const currentIndex = modes.indexOf(state.layoutMode)
            const nextIndex = (currentIndex + 1) % modes.length
            return { layoutMode: modes[nextIndex] }
          },
          false,
          'cycleLayoutMode'
        ),

      // Computed getters
      getIsSidebarVisible: () => {
        const { layoutMode } = get()
        return layoutMode !== 'focus'
      },

      getIsNotesListVisible: () => {
        const { layoutMode } = get()
        return layoutMode !== 'markdown' && layoutMode !== 'focus'
      },

      // Reset
      reset: () =>
        set(
          {
            showSettings: false,
            showSearch: false,
            showExportDialog: false,
            showNotebookManager: false,
            showPreviewPanel: false,
            isPreviewVisible: false,
            isFullscreen: false,
            layoutMode: 'normal',
            expandedSections: {
              notebooks: true,
              status: false,
              tags: false,
            },
            modals: {
              settings: false,
              search: false,
              export: false,
              notebookManager: false,
            },
            toasts: [],
            loadingStates: {
              notes: false,
              save: false,
              delete: false,
              search: false,
            },
          },
          false,
          'reset'
        ),
    }),
    {
      name: 'ui-store',
    }
  )
)

export default useUIStore
