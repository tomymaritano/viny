import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Icons from '../Icons'
import { useNotebooks } from '../../hooks/useNotebooks'
import { THEME_CLASSES } from '../../theme/themeConstants'

interface Notebook {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
}

interface NotebookItemProps {
  notebook: Notebook
  onEdit: (notebook: Notebook) => void
  onDelete: (id: string) => void
  index: number
}

const NotebookItem: React.FC<NotebookItemProps> = ({
  notebook,
  onEdit,
  onDelete,
  index
}) => {
  const { getColorClass } = useNotebooks()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete(notebook.id)
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group p-4 border rounded-lg ${THEME_CLASSES.BORDER.PRIMARY} hover:${THEME_CLASSES.BG.TERTIARY} transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        {/* Notebook info */}
        <div className="flex items-start space-x-3 flex-1">
          {/* Color indicator */}
          <div 
            className={`w-4 h-4 rounded-full ${getColorClass(notebook.color)} flex-shrink-0 mt-1`}
          />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${THEME_CLASSES.TEXT.PRIMARY} truncate`}>
              {notebook.name}
            </h4>
            
            {notebook.description && (
              <p className={`text-sm ${THEME_CLASSES.TEXT.SECONDARY} mt-1 line-clamp-2`}>
                {notebook.description}
              </p>
            )}
            
            <p className={`text-xs ${THEME_CLASSES.TEXT.MUTED} mt-2`}>
              Created {formatDate(notebook.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(notebook)}
            className={`p-1.5 rounded hover:${THEME_CLASSES.BG.SECONDARY} transition-colors`}
            title="Edit notebook"
          >
            <Icons.Edit size={16} className={THEME_CLASSES.TEXT.MUTED} />
          </button>
          
          <button
            onClick={handleDeleteClick}
            className={`p-1.5 rounded hover:bg-red-100 transition-colors`}
            title="Delete notebook"
          >
            <Icons.Trash size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center"
        >
          <div className={`${THEME_CLASSES.BG.PRIMARY} p-4 rounded-lg border ${THEME_CLASSES.BORDER.PRIMARY} shadow-lg`}>
            <p className={`text-sm ${THEME_CLASSES.TEXT.PRIMARY} mb-3`}>
              Delete "{notebook.name}"?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className={`px-3 py-1.5 text-xs font-medium ${THEME_CLASSES.TEXT.SECONDARY} hover:${THEME_CLASSES.TEXT.PRIMARY} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default NotebookItem