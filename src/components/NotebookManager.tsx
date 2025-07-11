import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useNotebooks } from '../hooks/useNotebooks'

interface Notebook {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
}

interface NotebookManagerProps {
  isVisible: boolean
  onClose: () => void
  onNotebookChange?: (notebook: Notebook) => void
}

interface FormData {
  name: string
  description: string
  color: string
}

interface NotebookFormProps {
  isEdit?: boolean
}

interface NotebookItemProps {
  notebook: Notebook
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ isVisible, onClose, onNotebookChange }) => {
  const {
    notebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    getAvailableColors,
    getColorClass,
  } = useNotebooks()

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: 'blue',
  })

  const handleCreateNotebook = (): void => {
    if (!formData.name.trim()) return

    const newNotebook = createNotebook(formData)
    setFormData({ name: '', description: '', color: 'blue' })
    setShowCreateForm(false)
    onNotebookChange?.(newNotebook)
  }

  const handleUpdateNotebook = (): void => {
    if (!formData.name.trim() || !editingNotebook) return

    updateNotebook(editingNotebook.id, formData)
    setEditingNotebook(null)
    setFormData({ name: '', description: '', color: 'blue' })
  }

  const handleDeleteNotebook = (notebook: Notebook): void => {
    if (
      window.confirm(
        `Are you sure you want to delete "${notebook.name}"? This action cannot be undone.`
      )
    ) {
      const success = deleteNotebook(notebook.id)
      if (!success) {
        alert(
          'Cannot delete the last notebook. You must have at least one notebook.'
        )
      }
    }
  }

  const startEdit = (notebook: Notebook): void => {
    setEditingNotebook(notebook)
    setFormData({
      name: notebook.name,
      description: notebook.description || '',
      color: notebook.color,
    })
    setShowCreateForm(false)
  }

  const cancelEdit = (): void => {
    setEditingNotebook(null)
    setShowCreateForm(false)
    setFormData({ name: '', description: '', color: 'blue' })
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const NotebookForm: React.FC<NotebookFormProps> = ({ isEdit = false }) => (
    <motion.div
      className="bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg p-4 mb-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Notebook Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="Enter notebook name..."
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Brief description of this notebook..."
            rows={2}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {getAvailableColors().map(color => (
              <button
                key={color.value}
                onClick={() => handleInputChange('color', color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-colors ${
                  formData.color === color.value
                    ? 'border-theme-text-primary'
                    : 'border-theme-border-primary hover:border-theme-text-tertiary'
                } ${color.class.replace('text-', 'bg-')}`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={isEdit ? handleUpdateNotebook : handleCreateNotebook}
            disabled={!formData.name.trim()}
            className="px-4 py-2 text-theme-text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            style={{
              backgroundColor: 'var(--color-active-bg)',
              color: 'var(--color-active-text)',
            }}
          >
            {isEdit ? 'Update Notebook' : 'Create Notebook'}
          </button>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-theme-text-tertiary border border-theme-border-primary rounded transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )

  const NotebookItem: React.FC<NotebookItemProps> = ({ notebook }) => (
    <motion.div
      key={notebook.id}
      className="bg-theme-bg-secondary border border-theme-border-primary rounded-lg p-4 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className={`w-3 h-3 rounded-full ${getColorClass(notebook.color).replace('text-', 'bg-')}`}
            />
            <h3 className="font-medium text-theme-text-secondary">
              {notebook.name}
            </h3>
          </div>
          {notebook.description && (
            <p className="text-sm text-theme-text-tertiary mb-2">
              {notebook.description}
            </p>
          )}
          <p className="text-xs text-theme-text-muted">
            Created {new Date(notebook.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => startEdit(notebook)}
            className="p-1 text-theme-text-tertiary hover:text-theme-text-secondary rounded transition-colors"
            title="Edit notebook"
          >
            <Icons.Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteNotebook(notebook)}
            className="p-1 text-theme-text-tertiary hover:text-theme-accent-red rounded transition-colors"
            title="Delete notebook"
          >
            <Icons.Trash size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-border-primary">
              <div>
                <h2 className="text-xl font-semibold text-theme-text-primary">
                  Manage Notebooks
                </h2>
                <p className="text-sm text-theme-text-tertiary mt-1">
                  Create, edit, and organize your notebooks
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-theme-text-tertiary hover:text-theme-text-secondary rounded transition-colors"
              >
                <Icons.X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Create Button */}
              {!showCreateForm && !editingNotebook && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mb-6 p-4 border-2 border-dashed border-theme-border-primary rounded-lg text-theme-text-tertiary hover:border-theme-accent-primary hover:text-theme-accent-primary transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icons.Plus size={20} />
                    <span>Create New Notebook</span>
                  </div>
                </button>
              )}

              {/* Create/Edit Form */}
              <AnimatePresence>
                {(showCreateForm || editingNotebook) && (
                  <NotebookForm isEdit={!!editingNotebook} />
                )}
              </AnimatePresence>

              {/* Notebooks List */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-theme-text-secondary mb-3">
                  Your Notebooks ({notebooks.length})
                </h3>
                <AnimatePresence>
                  {notebooks.map(notebook => (
                    <NotebookItem key={notebook.id} notebook={notebook} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotebookManager