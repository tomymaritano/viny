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
})

// For backward compatibility
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})
