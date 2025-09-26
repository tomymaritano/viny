import React, { useState } from 'react'
import { Icons } from './Icons'
import { useElectronExport } from '../hooks/useElectronExport'
import { useSettings } from '../hooks/useSettings'
import { StandardModal } from './ui/StandardModal'
import { RadioGroup, RadioGroupItem } from './ui/RadioGroupRadix'
import { SwitchWithLabel } from './ui/SwitchRadix'
import type { Note } from '../types' // Use the proper Note type instead of local interface

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
  const {
    exportToHTML,
    exportToPDF,
    exportToMarkdown,
    exportMultipleNotes,
    isElectron,
  } = useElectronExport()
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
            filename: customFilename || 'viny_notes_export',
          })
          alert(
            "Multiple notes exported as HTML. Use your browser's print function to save as PDF."
          )
        } else {
          exportMultipleNotes(notesToExport, exportFormat, {
            ...options,
            filename: customFilename || 'viny_notes_export',
          })
        }
      }

      onClose()
    } catch (error) {
      // Export failed - show user-friendly error
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
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
        ? isElectron
          ? 'Generates native PDF file'
          : 'Opens print dialog'
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
      return 'viny_notes_export'
    }
  }

  const handleFormatChange = (value: string): void => {
    setExportFormat(value as ExportFormat)
  }

  const handleFilenameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setCustomFilename(e.target.value)
  }

  return (
    <StandardModal
      isOpen={isVisible}
      onClose={onClose}
      title={`Export ${isSingleNote ? 'Note' : 'Notes'}`}
      size="md"
      data-testid="export-dialog"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-theme-text-tertiary hover:bg-theme-bg-tertiary rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || notesToExport.length === 0}
            className="px-3 py-1.5 text-sm bg-theme-accent-primary text-theme-text-primary rounded hover:bg-theme-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-theme-text-primary border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Icons.Download size={14} />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      }
    >
      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Note title for single note export */}
        {isSingleNote && (
          <div className="mb-3 p-2 bg-theme-bg-primary rounded-lg">
            <p className="text-xs text-theme-text-tertiary">Exporting note:</p>
            <p className="text-sm font-medium text-theme-text-primary truncate">
              {notesToExport[0]?.title}
            </p>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">
            Format
          </label>
          <RadioGroup
            value={exportFormat}
            onValueChange={handleFormatChange}
            className="grid grid-cols-3 gap-2"
          >
            {formatOptions.map(format => (
              <label
                key={format.value}
                className={`flex flex-col items-center p-2.5 border rounded-lg cursor-pointer transition-colors ${
                  exportFormat === format.value
                    ? 'border-theme-accent-primary bg-theme-accent-primary/10'
                    : 'border-theme-border-primary hover:border-theme-text-tertiary'
                }`}
              >
                <RadioGroupItem value={format.value} className="sr-only" />
                <div
                  className={`mb-1.5 ${exportFormat === format.value ? 'text-theme-accent-primary' : 'text-theme-text-tertiary'}`}
                >
                  {format.icon}
                </div>
                <div
                  className={`text-xs font-medium text-center ${exportFormat === format.value ? 'text-theme-accent-primary' : 'text-theme-text-secondary'}`}
                >
                  {format.label}
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          <SwitchWithLabel
            checked={includeMetadata}
            onCheckedChange={setIncludeMetadata}
            label="Include Metadata"
            size="sm"
          />

          <div>
            <input
              type="text"
              value={customFilename}
              onChange={handleFilenameChange}
              placeholder={`Filename (default: ${generateDefaultFilename()})`}
              className="w-full px-2.5 py-1.5 text-sm bg-theme-bg-primary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </StandardModal>
  )
}

export default ExportDialog
export { ExportDialog }
