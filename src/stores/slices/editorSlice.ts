import type { StateCreator } from 'zustand'

export interface EditorSlice {
  // Editor state
  viewMode: 'edit' | 'preview'
  editorContent: string
  fontSize: number
  lineHeight: number
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
  setEditorContent: (content: string) => void
  setFontSize: (size: number) => void
  setLineHeight: (height: number) => void
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
  minimap: false,
}

export const createEditorSlice: StateCreator<EditorSlice> = (set, get) => {
  return {
    // Initial state
    viewMode: 'edit',
    editorContent: '',
    fontSize: defaultEditorSettings.fontSize,
    lineHeight: defaultEditorSettings.lineHeight,
    editorSettings: { ...defaultEditorSettings },

    // Actions
    setViewMode: viewMode => set({ viewMode }),
    
    setEditorContent: content => set({ editorContent: content }),
    
    setFontSize: size => set(state => ({
      fontSize: size,
      editorSettings: { ...state.editorSettings, fontSize: size },
    })),
    
    setLineHeight: height => set(state => ({
      lineHeight: height,
      editorSettings: { ...state.editorSettings, lineHeight: height },
    })),

    updateEditorSetting: (key, value) =>
      set(state => {
        const newSettings = { ...state.editorSettings, [key]: value };
        // Keep top-level fontSize and lineHeight in sync
        const updates: Partial<EditorSlice> = { editorSettings: newSettings };
        if (key === 'fontSize') {
          updates.fontSize = value as number;
        } else if (key === 'lineHeight') {
          updates.lineHeight = value as number;
        }
        return updates;
      }),

    resetEditorSettings: () =>
      set({
        fontSize: defaultEditorSettings.fontSize,
        lineHeight: defaultEditorSettings.lineHeight,
        editorSettings: { ...defaultEditorSettings },
      }),
  }
}
