const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')

let mainWindow = null
let settingsWindow = null

// File System Storage Service - Inkdrop Style
class FileSystemStorageService {
  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'viny-data')
    this.notesDir = path.join(this.dataDir, 'notes')
    this.backupDir = path.join(this.dataDir, 'backups')
    this.metadataFile = path.join(this.dataDir, 'metadata.json')
    this.notebooksFile = path.join(this.dataDir, 'notebooks.json')
    this.settingsFile = path.join(this.dataDir, 'settings.json')
    this.tagColorsFile = path.join(this.dataDir, 'tag-colors.json')

    this.lastBackupTime = new Map()
    this.initializeDirectories()
  }

  async initializeDirectories() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      await fs.mkdir(this.notesDir, { recursive: true })
      await fs.mkdir(this.backupDir, { recursive: true })
      console.log('[StorageService] Initialized directories at:', this.dataDir)
    } catch (error) {
      console.error('[StorageService] Failed to initialize directories:', error)
    }
  }

  // Generate backup filename with timestamp
  generateBackupPath(filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ext = path.extname(filename)
    const name = path.basename(filename, ext)
    return path.join(this.backupDir, `${name}-${timestamp}${ext}`)
  }

  // Create backup before modifying file (throttled)
  async createFileBackup(filePath) {
    try {
      if (fsSync.existsSync(filePath)) {
        const now = Date.now()
        const lastBackup = this.lastBackupTime.get(filePath) || 0

        // Only create backup if last one was more than 5 seconds ago
        if (now - lastBackup < 5000) {
          return null
        }

        this.lastBackupTime.set(filePath, now)
        const backupPath = this.generateBackupPath(path.basename(filePath))
        await fs.copyFile(filePath, backupPath)
        console.log('[StorageService] Created backup:', backupPath)
        return backupPath
      }
    } catch (error) {
      console.warn(
        '[StorageService] Failed to create backup for:',
        filePath,
        error
      )
    }
    return null
  }

  // Save individual note with backup
  async saveNote(note) {
    if (!note || !note.id) {
      throw new Error('Invalid note: missing id')
    }

    const noteFile = path.join(this.notesDir, `note-${note.id}.json`)

    try {
      // Create backup of existing note
      await this.createFileBackup(noteFile)

      // Save new note
      await fs.writeFile(noteFile, JSON.stringify(note, null, 2))
      console.log('[StorageService] Saved note:', note.id)

      // Update metadata
      await this.updateMetadata('note_saved', {
        id: note.id,
        title: note.title,
      })

      return { success: true, path: noteFile }
    } catch (error) {
      console.error('[StorageService] Failed to save note:', note.id, error)
      throw new Error(`Failed to save note: ${error.message}`)
    }
  }

  // Load individual note
  async loadNote(id) {
    const noteFile = path.join(this.notesDir, `note-${id}.json`)

    try {
      const data = await fs.readFile(noteFile, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null // Note not found
      }
      console.error('[StorageService] Failed to load note:', id, error)
      throw new Error(`Failed to load note: ${error.message}`)
    }
  }

  // Load all notes
  async loadAllNotes() {
    try {
      const files = await fs.readdir(this.notesDir)
      const noteFiles = files.filter(
        file => file.startsWith('note-') && file.endsWith('.json')
      )

      const notes = []
      for (const file of noteFiles) {
        try {
          const filePath = path.join(this.notesDir, file)
          const data = await fs.readFile(filePath, 'utf-8')
          const note = JSON.parse(data)
          notes.push(note)
        } catch (error) {
          console.warn(
            '[StorageService] Failed to load note file:',
            file,
            error
          )
          // Continue loading other notes even if one fails
        }
      }

      console.log('[StorageService] Loaded', notes.length, 'notes')
      return notes
    } catch (error) {
      console.error('[StorageService] Failed to load notes:', error)
      return []
    }
  }

  // Delete note with backup
  async deleteNote(id) {
    const noteFile = path.join(this.notesDir, `note-${id}.json`)

    try {
      if (fsSync.existsSync(noteFile)) {
        // Create backup before deletion
        const backupPath = await this.createFileBackup(noteFile)

        // Delete the note
        await fs.unlink(noteFile)
        console.log('[StorageService] Deleted note:', id)

        // Update metadata
        await this.updateMetadata('note_deleted', { id, backupPath })

        return { success: true, backupPath }
      }
      return { success: false, error: 'Note not found' }
    } catch (error) {
      console.error('[StorageService] Failed to delete note:', id, error)
      throw new Error(`Failed to delete note: ${error.message}`)
    }
  }

  // Save/load other data types with backup
  async saveDataFile(filePath, data) {
    try {
      await this.createFileBackup(filePath)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      return { success: true }
    } catch (error) {
      console.error(
        '[StorageService] Failed to save data file:',
        filePath,
        error
      )
      throw new Error(`Failed to save data: ${error.message}`)
    }
  }

  async loadDataFile(filePath, defaultValue = null) {
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return defaultValue
      }
      console.error(
        '[StorageService] Failed to load data file:',
        filePath,
        error
      )
      throw new Error(`Failed to load data: ${error.message}`)
    }
  }

  // Notebooks operations
  async saveNotebooks(notebooks) {
    return this.saveDataFile(this.notebooksFile, notebooks)
  }

  async loadNotebooks() {
    return this.loadDataFile(this.notebooksFile, [])
  }

  // Settings operations
  async saveSettings(settings) {
    return this.saveDataFile(this.settingsFile, settings)
  }

  async loadSettings() {
    return this.loadDataFile(this.settingsFile, {})
  }

  // Tag colors operations
  async saveTagColors(tagColors) {
    return this.saveDataFile(this.tagColorsFile, tagColors)
  }

  async loadTagColors() {
    return this.loadDataFile(this.tagColorsFile, {})
  }

  // Update metadata file
  async updateMetadata(action, data) {
    try {
      let metadata = await this.loadDataFile(this.metadataFile, {
        created: new Date().toISOString(),
        actions: [],
      })

      metadata.actions.push({
        action,
        data,
        timestamp: new Date().toISOString(),
      })

      // Keep only last 1000 actions
      if (metadata.actions.length > 1000) {
        metadata.actions = metadata.actions.slice(-1000)
      }

      await this.saveDataFile(this.metadataFile, metadata)
    } catch (error) {
      console.warn('[StorageService] Failed to update metadata:', error)
    }
  }

  // Migration from localStorage
  async migrateFromLocalStorage(data) {
    try {
      console.log('[StorageService] Starting migration from localStorage')

      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          await this.saveNote(note)
        }
        console.log('[StorageService] Migrated', data.notes.length, 'notes')
      }

      if (data.notebooks) {
        await this.saveNotebooks(data.notebooks)
        console.log('[StorageService] Migrated notebooks')
      }

      if (data.settings) {
        await this.saveSettings(data.settings)
        console.log('[StorageService] Migrated settings')
      }

      if (data.tagColors) {
        await this.saveTagColors(data.tagColors)
        console.log('[StorageService] Migrated tag colors')
      }

      await this.updateMetadata('migration_completed', {
        source: 'localStorage',
        notesCount: data.notes?.length || 0,
      })

      return { success: true, message: 'Migration completed successfully' }
    } catch (error) {
      console.error('[StorageService] Migration failed:', error)
      throw new Error(`Migration failed: ${error.message}`)
    }
  }

  // Get storage information
  async getStorageInfo() {
    try {
      const notes = await this.loadAllNotes()
      const notebooks = await this.loadNotebooks()
      const settings = await this.loadSettings()
      const tagColors = await this.loadTagColors()

      return {
        dataDirectory: this.dataDir,
        notesCount: notes.length,
        notebooksCount: notebooks.length,
        hasSettings: Object.keys(settings).length > 0,
        tagColorsCount: Object.keys(tagColors).length,
        directories: {
          data: this.dataDir,
          notes: this.notesDir,
          backups: this.backupDir,
        },
      }
    } catch (error) {
      console.error('[StorageService] Failed to get storage info:', error)
      throw new Error(`Failed to get storage info: ${error.message}`)
    }
  }

  // Get data directory path
  getDataDirectory() {
    return this.dataDir
  }
}

