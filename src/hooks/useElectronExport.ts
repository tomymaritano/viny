import { useCallback } from 'react'
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

  // TEMPORARY: Using browser export for all platforms until Electron export path validation is fixed
  // The Electron export has strict path validation that rejects absolute paths from save dialog
  
  const exportToHTML = useCallback(
    async (note: Note, options: ExportOptions = {}): Promise<void> => {
      return browserExport.exportToHTML(note, options)
    },
    [browserExport]
  )

  const exportToMarkdown = useCallback(
    async (note: Note, options: ExportOptions = {}): Promise<void> => {
      return browserExport.exportToMarkdown(note, options)
    },
    [browserExport]
  )

  const exportToPDF = useCallback(
    async (note: Note, options: ExportOptions = {}): Promise<void> => {
      return browserExport.exportToPDF(note, options)
    },
    [browserExport]
  )

  const exportMultipleNotes = useCallback(
    (
      notes: Note[],
      format: 'html' | 'markdown' = 'html',
      options: ExportOptions = {}
    ): void => {
      return browserExport.exportMultipleNotes(notes, format, options)
    },
    [browserExport]
  )

  return {
    exportToHTML,
    exportToPDF,
    exportToMarkdown,
    exportMultipleNotes,
    generateHTML: browserExport.generateHTML,
    isElectron,
  }
}