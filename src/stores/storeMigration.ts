/**
 * Store Migration Utilities
 * 
 * This file provides utilities to maintain backward compatibility
 * during the migration from monolithic UiSlice to specialized slices.
 * 
 * Usage: Import these utilities in components that need the old API
 * while we gradually migrate to the new slice-based approach.
 */

import { useAppStore } from './newSimpleStore'

/**
 * Legacy UiSlice compatibility layer
 * Maps old UiSlice methods to new specialized slice methods
 */
export const useLegacyUiSlice = () => {
  const store = useAppStore()
  
  return {
    // App State (migrated to AppStateSlice)
    isLoading: store.isLoading,
    error: store.error,
    setLoading: store.setLoading,
    setError: store.setError,
    
    // Navigation (migrated to NavigationSlice)
    activeSection: store.activeSection,
    expandedSections: store.expandedSections,
    setActiveSection: store.setActiveSection,
    setExpandedSection: store.setExpandedSection,
    
    // Search (migrated to SearchSlice)
    searchQuery: store.searchQuery,
    filterTags: store.filterTags,
    setSearchQuery: store.setSearchQuery,
    setFilterTags: store.setFilterTags,
    
    // Editor (migrated to EditorSlice)
    viewMode: store.viewMode,
    isPreviewVisible: store.isPreviewVisible,
    setViewMode: store.setViewMode,
    setIsPreviewVisible: store.setIsPreviewVisible,
    
    // Modals (migrated to ModalSlice)
    modals: store.modals,
    setModal: store.setModal,
    
    // Toasts (migrated to ToastSlice)
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearAllToasts: store.clearAllToasts
  }
}

/**
 * Specialized slice hooks for new code
 * Use these in new components for better type safety and performance
 */

export const useModalStore = () => {
  const store = useAppStore()
  return {
    modals: store.modals,
    setModal: store.setModal,
    closeAllModals: store.closeAllModals
  }
}

export const useToastStore = () => {
  const store = useAppStore()
  return {
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearAllToasts: store.clearAllToasts
  }
}

export const useNavigationStore = () => {
  const store = useAppStore()
  return {
    activeSection: store.activeSection,
    expandedSections: store.expandedSections,
    setActiveSection: store.setActiveSection,
    setExpandedSection: store.setExpandedSection,
    toggleExpandedSection: store.toggleExpandedSection,
    expandAllSections: store.expandAllSections,
    collapseAllSections: store.collapseAllSections
  }
}

export const useSearchStore = () => {
  const store = useAppStore()
  return {
    searchQuery: store.searchQuery,
    filterTags: store.filterTags,
    searchHistory: store.searchHistory,
    setSearchQuery: store.setSearchQuery,
    setFilterTags: store.setFilterTags,
    addTagToFilter: store.addTagToFilter,
    removeTagFromFilter: store.removeTagFromFilter,
    clearFilterTags: store.clearFilterTags,
    addToSearchHistory: store.addToSearchHistory,
    clearSearchHistory: store.clearSearchHistory,
    clearSearch: store.clearSearch
  }
}

export const useEditorStore = () => {
  const store = useAppStore()
  return {
    viewMode: store.viewMode,
    isPreviewVisible: store.isPreviewVisible,
    editorSettings: store.editorSettings,
    setViewMode: store.setViewMode,
    setIsPreviewVisible: store.setIsPreviewVisible,
    togglePreview: store.togglePreview,
    updateEditorSetting: store.updateEditorSetting,
    resetEditorSettings: store.resetEditorSettings
  }
}

export const useAppStateStore = () => {
  const store = useAppStore()
  return {
    isLoading: store.isLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    lastActivity: store.lastActivity,
    setLoading: store.setLoading,
    setError: store.setError,
    setInitialized: store.setInitialized,
    updateLastActivity: store.updateLastActivity,
    clearError: store.clearError,
    resetAppState: store.resetAppState
  }
}