import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useSimpleStore } from '../stores/simpleStore'

interface Template {
  id: string
  name: string
  description: string
  category: string
  content?: string
}

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  const { templates, createNoteFromTemplate, addToast } = useSimpleStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isCreating, setIsCreating] = useState<boolean>(false)

  // Memoize categories to prevent unnecessary recalculation
  const categories = useMemo(
    () => ['All', ...new Set(templates.map(t => t.category))],
    [templates]
  )

  // Memoize filtered templates for performance
  const filteredTemplates = useMemo(
    () =>
      selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory),
    [templates, selectedCategory]
  )

  const handleCreateFromTemplate = useCallback(
    async (templateId: string) => {
      // Input validation
      if (!templateId || typeof templateId !== 'string') {
        addToast({
          type: 'error',
          message: 'Invalid template selected',
          duration: 3000,
        })
        return
      }

      // Check if template exists
      const template = templates.find(t => t.id === templateId)
      if (!template) {
        addToast({
          type: 'error',
          message: 'Template not found',
          duration: 3000,
        })
        return
      }

      setIsCreating(true)

      try {
        const result = createNoteFromTemplate(templateId)

        if (!result) {
          throw new Error('Failed to create note from template')
        }

        onClose()
        addToast({
          type: 'success',
          message: `Note created from "${template.name}" template`,
          duration: 3000,
        })
      } catch (error) {
        console.error('Template creation error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note from template'
        addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        })
      } finally {
        setIsCreating(false)
      }
    },
    [templates, createNoteFromTemplate, onClose, addToast]
  )

  const getTemplateIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'Personal':
        return <Icons.User size={20} className="text-blue-500" />
      case 'Work':
        return <Icons.Briefcase size={20} className="text-green-500" />
      case 'Projects':
        return <Icons.FolderOpen size={20} className="text-purple-500" />
      default:
        return <Icons.FileText size={20} className="text-gray-500" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-theme-bg-secondary rounded-xl shadow-2xl border border-theme-border-primary max-w-2xl w-full max-h-[80vh] overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border-primary">
            <div className="flex items-center space-x-3">
              <Icons.FileTemplate
                size={24}
                className="text-theme-accent-primary"
              />
              <div>
                <h2 className="text-xl font-semibold text-theme-text-primary">
                  Choose Template
                </h2>
                <p className="text-sm text-theme-text-secondary">
                  Start with a pre-designed note template
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-theme-bg-tertiary text-theme-text-secondary transition-colors"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="p-6 border-b border-theme-border-primary">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-theme-accent-primary text-white'
                      : 'bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-quaternary'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="p-6 overflow-y-auto max-h-96">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <Icons.FileText
                  size={48}
                  className="mx-auto text-theme-text-muted opacity-50 mb-4"
                />
                <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
                  No templates found
                </h3>
                <p className="text-sm text-theme-text-muted">
                  No templates match the selected category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    className={`group bg-theme-bg-tertiary rounded-lg p-4 border border-theme-border-primary hover:border-theme-accent-primary transition-all duration-200 ${
                      isCreating
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    }`}
                    whileHover={!isCreating ? { scale: 1.02 } : {}}
                    whileTap={!isCreating ? { scale: 0.98 } : {}}
                    onClick={() =>
                      !isCreating && handleCreateFromTemplate(template.id)
                    }
                  >
                    <div className="flex items-start space-x-3">
                      {getTemplateIcon(template.category)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-theme-text-primary group-hover:text-theme-accent-primary transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs px-2 py-1 bg-theme-bg-quaternary text-theme-text-muted rounded">
                            {template.category}
                          </span>
                          <Icons.ArrowRight
                            size={16}
                            className="text-theme-text-muted group-hover:text-theme-accent-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-theme-border-primary bg-theme-bg-tertiary">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-theme-text-muted">
                {filteredTemplates.length} template
                {filteredTemplates.length !== 1 ? 's' : ''} available
              </div>
              {isCreating && (
                <div className="flex items-center space-x-2 text-sm text-theme-accent-primary">
                  <div className="w-4 h-4 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
                  <span>Creating note...</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isCreating
                  ? 'text-theme-text-muted cursor-not-allowed'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TemplateModal