// Core types for the application
// Strict TypeScript types with comprehensive null safety

export type NoteStatus =
  | 'draft'
  | 'in-progress'
  | 'review'
  | 'completed'
  | 'archived'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type LayoutMode = 'normal' | 'markdown' | 'preview' | 'focus'
export type ViewMode = 'edit' | 'preview'

export interface Note {
  readonly id: string
  title: string
  content: string
  notebook: string
  tags: readonly string[]
  status: NoteStatus
  isPinned: boolean
  isTrashed: boolean
  readonly createdAt: string
  updatedAt: string
  trashedAt?: string
  metadata?: NoteMetadata
  _rev?: string // For PouchDB compatibility
}

export interface NoteMetadata {
  readonly wordCount: number
  readonly readingTime: number
  lastEditedBy?: string
  collaborators?: readonly string[]
  version?: number
}

export interface TagInfo {
  name: string
  count: number
}

export interface Notebook {
  readonly id: string
  name: string
  color: string
  description?: string
  readonly createdAt: string
  updatedAt: string
  parentId?: string
  notes?: readonly Note[]
  subNotebooks?: readonly Notebook[]
  type: 'notebook' // For repository pattern compatibility
  isTrashed?: boolean // Soft delete flag
  trashedAt?: string | null // When the notebook was trashed
  _rev?: string // For PouchDB compatibility
}

export interface Toast {
  readonly id: string
  type: ToastType
  message: string
  duration?: number
  readonly timestamp: string
  action?: {
    label: string
    onClick: () => void
  }
}

export interface Settings {
  theme: ThemeMode
  markdownFontFamily: string
  markdownFontSize: string
  editorFontFamily: string
  editorFontSize: string
  autoSave: boolean
  autoSaveInterval: number
  language: string
  fontSize: number
  previewMode: 'split' | 'tabs'
  wordWrap: boolean
  lineNumbers: boolean
  tabSize: number
  previewWidth: number
  syntaxTheme: string
  previewTheme: string
  customCSS?: string
  enableCustomCSS: boolean
}

export interface UIState {
  readonly showSettings: boolean
  readonly showSearch: boolean
  readonly showExportDialog: boolean
  readonly showNotebookManager: boolean
  readonly isPreviewVisible: boolean
  readonly isFullscreen: boolean
  readonly layoutMode: LayoutMode
  readonly sidebarWidth: number
  readonly notesListWidth: number
  readonly expandedSections: {
    readonly notebooks: boolean
    readonly status: boolean
    readonly tags: boolean
  }
  readonly modals: {
    readonly settings: boolean
    readonly search: boolean
    readonly export: boolean
    readonly notebookManager: boolean
  }
  readonly toasts: readonly Toast[]
  readonly loadingStates: {
    readonly notes: boolean
    readonly save: boolean
    readonly delete: boolean
    readonly search: boolean
  }
  readonly theme: string
}

export interface NotesState {
  readonly notes: readonly Note[]
  readonly currentNote: Note | null
  readonly selectedNoteId: string | null
  readonly isEditorOpen: boolean
  readonly isLoading: boolean
  readonly error: string | null
  readonly activeSection: string
  readonly viewMode: ViewMode
  readonly searchQuery: string
  readonly filterTags: readonly string[]
  readonly notebooks: readonly Notebook[]
  readonly selectedNotebook: string | null
}

// API Response types
export interface ApiResponse<T> {
  readonly data: T
  readonly success: boolean
  readonly message?: string
  readonly timestamp: number
}

export interface ApiError {
  readonly message: string
  readonly status: number
  readonly code?: string
  readonly timestamp: number
}

// Component prop types
export interface BaseComponentProps {
  readonly className?: string
  readonly children?: React.ReactNode
  readonly testId?: string
}

export interface LoadingProps extends BaseComponentProps {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly text?: string
}

