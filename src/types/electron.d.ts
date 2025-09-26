import type { Note, Notebook, Settings } from './index'

interface StorageInfo {
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

interface BackupInfo {
  filename: string
  createdAt: string
  size: number
  notesCount: number
}

interface ExportData {
  notes: Note[]
  notebooks: Notebook[]
  settings: Settings
  tagColors: Record<string, string>
  exportedAt: string
  version: string
}

interface StorageResult {
  success: boolean
  message?: string
}

interface ExportOptions {
  format: 'html' | 'markdown' | 'pdf'
  includeMetadata?: boolean
}

interface ExportResult {
  success: boolean
  filePath?: string
  error?: string
}

interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string

  // Window controls
  windowControls: {
    minimize: () => void
    maximize: () => void
    close: () => void
    unmaximize: () => void
  }

  // Storage API - Reduced to essential operations only
  storage: {
    // Notes operations - Core CRUD only
    saveNote: (note: Note) => Promise<StorageResult>
    loadNote: (id: string) => Promise<Note | null>
    loadAllNotes: () => Promise<Note[]>
    deleteNote: (id: string) => Promise<StorageResult>

    // Notebooks operations
    saveNotebooks: (notebooks: Notebook[]) => Promise<StorageResult>
    loadNotebooks: () => Promise<Notebook[]>

    // Settings operations
    saveSettings: (settings: Partial<Settings>) => Promise<StorageResult>
    loadSettings: () => Promise<Partial<Settings>>

    // Tag colors operations
    saveTagColors: (tagColors: Record<string, string>) => Promise<StorageResult>
    loadTagColors: () => Promise<Record<string, string>>

    // REMOVED for security:
    // - createBackup, restoreFromBackup
    // - migrateFromLocalStorage
    // - checkDataIntegrity, repairCorruptedData
    // - exportData, importData
    // - getStorageInfo, getDataDirectory
    // - clearStorage, listBackups, deleteBackup
  }

  // Export API
  export: {
    showSaveDialog: (
      defaultFileName: string,
      filters: any[]
    ) => Promise<string | null>
    exportNoteToFile: (
      note: Note,
      filePath: string,
      options: ExportOptions
    ) => Promise<ExportResult>
    exportNoteToPDF: (
      note: Note,
      filePath: string,
      options: ExportOptions
    ) => Promise<ExportResult>
    showItemInFolder: (filePath: string) => Promise<void>
  }

  // Window management
  openNoteInNewWindow: (noteId: string) => Promise<void>

  // Context Menu
  showNoteContextMenu: (note: Note) => void
  showContextMenu: (type: string, context?: any) => void

  // IPC Events - Limited and validated
  on: (channel: string, callback: Function) => void
  removeAllListeners: (channel: string) => void
  send: (channel: string, data: any) => void

  // File operations
  selectDirectory: () => Promise<string | null>
  
  // AI/ML Operations
  loadEmbeddingModel?: (modelName: string) => Promise<boolean>
  generateEmbedding?: (text: string) => Promise<number[]>
  searchByEmbedding?: (embedding: number[], threshold?: number) => Promise<any[]>
  
  // Ollama installation
  downloadAndInstallOllama?: (options: {
    os: 'mac' | 'windows' | 'linux'
    onProgress?: (percent: number) => void
  }) => Promise<void>
  startOllamaService?: () => Promise<void>
  checkOllamaInstalled?: () => Promise<boolean>
}

interface Window {
  electronAPI?: ElectronAPI
  electron?: {
    isElectron: boolean
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    electron?: {
      isElectron: boolean
    }
  }
}

export {}
