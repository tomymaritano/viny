import type { StateCreator } from 'zustand'

export interface ModalSlice {
  // Modal state
  modals: {
    settings: boolean
    search: boolean
    export: boolean
    notebookManager: boolean
    template: boolean
    tagModal: boolean
    aiOnboarding: boolean
    createNotebook: boolean
    revisionHistory: boolean
  }
  
  // Complex modal states
  tagSettingsModal: {
    show: boolean
    tagName: string
  }
  renameNotebookModal: {
    show: boolean
    notebook: any | null
  }
  
  // Context menu states
  tagContextMenu: {
    isVisible: boolean
    position: { x: number; y: number }
    tagName: string
    showColorPicker: boolean
  }
  notebookContextMenu: {
    isVisible: boolean
    position: { x: number; y: number }
    notebook: any | null
  }
  trashContextMenu: {
    isVisible: boolean
    position: { x: number; y: number }
  }

  // Modal actions
  setModal: (modal: string, open: boolean) => void
  closeAllModals: () => void
  
  // Tag settings modal actions
  setTagSettingsModal: (settings: { show: boolean; tagName: string }) => void
  
  // Rename notebook modal actions
  setRenameNotebookModal: (settings: { show: boolean; notebook: any | null }) => void
  
  // Context menu actions
  setTagContextMenu: (menu: Partial<ModalSlice['tagContextMenu']>) => void
  setNotebookContextMenu: (menu: Partial<ModalSlice['notebookContextMenu']>) => void
  setTrashContextMenu: (menu: Partial<ModalSlice['trashContextMenu']>) => void
  closeAllContextMenus: () => void
}

export const createModalSlice: StateCreator<ModalSlice> = set => ({
  // Initial state
  modals: {
    settings: false,
    search: false,
    export: false,
    notebookManager: false,
    template: false,
    tagModal: false,
    aiOnboarding: false,
    createNotebook: false,
    revisionHistory: false,
  },
  
  // Complex modal states
  tagSettingsModal: {
    show: false,
    tagName: '',
  },
  renameNotebookModal: {
    show: false,
    notebook: null,
  },
  
  // Context menu states
  tagContextMenu: {
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false,
  },
  notebookContextMenu: {
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null,
  },
  trashContextMenu: {
    isVisible: false,
    position: { x: 0, y: 0 },
  },

  // Actions
  setModal: (modal, open) =>
    set(state => ({
      modals: { ...state.modals, [modal]: open },
    })),

  closeAllModals: () =>
    set({
      modals: {
        settings: false,
        search: false,
        export: false,
        notebookManager: false,
        template: false,
        tagModal: false,
        aiOnboarding: false,
        createNotebook: false,
        revisionHistory: false,
      },
      tagSettingsModal: { show: false, tagName: '' },
      renameNotebookModal: { show: false, notebook: null },
    }),
    
  // Tag settings modal actions
  setTagSettingsModal: settings =>
    set({ tagSettingsModal: settings }),
    
  // Rename notebook modal actions
  setRenameNotebookModal: settings =>
    set({ renameNotebookModal: settings }),
    
  // Context menu actions
  setTagContextMenu: menu =>
    set(state => ({
      tagContextMenu: { ...state.tagContextMenu, ...menu },
    })),
    
  setNotebookContextMenu: menu =>
    set(state => ({
      notebookContextMenu: { ...state.notebookContextMenu, ...menu },
    })),
    
  setTrashContextMenu: menu =>
    set(state => ({
      trashContextMenu: { ...state.trashContextMenu, ...menu },
    })),
    
  closeAllContextMenus: () =>
    set({
      tagContextMenu: {
        isVisible: false,
        position: { x: 0, y: 0 },
        tagName: '',
        showColorPicker: false,
      },
      notebookContextMenu: {
        isVisible: false,
        position: { x: 0, y: 0 },
        notebook: null,
      },
      trashContextMenu: {
        isVisible: false,
        position: { x: 0, y: 0 },
      },
    }),
})
