/**
 * Settings UI Slice - UI state for settings, no data persistence
 * Actual settings data is managed by TanStack Query
 */

import { StateCreator } from 'zustand'

export interface SettingsUISlice {
  // Settings panel state
  isSettingsOpen: boolean
  activeSettingsTab: string
  openSettings: (tab?: string) => void
  closeSettings: () => void
  setActiveSettingsTab: (tab: string) => void
  
  // Settings search
  settingsSearchQuery: string
  setSettingsSearchQuery: (query: string) => void
  
  // Unsaved changes tracking
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Import/Export UI state
  isImporting: boolean
  isExporting: boolean
  setIsImporting: (importing: boolean) => void
  setIsExporting: (exporting: boolean) => void
  
  // Validation state
  validationErrors: Record<string, string>
  setValidationError: (field: string, error: string | null) => void
  clearValidationErrors: () => void
}

export const createSettingsUISlice: StateCreator<SettingsUISlice> = (set) => ({
  // Settings panel state
  isSettingsOpen: false,
  activeSettingsTab: 'general',
  openSettings: (tab) => set({
    isSettingsOpen: true,
    activeSettingsTab: tab || 'general',
  }),
  closeSettings: () => set({
    isSettingsOpen: false,
    hasUnsavedChanges: false,
    validationErrors: {},
  }),
  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
  
  // Settings search
  settingsSearchQuery: '',
  setSettingsSearchQuery: (query) => set({ settingsSearchQuery: query }),
  
  // Unsaved changes tracking
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  
  // Import/Export UI state
  isImporting: false,
  isExporting: false,
  setIsImporting: (importing) => set({ isImporting: importing }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  
  // Validation state
  validationErrors: {},
  setValidationError: (field, error) => set((state) => ({
    validationErrors: error
      ? { ...state.validationErrors, [field]: error }
      : Object.fromEntries(
          Object.entries(state.validationErrors).filter(([key]) => key !== field)
        ),
  })),
  clearValidationErrors: () => set({ validationErrors: {} }),
})