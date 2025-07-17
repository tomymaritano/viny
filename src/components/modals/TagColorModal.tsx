import React, { useState } from 'react'
import BaseModal from '../ui/BaseModal'
import { Icons } from '../Icons'
import { getAvailableTagColors } from '../../utils/customTagColors'
import { useAppStore } from '../../stores/newSimpleStore'

interface TagColorModalProps {
  isOpen: boolean
  onClose: () => void
  tagName: string
}

const TagColorModal: React.FC<TagColorModalProps> = ({
  isOpen,
  onClose,
  tagName
}) => {
  const { setTagColor } = useAppStore()
  const availableColors = getAvailableTagColors()

  const handleColorSelect = (colorKey: string) => {
    setTagColor(tagName, colorKey)
    onClose()
  }

  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Color for #${tagName}`}
      icon={<Icons.Palette size={20} />}
      maxWidth="sm"
      closeOnEscape={true}
    >
      <div className="p-4">
        <p className="text-sm text-theme-text-secondary mb-4">
          Select a color for this tag:
        </p>
        
        <div className="grid grid-cols-6 gap-3">
          {availableColors.map(({ key, preview }) => (
            <button
              key={key}
              onClick={() => handleColorSelect(key)}
              className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg"
              style={{
                backgroundColor: preview.bg,
                borderColor: preview.border
              }}
            />
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default TagColorModal