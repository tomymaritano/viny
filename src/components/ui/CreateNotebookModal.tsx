import React, { useState } from 'react'
import Icons from '../Icons'
import BaseModal from './BaseModal'
import { Notebook, NOTEBOOK_COLORS } from '../../types/notebook'

interface CreateNotebookModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, color: string, parentId?: string | null) => void
  existingNames: string[]
  availableParents?: Notebook[]
  maxLevel?: number
}

const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  existingNames,
  availableParents = [],
  maxLevel = 3
}) => {
  const [notebookName, setNotebookName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedParent, setSelectedParent] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Filter parents that haven't reached max level
  const validParents = availableParents.filter(parent => parent.level < maxLevel)

  const handleSubmit = () => {
    const trimmedName = notebookName.trim()
    
    // Validate empty name
    if (!trimmedName) {
      setError('Category name is required')
      return
    }
    
    // Validate minimum length
    if (trimmedName.length < 2) {
      setError('Category name must be at least 2 characters')
      return
    }
    
    // Validate maximum length
    if (trimmedName.length > 50) {
      setError('Category name must be less than 50 characters')
      return
    }
    
    // Validate special characters (allow only letters, numbers, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
      setError('Category name can only contain letters, numbers, spaces, hyphens, and underscores')
      return
    }
    
    // Validate duplicate names (case insensitive)
    if (existingNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A category with this name already exists')
      return
    }
    
    // Validate reserved names
    const reservedNames = ['all', 'pinned', 'trash', 'archived', 'completed', 'draft', 'in-progress', 'review']
    if (reservedNames.some(reserved => reserved.toLowerCase() === trimmedName.toLowerCase())) {
      setError('This is a reserved name. Please choose a different name')
      return
    }
    
    onCreate(trimmedName, selectedColor, selectedParent)
    handleClose()
  }

  const handleClose = () => {
    setNotebookName('')
    setSelectedColor('blue')
    setSelectedParent(null)
    setError('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${ANIMATIONS.FADE_IN}`}
      onClick={handleClose}
    >
      <div
        className={`border border-theme-border-primary rounded-lg shadow-xl w-full max-w-md mx-4 ${ANIMATIONS.ZOOM_IN}`}
        style={{ backgroundColor: THEME_COLORS.MODAL_BG }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            New Category
          </h3>
          <IconButton
            icon={Icons.X}
            onClick={handleClose}
            title="Close"
            size={16}
            variant="default"
            aria-label="Close create category modal"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Category name
            </label>
            <input
              type="text"
              value={notebookName}
              onChange={(e) => {
                const value = e.target.value
                setNotebookName(value)
                
                // Clear error when user starts typing
                if (error) {
                  setError('')
                }
                
                // Real-time validation for better UX
                const trimmed = value.trim()
                if (trimmed && existingNames.some(name => name.toLowerCase() === trimmed.toLowerCase())) {
                  setError('A category with this name already exists')
                } else if (trimmed && trimmed.length > 50) {
                  setError('Category name must be less than 50 characters')
                } else if (trimmed && !/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
                  setError('Only letters, numbers, spaces, hyphens, and underscores allowed')
                }
              }}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              placeholder="Enter category name..."
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-theme-accent-red">{error}</p>
            )}
          </div>

          {/* Parent Category Selection */}
          {validParents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Parent Category (optional)
              </label>
              <select
                value={selectedParent || ''}
                onChange={(e) => setSelectedParent(e.target.value || null)}
                className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              >
                <option value="">Root Level</option>
                {validParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {'  '.repeat(parent.level)}{parent.name} (Level {parent.level + 1})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-theme-text-muted">
                Maximum nesting level: {maxLevel}
              </p>
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTEBOOK_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-theme-text-primary scale-110'
                      : 'border-theme-border-primary hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value === 'blue' ? '#3b82f6' : 
                          color.value === 'green' ? '#10b981' :
                          color.value === 'orange' ? '#f97316' :
                          color.value === 'yellow' ? '#eab308' :
                          color.value === 'red' ? '#ef4444' :
                          color.value === 'purple' ? '#a855f7' : '#06b6d4' }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-theme-border-primary">
          <button
            onClick={handleClose}
            className="px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 transition-colors"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateNotebookModal
