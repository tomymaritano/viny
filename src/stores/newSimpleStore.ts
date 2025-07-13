import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { NotesSlice, createNotesSlice } from './slices/notesSlice'
import { UiSlice, createUiSlice } from './slices/uiSlice'
import { TemplatesSlice, createTemplatesSlice } from './slices/templatesSlice'
import { ThemeSlice, createThemeSlice } from './slices/themeSlice'

// Combined store interface
type AppStore = NotesSlice & UiSlice & TemplatesSlice & ThemeSlice

// Create the combined store
export const useAppStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createNotesSlice(...args),
      ...createUiSlice(...args),
      ...createTemplatesSlice(...args),
      ...createThemeSlice(...args)
    }),
    { name: 'app-store' }
  )
)

// Store reference for storage service (needed for Electron sync compatibility)
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__appStore = useAppStore
}

// Re-export types for convenience
export type { NotesSlice, UiSlice, TemplatesSlice, ThemeSlice, AppStore }
export type { Template } from './slices/templatesSlice'
export type { Toast } from './slices/uiSlice'

// Legacy alias for backward compatibility during migration
export const useSimpleStore = useAppStore
export default useAppStore