/**
 * IPC channel constants shared between processes
 */

export const IPC_CHANNELS = {
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

export const VALID_RECEIVE_CHANNELS = [
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

export const VALID_SEND_CHANNELS = [
  'broadcast-note-update'
] as const

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
export type ValidReceiveChannel = typeof VALID_RECEIVE_CHANNELS[number]
export type ValidSendChannel = typeof VALID_SEND_CHANNELS[number]