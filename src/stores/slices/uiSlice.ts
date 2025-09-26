import type { StateCreator } from 'zustand'

// Re-export Toast type for backward compatibility
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  timestamp: string
}

export interface UiSlice {
  // Legacy UI state (kept for backward compatibility)
  // Most functionality has been moved to specialized slices:
  // - modals -> modalSlice
  // - toasts -> toastSlice
  // - search -> searchSlice
  // - navigation -> navigationSlice
  // - editor -> editorSlice
  // - app state -> appStateSlice

  // Remaining UI state
  theme: 'light' | 'dark' | 'system'
  sidebarWidth: number
  notesListWidth: number
  isSidebarOpen: boolean
  isAIChatOpen: boolean

  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarWidth: (width: number) => void
  setNotesListWidth: (width: number) => void
  setIsSidebarOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
  setIsAIChatOpen: (isOpen: boolean) => void
  toggleAIChat: () => void
  resetLayout: () => void
}

const defaultLayout = {
  sidebarWidth: 240,
  notesListWidth: 320,
}

export const createUiSlice: StateCreator<UiSlice> = set => ({
  // Initial state
  theme: 'system',
  sidebarWidth: defaultLayout.sidebarWidth,
  notesListWidth: defaultLayout.notesListWidth,
  isSidebarOpen: true,
  isAIChatOpen: false,

  // Actions
  setTheme: theme => set({ theme }),
  setSidebarWidth: sidebarWidth => set({ sidebarWidth }),
  setNotesListWidth: notesListWidth => set({ notesListWidth }),
  setIsSidebarOpen: isSidebarOpen => set({ isSidebarOpen }),
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsAIChatOpen: isAIChatOpen => set({ isAIChatOpen }),
  toggleAIChat: () => set(state => ({ isAIChatOpen: !state.isAIChatOpen })),

  resetLayout: () =>
    set({
      sidebarWidth: defaultLayout.sidebarWidth,
      notesListWidth: defaultLayout.notesListWidth,
      isSidebarOpen: true,
      isAIChatOpen: false,
    }),
})
