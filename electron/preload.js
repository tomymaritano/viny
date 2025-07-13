const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openSettings: () => ipcRenderer.send('open-settings'),
  isElectron: true,
  platform: process.platform,
  windowControls: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    unmaximize: () => ipcRenderer.send('window-unmaximize'),
  },
  // Modern window dragging methods
  startWindowDrag: data => ipcRenderer.send('window-drag-start', data),
  continueWindowDrag: data => ipcRenderer.send('window-drag-move', data),
  endWindowDrag: () => ipcRenderer.send('window-drag-end'),

  // File System Storage APIs - Inkdrop Style
  storage: {
    // Notes operations
    saveNote: note => ipcRenderer.invoke('storage-save-note', note),
    loadNote: id => ipcRenderer.invoke('storage-load-note', id),
    loadAllNotes: () => ipcRenderer.invoke('storage-load-all-notes'),
    deleteNote: id => ipcRenderer.invoke('storage-delete-note', id),

    // Notebooks operations
    saveNotebooks: notebooks =>
      ipcRenderer.invoke('storage-save-notebooks', notebooks),
    loadNotebooks: () => ipcRenderer.invoke('storage-load-notebooks'),

    // Settings operations
    saveSettings: settings =>
      ipcRenderer.invoke('storage-save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('storage-load-settings'),

    // Tag colors operations
    saveTagColors: tagColors =>
      ipcRenderer.invoke('storage-save-tag-colors', tagColors),
    loadTagColors: () => ipcRenderer.invoke('storage-load-tag-colors'),

    // Backup and recovery
    createBackup: targetPath =>
      ipcRenderer.invoke('storage-create-backup', targetPath),
    restoreFromBackup: backupPath =>
      ipcRenderer.invoke('storage-restore-backup', backupPath),

    // Migration and maintenance
    migrateFromLocalStorage: data =>
      ipcRenderer.invoke('storage-migrate-from-localStorage', data),
    checkDataIntegrity: () => ipcRenderer.invoke('storage-check-integrity'),
    repairCorruptedData: () => ipcRenderer.invoke('storage-repair-data'),

    // Export/Import
    exportData: targetPath =>
      ipcRenderer.invoke('storage-export-data', targetPath),
    importData: sourcePath =>
      ipcRenderer.invoke('storage-import-data', sourcePath),

    // Storage info
    getStorageInfo: () => ipcRenderer.invoke('storage-get-info'),
    getDataDirectory: () => ipcRenderer.invoke('storage-get-data-directory'),
  },
})

// For backward compatibility
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})
