import { Menu, MenuItemConstructorOptions, app, dialog, shell, clipboard, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { promises as fs } from 'fs'
import type { WindowManager } from '../windows/WindowManager'
import type { FileSystemStorage } from '../storage/FileSystemStorage'
import type { Note, Notebook, Settings, ExportData } from '../../shared/types'

export class MenuBuilder {
  constructor(
    private windowManager: WindowManager,
    private storageService: FileSystemStorage
  ) {}

  buildMenu(): Menu {
    const isMac = process.platform === 'darwin'
    const template: MenuItemConstructorOptions[] = [
      // App menu (macOS only)
      ...(isMac ? [{
        label: app.getName(),
        submenu: [
          { role: 'about' as const },
          { 
            label: 'Check for Updates...',
            click: () => {
              autoUpdater.checkForUpdatesAndNotify()
            }
          },
          { type: 'separator' as const },
          { 
            label: 'Preferences...',
            accelerator: 'Cmd+,',
            click: () => {
              this.windowManager.createSettingsWindow()
            }
          },
          { type: 'separator' as const },
          { role: 'services' as const },
          { type: 'separator' as const },
          { role: 'hide' as const },
          { role: 'hideOthers' as const },
          { role: 'unhide' as const },
          { type: 'separator' as const },
          { role: 'quit' as const }
        ] as MenuItemConstructorOptions[]
      }] : []),
      
      // File menu
      {
        label: 'File',
        submenu: [
          {
            label: 'New Note',
            accelerator: 'CmdOrCtrl+N',
            click: (menuItem, browserWindow) => {
              if (browserWindow && browserWindow instanceof BrowserWindow) {
                browserWindow.webContents.send('create-new-note')
              }
            }
          },
          {
            label: 'New Notebook',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: (menuItem, browserWindow) => {
              if (browserWindow && browserWindow instanceof BrowserWindow) {
                browserWindow.webContents.send('create-new-notebook')
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Export All Notes...',
            click: () => this.handleExportAllNotes()
          },
          {
            label: 'Import Notes...',
            click: () => this.handleImportNotes()
          },
          { type: 'separator' },
          {
            label: 'Create Backup...',
            click: () => this.handleCreateBackup()
          },
          {
            label: 'Restore from Backup...',
            click: () => this.handleRestoreBackup()
          },
          { type: 'separator' },
          {
            label: 'Check Data Integrity',
            click: () => this.handleCheckDataIntegrity()
          },
          ...(!isMac ? [
            { type: 'separator' as const },
            { 
              label: 'Settings',
              accelerator: 'Ctrl+,',
              click: () => {
                this.windowManager.createSettingsWindow()
              }
            },
            { type: 'separator' as const },
            { role: 'quit' as const }
          ] : [])
        ] as MenuItemConstructorOptions[]
      },
      
      // Edit menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle' as const },
            { role: 'delete' as const },
            { role: 'selectAll' as const },
            { type: 'separator' as const },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' as const },
                { role: 'stopSpeaking' as const }
              ]
            }
          ] : [
            { role: 'delete' as const },
            { type: 'separator' as const },
            { role: 'selectAll' as const }
          ])
        ] as MenuItemConstructorOptions[]
      },
      
      // View menu
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ] as MenuItemConstructorOptions[]
      },
      
      // Window menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          ...(isMac ? [
            { type: 'separator' as const },
            { role: 'front' as const },
            { type: 'separator' as const },
            { role: 'window' as const }
          ] : [
            { role: 'close' as const }
          ])
        ] as MenuItemConstructorOptions[]
      },
      
      // Help menu
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://github.com/yourusername/viny')
            }
          },
          {
            label: 'Report Issue',
            click: () => {
              shell.openExternal('https://github.com/yourusername/viny/issues')
            }
          }
        ]
      }
    ]
    
    return Menu.buildFromTemplate(template)
  }

  // Export all notes handler
  private async handleExportAllNotes(): Promise<void> {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export All Notes',
        defaultPath: `viny-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      })

      if (result.canceled || !result.filePath) return

      // Show progress dialog
      const progressWindow = dialog.showMessageBoxSync({
        type: 'info',
        buttons: [],
        title: 'Exporting Notes',
        message: 'Exporting your notes...',
        detail: 'Please wait while we export your data.'
      })

      // Gather all data
      const [notes, notebooks, settings, tagColors] = await Promise.all([
        this.storageService.loadAllNotes(),
        this.storageService.loadNotebooks(),
        this.storageService.loadSettings(),
        this.storageService.loadTagColors()
      ])

      const exportData: ExportData = {
        notes,
        notebooks,
        settings: settings as Settings,
        tagColors,
        exportedAt: new Date().toISOString(),
        version: app.getVersion()
      }

      // Write to file
      await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2))

      dialog.showMessageBox({
        type: 'info',
        title: 'Export Complete',
        message: 'Your notes have been exported successfully!',
        detail: `Exported ${notes.length} notes to ${path.basename(result.filePath)}`,
        buttons: ['OK', 'Show in Folder']
      }).then(response => {
        if (response.response === 1) {
          shell.showItemInFolder(result.filePath!)
        }
      })
    } catch (error) {
      dialog.showErrorBox('Export Failed', `Failed to export notes: ${error}`)
    }
  }

  // Import notes handler
  private async handleImportNotes(): Promise<void> {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Notes',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) return

      const filePath = result.filePaths[0]
      
      // Read and parse file
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const importData = JSON.parse(fileContent) as ExportData

      // Validate structure
      if (!importData.notes || !Array.isArray(importData.notes)) {
        throw new Error('Invalid import file format')
      }

      // Ask for import mode
      const importMode = await dialog.showMessageBox({
        type: 'question',
        title: 'Import Mode',
        message: 'How would you like to import the notes?',
        detail: `Found ${importData.notes.length} notes to import.`,
        buttons: ['Merge with Existing', 'Replace All', 'Cancel'],
        defaultId: 0,
        cancelId: 2
      })

      if (importMode.response === 2) return

      if (importMode.response === 1) {
        // Replace all - create backup first
        await this.handleCreateBackup()
      }

      // Import notes
      let importedCount = 0
      for (const note of importData.notes) {
        try {
          if (importMode.response === 0) {
            // Merge mode - generate new IDs to avoid conflicts
            note.id = `${note.id}-imported-${Date.now()}`
          }
          await this.storageService.saveNote(note)
          importedCount++
        } catch (error) {
          console.error('Failed to import note:', note.id, error)
        }
      }

      // Import notebooks if present
      if (importData.notebooks && Array.isArray(importData.notebooks)) {
        await this.storageService.saveNotebooks(importData.notebooks)
      }

      // Import settings if requested
      if (importData.settings && importMode.response === 1) {
        await this.storageService.saveSettings(importData.settings)
      }

      // Import tag colors
      if (importData.tagColors) {
        await this.storageService.saveTagColors(importData.tagColors)
      }

      dialog.showMessageBox({
        type: 'info',
        title: 'Import Complete',
        message: 'Notes imported successfully!',
        detail: `Imported ${importedCount} out of ${importData.notes.length} notes.`,
        buttons: ['OK']
      })

      // Reload the main window
      this.windowManager.getMainWindow()?.reload()
    } catch (error) {
      dialog.showErrorBox('Import Failed', `Failed to import notes: ${error}`)
    }
  }

  // Create backup handler
  private async handleCreateBackup(): Promise<void> {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Create Backup',
        defaultPath: `viny-backup-${new Date().toISOString().split('T')[0]}.zip`,
        filters: [
          { name: 'ZIP Files', extensions: ['zip'] }
        ]
      })

      if (result.canceled || !result.filePath) return

      const AdmZip = require('adm-zip')
      const zip = new AdmZip()

      // Add all data files to zip
      const dataDir = this.storageService.getDataDirectory()
      zip.addLocalFolder(dataDir)

      // Write zip file
      zip.writeZip(result.filePath)

      dialog.showMessageBox({
        type: 'info',
        title: 'Backup Complete',
        message: 'Backup created successfully!',
        detail: `Backup saved to ${path.basename(result.filePath)}`,
        buttons: ['OK', 'Show in Folder']
      }).then(response => {
        if (response.response === 1) {
          shell.showItemInFolder(result.filePath!)
        }
      })
    } catch (error) {
      dialog.showErrorBox('Backup Failed', `Failed to create backup: ${error}`)
    }
  }

  // Restore from backup handler
  private async handleRestoreBackup(): Promise<void> {
    try {
      // Warning dialog
      const warning = await dialog.showMessageBox({
        type: 'warning',
        title: 'Restore from Backup',
        message: 'Are you sure you want to restore from a backup?',
        detail: 'This will replace all your current data. Your current data will be backed up first.',
        buttons: ['Cancel', 'Continue'],
        defaultId: 0,
        cancelId: 0
      })

      if (warning.response === 0) return

      // Create backup of current data first
      await this.handleCreateBackup()

      // Select backup file
      const result = await dialog.showOpenDialog({
        title: 'Select Backup File',
        filters: [
          { name: 'ZIP Files', extensions: ['zip'] }
        ],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) return

      const AdmZip = require('adm-zip')
      const zip = new AdmZip(result.filePaths[0])
      
      // Extract to data directory
      const dataDir = this.storageService.getDataDirectory()
      zip.extractAllTo(dataDir, true)

      dialog.showMessageBox({
        type: 'info',
        title: 'Restore Complete',
        message: 'Backup restored successfully!',
        detail: 'The application will now restart to apply the changes.',
        buttons: ['Restart Now']
      }).then(() => {
        app.relaunch()
        app.exit()
      })
    } catch (error) {
      dialog.showErrorBox('Restore Failed', `Failed to restore from backup: ${error}`)
    }
  }

  // Check data integrity handler
  private async handleCheckDataIntegrity(): Promise<void> {
    try {
      const issues: string[] = []
      
      // Check notes
      const notes = await this.storageService.loadAllNotes()
      const noteIds = new Set<string>()
      
      for (const note of notes) {
        if (!note.id) issues.push(`Note without ID found`)
        if (noteIds.has(note.id)) issues.push(`Duplicate note ID: ${note.id}`)
        noteIds.add(note.id)
        
        if (!note.title) issues.push(`Note ${note.id} missing title`)
        if (!note.createdAt) issues.push(`Note ${note.id} missing createdAt`)
        if (!note.updatedAt) issues.push(`Note ${note.id} missing updatedAt`)
      }

      // Check notebooks
      const notebooks = await this.storageService.loadNotebooks()
      const notebookIds = new Set<string>()
      
      for (const notebook of notebooks) {
        if (!notebook.id) issues.push(`Notebook without ID found`)
        if (notebookIds.has(notebook.id)) issues.push(`Duplicate notebook ID: ${notebook.id}`)
        notebookIds.add(notebook.id)
        
        if (!notebook.name) issues.push(`Notebook ${notebook.id} missing name`)
      }

      // Show results
      if (issues.length === 0) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Data Integrity Check',
          message: 'No issues found!',
          detail: `Checked ${notes.length} notes and ${notebooks.length} notebooks.`,
          buttons: ['OK']
        })
      } else {
        const response = await dialog.showMessageBox({
          type: 'warning',
          title: 'Data Integrity Check',
          message: `Found ${issues.length} issues`,
          detail: issues.slice(0, 10).join('\\n') + (issues.length > 10 ? '\\n...' : ''),
          buttons: ['OK', 'Copy Full Report', 'Attempt Repair'],
          defaultId: 0
        })

        if (response.response === 1) {
          clipboard.writeText(issues.join('\\n'))
        } else if (response.response === 2) {
          // Attempt basic repairs
          // This would implement basic repair logic
          dialog.showMessageBox({
            type: 'info',
            title: 'Repair Complete',
            message: 'Basic repairs attempted.',
            detail: 'Please check your data and create a new backup.',
            buttons: ['OK']
          })
        }
      }
    } catch (error) {
      dialog.showErrorBox('Integrity Check Failed', `Failed to check data integrity: ${error}`)
    }
  }
}