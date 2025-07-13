import { StateCreator } from 'zustand'

export interface ModalSlice {
  // Modal state
  modals: {
    settings: boolean
    search: boolean
    export: boolean
    notebookManager: boolean
    template: boolean
    tagModal: boolean
  }

  // Modal actions
  setModal: (modal: string, open: boolean) => void
  closeAllModals: () => void
}

export const createModalSlice: StateCreator<ModalSlice> = (set) => ({
  // Initial state
  modals: {
    settings: false,
    search: false,
    export: false,
    notebookManager: false,
    template: false,
    tagModal: false
  },

  // Actions
  setModal: (modal, open) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: open }
    })),

  closeAllModals: () =>
    set({
      modals: {
        settings: false,
        search: false,
        export: false,
        notebookManager: false,
        template: false,
        tagModal: false
      }
    })
})