/**
 * Shared type definitions used across Electron processes
 */

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  notebook?: string
  isPinned?: boolean
  createdAt: string
  updatedAt: string
  isTrashed?: boolean
  _rev?: string
}

export interface Notebook {
  id: string
  name: string
  color: string
  level: number
  parentId?: string | null
  _rev?: string
  updatedAt?: string
}

export interface Settings {
  theme: string
  fontSize: number
  editorMode: string
  [key: string]: any
}

export interface StorageResult {
  success: boolean
  path?: string
  message?: string
  backupPath?: string
  error?: string
}

export interface StorageInfo {
  dataDirectory: string
  notesCount: number
  notebooksCount: number
  hasSettings: boolean
  tagColorsCount: number
  directories: {
    data: string
    notes: string
    backups: string
  }
  lastBackup?: string
  storageSize?: number
}

export interface ExportOptions {
  format: 'html' | 'markdown' | 'pdf' | 'txt'
  includeMetadata?: boolean
}

export interface ExportResult {
  success: boolean
  filePath?: string
  error?: string
}

export interface BackupInfo {
  filename: string
  createdAt: string
  size: number
  notesCount: number
}

export interface ExportData {
  notes: Note[]
  notebooks: Notebook[]
  settings: Settings
  tagColors: Record<string, string>
  exportedAt: string
  version: string
}

export interface DragState {
  isDragging: boolean
  startPosition: { x: number; y: number } | null
  windowStartPosition: { x: number; y: number } | null
}

export interface DragData {
  startX?: number
  startY?: number
  currentX?: number
  currentY?: number
}

export interface MetadataAction {
  action: string
  data: any
  timestamp: string
}

export interface Metadata {
  created: string
  actions: MetadataAction[]
}