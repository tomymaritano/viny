import { contextBridge, ipcRenderer } from 'electron'

// Define IPC channels inline to avoid module resolution issues
const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize',
  WINDOW_CLOSE: 'window-close',
  WINDOW_UNMAXIMIZE: 'window-unmaximize',
  
  // Storage operations
  STORAGE_SAVE_NOTE: 'storage-save-note',
  STORAGE_LOAD_NOTE: 'storage-load-note',
  STORAGE_LOAD_ALL_NOTES: 'storage-load-all-notes',
  STORAGE_DELETE_NOTE: 'storage-delete-note',
  STORAGE_SAVE_NOTEBOOKS: 'storage-save-notebooks',
  STORAGE_LOAD_NOTEBOOKS: 'storage-load-notebooks',
  STORAGE_SAVE_SETTINGS: 'storage-save-settings',
  STORAGE_LOAD_SETTINGS: 'storage-load-settings',
  STORAGE_SAVE_TAG_COLORS: 'storage-save-tag-colors',
  STORAGE_LOAD_TAG_COLORS: 'storage-load-tag-colors',
  
  // Export operations
  EXPORT_SAVE_DIALOG: 'export-save-dialog',
  EXPORT_NOTE_TO_FILE: 'export-note-to-file',
  EXPORT_NOTE_TO_PDF: 'export-note-to-pdf',
  SHOW_ITEM_IN_FOLDER: 'show-item-in-folder',
  
  // Window management
  OPEN_NOTE_IN_NEW_WINDOW: 'open-note-in-new-window',
  
  // Context menus
  SHOW_NOTE_CONTEXT_MENU: 'show-note-context-menu',
  SHOW_CONTEXT_MENU: 'show-context-menu',
  
  // Other
  OPEN_SETTINGS: 'open-settings',
  DIALOG_SELECT_DIRECTORY: 'dialog-select-directory',
  
  // Broadcast channels
  BROADCAST_NOTE_UPDATE: 'broadcast-note-update',
  NOTE_UPDATED: 'note-updated',
} as const

const VALID_RECEIVE_CHANNELS = [
  // Note operations
  'export-note',
  'toggle-pin-note',
  'duplicate-note',
  'delete-note',
  'restore-note',
  'permanent-delete-note',
  'move-to-notebook',
  'create-new-note',
  
  // UI operations
  'open-search',
  'open-settings-modal',
  
  // Notebook operations
  'create-new-notebook',
  'collapse-all-notebooks',
  'expand-all-notebooks',
  'create-note-in-notebook',
  'rename-notebook',
  'delete-notebook',
  
  // Tag operations
  'rename-tag',
  'change-tag-color',
  'remove-tag',
  
  // Other
  'empty-trash',
  'note-updated',
  'view-note-history'
] as const

const VALID_SEND_CHANNELS = [
  'broadcast-note-update'
] as const

// Type definitions
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
  _rev?: string
}

interface Notebook {
  id: string
  name: string
  color: string
  level: number
  parentId?: string | null
  _rev?: string
}

interface Settings {
  theme: string
  fontSize: number
  editorMode: string
  [key: string]: any
}

interface StorageResult {
  success: boolean
  path?: string
  message?: string
  backupPath?: string
  error?: string
}

interface ExportOptions {
  format: 'html' | 'markdown' | 'pdf' | 'txt'
  includeMetadata?: boolean
}

interface ExportResult {
  success: boolean
  filePath?: string
  error?: string
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
})

// For backward compatibility - minimal exposure
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})