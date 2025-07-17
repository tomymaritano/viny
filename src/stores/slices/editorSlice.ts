import { StateCreator } from 'zustand'

export interface EditorSlice {
  // Editor state
  viewMode: 'edit' | 'preview'
  editorSettings: {
    fontSize: number
    lineHeight: number
    tabSize: number
    wordWrap: boolean
    showLineNumbers: boolean
    minimap: boolean
  }

  // Editor actions
  setViewMode: (mode: 'edit' | 'preview') => void
  updateEditorSetting: <K extends keyof EditorSlice['editorSettings']>(
    key: K, 
    value: EditorSlice['editorSettings'][K]
  ) => void
  resetEditorSettings: () => void
}

const defaultEditorSettings = {
  fontSize: 14,
  lineHeight: 1.5,
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  minimap: false
}

export const createEditorSlice: StateCreator<EditorSlice> = (set, get) => {
  return {
    // Initial state
    viewMode: 'edit',
    editorSettings: { ...defaultEditorSettings },

    // Actions
    setViewMode: (viewMode) => set({ viewMode }),

    updateEditorSetting: (key, value) =>
      set((state) => ({
        editorSettings: { ...state.editorSettings, [key]: value }
      })),

    resetEditorSettings: () =>
      set({ editorSettings: { ...defaultEditorSettings } })
  }
}