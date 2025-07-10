import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useNotebooks } from '../hooks/useNotebooks'

const NotebookManager = ({ isVisible, onClose, onNotebookChange }) => {
  const {
    notebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    getAvailableColors,
    getColorClass,
  } = useNotebooks()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotebook, setEditingNotebook] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
  })

  // Remove early return to allow AnimatePresence to handle exit animations

  const handleCreateNotebook = () => {
    if (!formData.name.trim()) return

    const newNotebook = createNotebook(formData)
    setFormData({ name: '', description: '', color: 'blue' })
    setShowCreateForm(false)
    onNotebookChange?.(newNotebook)
  }

  const handleUpdateNotebook = () => {
    if (!formData.name.trim() || !editingNotebook) return

    updateNotebook(editingNotebook.id, formData)
    setEditingNotebook(null)
    setFormData({ name: '', description: '', color: 'blue' })
  }

  const handleDeleteNotebook = notebook => {
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

  const startEdit = notebook => {
    setEditingNotebook(notebook)
    setFormData({
      name: notebook.name,
      description: notebook.description,
      color: notebook.color,
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingNotebook(null)
    setShowCreateForm(false)
    setFormData({ name: '', description: '', color: 'blue' })
  }

  const NotebookForm = ({ isEdit = false }) => (
    <motion.div
      className="theme-bg-tertiary border border-theme-border-secondary rounded-lg p-4 mb-4"
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
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter notebook name..."
            className="w-full px-3 py-2 theme-bg-secondary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of this notebook..."
            rows={2}
            className="w-full px-3 py-2 theme-bg-secondary border border-theme-border-primary rounded text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none resize-none"
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
                onClick={() =>
                  setFormData(prev => ({ ...prev, color: color.value }))
                }
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
            onMouseEnter={e => {
              if (!formData.name.trim()) return
              e.target.style.backgroundColor = 'var(--color-active-bg)'
              e.target.style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              if (!formData.name.trim()) return
              e.target.style.backgroundColor = 'var(--color-active-bg)'
              e.target.style.opacity = '1'
            }}
          >
            {isEdit ? 'Update Notebook' : 'Create Notebook'}
          </button>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-theme-text-tertiary border border-theme-border-primary rounded transition-colors text-sm"
            onMouseEnter={e => {
              e.target.style.backgroundColor = 'var(--color-hover-bg)'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )

  const NotebookItem = ({ notebook }) => (
    <motion.div
      key={notebook.id}
      className="theme-bg-secondary border border-theme-border-primary rounded-lg p-4 transition-colors"
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'var(--color-base02)'
      }}
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
            onMouseEnter={e => {
              e.target.style.backgroundColor = 'var(--color-hover-bg)'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent'
            }}
            title="Edit notebook"
          >
            <Icons.Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteNotebook(notebook)}
            className="p-1 text-theme-text-tertiary hover:text-theme-accent-red rounded transition-colors"
            onMouseEnter={e => {
              e.target.style.backgroundColor = 'var(--color-hover-bg)'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent'
            }}
            title="Delete notebook"
          >
            <Icons.Trash size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )

  NotebookForm.propTypes = {
    isEdit: PropTypes.bool,
  }

  NotebookItem.propTypes = {
    notebook: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      color: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }

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
            className="theme-bg-primary border border-theme-border-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
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
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'var(--color-hover-bg)'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent'
                }}
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

NotebookManager.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNotebookChange: PropTypes.func,
}

NotebookManager.defaultProps = {
  onNotebookChange: null,
}

export default NotebookManager
