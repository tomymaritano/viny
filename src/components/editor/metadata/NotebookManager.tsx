import React from 'react'
import { Icons } from '../../Icons'
import BaseModal from '../../ui/BaseModal'
import { useNotebookManager } from '../../../hooks/useNotebookManager'

interface NotebookManagerProps {
  note: any
  onNotebookChange: (notebookId: string) => void
  isPreviewMode?: boolean
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ 
  note, 
  onNotebookChange, 
  isPreviewMode = false 
}) => {
  const {
    showNotebookModal,
    notebookSearchInput,
    filteredNotebooks,
    currentNotebook,
    setShowNotebookModal,
    setNotebookSearchInput,
    handleNotebookSelect,
    handleNotebookModalClose,
  } = useNotebookManager(note, onNotebookChange)

  if (isPreviewMode) {
    return (
      <div className="flex items-center space-x-2 text-sm text-theme-text-secondary">
        <Icons.Book size={14} />
        <span>{currentNotebook?.label || 'No notebook'}</span>
      </div>
    )
  }

  return (
    <>
      {/* Notebook Selector Button */}
      <button
        onClick={() => setShowNotebookModal(true)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Icons.Book size={14} />
          <span>{currentNotebook?.label || 'Select notebook'}</span>
        </div>
        <Icons.ChevronDown size={14} />
      </button>

      {/* Notebook Selection Modal */}
      <BaseModal
        isOpen={showNotebookModal}
        onClose={handleNotebookModalClose}
        title="Select Notebook"
        size="md"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Icons.Search 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted" 
            />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={notebookSearchInput}
              onChange={(e) => setNotebookSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Notebook List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredNotebooks.length > 0 ? (
              filteredNotebooks.map((notebook) => (
                <button
                  key={notebook.value}
                  onClick={() => handleNotebookSelect(notebook.value)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left rounded-md transition-colors ${
                    note?.notebookId === notebook.value
                      ? 'bg-theme-accent-primary text-white'
                      : 'hover:bg-theme-bg-tertiary text-theme-text-primary'
                  }`}
                >
                  <Icons.Book size={16} />
                  <span>{notebook.label}</span>
                  {note?.notebookId === notebook.value && (
                    <Icons.Check size={16} className="ml-auto" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-theme-text-muted text-center">
                No notebooks found
              </div>
            )}
          </div>
        </div>
      </BaseModal>
    </>
  )
}

export default NotebookManager