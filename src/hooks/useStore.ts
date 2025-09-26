/**
 * Store selection hook based on feature flags
 * Allows gradual migration from old store to clean UI store
 */

import { featureFlags } from '../config/featureFlags'
import { useAppStore } from '../stores/newSimpleStore'
import { useCleanUIStore } from '../stores/cleanUIStore'
import type { CleanUIStore } from '../stores/cleanUIStore'

/**
 * Hook that returns the appropriate store based on feature flag
 * During migration, this allows components to work with both stores
 */
export const useStore = () => {
  if (featureFlags.useCleanArchitecture) {
    return useCleanUIStore()
  }
  
  // Return old store with adapter to match clean store interface
  const oldStore = useAppStore()
  
  // Adapter to make old store compatible with clean store interface
  const adapter: Partial<CleanUIStore> = {
    // UI slice - already clean
    ...oldStore,
    
    // Note UI adaptations
    selectedNoteId: oldStore.selectedNote?.id || null,
    setSelectedNoteId: (id) => {
      const note = oldStore.notes.find(n => n.id === id)
      if (note) oldStore.setSelectedNote(note)
      else oldStore.setSelectedNote(null)
    },
    isEditorOpen: !!oldStore.selectedNote,
    openEditor: (noteId) => {
      if (noteId) {
        const note = oldStore.notes.find(n => n.id === noteId)
        if (note) oldStore.setSelectedNote(note)
      }
    },
    closeEditor: () => oldStore.setSelectedNote(null),
    
    // Sort preferences (if they exist in old store)
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    setSortBy: () => {},
    setSortDirection: () => {},
    toggleSortDirection: () => {},
    
    // View preferences
    viewMode: 'list',
    setViewMode: () => {},
    
    // Multi-select
    selectedNoteIds: new Set(),
    toggleNoteSelection: () => {},
    clearSelection: () => {},
    selectAll: () => {},
    
    // Notebook UI adaptations
    expandedNotebooks: new Set(['default']),
    toggleNotebookExpanded: () => {},
    expandNotebook: () => {},
    collapseNotebook: () => {},
    expandAllNotebooks: () => {},
    collapseAllNotebooks: () => {},
    
    editingNotebookId: null,
    startEditingNotebook: () => {},
    stopEditingNotebook: () => {},
    
    isCreatingNotebook: false,
    parentNotebookId: null,
    startCreatingNotebook: () => {},
    stopCreatingNotebook: () => {},
    
    // Settings UI adaptations
    isSettingsOpen: oldStore.modals.settings,
    activeSettingsTab: 'general',
    openSettings: (tab) => oldStore.openModal('settings'),
    closeSettings: () => oldStore.closeModal('settings'),
    setActiveSettingsTab: () => {},
    
    settingsSearchQuery: '',
    setSettingsSearchQuery: () => {},
    
    hasUnsavedChanges: false,
    setHasUnsavedChanges: () => {},
    
    // Provide defaults for new UI state
    isDragging: false,
    setIsDragging: () => {},
    
    draggingNotebookId: null,
    dragOverNotebookId: null,
    setDraggingNotebook: () => {},
    setDragOverNotebook: () => {},
    
    contextMenuNotebookId: null,
    setContextMenuNotebook: () => {},
    
    isImporting: false,
    isExporting: false,
    setIsImporting: () => {},
    setIsExporting: () => {},
    
    validationErrors: {},
    setValidationError: () => {},
    clearValidationErrors: () => {},
  }
  
  return adapter as CleanUIStore
}

/**
 * Specific hooks for different UI domains
 * These work with both old and new stores
 */
export const useUIStore = () => {
  const store = useStore()
  return {
    theme: store.theme,
    setTheme: store.setTheme,
    sidebarWidth: store.sidebarWidth,
    notesListWidth: store.notesListWidth,
    setSidebarWidth: store.setSidebarWidth,
    setNotesListWidth: store.setNotesListWidth,
    isSidebarOpen: store.isSidebarOpen,
    toggleSidebar: store.toggleSidebar,
    isAIChatOpen: store.isAIChatOpen,
    toggleAIChat: store.toggleAIChat,
  }
}

export const useModalStore = () => {
  const store = useStore()
  return {
    modals: store.modals,
    openModal: store.openModal,
    closeModal: store.closeModal,
    toggleModal: store.toggleModal,
  }
}

export const useToastStore = () => {
  const store = useStore()
  return {
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
  }
}

export const useNavigationStore = () => {
  const store = useStore()
  return {
    activeSection: store.activeSection,
    setActiveSection: store.setActiveSection,
    expandedSections: store.expandedSections,
    toggleSection: store.toggleSection,
  }
}

export const useEditorStore = () => {
  const store = useStore()
  return {
    viewMode: store.viewMode,
    setViewMode: store.setViewMode,
    fontSize: store.fontSize,
    lineHeight: store.lineHeight,
    setFontSize: store.setFontSize,
    setLineHeight: store.setLineHeight,
  }
}