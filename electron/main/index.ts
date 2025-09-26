import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { WindowManager } from './windows/WindowManager'
import { FileSystemStorage } from './storage/FileSystemStorage'
import { MenuBuilder } from './menu/MenuBuilder'
import { setupIpcHandlers } from './ipc/handlers'
import { setupContextMenus } from './ipc/contextMenus'
import { setupPermissionHandlers } from './utils/permissions'

// Services
let windowManager: WindowManager
let storageService: FileSystemStorage
let menuBuilder: MenuBuilder

// Initialize services
function initializeServices(): void {
  const preloadPath = path.join(__dirname, '../preload/index.js')
  
  windowManager = new WindowManager(preloadPath)
  storageService = new FileSystemStorage()
  menuBuilder = new MenuBuilder(windowManager, storageService)
}

// Initialize the app
function initializeApp(): void {
  // Set up IPC handlers
  setupIpcHandlers(windowManager, storageService)
  setupContextMenus(windowManager)
  
  // Set up permission handlers
  setupPermissionHandlers()
  
  // Create main window
  windowManager.createMainWindow()
  
  // Set up auto-updater
  setupAutoUpdater()
  
  // Create application menu
  const menu = menuBuilder.buildMenu()
  Menu.setApplicationMenu(menu)
}

// Auto-updater setup
function setupAutoUpdater(): void {
  // Configure auto-updater for private repository
  const token = process.env.GH_TOKEN
  
  if (token) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'yourusername',
      repo: 'viny',
      private: true,
      token: token
    })
  }

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info)
  })

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    console.log(log_message)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info)
    autoUpdater.quitAndInstall()
  })

  // Check for updates
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify()
  }
}

// Enable WebGL and hardware acceleration
app.commandLine.appendSwitch('enable-webgl')
app.commandLine.appendSwitch('enable-gpu')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('enable-hardware-acceleration')

// App event handlers
app.whenReady().then(() => {
  initializeServices()
  initializeApp()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' }
  })
})

// Handle protocol for deep linking (optional)
app.setAsDefaultProtocolClient('viny')

// Export for testing
export { windowManager, storageService }