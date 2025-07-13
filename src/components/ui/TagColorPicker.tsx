import React, { useState } from 'react'
import { getAvailableTagColors, getTagStyle } from '../../utils/customTagColors'
import { useAppStore } from '../../stores/newSimpleStore'
import StandardModal from './StandardModal'

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

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Choose Color for "${tagName}"`}
      size="md"
    >
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
    </StandardModal>
  )
}

export default TagColorPicker
