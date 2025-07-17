import { Note, Notebook, Settings } from './index'

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

interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string
  
  // Context menu support
  showContextMenu: (type: string) => void
  showNoteContextMenu: (note: Note) => void
  
  // Event handling
  on: (event: string, callback: Function) => void
  removeAllListeners: (event: string) => void
  windowControls: {
    minimize: () => void
    maximize: () => void
    close: () => void
    unmaximize: () => void
  }
  // Manual window dragging methods
  startWindowDrag: (data: { startX?: number; startY?: number }) => void
  continueWindowDrag: (data: { currentX?: number; currentY?: number; deltaX?: number; deltaY?: number }) => void
  endWindowDrag: () => void
  storage: {
    saveNote: (note: Note) => Promise<Note>
    loadNote: (id: string) => Promise<Note | null>
    loadAllNotes: () => Promise<Note[]>
    deleteNote: (id: string) => Promise<boolean>
    saveNotebooks: (notebooks: Notebook[]) => Promise<Notebook[]>
    loadNotebooks: () => Promise<Notebook[]>
    saveSettings: (settings: Settings) => Promise<Settings>
    loadSettings: () => Promise<Settings | null>
    saveTagColors: (tagColors: Record<string, string>) => Promise<Record<string, string>>
    loadTagColors: () => Promise<Record<string, string>>
    getStorageInfo: () => Promise<StorageInfo>
    exportData: () => Promise<ExportData>
    importData: (data: ExportData) => Promise<boolean>
    clearStorage: () => Promise<boolean>
    createBackup: () => Promise<string>
    listBackups: () => Promise<BackupInfo[]>
    restoreBackup: (filename: string) => Promise<boolean>
    deleteBackup: (filename: string) => Promise<boolean>
  }
  // File system operations
  selectDirectory: () => Promise<string | null>
  
  // Window management
  openNoteInNewWindow: (noteId: string) => Promise<void>
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