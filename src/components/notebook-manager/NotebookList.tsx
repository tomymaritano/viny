import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '../Icons'
import NotebookItem from './NotebookItem'
import { THEME_CLASSES } from '../../theme/themeConstants'

interface Notebook {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
}

interface NotebookListProps {
  notebooks: Notebook[]
  onEdit: (notebook: Notebook) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

const NotebookList: React.FC<NotebookListProps> = ({
  notebooks,
  onEdit,
  onDelete,
  onCreateNew
}) => {
  if (notebooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className={`w-16 h-16 rounded-full ${THEME_CLASSES.BG.TERTIARY} flex items-center justify-center mb-4`}>
          <Icons.Folder size={32} className={THEME_CLASSES.TEXT.MUTED} />
        </div>
        
        <h3 className={`text-lg font-medium ${THEME_CLASSES.TEXT.SECONDARY} mb-2`}>
          No notebooks yet
        </h3>
        
        <p className={`text-sm ${THEME_CLASSES.TEXT.MUTED} text-center mb-6 max-w-sm`}>
          Create your first notebook to organize your notes into collections.
        </p>
        
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Icons.Plus size={16} />
          <span>Create Notebook</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${THEME_CLASSES.TEXT.PRIMARY}`}>
          Notebooks ({notebooks.length})
        </h3>
        
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Icons.Plus size={14} />
          <span>New</span>
        </button>
      </div>

      {/* Notebooks grid */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {notebooks.map((notebook, index) => (
            <NotebookItem
              key={notebook.id}
              notebook={notebook}
              onEdit={onEdit}
              onDelete={onDelete}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {notebooks.length > 0 && (
        <div className={`text-xs ${THEME_CLASSES.TEXT.MUTED} text-center pt-4 border-t ${THEME_CLASSES.BORDER.PRIMARY}`}>
          {notebooks.length === 1 ? '1 notebook' : `${notebooks.length} notebooks`} total
        </div>
      )}
    </div>
  )
}

export default NotebookList