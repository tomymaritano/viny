import React from 'react'
import Icons from '../Icons'

interface NotebookSelectorProps {
  notebook?: { name: string } | string
  onShowModal: () => void
}

const NotebookSelector: React.FC<NotebookSelectorProps> = ({
  notebook,
  onShowModal
}) => {
  const notebookName = notebook?.name || notebook || 'None'

  return (
    <div className="relative">
      <button
        onClick={onShowModal}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-theme-bg-tertiary/50 text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors border-none"
        title={`Notebook: ${notebookName}`}
      >
        <Icons.Book size={10} className="text-theme-accent-primary" />
        <span className="max-w-16 truncate font-medium">
          {notebookName}
        </span>
        <Icons.ChevronDown size={12} />
      </button>
    </div>
  )
}

export default NotebookSelector