/**
 * Notebook selector dropdown component
 */
import React from 'react'
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'

interface Notebook {
  id: string
  name: string
}

interface NotebookSelectorProps {
  notebooks: Notebook[]
  selectedNotebook?: string | { name: string }
  isOpen: boolean
  onToggle: () => void
  onSelect: (notebookId: string) => void
  className?: string
}

const NotebookSelector: React.FC<NotebookSelectorProps> = ({
  notebooks,
  selectedNotebook,
  isOpen,
  onToggle,
  onSelect,
  className = ''
}) => {
  // Prepare notebook options
  const notebookOptions = notebooks.map(notebook => {
    const notebookName = typeof notebook === 'string' ? notebook : notebook.name || notebook.id
    const notebookId = typeof notebook === 'string' ? notebook : notebook.id || notebook.name
    return {
      value: notebookId,
      label: notebookName,
      icon: 'Book'
    }
  })

  // Get current notebook display name
  const getCurrentNotebookName = () => {
    if (typeof selectedNotebook === 'object' && selectedNotebook?.name) {
      return selectedNotebook.name
    }
    if (typeof selectedNotebook === 'string') {
      return selectedNotebook
    }
    return 'Notebook'
  }

  return (
    <div className={`relative dropdown-container min-w-24 ${className}`}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-transparent text-theme-text-muted rounded-xl hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary"
      >
        <Icons.Book size={12} />
        <span className="max-w-20 truncate">
          {getCurrentNotebookName()}
        </span>
        <Icons.ChevronDown size={10} />
      </button>
      
      <DropdownMenu
        isOpen={isOpen}
        width="w-48"
      >
        {notebookOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            icon={<Icons.Book size={12} />}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </div>
  )
}

export default NotebookSelector