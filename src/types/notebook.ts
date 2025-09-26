export interface Notebook {
  id: string
  name: string
  color: string
  description?: string
  parentId: string | null // null = root category
  children: string[] // array of child notebook IDs
  level: number // 0 = root, 1 = first level, etc.
  path: string // full path like "work/projects/mobile"
  createdAt: string
  updatedAt: string
  isExpanded?: boolean // for UI state
  isTrashed?: boolean // Soft delete flag
  trashedAt?: string | null // When the notebook was trashed
}

export interface NotebookWithCounts extends Notebook {
  count: number
  directCount: number // notes directly in this notebook
  totalCount: number // notes in this notebook + all children
}

export interface CreateNotebookData {
  name: string
  color: string
  description?: string
  parentId?: string | null
}

export interface UpdateNotebookData {
  name?: string
  color?: string
  description?: string
  parentId?: string | null
}

export const NOTEBOOK_VALIDATION = {
  minLength: 2,
  maxLength: 50,
  allowedChars: /^[a-zA-Z0-9\s\-_]+$/,
  reservedNames: [
    'all',
    'pinned',
    'trash',
    'archived',
    'completed',
    'draft',
    'in-progress',
    'review',
  ],
  maxNestingLevel: 3,
} as const

export const NOTEBOOK_COLORS = [
  { value: 'blue', label: 'Blue', class: 'text-solarized-blue' },
  { value: 'green', label: 'Green', class: 'text-solarized-green' },
  { value: 'orange', label: 'Orange', class: 'text-solarized-orange' },
  { value: 'yellow', label: 'Yellow', class: 'text-solarized-yellow' },
  { value: 'red', label: 'Red', class: 'text-solarized-red' },
  { value: 'purple', label: 'Purple', class: 'text-solarized-magenta' },
  { value: 'cyan', label: 'Cyan', class: 'text-solarized-cyan' },
  { value: 'teal', label: 'Teal', class: 'text-emerald-600' },
  { value: 'indigo', label: 'Indigo', class: 'text-indigo-600' },
  { value: 'pink', label: 'Pink', class: 'text-pink-600' },
] as const
