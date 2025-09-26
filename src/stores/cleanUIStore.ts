/**
 * Clean UI Store - Only UI state, no data
 * All data is managed by TanStack Query
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// UI-only slices
import type { UiSlice } from './slices/uiSlice'
import { createUiSlice } from './slices/uiSlice'
import type { ModalSlice } from './slices/modalSlice'
import { createModalSlice } from './slices/modalSlice'
import type { ToastSlice } from './slices/toastSlice'
import { createToastSlice } from './slices/toastSlice'
import type { NavigationSlice } from './slices/navigationSlice'
import { createNavigationSlice } from './slices/navigationSlice'
import type { SearchSlice } from './slices/searchSlice'
import { createSearchSlice } from './slices/searchSlice'
import type { EditorSlice } from './slices/editorSlice'
import { createEditorSlice } from './slices/editorSlice'
import type { AppStateSlice } from './slices/appStateSlice'
import { createAppStateSlice } from './slices/appStateSlice'
import type { AuthSlice } from './slices/authSlice'
import { createAuthSlice } from './slices/authSlice'
import type { FilterSlice } from './slices/filterSlice'
import { createFilterSlice } from './slices/filterSlice'

// New UI-only slices
import type { NoteUISlice } from './slices/noteUISlice'
import { createNoteUISlice } from './slices/noteUISlice'
import type { NotebookUISlice } from './slices/notebookUISlice'
import { createNotebookUISlice } from './slices/notebookUISlice'
import type { SettingsUISlice } from './slices/settingsUISlice'
import { createSettingsUISlice } from './slices/settingsUISlice'

// Clean UI Store interface with only UI slices
export type CleanUIStore = UiSlice &
  ModalSlice &
  ToastSlice &
  NavigationSlice &
  SearchSlice &
  EditorSlice &
  AppStateSlice &
  AuthSlice &
  FilterSlice &
  NoteUISlice &
  NotebookUISlice &
  SettingsUISlice

// Create the clean UI store
export const useCleanUIStore = create<CleanUIStore>()(
  devtools(
    (...args) => ({
      ...createUiSlice(...args),
      ...createModalSlice(...args),
      ...createToastSlice(...args),
      ...createNavigationSlice(...args),
      ...createSearchSlice(...args),
      ...createEditorSlice(...args),
      ...createAppStateSlice(...args),
      ...createAuthSlice(...args),
      ...createFilterSlice(...args),
      ...createNoteUISlice(...args),
      ...createNotebookUISlice(...args),
      ...createSettingsUISlice(...args),
    }),
    { 
      name: 'clean-ui-store',
      // Only track UI state changes in devtools
      trace: false,
    }
  )
)

// Helper hooks for specific UI domains
export const useNoteUI = () => {
  const store = useCleanUIStore()
  return {
    selectedNoteId: store.selectedNoteId,
    setSelectedNoteId: store.setSelectedNoteId,
    isEditorOpen: store.isEditorOpen,
    openEditor: store.openEditor,
    closeEditor: store.closeEditor,
    sortBy: store.sortBy,
    sortDirection: store.sortDirection,
    setSortBy: store.setSortBy,
    setSortDirection: store.setSortDirection,
    toggleSortDirection: store.toggleSortDirection,
    viewMode: store.viewMode,
    setViewMode: store.setViewMode,
    selectedNoteIds: store.selectedNoteIds,
    toggleNoteSelection: store.toggleNoteSelection,
    clearSelection: store.clearSelection,
    selectAll: store.selectAll,
  }
}

export const useModalStore = <T = any>(selector?: (state: ModalSlice) => T) => {
  const store = useCleanUIStore()
  
  if (selector) {
    return useCleanUIStore(selector)
  }
  
  return {
    modals: store.modals,
    setModal: store.setModal,
    closeAllModals: store.closeAllModals,
    openModal: (modal: string) => store.setModal(modal, true),
    closeModal: (modal: string) => store.setModal(modal, false),
    // Complex modal states
    tagSettingsModal: store.tagSettingsModal,
    setTagSettingsModal: store.setTagSettingsModal,
    renameNotebookModal: store.renameNotebookModal,
    setRenameNotebookModal: store.setRenameNotebookModal,
    // Context menus
    tagContextMenu: store.tagContextMenu,
    notebookContextMenu: store.notebookContextMenu,
    trashContextMenu: store.trashContextMenu,
    setTagContextMenu: store.setTagContextMenu,
    setNotebookContextMenu: store.setNotebookContextMenu,
    setTrashContextMenu: store.setTrashContextMenu,
    closeAllContextMenus: store.closeAllContextMenus,
  }
}

export const useToastStore = () => {
  const store = useCleanUIStore()
  return {
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
    showSuccess: (message: string) => store.addToast({
      id: Date.now().toString(),
      message,
      type: 'success',
    }),
    showError: (message: string) => store.addToast({
      id: Date.now().toString(),
      message,
      type: 'error',
    }),
  }
}

export const useUiStore = () => {
  const store = useCleanUIStore()
  return {
    activeSection: store.activeSection,
    setActiveSection: store.setActiveSection,
    sidebarWidth: store.sidebarWidth,
    setSidebarWidth: store.setSidebarWidth,
    notesListWidth: store.notesListWidth,
    setNotesListWidth: store.setNotesListWidth,
    selectedTag: store.selectedTag,
    setSelectedTag: store.setSelectedTag,
    searchQuery: store.searchQuery,
    setSearchQuery: store.setSearchQuery,
  }
}

export const useEditorStore = () => {
  const store = useCleanUIStore()
  return {
    viewMode: store.viewMode,
    setViewMode: store.setViewMode,
    fontSize: store.fontSize,
    setFontSize: store.setFontSize,
    lineHeight: store.lineHeight,
    setLineHeight: store.setLineHeight,
    editorContent: store.editorContent,
    setEditorContent: store.setEditorContent,
  }
}

export const useNavigationStore = () => {
  const store = useCleanUIStore()
  return {
    activeSection: store.activeSection,
    setActiveSection: store.setActiveSection,
    selectedNotebookId: store.selectedNotebookId,
    setSelectedNotebookId: store.setSelectedNotebookId,
    selectedTag: store.selectedTag,
    setSelectedTag: store.setSelectedTag,
  }
}

export const useNotebookUI = () => {
  const store = useCleanUIStore()
  return {
    expandedNotebooks: store.expandedNotebooks,
    toggleNotebookExpanded: store.toggleNotebookExpanded,
    expandNotebook: store.expandNotebook,
    collapseNotebook: store.collapseNotebook,
    editingNotebookId: store.editingNotebookId,
    startEditingNotebook: store.startEditingNotebook,
    stopEditingNotebook: store.stopEditingNotebook,
    isCreatingNotebook: store.isCreatingNotebook,
    parentNotebookId: store.parentNotebookId,
    startCreatingNotebook: store.startCreatingNotebook,
    stopCreatingNotebook: store.stopCreatingNotebook,
  }
}

export const useSettingsUI = () => {
  const store = useCleanUIStore()
  return {
    isSettingsOpen: store.isSettingsOpen,
    activeSettingsTab: store.activeSettingsTab,
    openSettings: store.openSettings,
    closeSettings: store.closeSettings,
    setActiveSettingsTab: store.setActiveSettingsTab,
    settingsSearchQuery: store.settingsSearchQuery,
    setSettingsSearchQuery: store.setSettingsSearchQuery,
    hasUnsavedChanges: store.hasUnsavedChanges,
    setHasUnsavedChanges: store.setHasUnsavedChanges,
  }
}

// Additional helper hooks for compatibility
export const useNoteUIStore = useNoteUI
export const useNotebookUIStore = useNotebookUI
export const useSettingsUIStore = useSettingsUI

// Re-export types
export type {
  UiSlice,
  ModalSlice,
  ToastSlice,
  NavigationSlice,
  SearchSlice,
  EditorSlice,
  AppStateSlice,
  AuthSlice,
  FilterSlice,
  NoteUISlice,
  NotebookUISlice,
  SettingsUISlice,
}

// Export for debugging in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__cleanUIStore = useCleanUIStore
}