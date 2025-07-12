import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useNotebooks } from '../hooks/useNotebooks'
import { THEME_CLASSES } from '../theme/themeConstants'

// Modular components
import NotebookForm from './notebook-manager/NotebookForm'
import NotebookList from './notebook-manager/NotebookList'

interface Notebook {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
}

interface NotebookManagerRefactoredProps {
  isVisible: boolean
  onClose: () => void
  onNotebookChange?: (notebook: Notebook) => void
}

interface FormData {
  name: string
  description: string
  color: string
}

const NotebookManagerRefactored: React.FC<NotebookManagerRefactoredProps> = ({ 
  isVisible, 
  onClose, 
  onNotebookChange 
}) => {
  const {
    notebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  } = useNotebooks()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null)

  // Form handlers
  const handleCreateSubmit = async (formData: FormData) => {
    try {
      const newNotebook = createNotebook({
        name: formData.name,
        description: formData.description,
        color: formData.color
      })
      
      if (newNotebook && onNotebookChange) {
        onNotebookChange(newNotebook)
      }
      
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating notebook:', error)
    }
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingNotebook) return

    try {
      const updatedNotebook = updateNotebook(editingNotebook.id, {
        name: formData.name,
        description: formData.description,
        color: formData.color
      })
      
      if (updatedNotebook && onNotebookChange) {
        onNotebookChange(updatedNotebook)
      }
      
      setEditingNotebook(null)
    } catch (error) {
      console.error('Error updating notebook:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      deleteNotebook(id)
    } catch (error) {
      console.error('Error deleting notebook:', error)
    }
  }

  const handleEdit = (notebook: Notebook) => {
    setEditingNotebook(notebook)
    setShowCreateForm(false)
  }

  const handleCreateNew = () => {
    setShowCreateForm(true)
    setEditingNotebook(null)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingNotebook(null)
  }

  const isFormVisible = showCreateForm || editingNotebook !== null

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl max-h-[90vh] ${THEME_CLASSES.BG.PRIMARY} rounded-lg shadow-xl overflow-hidden`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${THEME_CLASSES.BORDER.PRIMARY} flex items-center justify-between`}>
          <div>
            <h2 className={`text-xl font-semibold ${THEME_CLASSES.TEXT.PRIMARY}`}>
              Notebook Manager
            </h2>
            <p className={`text-sm ${THEME_CLASSES.TEXT.SECONDARY} mt-1`}>
              Organize your notes into collections
            </p>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:${THEME_CLASSES.BG.TERTIARY} transition-colors`}
          >
            <Icons.X size={20} className={THEME_CLASSES.TEXT.MUTED} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-5rem)]">
          {/* Form Section */}
          <div className={`w-1/2 p-6 border-r ${THEME_CLASSES.BORDER.PRIMARY} overflow-y-auto`}>
            <AnimatePresence mode="wait">
              {isFormVisible ? (
                <NotebookForm
                  key={editingNotebook ? 'edit' : 'create'}
                  isEdit={!!editingNotebook}
                  notebook={editingNotebook}
                  onSubmit={editingNotebook ? handleEditSubmit : handleCreateSubmit}
                  onCancel={handleCancel}
                  isVisible={true}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <div className={`w-20 h-20 rounded-full ${THEME_CLASSES.BG.TERTIARY} flex items-center justify-center mb-6`}>
                    <Icons.FolderPlus size={40} className={THEME_CLASSES.TEXT.MUTED} />
                  </div>
                  
                  <h3 className={`text-lg font-medium ${THEME_CLASSES.TEXT.SECONDARY} mb-2`}>
                    Manage Notebooks
                  </h3>
                  
                  <p className={`text-sm ${THEME_CLASSES.TEXT.MUTED} text-center mb-6`}>
                    Create new notebooks or edit existing ones to organize your notes.
                  </p>
                  
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icons.Plus size={16} />
                    <span>Create Notebook</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Section */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <NotebookList
              notebooks={notebooks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default NotebookManagerRefactored