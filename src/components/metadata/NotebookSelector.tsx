import React, { useState } from 'react'
import { Icons } from '../Icons'
import NotebookSelectorModal from './NotebookSelectorModal'
import { cn } from '../../lib/utils'

interface NotebookOption {
  value: string
  label: string
  level?: number
  color?: string
}

interface NotebookSelectorProps {
  notebook?: { name: string } | string
  notebooks: NotebookOption[]
  onNotebookChange: (notebook: string) => void
  disabled?: boolean
  className?: string
}

const NotebookSelector: React.FC<NotebookSelectorProps> = ({
  notebook,
  notebooks,
  onNotebookChange,
  disabled = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get current notebook display value
  const currentNotebook = notebook?.name || notebook || ''
  const displayValue = currentNotebook || 'None'

  // Find the current notebook option to get its color
  const currentNotebookOption = notebooks.find(
    nb => nb.value === currentNotebook || nb.label === currentNotebook
  )

  // Get notebook color
  const getNotebookColor = (option?: NotebookOption) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      yellow: '#eab308',
      red: '#ef4444',
      purple: '#a855f7',
      cyan: '#06b6d4',
    }

    return colorMap[option?.color || 'blue'] || '#3b82f6'
  }

  const handleSelect = (notebookValue: string) => {
    console.log('📚 NotebookSelector handleSelect called:', {
      oldNotebook: currentNotebook,
      newNotebook: notebookValue,
      onNotebookChange: typeof onNotebookChange,
      willCallWith: notebookValue
    })
    
    // Call the change handler with the notebook value
    onNotebookChange(notebookValue)
    
    console.log('📚 NotebookSelector handleSelect completed')
  }

  const handleClick = () => {
    if (!disabled) {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      {/* Compact selector button */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-xs bg-theme-bg-tertiary/50 text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors border-none h-auto min-h-[24px] w-auto min-w-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        title={
          currentNotebook ? `Category: ${currentNotebook}` : 'Select category'
        }
      >
        {/* Color indicator */}
        {currentNotebookOption && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: getNotebookColor(currentNotebookOption) }}
          />
        )}

        {/* Book icon */}
        <Icons.Book
          size={10}
          className="text-theme-accent-primary flex-shrink-0"
        />

        {/* Notebook name */}
        <span className="truncate text-theme-text-primary font-medium min-w-0">
          {currentNotebook || 'None'}
        </span>

        {/* Dropdown indicator */}
        <Icons.ChevronDown
          size={10}
          className="text-theme-text-muted flex-shrink-0 ml-auto"
        />
      </button>

      {/* Modal for selection */}
      <NotebookSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedNotebook={currentNotebook}
        notebooks={notebooks}
        onSelect={handleSelect}
        disabled={disabled}
      />
    </>
  )
}

export default NotebookSelector
