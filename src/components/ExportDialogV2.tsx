/**
 * ExportDialogV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2
 */

import React, { memo, useState, useCallback } from 'react'
import { useActiveNotesQueryV2 } from '../hooks/queries/useNotesServiceQueryV2'
import { useNotebooksQueryV2 } from '../hooks/queries/useNotebooksServiceQueryV2'
import { useModalStore, useNoteUIStore } from '../stores/cleanUIStore'
import { StandardModal } from './ui/StandardModal'
import { Icons } from './Icons'
import { useExport } from '../hooks/useExport'
import { useToast } from '../hooks/useToast'
import type { Note } from '../types'

type ExportFormat = 'markdown' | 'json' | 'pdf' | 'html'
type ExportScope = 'current' | 'selected' | 'all' | 'notebook'

export const ExportDialogV2: React.FC = memo(() => {
  const { modals, setModal } = useModalStore()
  const { selectedNoteId, selectedNoteIds } = useNoteUIStore()
  const { data: notes = [] } = useActiveNotesQueryV2()
  const { data: notebooks = [] } = useNotebooksQueryV2()
  const { exportNotes } = useExport()
  const { showToast } = useToast()

  const [format, setFormat] = useState<ExportFormat>('markdown')
  const [scope, setScope] = useState<ExportScope>('current')
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const currentNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null

  const handleClose = () => {
    setModal('export', false)
  }

  const getNotesToExport = useCallback((): Note[] => {
    switch (scope) {
      case 'current':
        return currentNote ? [currentNote] : []
      case 'selected':
        return notes.filter(note => selectedNoteIds.has(note.id))
      case 'all':
        return notes
      case 'notebook':
        return notes.filter(note => note.notebookId === selectedNotebookId)
      default:
        return []
    }
  }, [scope, currentNote, notes, selectedNoteIds, selectedNotebookId])

  const handleExport = useCallback(async () => {
    const notesToExport = getNotesToExport()
    
    if (notesToExport.length === 0) {
      showToast('No notes to export', 'error')
      return
    }

    setIsExporting(true)
    try {
      await exportNotes(notesToExport, {
        format,
        includeMetadata,
        filename: scope === 'current' && currentNote 
          ? currentNote.title 
          : `viny-export-${new Date().toISOString().split('T')[0]}`
      })
      showToast(`Exported ${notesToExport.length} note(s) successfully`, 'success')
      handleClose()
    } catch (error) {
      showToast('Export failed', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [getNotesToExport, exportNotes, format, includeMetadata, scope, currentNote, showToast, handleClose])

  if (!modals.export) return null

  const exportCount = getNotesToExport().length

  return (
    <StandardModal
      isOpen={modals.export}
      onClose={handleClose}
      title="Export Notes"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Export Scope */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary mb-2">
            Export Scope
          </label>
          <div className="space-y-2">
            {currentNote && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="scope"
                  value="current"
                  checked={scope === 'current'}
                  onChange={(e) => setScope(e.target.value as ExportScope)}
                  className="text-theme-primary"
                />
                <span className="text-sm">Current note ({currentNote.title})</span>
              </label>
            )}
            
            {selectedNoteIds.size > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="scope"
                  value="selected"
                  checked={scope === 'selected'}
                  onChange={(e) => setScope(e.target.value as ExportScope)}
                  className="text-theme-primary"
                />
                <span className="text-sm">Selected notes ({selectedNoteIds.size})</span>
              </label>
            )}
            
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                value="all"
                checked={scope === 'all'}
                onChange={(e) => setScope(e.target.value as ExportScope)}
                className="text-theme-primary"
              />
              <span className="text-sm">All notes ({notes.length})</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                value="notebook"
                checked={scope === 'notebook'}
                onChange={(e) => setScope(e.target.value as ExportScope)}
                className="text-theme-primary"
              />
              <span className="text-sm">Specific notebook</span>
            </label>
          </div>
          
          {scope === 'notebook' && (
            <select
              value={selectedNotebookId}
              onChange={(e) => setSelectedNotebookId(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-sm"
            >
              <option value="">Select a notebook</option>
              {notebooks.map(notebook => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormat('markdown')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                format === 'markdown'
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-bg-secondary border-theme-border hover:bg-theme-hover'
              }`}
            >
              <Icons.FileText className="w-4 h-4 inline-block mr-1" />
              Markdown
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                format === 'json'
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-bg-secondary border-theme-border hover:bg-theme-hover'
              }`}
            >
              <Icons.Code className="w-4 h-4 inline-block mr-1" />
              JSON
            </button>
            <button
              onClick={() => setFormat('html')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                format === 'html'
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-bg-secondary border-theme-border hover:bg-theme-hover'
              }`}
            >
              <Icons.Globe className="w-4 h-4 inline-block mr-1" />
              HTML
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                format === 'pdf'
                  ? 'bg-theme-primary text-white border-theme-primary'
                  : 'bg-theme-bg-secondary border-theme-border hover:bg-theme-hover'
              }`}
            >
              <Icons.FileText className="w-4 h-4 inline-block mr-1" />
              PDF
            </button>
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="rounded text-theme-primary"
            />
            <span className="text-sm">Include metadata (tags, dates, notebook)</span>
          </label>
        </div>

        {/* Export Info */}
        <div className="text-sm text-theme-text-secondary">
          {exportCount > 0 ? (
            <>Ready to export {exportCount} note{exportCount !== 1 ? 's' : ''}</>
          ) : (
            <>No notes selected for export</>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-theme-bg-secondary border border-theme-border rounded-lg hover:bg-theme-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exportCount === 0 || isExporting}
            className="px-4 py-2 text-sm bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Icons.Loader className="w-4 h-4 inline-block mr-1 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Icons.Download className="w-4 h-4 inline-block mr-1" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </StandardModal>
  )
})

ExportDialogV2.displayName = 'ExportDialogV2'

export default ExportDialogV2