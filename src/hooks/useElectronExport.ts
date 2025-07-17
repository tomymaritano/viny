import { useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { Note } from '../types'
import { useExport } from './useExport'
import { useToast } from './useToast'

interface ExportOptions {
  includeMetadata?: boolean
  filename?: string
}

export const useElectronExport = () => {
  const { showToast } = useToast()
  const browserExport = useExport()
  
  const isElectron = window.electronAPI?.isElectron === true

  const exportToHTML = useCallback(async (note: Note, options: ExportOptions = {}): Promise<void> => {
    const { includeMetadata = true, filename } = options
    
    if (!isElectron) {
      // Fallback to browser export
      return browserExport.exportToHTML(note, options)
    }
    
    try {
      // Use native file dialog
      const defaultFileName = filename || `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
      const filePath = await window.electronAPI.export.showSaveDialog(defaultFileName, [
        { name: 'HTML Files', extensions: ['html', 'htm'] },
        { name: 'All Files', extensions: ['*'] }
      ])
      
      if (!filePath) {
        // User cancelled
        return
      }
      
      // Export using native file system
      const result = await window.electronAPI.export.exportNoteToFile(note, filePath, {
        format: 'html',
        includeMetadata
      })
      
      if (result.success) {
        showToast('Note exported successfully', 'success')
        
        // Show in folder
        await window.electronAPI.export.showItemInFolder(result.filePath!)
      } else {
        showToast(`Export failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showToast('Export failed', 'error')
    }
  }, [isElectron, browserExport, showToast])

  const exportToMarkdown = useCallback(async (note: Note, options: ExportOptions = {}): Promise<void> => {
    const { includeMetadata = true, filename } = options
    
    if (!isElectron) {
      // Fallback to browser export
      return browserExport.exportToMarkdown(note, options)
    }
    
    try {
      // Use native file dialog
      const defaultFileName = filename || `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
      const filePath = await window.electronAPI.export.showSaveDialog(defaultFileName, [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ])
      
      if (!filePath) {
        // User cancelled
        return
      }
      
      // Export using native file system
      const result = await window.electronAPI.export.exportNoteToFile(note, filePath, {
        format: 'markdown',
        includeMetadata
      })
      
      if (result.success) {
        showToast('Note exported successfully', 'success')
        
        // Show in folder
        await window.electronAPI.export.showItemInFolder(result.filePath!)
      } else {
        showToast(`Export failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Export failed:', error)
      showToast('Export failed', 'error')
    }
  }, [isElectron, browserExport, showToast])

  const exportToPDF = useCallback(async (note: Note, options: ExportOptions = {}): Promise<void> => {
    const { includeMetadata = true, filename } = options
    
    if (!isElectron) {
      // Fallback to browser export
      return browserExport.exportToPDF(note, options)
    }
    
    try {
      // Use native file dialog
      const defaultFileName = filename || `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      const filePath = await window.electronAPI.export.showSaveDialog(defaultFileName, [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ])
      
      if (!filePath) {
        // User cancelled
        return
      }
      
      showToast('Generating PDF...', 'info')
      
      // Export using native PDF generation
      const result = await window.electronAPI.export.exportNoteToPDF(note, filePath, {
        format: 'pdf',
        includeMetadata
      })
      
      if (result.success) {
        showToast('PDF exported successfully', 'success')
        
        // Show in folder
        await window.electronAPI.export.showItemInFolder(result.filePath!)
      } else {
        showToast(`PDF export failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('PDF export failed:', error)
      showToast('PDF export failed', 'error')
    }
  }, [isElectron, browserExport, showToast])

  const exportMultipleNotes = useCallback((notes: Note[], format: 'html' | 'markdown' = 'html', options: ExportOptions = {}): void => {
    // For multiple notes, always use browser export for now
    // TODO: Implement native multi-note export
    return browserExport.exportMultipleNotes(notes, format, options)
  }, [browserExport])

  return {
    exportToHTML,
    exportToPDF,
    exportToMarkdown,
    exportMultipleNotes,
    generateHTML: browserExport.generateHTML,
    isElectron
  }
}