// Initialize storage service
const storageService = new FileSystemStorageService()

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // Performance optimizations
      experimentalFeatures: false,
      v8CacheOptions: 'code',
      backgroundThrottling: false,
    },
    title: 'Viny v1.3.0 - Note Taking App',
    show: false,
    minWidth: 800,
    minHeight: 600,
    // Performance optimizations
    webSecurity: true,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
  })

  const isDev = process.env.NODE_ENV === 'development'

  // Security: Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    // Try different ports since Vite might use 5174
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    console.log('Loading dev URL:', devUrl)
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

// Create settings window
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 900,
    height: 600,
    parent: mainWindow,
    modal: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    title: 'Viny Settings',
    minWidth: 800,
    minHeight: 500,
  })

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    settingsWindow.loadURL(`${devUrl}#/settings`)
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/settings',
    })
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show()
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// IPC handlers
ipcMain.on('open-settings', () => {
  createSettingsWindow()
})

// Window control handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window-unmaximize', () => {
  if (mainWindow) {
    mainWindow.unmaximize()
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})

// Modern window dragging handlers
let dragState = {
  isDragging: false,
  startPosition: null,
  windowStartPosition: null,
}

ipcMain.on('window-drag-start', (event, data) => {
  if (!mainWindow) return

  const windowBounds = mainWindow.getBounds()
  dragState = {
    isDragging: true,
    startPosition: { x: data.startX, y: data.startY },
    windowStartPosition: { x: windowBounds.x, y: windowBounds.y },
  }
})

