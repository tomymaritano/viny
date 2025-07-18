import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { NotesSlice, createNotesSlice } from './slices/notesSlice'
import { UiSlice, createUiSlice } from './slices/uiSlice'
import { TemplatesSlice, createTemplatesSlice } from './slices/templatesSlice'
import { ModalSlice, createModalSlice } from './slices/modalSlice'
import { ToastSlice, createToastSlice } from './slices/toastSlice'
import { NavigationSlice, createNavigationSlice } from './slices/navigationSlice'
import { SearchSlice, createSearchSlice } from './slices/searchSlice'
import { EditorSlice, createEditorSlice } from './slices/editorSlice'
import { AppStateSlice, createAppStateSlice } from './slices/appStateSlice'
import { SettingsSlice, createSettingsSlice, initializeSettings } from './slices/settingsSlice'
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
  SettingsSlice

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
      ...createSettingsSlice(...args)
    }),
    { name: 'app-store' }
  )
)

// Initialize all slices after store creation
const storeState = useAppStore.getState()
initializeSettings(storeState)
initializeNotes(storeState)
initializeTemplates(storeState)

// Store reference for storage service (needed for Electron sync compatibility)
// Only expose in development or Electron environment for debugging
if (typeof globalThis !== 'undefined' && 
    (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.electronAPI))) {
  interface AppGlobal {
    __appStore?: typeof useAppStore
  }
  (globalThis as AppGlobal).__appStore = useAppStore
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
  AppStore 
}
export type { Template } from './slices/templatesSlice'
export type { Toast } from './slices/toastSlice'

// Legacy alias for backward compatibility during migration
export const useSimpleStore = useAppStore
export default useAppStore