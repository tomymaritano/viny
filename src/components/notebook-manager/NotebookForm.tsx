import React, { useState, useEffect } from 'react'
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

interface FormData {
  name: string
  description: string
  color: string
}

interface NotebookFormProps {
  isEdit?: boolean
  notebook?: Notebook | null
  onSubmit: (data: FormData) => void
  onCancel: () => void
  isVisible: boolean
}

const NotebookForm: React.FC<NotebookFormProps> = ({
  isEdit = false,
  notebook,
  onSubmit,
  onCancel,
  isVisible
}) => {
  const { getAvailableColors, getColorClass } = useNotebooks()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: 'blue'
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Initialize form when notebook changes
  useEffect(() => {
    if (isEdit && notebook) {
      setFormData({
        name: notebook.name,
        description: notebook.description || '',
        color: notebook.color
      })
    } else {
      setFormData({
        name: '',
        description: '',
        color: 'blue'
      })
    }
    setErrors({})
  }, [isEdit, notebook])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Notebook name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Notebook name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${THEME_CLASSES.BG.PRIMARY} rounded-lg border ${THEME_CLASSES.BORDER.PRIMARY} p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${THEME_CLASSES.TEXT.PRIMARY}`}>
          {isEdit ? 'Edit Notebook' : 'Create New Notebook'}
        </h3>
        <button
          onClick={onCancel}
          className={`p-1 rounded hover:${THEME_CLASSES.BG.TERTIARY} transition-colors`}
        >
          <Icons.X size={20} className={THEME_CLASSES.TEXT.MUTED} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label className={`block text-sm font-medium ${THEME_CLASSES.TEXT.SECONDARY} mb-1`}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter notebook name"
            className={`w-full px-3 py-2 border rounded-md ${THEME_CLASSES.BG.SECONDARY} ${THEME_CLASSES.TEXT.PRIMARY} ${
              errors.name ? 'border-red-500' : THEME_CLASSES.BORDER.PRIMARY
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            autoFocus
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label className={`block text-sm font-medium ${THEME_CLASSES.TEXT.SECONDARY} mb-1`}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description"
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${THEME_CLASSES.BG.SECONDARY} ${THEME_CLASSES.TEXT.PRIMARY} ${THEME_CLASSES.BORDER.PRIMARY} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          />
        </div>

        {/* Color selection */}
        <div>
          <label className={`block text-sm font-medium ${THEME_CLASSES.TEXT.SECONDARY} mb-2`}>
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {getAvailableColors().map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleInputChange('color', color)}
                className={`w-8 h-8 rounded-full border-2 ${getColorClass(color)} ${
                  formData.color === color
                    ? 'border-white shadow-lg scale-110'
                    : 'border-gray-300 hover:scale-105'
                } transition-all duration-200`}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 text-sm font-medium ${THEME_CLASSES.TEXT.SECONDARY} hover:${THEME_CLASSES.TEXT.PRIMARY} transition-colors`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default NotebookForm