// Core types for the application

export interface Note {
  id: string
  title: string
  content: string
  notebook: string
  tags: string[]
  status: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived'
  isPinned: boolean
  isTrashed: boolean
  createdAt: string
  updatedAt: string
  trashedAt?: string
}

export interface Notebook {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  timestamp: string
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  markdownFontFamily: string
  markdownFontSize: string
  editorFontFamily: string
  editorFontSize: string
  autoSave: boolean
  autoSaveInterval: number
}

export interface UIState {
  showSettings: boolean
  showSearch: boolean
  showExportDialog: boolean
  showNotebookManager: boolean
  isPreviewVisible: boolean
  isFullscreen: boolean
  layoutMode: 'normal' | 'markdown' | 'preview' | 'focus'
  sidebarWidth: number
  notesListWidth: number
  expandedSections: {
    notebooks: boolean
    status: boolean
    tags: boolean
  }
  modals: {
    settings: boolean
    search: boolean
    export: boolean
    notebookManager: boolean
  }
  toasts: Toast[]
  loadingStates: {
    notes: boolean
    save: boolean
    delete: boolean
    search: boolean
  }
  theme: string
}

export interface NotesState {
  notes: Note[]
  currentNote: Note | null
  selectedNoteId: string | null
  isEditorOpen: boolean
  isLoading: boolean
  error: string | null
  activeSection: string
  viewMode: 'edit' | 'preview'
  searchQuery: string
  filterTags: string[]
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export interface ErrorProps extends BaseComponentProps {
  error: Error | string
  onRetry?: () => void
}