ipcMain.on('window-drag-move', (event, data) => {
  if (!mainWindow || !dragState.isDragging) return

  const deltaX = data.currentX - dragState.startPosition.x
  const deltaY = data.currentY - dragState.startPosition.y

  const newX = dragState.windowStartPosition.x + deltaX
  const newY = dragState.windowStartPosition.y + deltaY

  mainWindow.setPosition(newX, newY)
})

ipcMain.on('window-drag-end', () => {
  dragState = {
    isDragging: false,
    startPosition: null,
    windowStartPosition: null,
  }
})

// Storage IPC Handlers - File System Operations
ipcMain.handle('storage-save-note', async (event, note) => {
  try {
    return await storageService.saveNote(note)
  } catch (error) {
    console.error('[IPC] storage-save-note failed:', error)
    throw error
  }
})

ipcMain.handle('storage-load-note', async (event, id) => {
  try {
    return await storageService.loadNote(id)
  } catch (error) {
    console.error('[IPC] storage-load-note failed:', error)
    throw error
  }
})

ipcMain.handle('storage-load-all-notes', async () => {
  try {
    return await storageService.loadAllNotes()
  } catch (error) {
    console.error('[IPC] storage-load-all-notes failed:', error)
    throw error
  }
})

ipcMain.handle('storage-delete-note', async (event, id) => {
  try {
    return await storageService.deleteNote(id)
  } catch (error) {
    console.error('[IPC] storage-delete-note failed:', error)
    throw error
  }
})

ipcMain.handle('storage-save-notebooks', async (event, notebooks) => {
  try {
    return await storageService.saveNotebooks(notebooks)
  } catch (error) {
    console.error('[IPC] storage-save-notebooks failed:', error)
    throw error
  }
})

ipcMain.handle('storage-load-notebooks', async () => {
  try {
    return await storageService.loadNotebooks()
  } catch (error) {
    console.error('[IPC] storage-load-notebooks failed:', error)
    throw error
  }
})

ipcMain.handle('storage-save-settings', async (event, settings) => {
  try {
    return await storageService.saveSettings(settings)
  } catch (error) {
    console.error('[IPC] storage-save-settings failed:', error)
    throw error
  }
})

ipcMain.handle('storage-load-settings', async () => {
  try {
    return await storageService.loadSettings()
  } catch (error) {
    console.error('[IPC] storage-load-settings failed:', error)
    throw error
  }
})

ipcMain.handle('storage-save-tag-colors', async (event, tagColors) => {
  try {
    return await storageService.saveTagColors(tagColors)
  } catch (error) {
    console.error('[IPC] storage-save-tag-colors failed:', error)
    throw error
  }
})

ipcMain.handle('storage-load-tag-colors', async () => {
  try {
    return await storageService.loadTagColors()
  } catch (error) {
    console.error('[IPC] storage-load-tag-colors failed:', error)
    throw error
  }
})

ipcMain.handle('storage-migrate-from-localStorage', async (event, data) => {
  try {
    return await storageService.migrateFromLocalStorage(data)
  } catch (error) {
    console.error('[IPC] storage-migrate-from-localStorage failed:', error)
    throw error
  }
})

ipcMain.handle('storage-get-info', async () => {
  try {
    return await storageService.getStorageInfo()
  } catch (error) {
    console.error('[IPC] storage-get-info failed:', error)
    throw error
  }
})

ipcMain.handle('storage-get-data-directory', async () => {
  try {
    return storageService.getDataDirectory()
  } catch (error) {
    console.error('[IPC] storage-get-data-directory failed:', error)
    throw error
  }
})

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
  createMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Auto-updater setup
function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.checkForUpdatesAndNotify()

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })

  autoUpdater.on('update-available', info => {
    console.log('Update available:', info.version)
  })

  autoUpdater.on('update-not-available', info => {
    console.log('Update not available:', info.version)
  })

  autoUpdater.on('error', err => {
    console.log('Error in auto-updater:', err)
  })

  autoUpdater.on('download-progress', progressObj => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message =
      log_message +
      ' (' +
      progressObj.transferred +
      '/' +
      progressObj.total +
      ')'
    console.log(log_message)
  })

  autoUpdater.on('update-downloaded', info => {
    console.log('Update downloaded:', info.version)
    autoUpdater.quitAndInstall()
  })
}

// Create application menu with update check
function createMenu() {
  const template = [
    {
      label: 'Viny',
      submenu: [
        {
          label: 'About Viny',
          role: 'about',
        },
        {
          label: 'Check for Updates...',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify()
          },
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: [],
        },
        { type: 'separator' },
        {
          label: 'Hide Viny',
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          role: 'forceReload',
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          role: 'toggleDevTools',
        },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'Ctrl+Command+F',
          role: 'togglefullscreen',
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Viny Website',
          click: () => {
            shell.openExternal('https://viny.app')
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal(
              'https://github.com/tomymaritano/markdown/issues'
            )
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
