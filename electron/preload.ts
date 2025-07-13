import { contextBridge, ipcRenderer } from 'electron'

// Type definitions for our Electron APIs
interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
  unmaximize: () => void
}

interface DragData {
  startX: number
  startY: number
  currentX: number
  currentY: number
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

interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string
  windowControls: WindowControls
  
  // Modern window dragging methods
  startWindowDrag: (data: Partial<DragData>) => void
  continueWindowDrag: (data: Partial<DragData>) => void
  endWindowDrag: () => void
  
  // File System Storage APIs - Inkdrop Style
  storage: StorageAPI
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
  // Modern window dragging methods
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

export type { ElectronAPI, StorageAPI, StorageInfo, StorageResult, Note, Notebook, Settings }