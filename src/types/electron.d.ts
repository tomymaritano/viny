interface ElectronAPI {
  openSettings: () => void
  isElectron: boolean
  platform: string
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
    saveNote: (note: any) => Promise<any>
    loadNote: (id: string) => Promise<any>
    loadAllNotes: () => Promise<any[]>
    deleteNote: (id: string) => Promise<any>
    saveNotebooks: (notebooks: any[]) => Promise<any>
    loadNotebooks: () => Promise<any[]>
    saveSettings: (settings: any) => Promise<any>
    loadSettings: () => Promise<any>
    saveTagColors: (tagColors: any) => Promise<any>
    loadTagColors: () => Promise<any>
    getStorageInfo: () => Promise<any>
    exportData: () => Promise<any>
    importData: (data: any) => Promise<any>
    clearStorage: () => Promise<any>
    createBackup: () => Promise<any>
    listBackups: () => Promise<any[]>
    restoreBackup: (filename: string) => Promise<any>
    deleteBackup: (filename: string) => Promise<any>
  }
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