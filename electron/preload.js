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
})

// For backward compatibility
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
})
