import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import Icons from './Icons'
import { useExport } from '../hooks/useExport'
import { useSettings } from '../hooks/useSettings'

const ExportDialog = ({
  isVisible,
  onClose,
  notes = [],
  selectedNotes = [],
  type = 'single',
}) => {
  const { exportToHTML, exportToPDF, exportToMarkdown, exportMultipleNotes } =
    useExport()
  const { settings } = useSettings()

  const [exportFormat, setExportFormat] = useState(
    settings.exportFormat || 'pdf'
  )
  const [includeMetadata, setIncludeMetadata] = useState(
    settings.includeMetadata !== false
  )
  const [customFilename, setCustomFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  if (!isVisible) return null

  const notesToExport = type === 'multiple' ? selectedNotes : [notes[0]]
  const isSingleNote = type === 'single'

  const handleExport = async () => {
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
      alert(`Export failed: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
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

  const generateDefaultFilename = () => {
    if (isSingleNote) {
      const note = notesToExport[0]
      return note?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'
    } else {
      return 'inkrun_notes_export'
    }
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
          className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-solarized-base01">
            <div>
              <h2 className="text-xl font-semibold text-solarized-base5">
                Export {isSingleNote ? 'Note' : 'Notes'}
              </h2>
              <p className="text-sm text-solarized-base1 mt-1">
                {isSingleNote
                  ? `Export "${notesToExport[0]?.title}" to your preferred format`
                  : `Export ${notesToExport.length} selected notes`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01 rounded transition-colors"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-solarized-base3 mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                {formatOptions.map(format => (
                  <label
                    key={format.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === format.value
                        ? 'border-solarized-blue bg-solarized-blue/10'
                        : 'border-solarized-base01 hover:border-solarized-base1'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={e => setExportFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`mt-0.5 ${exportFormat === format.value ? 'text-solarized-blue' : 'text-solarized-base1'}`}
                      >
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${exportFormat === format.value ? 'text-solarized-blue' : 'text-solarized-base3'}`}
                        >
                          {format.label}
                        </div>
                        <div className="text-sm text-solarized-base1 mt-0.5">
                          {format.description}
                        </div>
                        <div className="text-xs text-solarized-base0 mt-1">
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
                  <div className="text-sm font-medium text-solarized-base3">
                    Include Metadata
                  </div>
                  <div className="text-xs text-solarized-base1 mt-0.5">
                    Include title, date, notebook, and tags in export
                  </div>
                </div>
                <button
                  onClick={() => setIncludeMetadata(!includeMetadata)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    includeMetadata
                      ? 'bg-solarized-blue'
                      : 'bg-solarized-base01'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      includeMetadata ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-solarized-base3 mb-2">
                  Custom Filename (Optional)
                </label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={e => setCustomFilename(e.target.value)}
                  placeholder={generateDefaultFilename()}
                  className="w-full px-3 py-2 bg-solarized-base03 border border-solarized-base01 rounded text-solarized-base3 focus:border-solarized-blue focus:outline-none"
                />
                <div className="text-xs text-solarized-base0 mt-1">
                  Leave empty to use default filename
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-solarized-base01 rounded-lg p-3">
              <div className="text-sm text-solarized-base3 font-medium mb-2">
                Export Preview
              </div>
              <div className="space-y-1 text-xs text-solarized-base1">
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
          <div className="flex items-center justify-between p-6 border-t border-solarized-base01">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-solarized-base1 border border-solarized-base01 rounded hover:bg-solarized-base01 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || notesToExport.length === 0}
              className="px-4 py-2 text-sm bg-solarized-blue text-solarized-base5 rounded hover:bg-solarized-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-solarized-base5 border-t-transparent rounded-full animate-spin" />
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

ExportDialog.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notes: PropTypes.array,
  selectedNotes: PropTypes.array,
  type: PropTypes.oneOf(['single', 'multiple']),
}

ExportDialog.defaultProps = {
  notes: [],
  selectedNotes: [],
  type: 'single',
}

export default ExportDialog
