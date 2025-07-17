import { contextBridge, ipcRenderer } from 'electron'

// Type definitions for our Electron APIs
interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
  unmaximize: () => void
}

interface DragData {
  startX?: number
  startY?: number
  currentX?: number
  currentY?: number
}


interface StorageResult {
  success: boolean
  path?: string
  message?: string
  backupPath?: string
}

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

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  notebook?: string
  isPinned?: boolean
  createdAt: string
  updatedAt: string
  isTrashed?: boolean
}

interface Notebook {
  id: string
  name: string
  color: string
  level: number
  parentId?: string | null
}

interface Settings {
  theme: string
  fontSize: number
  editorMode: string
  [key: string]: any
}

interface StorageAPI {
  // Notes operations
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
  
  // Backup and recovery
  createBackup: (targetPath: string) => Promise<StorageResult>
  restoreFromBackup: (backupPath: string) => Promise<StorageResult>
  
  // Migration and maintenance
  migrateFromLocalStorage: (data: any) => Promise<StorageResult>
  checkDataIntegrity: () => Promise<StorageResult>
  repairCorruptedData: () => Promise<StorageResult>
  
  // Export/Import
  exportData: (targetPath: string) => Promise<StorageResult>
  importData: (sourcePath: string) => Promise<StorageResult>
  
  // Storage info
  getStorageInfo: () => Promise<StorageInfo>
  getDataDirectory: () => Promise<string>
}

interface ExportAPI {
  showSaveDialog: (defaultFileName: string, filters: any[]) => Promise<string | null>
  exportNoteToFile: (note: Note, filePath: string, options: ExportOptions) => Promise<ExportResult>
  exportNoteToPDF: (note: Note, filePath: string, options: ExportOptions) => Promise<ExportResult>
  showItemInFolder: (filePath: string) => Promise<void>
}

interface WindowManagement {
  openNoteInNewWindow: (noteId: string) => Promise<void>
}

interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string
  windowControls: WindowControls
  
  // Manual window dragging methods
  startWindowDrag: (data: Partial<DragData>) => void
  continueWindowDrag: (data: Partial<DragData>) => void
  endWindowDrag: () => void
  
  // File System Storage APIs - Inkdrop Style
  storage: StorageAPI
  
  // Native Export APIs
  export: ExportAPI

  // Window management
  openNoteInNewWindow: (noteId: string) => Promise<void>
  
  // Context Menu
  showNoteContextMenu: (note: Note) => void
  showContextMenu: (type: string, context?: any) => void
  
  // File operations
  selectDirectory: () => Promise<string | null>
  
  // IPC Events
  on: (channel: string, callback: Function) => void
  removeAllListeners: (channel: string) => void
  send: (channel: string, data: any) => void
}

