import { BrowserWindow, shell, app } from 'electron'
import * as path from 'path'
import type { Note } from '../../shared/types'

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private settingsWindow: BrowserWindow | null = null
  private noteWindows: Map<string, BrowserWindow> = new Map()

  constructor(private preloadPath: string) {
    // Use the simple preload script that doesn't require external modules
    this.preloadPath = preloadPath.replace('/preload/index.js', '/preload-simple.js')
  }

  /**
   * Apply security settings to all windows
   */
  private applyWindowSecuritySettings(window: BrowserWindow): void {
    // Prevent new window creation
    window.webContents.setWindowOpenHandler(({ url }) => {
      // Open external links in default browser
      shell.openExternal(url)
      return { action: 'deny' }
    })
    
    // Prevent navigation to external URLs
    window.webContents.on('will-navigate', (event, url) => {
      const parsedUrl = new URL(url)
      const appUrl = new URL(window.webContents.getURL())
      
      // Only allow navigation within the app
      if (parsedUrl.origin !== appUrl.origin) {
        event.preventDefault()
        shell.openExternal(url)
      }
    })
    
    // Prevent iframe embedding of external content
    window.webContents.on('will-frame-navigate', (event) => {
      event.preventDefault()
    })
    
    // Disable or limit WebRTC IP handling
    window.webContents.setWebRTCIPHandlingPolicy('default_public_interface_only')
  }

  /**
   * Create the main application window
   */
  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 15, y: 10 },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.preloadPath,
        // Performance optimizations
        experimentalFeatures: false,
        offscreen: false,
        // Security
        webSecurity: true,
        allowRunningInsecureContent: false,
        navigateOnDragDrop: false,
        spellcheck: false,
        // Enable WebGL for VantaFog effect
        webgl: true,
        plugins: false,
      },
      // Appearance
      backgroundColor: '#1e1e1e',
      show: false,
      // Window behavior
      autoHideMenuBar: true,
      icon: path.join(__dirname, '../../../assets/icon.png'),
    })

    // Apply security settings
    this.applyWindowSecuritySettings(this.mainWindow)

    // Load the app
    if (process.env.NODE_ENV !== 'production') {
      this.mainWindow.loadURL('http://localhost:5173')
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools()
    } else {
      // In production, the dist folder is at the root of the app
      const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
      this.mainWindow.loadFile(indexPath)
    }

    // Show when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    return this.mainWindow
  }

  /**
   * Create the settings window
   */
  createSettingsWindow(): BrowserWindow | null {
    if (!this.mainWindow) return null

    if (this.settingsWindow) {
      this.settingsWindow.focus()
      return this.settingsWindow
    }

    this.settingsWindow = new BrowserWindow({
      width: 900,
      height: 600,
      parent: this.mainWindow,
      modal: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.preloadPath,
      },
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 15, y: 10 },
    })

    // Apply security settings
    this.applyWindowSecuritySettings(this.settingsWindow)

    // Load settings page
    const settingsUrl = process.env.NODE_ENV !== 'production'
      ? 'http://localhost:5173/#/settings'
      : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}#/settings`

    this.settingsWindow.loadURL(settingsUrl)

    this.settingsWindow.once('ready-to-show', () => {
      this.settingsWindow?.show()
    })

    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null
    })

    return this.settingsWindow
  }

  /**
   * Create a window for a specific note
   */
  createNoteWindow(note: Note): BrowserWindow {
    // Check if window already exists for this note
    const existingWindow = this.noteWindows.get(note.id)
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus()
      return existingWindow
    }

    const noteWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 15, y: 10 },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.preloadPath,
      },
      title: `${note.title} - Viny`,
    })

    // Apply security settings
    this.applyWindowSecuritySettings(noteWindow)

    // Store window reference
    this.noteWindows.set(note.id, noteWindow)

    // Load note in standalone mode
    const noteUrl = process.env.NODE_ENV !== 'production'
      ? `http://localhost:5173/note/${note.id}`
      : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}?noteId=${note.id}`

    noteWindow.loadURL(noteUrl)

    // Clean up on close
    noteWindow.on('closed', () => {
      this.noteWindows.delete(note.id)
    })

    return noteWindow
  }

  /**
   * Create a hidden window for PDF generation
   */
  async createPDFWindow(): Promise<BrowserWindow> {
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })
    
    // Apply security settings
    this.applyWindowSecuritySettings(pdfWindow)
    
    return pdfWindow
  }

  /**
   * Get all windows
   */
  getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows()
  }

  /**
   * Get the main window
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * Close all windows
   */
  closeAllWindows(): void {
    this.noteWindows.forEach(window => {
      if (!window.isDestroyed()) {
        window.close()
      }
    })
    this.noteWindows.clear()

    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.close()
    }

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close()
    }
  }
}