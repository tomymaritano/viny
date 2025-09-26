import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, VALID_RECEIVE_CHANNELS, VALID_SEND_CHANNELS } from '../shared/constants/ipc'
import type { 
  Note, 
  Notebook, 
  Settings, 
  StorageResult, 
  ExportOptions, 
  ExportResult 
} from '../shared/types'

// Window controls interface
interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
  unmaximize: () => void
}

// Storage API interface
interface StorageAPI {
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
}

// Export API interface
interface ExportAPI {
  showSaveDialog: (defaultFileName: string, filters: any[]) => Promise<string | null>
  exportNoteToFile: (note: Note, filePath: string, options: ExportOptions) => Promise<ExportResult>
  exportNoteToPDF: (note: Note, filePath: string, options: ExportOptions) => Promise<ExportResult>
  showItemInFolder: (filePath: string) => Promise<void>
}

// Main Electron API interface
interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string
  windowControls: WindowControls
  storage: StorageAPI
  export: ExportAPI
  openNoteInNewWindow: (noteId: string) => Promise<void>
  showNoteContextMenu: (note: Note) => void
  showContextMenu: (type: string, context?: any) => void
  on: (channel: string, callback: Function) => void
  removeAllListeners: (channel: string) => void
  send: (channel: string, data: any) => void
  selectDirectory: () => Promise<string | null>
}

// Expose secure APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: (): void => ipcRenderer.send(IPC_CHANNELS.OPEN_SETTINGS),
  isElectron: true,
  platform: process.platform,
  
  windowControls: {
    minimize: (): void => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: (): void => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: (): void => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
    unmaximize: (): void => ipcRenderer.send(IPC_CHANNELS.WINDOW_UNMAXIMIZE),
  },
  
  // File System Storage APIs - Essential operations only
  storage: {
    // Notes operations
    saveNote: (note: Note): Promise<StorageResult> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_SAVE_NOTE, note),
    loadNote: (id: string): Promise<Note | null> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LOAD_NOTE, id),
    loadAllNotes: (): Promise<Note[]> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LOAD_ALL_NOTES),
    deleteNote: (id: string): Promise<StorageResult> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_DELETE_NOTE, id),
    
    // Notebooks operations
    saveNotebooks: (notebooks: Notebook[]): Promise<StorageResult> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_SAVE_NOTEBOOKS, notebooks),
    loadNotebooks: (): Promise<Notebook[]> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LOAD_NOTEBOOKS),
    
    // Settings operations
    saveSettings: (settings: Partial<Settings>): Promise<StorageResult> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_SAVE_SETTINGS, settings),
    loadSettings: (): Promise<Partial<Settings>> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LOAD_SETTINGS),
    
    // Tag colors operations
    saveTagColors: (tagColors: Record<string, string>): Promise<StorageResult> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_SAVE_TAG_COLORS, tagColors),
    loadTagColors: (): Promise<Record<string, string>> => 
      ipcRenderer.invoke(IPC_CHANNELS.STORAGE_LOAD_TAG_COLORS),
  },
  
  // Native Export APIs
  export: {
    showSaveDialog: (defaultFileName: string, filters: any[]): Promise<string | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPORT_SAVE_DIALOG, defaultFileName, filters),
    exportNoteToFile: (note: Note, filePath: string, options: ExportOptions): Promise<ExportResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPORT_NOTE_TO_FILE, note, filePath, options),
    exportNoteToPDF: (note: Note, filePath: string, options: ExportOptions): Promise<ExportResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.EXPORT_NOTE_TO_PDF, note, filePath, options),
    showItemInFolder: (filePath: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SHOW_ITEM_IN_FOLDER, filePath),
  },

  // Window management
  openNoteInNewWindow: (noteId: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_NOTE_IN_NEW_WINDOW, noteId),
  
  // Context Menu
  showNoteContextMenu: (note: Note): void => 
    ipcRenderer.send(IPC_CHANNELS.SHOW_NOTE_CONTEXT_MENU, note),
  showContextMenu: (type: string, context?: any): void =>
    ipcRenderer.send(IPC_CHANNELS.SHOW_CONTEXT_MENU, { type, context }),
  
  // IPC Events - Safe channel whitelist
  on: (channel: string, callback: Function): void => {
    if (VALID_RECEIVE_CHANNELS.includes(channel as any)) {
      // Wrap callback to prevent direct access to event object
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    } else {
      console.warn(`Attempted to listen to unauthorized channel: ${channel}`)
    }
  },
  
  removeAllListeners: (channel: string): void => {
    if (VALID_RECEIVE_CHANNELS.includes(channel as any)) {
      ipcRenderer.removeAllListeners(channel)
    } else {
      console.warn(`Attempted to remove listeners from unauthorized channel: ${channel}`)
    }
  },
  
  // Send method for specific allowed channels only
  send: (channel: string, data: any): void => {
    if (VALID_SEND_CHANNELS.includes(channel as any)) {
      ipcRenderer.send(channel, data)
    } else {
      console.warn(`Attempted to send to unauthorized channel: ${channel}`)
    }
  },
  
  // File operations
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_DIRECTORY),
} as ElectronAPI)

// For backward compatibility - minimal exposure
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})

export type { ElectronAPI, StorageAPI, ExportAPI }