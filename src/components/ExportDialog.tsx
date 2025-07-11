import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useExport } from '../hooks/useExport'
import { useSettings } from '../hooks/useSettings'

interface Note {
  id: string
  title: string
  content?: string
  [key: string]: any
}

interface ExportDialogProps {
  isVisible: boolean
  onClose: () => void
  notes?: Note[]
  selectedNotes?: Note[]
  type?: 'single' | 'multiple'
}

type ExportFormat = 'pdf' | 'html' | 'markdown'

interface FormatOption {
  value: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
  note: string
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isVisible,
  onClose,
  notes = [],
  selectedNotes = [],
  type = 'single',
}) => {
  const { exportToHTML, exportToPDF, exportToMarkdown, exportMultipleNotes } =
    useExport()
  const { settings } = useSettings()

  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    (settings.exportFormat as ExportFormat) || 'pdf'
  )
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(
    settings.includeMetadata !== false
  )
  const [customFilename, setCustomFilename] = useState<string>('')
  const [isExporting, setIsExporting] = useState<boolean>(false)

  if (!isVisible) return null

  const notesToExport = type === 'multiple' ? selectedNotes : [notes[0]]
  const isSingleNote = type === 'single'

  const handleExport = async (): Promise<void> => {
    if (notesToExport.length === 0) return

    setIsExporting(true)

    try {
      const options = {
        includeMetadata,
        filename: customFilename || undefined,
      }

      if (isSingleNote) {
        const note = notesToExport[0]

        switch (exportFormat) {
          case 'pdf':
            await exportToPDF(note, options)
            break
          case 'html':
            exportToHTML(note, options)
            break
          case 'markdown':
            exportToMarkdown(note, options)
            break
          default:
            throw new Error('Unsupported export format')
        }
      } else {
        // Multiple notes
        if (exportFormat === 'pdf') {
          // For multiple notes in PDF, we'll create HTML and let user print
          exportMultipleNotes(notesToExport, 'html', {
            ...options,
            filename: customFilename || 'inkrun_notes_export',
          })
          alert(
            "Multiple notes exported as HTML. Use your browser's print function to save as PDF."
          )
        } else {
          exportMultipleNotes(notesToExport, exportFormat, {
            ...options,
            filename: customFilename || 'inkrun_notes_export',
          })
        }
      }

      onClose()
    } catch (error) {
      // Export failed - show user-friendly error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Export failed: ${errorMessage}`)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions: FormatOption[] = [
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Print-ready document format',
      icon: <Icons.FileText size={20} />,
      note: isSingleNote
        ? 'Opens print dialog'
        : 'Exports as HTML for printing',
    },
    {
      value: 'html',
      label: 'HTML',
      description: 'Web page format with styling',
      icon: <Icons.Globe size={20} />,
      note: 'Viewable in any web browser',
    },
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Plain text with markdown formatting',
      icon: <Icons.FileText size={20} />,
      note: 'Compatible with other markdown editors',
    },
  ]

  const generateDefaultFilename = (): string => {
    if (isSingleNote) {
      const note = notesToExport[0]
      return note?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'
    } else {
      return 'inkrun_notes_export'
    }
  }

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setExportFormat(e.target.value as ExportFormat)
  }

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCustomFilename(e.target.value)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border-primary">
            <div>
              <h2 className="text-xl font-semibold text-theme-text-primary">
                Export {isSingleNote ? 'Note' : 'Notes'}
              </h2>
              <p className="text-sm text-theme-text-tertiary mt-1">
                {isSingleNote
                  ? `Export "${notesToExport[0]?.title}" to your preferred format`
                  : `Export ${notesToExport.length} selected notes`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary rounded transition-colors"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                {formatOptions.map(format => (
                  <label
                    key={format.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === format.value
                        ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                        : 'border-theme-border-primary hover:border-theme-text-tertiary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={handleFormatChange}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`mt-0.5 ${exportFormat === format.value ? 'text-theme-accent-primary' : 'text-theme-text-tertiary'}`}
                      >
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${exportFormat === format.value ? 'text-theme-accent-primary' : 'text-theme-text-secondary'}`}
                        >
                          {format.label}
                        </div>
                        <div className="text-sm text-theme-text-tertiary mt-0.5">
                          {format.description}
                        </div>
                        <div className="text-xs text-theme-text-muted mt-1">
                          {format.note}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-theme-text-secondary">
                    Include Metadata
                  </div>
                  <div className="text-xs text-theme-text-tertiary mt-0.5">
                    Include title, date, notebook, and tags in export
                  </div>
                </div>
                <button
                  onClick={() => setIncludeMetadata(!includeMetadata)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    includeMetadata
                      ? 'bg-theme-accent-primary'
                      : 'bg-theme-bg-tertiary'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-theme-text-primary transition-transform ${
                      includeMetadata ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Custom Filename (Optional)
                </label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={handleFilenameChange}
                  placeholder={generateDefaultFilename()}
                  className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
                />
                <div className="text-xs text-theme-text-muted mt-1">
                  Leave empty to use default filename
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-theme-bg-tertiary rounded-lg p-3">
              <div className="text-sm text-theme-text-secondary font-medium mb-2">
                Export Preview
              </div>
              <div className="space-y-1 text-xs text-theme-text-tertiary">
                <div>
                  Format:{' '}
                  {formatOptions.find(f => f.value === exportFormat)?.label}
                </div>
                <div>
                  Filename: {customFilename || generateDefaultFilename()}.
                  {exportFormat === 'markdown' ? 'md' : exportFormat}
                </div>
                <div>Metadata: {includeMetadata ? 'Included' : 'Excluded'}</div>
                {!isSingleNote && (
                  <div>Notes: {notesToExport.length} selected</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-theme-border-primary">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-theme-text-tertiary border border-theme-border-primary rounded hover:bg-theme-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || notesToExport.length === 0}
              className="px-4 py-2 text-sm bg-theme-accent-primary text-theme-text-primary rounded hover:bg-theme-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-theme-text-primary border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Icons.Download size={16} />
                  <span>Export {isSingleNote ? 'Note' : 'Notes'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ExportDialog