// Expose secure APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: (): void => ipcRenderer.send('open-settings'),
  isElectron: true,
  platform: process.platform,
  windowControls: {
    minimize: (): void => ipcRenderer.send('window-minimize'),
    maximize: (): void => ipcRenderer.send('window-maximize'),
    close: (): void => ipcRenderer.send('window-close'),
    unmaximize: (): void => ipcRenderer.send('window-unmaximize'),
  },
  
  // Manual window dragging methods
  startWindowDrag: (data: Partial<DragData>): void => 
    ipcRenderer.send('window-drag-start', data),
  continueWindowDrag: (data: Partial<DragData>): void => 
    ipcRenderer.send('window-drag-move', data),
  endWindowDrag: (): void => 
    ipcRenderer.send('window-drag-end'),
  
  // File System Storage APIs - Inkdrop Style
  storage: {
    // Notes operations
    saveNote: (note: Note): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-save-note', note),
    loadNote: (id: string): Promise<Note | null> => 
      ipcRenderer.invoke('storage-load-note', id),
    loadAllNotes: (): Promise<Note[]> => 
      ipcRenderer.invoke('storage-load-all-notes'),
    deleteNote: (id: string): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-delete-note', id),
    
    // Notebooks operations
    saveNotebooks: (notebooks: Notebook[]): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-save-notebooks', notebooks),
    loadNotebooks: (): Promise<Notebook[]> => 
      ipcRenderer.invoke('storage-load-notebooks'),
    
    // Settings operations
    saveSettings: (settings: Partial<Settings>): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-save-settings', settings),
    loadSettings: (): Promise<Partial<Settings>> => 
      ipcRenderer.invoke('storage-load-settings'),
    
    // Tag colors operations
    saveTagColors: (tagColors: Record<string, string>): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-save-tag-colors', tagColors),
    loadTagColors: (): Promise<Record<string, string>> => 
      ipcRenderer.invoke('storage-load-tag-colors'),
    
    // Backup and recovery
    createBackup: (targetPath: string): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-create-backup', targetPath),
    restoreFromBackup: (backupPath: string): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-restore-backup', backupPath),
    
    // Migration and maintenance
    migrateFromLocalStorage: (data: any): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-migrate-from-localStorage', data),
    checkDataIntegrity: (): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-check-integrity'),
    repairCorruptedData: (): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-repair-data'),
    
    // Export/Import
    exportData: (targetPath: string): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-export-data', targetPath),
    importData: (sourcePath: string): Promise<StorageResult> => 
      ipcRenderer.invoke('storage-import-data', sourcePath),
    
    // Storage info
    getStorageInfo: (): Promise<StorageInfo> => 
      ipcRenderer.invoke('storage-get-info'),
    getDataDirectory: (): Promise<string> => 
      ipcRenderer.invoke('storage-get-data-directory'),
  },
  
  // Native Export APIs
  export: {
    showSaveDialog: (defaultFileName: string, filters: any[]): Promise<string | null> =>
      ipcRenderer.invoke('export-save-dialog', defaultFileName, filters),
    exportNoteToFile: (note: Note, filePath: string, options: ExportOptions): Promise<ExportResult> =>
      ipcRenderer.invoke('export-note-to-file', note, filePath, options),
    exportNoteToPDF: (note: Note, filePath: string, options: ExportOptions): Promise<ExportResult> =>
      ipcRenderer.invoke('export-note-to-pdf', note, filePath, options),
    showItemInFolder: (filePath: string): Promise<void> =>
      ipcRenderer.invoke('show-item-in-folder', filePath),
  },

  // Window management
  openNoteInNewWindow: (noteId: string): Promise<void> =>
    ipcRenderer.invoke('open-note-in-new-window', noteId),
  
  // Context Menu
  showNoteContextMenu: (note: Note): void => 
    ipcRenderer.send('show-note-context-menu', note),
  showContextMenu: (type: string, context?: any): void =>
    ipcRenderer.send('show-context-menu', { type, context }),
  
  // File operations
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog-select-directory'),
  
  // IPC Events - Safe channel whitelist
  on: (channel: string, callback: Function): void => {
    const validChannels = [
      'export-note',
      'toggle-pin-note',
      'duplicate-note',
      'delete-note',
      'restore-note',
      'permanent-delete-note',
      'move-to-notebook',
      'create-new-note',
      'open-search',
      'open-settings-modal',
      'create-new-notebook',
      'collapse-all-notebooks',
      'expand-all-notebooks',
      'create-note-in-notebook',
      'rename-notebook',
      'delete-notebook',
      'rename-tag',
      'change-tag-color',
      'remove-tag',
      'empty-trash',
      'note-updated'  // Add note sync channel
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },
  
  removeAllListeners: (channel: string): void => {
    const validChannels = [
      'export-note',
      'toggle-pin-note',
      'duplicate-note',
      'delete-note',
      'restore-note',
      'permanent-delete-note',
      'move-to-notebook',
      'create-new-note',
      'open-search',
      'open-settings-modal',
      'create-new-notebook',
      'collapse-all-notebooks',
      'expand-all-notebooks',
      'create-note-in-notebook',
      'rename-notebook',
      'delete-notebook',
      'rename-tag',
      'change-tag-color',
      'remove-tag',
      'empty-trash',
      'note-updated'  // Add note sync channel
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel)
    }
  },
  
  // Add a send method for note sync
  send: (channel: string, data: any): void => {
    const validSendChannels = [
      'broadcast-note-update'
    ]
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
} as ElectronAPI)

// For backward compatibility
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})

// Global type declarations for renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron: {
      isElectron: boolean
    }
  }
}

export type { ElectronAPI, StorageAPI, StorageInfo, StorageResult, Note, Notebook, Settings, ExportAPI, ExportOptions, ExportResult }