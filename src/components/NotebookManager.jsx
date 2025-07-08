import { useState } from 'react'
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
      className="bg-solarized-base01 border border-solarized-base00 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-solarized-base3 mb-2">
            Notebook Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter notebook name..."
            className="w-full px-3 py-2 bg-solarized-base02 border border-solarized-base01 rounded text-solarized-base3 focus:border-solarized-blue focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-solarized-base3 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of this notebook..."
            rows={2}
            className="w-full px-3 py-2 bg-solarized-base02 border border-solarized-base01 rounded text-solarized-base3 focus:border-solarized-blue focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-solarized-base3 mb-2">
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
                    ? 'border-solarized-base5'
                    : 'border-solarized-base01 hover:border-solarized-base1'
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
            className="px-4 py-2 bg-solarized-blue text-solarized-base5 rounded hover:bg-solarized-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isEdit ? 'Update Notebook' : 'Create Notebook'}
          </button>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 text-solarized-base1 border border-solarized-base01 rounded hover:bg-solarized-base01 transition-colors text-sm"
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
      className="bg-solarized-base02 border border-solarized-base01 rounded-lg p-4 hover:bg-solarized-base01 transition-colors"
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
            <h3 className="font-medium text-solarized-base4">
              {notebook.name}
            </h3>
          </div>
          {notebook.description && (
            <p className="text-sm text-solarized-base1 mb-2">
              {notebook.description}
            </p>
          )}
          <p className="text-xs text-solarized-base0">
            Created {new Date(notebook.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => startEdit(notebook)}
            className="p-1 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01 rounded transition-colors"
            title="Edit notebook"
          >
            <Icons.Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteNotebook(notebook)}
            className="p-1 text-solarized-base1 hover:text-solarized-red hover:bg-solarized-base01 rounded transition-colors"
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
            className="bg-solarized-base03 border border-solarized-base01 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-solarized-base01">
              <div>
                <h2 className="text-xl font-semibold text-solarized-base5">
                  Manage Notebooks
                </h2>
                <p className="text-sm text-solarized-base1 mt-1">
                  Create, edit, and organize your notebooks
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
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Create Button */}
              {!showCreateForm && !editingNotebook && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mb-6 p-4 border-2 border-dashed border-solarized-base01 rounded-lg text-solarized-base1 hover:border-solarized-blue hover:text-solarized-blue transition-colors"
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
                <h3 className="text-sm font-medium text-solarized-base3 mb-3">
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