export interface ErrorProps extends BaseComponentProps {
  readonly error: Error | string
  readonly onRetry?: () => void
}

// Hook return types for strict typing
export interface UseNotesReturn {
  readonly notes: readonly Note[]
  readonly selectedNote: Note | null
  readonly isLoading: boolean
  readonly error: string | null
  readonly createNote: (
    note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Note>
  readonly updateNote: (id: string, changes: Partial<Note>) => Promise<Note>
  readonly deleteNote: (id: string) => Promise<void>
  readonly selectNote: (id: string) => void
  readonly searchNotes: (query: string) => Promise<readonly Note[]>
}

export interface UseNotebooksReturn {
  readonly notebooks: readonly Notebook[]
  readonly selectedNotebook: Notebook | null
  readonly isLoading: boolean
  readonly error: string | null
  readonly createNotebook: (
    notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Notebook>
  readonly updateNotebook: (
    id: string,
    changes: Partial<Notebook>
  ) => Promise<Notebook>
  readonly deleteNotebook: (id: string) => Promise<void>
  readonly selectNotebook: (id: string) => void
}

// Repository interface types
export interface RepositoryFilterOptions<T> {
  readonly where?: Partial<T>
  readonly orderBy?: keyof T
  readonly order?: 'asc' | 'desc'
  readonly limit?: number
  readonly offset?: number
  readonly include?: readonly (keyof T)[]
  readonly exclude?: readonly (keyof T)[]
}

export interface DocumentRepository<T = unknown> {
  readonly create: (
    document: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<T>
  readonly read: (id: string) => Promise<T | null>
  readonly update: (id: string, changes: Partial<T>) => Promise<T>
  readonly delete: (id: string) => Promise<void>
  readonly list: (filter?: RepositoryFilterOptions<T>) => Promise<readonly T[]>
  readonly search: (query: string) => Promise<readonly T[]>
  readonly initialize: () => Promise<void>
  readonly destroy: () => Promise<void>
}

// Event handling types
export interface EventHandler<T = unknown> {
  readonly(event: T): void | Promise<void>
}

export interface KeyboardShortcut {
  readonly key: string
  readonly ctrlKey?: boolean
  readonly shiftKey?: boolean
  readonly altKey?: boolean
  readonly metaKey?: boolean
  readonly handler: EventHandler<KeyboardEvent>
  readonly description: string
  readonly category: string
}

// Editor types
export interface EditorTheme {
  readonly name: string
  readonly isDark: boolean
  readonly colors: {
    readonly background: string
    readonly foreground: string
    readonly selectionBackground: string
    readonly lineHighlight: string
    readonly comment: string
    readonly keyword: string
    readonly string: string
    readonly number: string
  }
}

export interface EditorConfig {
  readonly theme: EditorTheme
  readonly fontSize: number
  readonly fontFamily: string
  readonly lineHeight: number
  readonly tabSize: number
  readonly wordWrap: boolean
  readonly lineNumbers: boolean
  readonly minimap: boolean
  readonly scrollBeyondLastLine: boolean
}

// Search types
export interface SearchResult<T> {
  readonly items: readonly T[]
  readonly total: number
  readonly query: string
  readonly took: number
  readonly highlights?: Record<string, readonly string[]>
}

export interface SearchOptions {
  readonly query: string
  readonly fields?: readonly string[]
  readonly fuzzy?: boolean
  readonly limit?: number
  readonly offset?: number
  readonly highlight?: boolean
}

// Form validation types
export interface ValidationRule {
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly pattern?: RegExp
  readonly validator?: (value: unknown) => boolean | string
  readonly message?: string
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

export interface FormField<T = unknown> {
  readonly name: string
  readonly value: T
  readonly rules?: readonly ValidationRule[]
  readonly error?: string
  readonly touched: boolean
  readonly dirty: boolean
}

// Export all types for better organization
export type * from './settings'
export type * from './electron'
export type * from './notebook'
