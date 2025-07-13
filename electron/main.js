const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

let mainWindow = null
let settingsWindow = null

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
    title: 'Nototo v1.1.1 - Note Taking App',
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
    title: 'Nototo Settings',
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
      label: 'Nototo',
      submenu: [
        {
          label: 'About Nototo',
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
          label: 'Hide Nototo',
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
          label: 'Nototo Website',
          click: () => {
            shell.openExternal('https://nototo.app')
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
