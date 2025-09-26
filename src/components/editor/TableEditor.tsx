import React, { useState, useRef, useEffect } from 'react'
import { Icons } from '../Icons'
import { StandardModal } from '../ui/StandardModal'
import { cn } from '../../lib/utils'

interface TableEditorProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (markdown: string) => void
  initialData?: {
    rows: string[][]
    headers?: string[]
  }
}

const TableEditor: React.FC<TableEditorProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialData,
}) => {
  const [rows, setRows] = useState(
    initialData?.rows || [
      ['', '', ''],
      ['', '', ''],
    ]
  )
  const [headers, setHeaders] = useState(
    initialData?.headers || ['Column 1', 'Column 2', 'Column 3']
  )
  const [alignment, setAlignment] = useState<('left' | 'center' | 'right')[]>(
    Array(headers.length).fill('left')
  )
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])

  useEffect(() => {
    if (initialData) {
      setRows(initialData.rows)
      if (initialData.headers) {
        setHeaders(initialData.headers)
        setAlignment(Array(initialData.headers.length).fill('left'))
      }
    }
  }, [initialData])

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`])
    setRows(rows.map(row => [...row, '']))
    setAlignment([...alignment, 'left'])
  }

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return
    setHeaders(headers.filter((_, i) => i !== index))
    setRows(rows.map(row => row.filter((_, i) => i !== index)))
    setAlignment(alignment.filter((_, i) => i !== index))
  }

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')])
  }

  const removeRow = (index: number) => {
    if (rows.length <= 1) return
    setRows(rows.filter((_, i) => i !== index))
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows]
    newRows[rowIndex][colIndex] = value
    setRows(newRows)
  }

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers]
    newHeaders[index] = value
    setHeaders(newHeaders)
  }

  const updateAlignment = (index: number, align: 'left' | 'center' | 'right') => {
    const newAlignment = [...alignment]
    newAlignment[index] = align
    setAlignment(newAlignment)
  }

  const generateMarkdown = () => {
    // Create header row
    const headerRow = '| ' + headers.join(' | ') + ' |'
    
    // Create separator row with alignment
    const separatorRow = '| ' + alignment.map(align => {
      switch (align) {
        case 'left': return ':---'
        case 'center': return ':---:'
        case 'right': return '---:'
        default: return '---'
      }
    }).join(' | ') + ' |'
    
    // Create data rows
    const dataRows = rows.map(row => 
      '| ' + row.join(' | ') + ' |'
    )
    
    return [headerRow, separatorRow, ...dataRows].join('\n')
  }

  const handleInsert = () => {
    const markdown = generateMarkdown()
    onInsert(markdown)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      
      if (e.shiftKey) {
        // Move to previous cell
        if (colIndex > 0) {
          inputRefs.current[rowIndex]?.[colIndex - 1]?.focus()
        } else if (rowIndex > 0) {
          inputRefs.current[rowIndex - 1]?.[headers.length - 1]?.focus()
        }
      } else {
        // Move to next cell
        if (colIndex < headers.length - 1) {
          inputRefs.current[rowIndex]?.[colIndex + 1]?.focus()
        } else if (rowIndex < rows.length - 1) {
          inputRefs.current[rowIndex + 1]?.[0]?.focus()
        } else {
          // At last cell, add new row
          addRow()
          setTimeout(() => {
            inputRefs.current[rows.length]?.[0]?.focus()
          }, 0)
        }
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      if (rowIndex < rows.length - 1) {
        inputRefs.current[rowIndex + 1]?.[colIndex]?.focus()
      } else {
        // At last row, add new row
        addRow()
        setTimeout(() => {
          inputRefs.current[rows.length]?.[colIndex]?.focus()
        }, 0)
      }
    }
  }

  return (
    <StandardModal isOpen={isOpen} onClose={onClose} title="Table Editor">
      <div className="space-y-4">
        {/* Preview */}
        <div className="bg-theme-bg-secondary rounded-lg p-4">
          <h3 className="text-sm font-medium text-theme-text-secondary mb-2">Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th 
                      key={i} 
                      className={cn(
                        "border border-theme-border-primary px-4 py-2 text-theme-text-primary",
                        alignment[i] === 'center' && 'text-center',
                        alignment[i] === 'right' && 'text-right'
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td 
                        key={j} 
                        className={cn(
                          "border border-theme-border-primary px-4 py-2 text-theme-text-primary",
                          alignment[j] === 'center' && 'text-center',
                          alignment[j] === 'right' && 'text-right'
                        )}
                      >
                        {cell || '\u00A0'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-theme-text-secondary">Edit Table</h3>
            <div className="flex gap-2">
              <button
                onClick={addColumn}
                className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors"
                title="Add column"
              >
                <Icons.Plus size={16} className="text-theme-text-secondary" />
              </button>
              <button
                onClick={addRow}
                className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors"
                title="Add row"
              >
                <Icons.Plus size={16} className="text-theme-text-secondary" />
              </button>
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="w-10"></div>
              {headers.map((header, i) => (
                <div key={i} className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-full px-2 py-1 bg-theme-bg-tertiary border border-theme-border-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                    placeholder={`Header ${i + 1}`}
                  />
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => updateAlignment(i, 'left')}
                      className={cn(
                        "p-1 rounded transition-colors",
                        alignment[i] === 'left' 
                          ? 'bg-theme-accent-primary text-white' 
                          : 'hover:bg-theme-bg-tertiary text-theme-text-secondary'
                      )}
                      title="Align left"
                    >
                      <Icons.AlignLeft size={14} />
                    </button>
                    <button
                      onClick={() => updateAlignment(i, 'center')}
                      className={cn(
                        "p-1 rounded transition-colors",
                        alignment[i] === 'center' 
                          ? 'bg-theme-accent-primary text-white' 
                          : 'hover:bg-theme-bg-tertiary text-theme-text-secondary'
                      )}
                      title="Align center"
                    >
                      <Icons.AlignCenter size={14} />
                    </button>
                    <button
                      onClick={() => updateAlignment(i, 'right')}
                      className={cn(
                        "p-1 rounded transition-colors",
                        alignment[i] === 'right' 
                          ? 'bg-theme-accent-primary text-white' 
                          : 'hover:bg-theme-bg-tertiary text-theme-text-secondary'
                      )}
                      title="Align right"
                    >
                      <Icons.AlignRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => removeColumn(headers.length - 1)}
                className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors text-theme-text-muted"
                disabled={headers.length <= 1}
                title="Remove column"
              >
                <Icons.X size={16} />
              </button>
            </div>
          </div>

          {/* Data rows */}
          <div className="space-y-2">
            {rows.map((row, rowIndex) => {
              if (!inputRefs.current[rowIndex]) {
                inputRefs.current[rowIndex] = []
              }
              
              return (
                <div key={rowIndex} className="flex gap-2 items-center">
                  <div className="w-10 text-xs text-theme-text-muted text-right">
                    {rowIndex + 1}
                  </div>
                  {row.map((cell, colIndex) => (
                    <input
                      key={colIndex}
                      ref={el => inputRefs.current[rowIndex][colIndex] = el}
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      className="flex-1 px-2 py-1 bg-theme-bg-tertiary border border-theme-border-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                      placeholder={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                    />
                  ))}
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 hover:bg-theme-bg-tertiary rounded transition-colors text-theme-text-muted"
                    disabled={rows.length <= 1}
                    title="Remove row"
                  >
                    <Icons.X size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-theme-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-theme-accent-primary text-white rounded hover:bg-theme-accent-secondary transition-colors"
          >
            Insert Table
          </button>
        </div>
      </div>
    </StandardModal>
  )
}

export default TableEditor