import { ipcMain, dialog, shell, app } from 'electron'
import * as path from 'path'
import type { WindowManager } from '../windows/WindowManager'
import type { FileSystemStorage } from '../storage/FileSystemStorage'
import type { Note, Notebook } from '../../shared/types'
import { IPC_CHANNELS } from '../../shared/constants/ipc'
import { 
  validateNote, 
  validateNotebook, 
  validateSettings, 
  validateExportOptions,
  validateId,
  validateFilePath
} from '../../shared/validation/ipcSchemas'
import { convertNoteToMarkdown, convertNoteToHTML } from '../utils/noteExport'

export function setupIpcHandlers(
  windowManager: WindowManager,
  storageService: FileSystemStorage
): void {
  // Window controls
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const window = windowManager.getMainWindow()
    window?.minimize()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const window = windowManager.getMainWindow()
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const window = windowManager.getMainWindow()
    window?.close()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_UNMAXIMIZE, () => {
    const window = windowManager.getMainWindow()
    window?.unmaximize()
  })

  // Storage handlers with validation
  ipcMain.handle(IPC_CHANNELS.STORAGE_SAVE_NOTE, async (event, noteData) => {
    const validation = validateNote(noteData)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid note data: ${validation.error}`)
    }
    // Convert NoteData to Note
    const note: Note = {
      ...validation.data,
      tags: validation.data.tags || []
    }
    return storageService.saveNote(note)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_LOAD_NOTE, async (event, id) => {
    const validation = validateId(id)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid note ID: ${validation.error}`)
    }
    return storageService.loadNote(validation.data)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_LOAD_ALL_NOTES, async () => {
    return storageService.loadAllNotes()
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_DELETE_NOTE, async (event, id) => {
    const validation = validateId(id)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid note ID: ${validation.error}`)
    }
    return storageService.deleteNote(validation.data)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_SAVE_NOTEBOOKS, async (event, notebooksData) => {
    if (!Array.isArray(notebooksData)) {
      throw new Error('Notebooks must be an array')
    }
    
    // Validate each notebook
    const validatedNotebooks = []
    for (const notebook of notebooksData) {
      const validation = validateNotebook(notebook)
      if (!validation.success || !validation.data) {
        throw new Error(`Invalid notebook data: ${validation.error}`)
      }
      // Convert NotebookData to Notebook
      const nb: Notebook = {
        id: validation.data.id,
        name: validation.data.name,
        color: validation.data.color || '#000000',
        level: 0, // Will be calculated based on parentId
        parentId: validation.data.parentId || null
      }
      validatedNotebooks.push(nb)
    }
    
    return storageService.saveNotebooks(validatedNotebooks)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_LOAD_NOTEBOOKS, async () => {
    return storageService.loadNotebooks()
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_SAVE_SETTINGS, async (event, settingsData) => {
    const validation = validateSettings(settingsData)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid settings data: ${validation.error}`)
    }
    return storageService.saveSettings(validation.data)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_LOAD_SETTINGS, async () => {
    return storageService.loadSettings()
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_SAVE_TAG_COLORS, async (event, tagColors) => {
    if (typeof tagColors !== 'object' || tagColors === null) {
      throw new Error('Tag colors must be an object')
    }
    
    // Validate each color value
    for (const [tag, color] of Object.entries(tagColors)) {
      if (typeof tag !== 'string' || typeof color !== 'string') {
        throw new Error('Tag colors must be string key-value pairs')
      }
      if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
        throw new Error(`Invalid color format for tag "${tag}": ${color}`)
      }
    }
    
    return storageService.saveTagColors(tagColors)
  })

  ipcMain.handle(IPC_CHANNELS.STORAGE_LOAD_TAG_COLORS, async () => {
    return storageService.loadTagColors()
  })

  // Export handlers
  ipcMain.handle(IPC_CHANNELS.EXPORT_SAVE_DIALOG, async (event, defaultFileName, filters) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultFileName,
      filters: filters
    })
    return result.canceled ? null : result.filePath
  })

  ipcMain.handle(IPC_CHANNELS.EXPORT_NOTE_TO_FILE, async (event, noteData, filePath, options) => {
    const noteValidation = validateNote(noteData)
    if (!noteValidation.success || !noteValidation.data) {
      throw new Error(`Invalid note data: ${noteValidation.error}`)
    }
    
    const pathValidation = validateFilePath(filePath)
    if (!pathValidation.success || !pathValidation.data) {
      throw new Error(`Invalid file path: ${pathValidation.error}`)
    }
    
    const optionsValidation = validateExportOptions(options)
    if (!optionsValidation.success || !optionsValidation.data) {
      throw new Error(`Invalid export options: ${optionsValidation.error}`)
    }
    
    const validatedNoteData = noteValidation.data
    const exportOptions = optionsValidation.data
    
    try {
      let content = ''
      
      // Convert NoteData to Note
      const note: Note = {
        ...validatedNoteData,
        tags: validatedNoteData.tags || []
      }
      
      if (exportOptions.format === 'markdown') {
        content = convertNoteToMarkdown(note, exportOptions)
      } else if (exportOptions.format === 'html') {
        content = convertNoteToHTML(note, exportOptions)
      } else {
        throw new Error(`Unsupported format: ${exportOptions.format}`)
      }
      
      const fs = require('fs').promises
      await fs.writeFile(pathValidation.data, content, 'utf-8')
      
      return { success: true, filePath: pathValidation.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.EXPORT_NOTE_TO_PDF, async (event, noteData, filePath, options) => {
    const noteValidation = validateNote(noteData)
    if (!noteValidation.success || !noteValidation.data) {
      throw new Error(`Invalid note data: ${noteValidation.error}`)
    }
    
    const pathValidation = validateFilePath(filePath)
    if (!pathValidation.success || !pathValidation.data) {
      throw new Error(`Invalid file path: ${pathValidation.error}`)
    }
    
    const optionsValidation = validateExportOptions(options)
    if (!optionsValidation.success || !optionsValidation.data) {
      throw new Error(`Invalid export options: ${optionsValidation.error}`)
    }
    
    try {
      const pdfWindow = await windowManager.createPDFWindow()
      const validatedNoteData = noteValidation.data
      const exportOptions = optionsValidation.data
      
      // Convert NoteData to Note
      const note: Note = {
        ...validatedNoteData,
        tags: validatedNoteData.tags || []
      }
      
      // Generate HTML content
      const htmlContent = convertNoteToHTML(note, exportOptions)
      
      // Create a data URL with the content
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
      
      // Load the content
      await pdfWindow.loadURL(dataUrl)
      
      // Generate PDF
      const pdfData = await pdfWindow.webContents.printToPDF({
        pageSize: 'A4',
        margins: {
          top: 1,
          bottom: 1,
          left: 1,
          right: 1
        }
      })
      
      // Save PDF
      const fs = require('fs').promises
      await fs.writeFile(pathValidation.data, pdfData)
      
      // Close the window
      pdfWindow.close()
      
      return { success: true, filePath: pathValidation.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOW_ITEM_IN_FOLDER, async (event, filePath) => {
    const validation = validateFilePath(filePath)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid file path: ${validation.error}`)
    }
    shell.showItemInFolder(validation.data)
  })

  // Window management
  ipcMain.handle(IPC_CHANNELS.OPEN_NOTE_IN_NEW_WINDOW, async (event, noteId) => {
    const validation = validateId(noteId)
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid note ID: ${validation.error}`)
    }
    
    const note = await storageService.loadNote(validation.data)
    if (note) {
      windowManager.createNoteWindow(note)
    }
  })

  // Settings
  ipcMain.on(IPC_CHANNELS.OPEN_SETTINGS, () => {
    windowManager.createSettingsWindow()
  })

  // Directory selection
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Note sync broadcast
  ipcMain.on(IPC_CHANNELS.BROADCAST_NOTE_UPDATE, (event, noteData) => {
    const validation = validateNote(noteData)
    if (!validation.success || !validation.data) {
      console.error('Invalid note data for broadcast:', validation.error)
      return
    }
    
    // Get all windows
    const windows = windowManager.getAllWindows()
    
    // Broadcast to all windows except the sender
    windows.forEach(window => {
      if (window.webContents !== event.sender) {
        window.webContents.send(IPC_CHANNELS.NOTE_UPDATED, validation.data)
      }
    })
    
    // Also save to storage
    const note: Note = {
      ...validation.data,
      tags: validation.data.tags || []
    }
    storageService.saveNote(note).catch(error => {
      console.error('Failed to save broadcasted note:', error)
    })
  })
}