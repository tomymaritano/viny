import React, { useState } from 'react'
import { getAvailableTagColors, getTagStyle } from '../../utils/customTagColors'
import { useAppStore } from '../../stores/newSimpleStore'

interface TagColorPickerProps {
  tagName: string
  isOpen: boolean
  onClose: () => void
  onColorChange: (colorKey: string) => void
  currentColorKey?: string
}

export const TagColorPicker: React.FC<TagColorPickerProps> = ({
  tagName,
  isOpen,
  onClose,
  onColorChange,
  currentColorKey
}) => {
  const { setTagColor } = useAppStore()
  const availableColors = getAvailableTagColors()
  
  const handleColorSelect = (colorKey: string) => {
    setTagColor(tagName, colorKey)
    onColorChange(colorKey)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Color for "{tagName}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {availableColors.map(({ key, name, preview }) => {
            const isSelected = currentColorKey === key
            const style = {
              backgroundColor: preview.bg,
              borderColor: preview.border,
              color: preview.text,
              border: '2px solid'
            }
            
            return (
              <button
                key={key}
                onClick={() => handleColorSelect(key)}
                className={`
                  p-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                `}
                style={style}
              >
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preview.text }}
                  />
                  <span className="text-xs font-medium truncate w-full">
                    {name}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagColorPicker
