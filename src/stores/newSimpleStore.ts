import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { NotesSlice } from './slices/notesSlice'
import { createNotesSlice } from './slices/notesSlice'
import type { UiSlice } from './slices/uiSlice'
import { createUiSlice } from './slices/uiSlice'
import type { TemplatesSlice } from './slices/templatesSlice'
import { createTemplatesSlice } from './slices/templatesSlice'
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
import type { SettingsSlice } from './slices/settingsSlice'
import { createSettingsSlice, initializeSettings } from './slices/settingsSlice'
import type { AuthSlice } from './slices/authSlice'
import { createAuthSlice, initializeAuth } from './slices/authSlice'
import type { FilterSlice } from './slices/filterSlice'
import { createFilterSlice } from './slices/filterSlice'
import type { NotebooksSlice } from './slices/notebooksSlice'
import {
  createNotebooksSlice,
  initializeNotebooks,
} from './slices/notebooksSlice'
import { initializeNotes } from './slices/notesSlice'
import { initializeTemplates } from './slices/templatesSlice'

// Combined store interface with all specialized slices
type AppStore = NotesSlice &
  UiSlice &
  TemplatesSlice &
  ModalSlice &
  ToastSlice &
  NavigationSlice &
  SearchSlice &
  EditorSlice &
  AppStateSlice &
  SettingsSlice &
  AuthSlice &
  FilterSlice &
  NotebooksSlice

// Create the combined store
export const useAppStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createNotesSlice(...args),
      ...createUiSlice(...args),
      ...createTemplatesSlice(...args),
      ...createModalSlice(...args),
      ...createToastSlice(...args),
      ...createNavigationSlice(...args),
      ...createSearchSlice(...args),
      ...createEditorSlice(...args),
      ...createAppStateSlice(...args),
      ...createSettingsSlice(...args),
      ...createAuthSlice(...args),
      ...createFilterSlice(...args),
      ...createNotebooksSlice(...args),
    }),
    { name: 'app-store' }
  )
)

// Initialize all slices after store creation
const storeState = useAppStore.getState()
initializeSettings(storeState)
initializeNotes(storeState)
initializeTemplates(storeState)
initializeAuth(storeState)
// Note: initializeNotebooks is called from useAppInit to ensure proper sequencing

// Store reference for storage service (needed for Electron sync compatibility)
// Only expose in development or Electron environment for debugging
if (
  typeof globalThis !== 'undefined' &&
  (process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.electronAPI))
) {
  interface AppGlobal {
    __appStore?: typeof useAppStore
  }
  ;(globalThis as AppGlobal).__appStore = useAppStore
}

// Re-export types for convenience
export type {
  NotesSlice,
  UiSlice,
  TemplatesSlice,
  ModalSlice,
  ToastSlice,
  NavigationSlice,
  SearchSlice,
  EditorSlice,
  AppStateSlice,
  SettingsSlice,
  AuthSlice,
  // TEMPORALMENTE COMENTADO - CONFLICTO CON SISTEMA EXISTENTE
  // NotebooksSlice,
  AppStore,
}
export type { Template } from './slices/templatesSlice'
export type { Toast } from './slices/toastSlice'
export type { User } from './slices/authSlice'

// Legacy alias for backward compatibility during migration
export const useSimpleStore = useAppStore
export default useAppStore
