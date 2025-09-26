import React, { useState } from 'react'
import { Icons } from '../Icons'
import { StandardModal } from './StandardModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './SelectRadix'
import type { Notebook } from '../../types/notebook'
import { NOTEBOOK_COLORS } from '../../types/notebook'
import { notebookLogger } from '../../utils/logger'

interface CreateNotebookModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, color: string, parentId?: string | null) => void
  existingNames: string[]
  availableParents?: Notebook[]
  maxLevel?: number
  defaultParentId?: string | null
}

const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  existingNames,
  availableParents = [],
  maxLevel = 3,
  defaultParentId = null,
}) => {
  const [notebookName, setNotebookName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedParent, setSelectedParent] = useState<string | null>(
    defaultParentId
  )
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Update selectedParent when modal opens with a new defaultParentId
  React.useEffect(() => {
    if (isOpen) {
      setSelectedParent(defaultParentId)
    }
  }, [isOpen, defaultParentId])

  // Allow all categories as potential parents (with reasonable depth limit)
  const validParents = availableParents.filter(
    parent => (parent.level || 0) < 4 // Allow nesting up to 4 levels deep
  )

  const handleSubmit = async () => {
    if (isCreating) return // Prevent multiple submissions

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
      setError(
        'Category name can only contain letters, numbers, spaces, hyphens, and underscores'
      )
      return
    }

    // Note: Duplicate validation now handled at repository level
    // Frontend validation removed to avoid race conditions

    // Validate reserved names
    const reservedNames = [
      'all',
      'pinned',
      'trash',
      'archived',
      'completed',
      'draft',
      'in-progress',
      'review',
    ]
    if (
      reservedNames.some(
        reserved => reserved.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError('This is a reserved name. Please choose a different name')
      return
    }

    setIsCreating(true)
    try {
      await onCreate(trimmedName, selectedColor, selectedParent)
      handleClose()
    } catch (error) {
      notebookLogger.error('Failed to create category:', error)
      setError('Failed to create category. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setNotebookName('')
    setSelectedColor('blue')
    setSelectedParent(null)
    setError('')
    setIsCreating(false)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Category"
      size="md"
      closeOnEscape={true}
      closeOnBackdrop={true}
      data-testid="create-notebook-modal"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!!error || !notebookName.trim() || isCreating}
            className="px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isCreating ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-4" onKeyDown={handleKeyDown}>
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Category name
          </label>
          <input
            type="text"
            value={notebookName}
            onChange={e => {
              const value = e.target.value
              setNotebookName(value)

              // Clear error when user starts typing
              if (error) {
                setError('')
              }

              // Real-time validation for better UX (excluding duplicates - handled at repository level)
              const trimmed = value.trim()
              if (trimmed && trimmed.length > 50) {
                setError('Category name must be less than 50 characters')
              } else if (trimmed && !/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
                setError(
                  'Only letters, numbers, spaces, hyphens, and underscores allowed'
                )
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
            <Select
              value={selectedParent || '__root__'}
              onValueChange={value =>
                setSelectedParent(value === '__root__' ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Root Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__root__">Root Level</SelectItem>
                {validParents.map(parent => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {'  '.repeat(parent.level || 0)}
                    {parent.name}
                    {parent.level ? ` (Level ${parent.level + 1})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-theme-text-muted">
              Select any category as parent, or leave as root level
            </p>
          </div>
        )}

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-3">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {NOTEBOOK_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-theme-text-primary scale-110'
                    : 'border-theme-border-primary hover:scale-105'
                }`}
                style={{
                  backgroundColor:
                    color.value === 'blue'
                      ? '#3b82f6'
                      : color.value === 'green'
                        ? '#10b981'
                        : color.value === 'orange'
                          ? '#f97316'
                          : color.value === 'yellow'
                            ? '#eab308'
                            : color.value === 'red'
                              ? '#ef4444'
                              : color.value === 'purple'
                                ? '#a855f7'
                                : '#06b6d4',
                }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </div>
    </StandardModal>
  )
}

export default CreateNotebookModal
