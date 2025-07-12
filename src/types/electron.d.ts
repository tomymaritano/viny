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