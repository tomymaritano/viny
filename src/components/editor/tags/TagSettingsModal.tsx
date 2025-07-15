import React, { useState, useEffect } from 'react'
import Icons from '../../Icons'
import BaseModal from '../../ui/BaseModal'
import CustomTag from '../../ui/CustomTag'
import { getAvailableTagColors } from '../../../utils/customTagColors'
import { useAppStore } from '../../../stores/newSimpleStore'

interface TagSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  tagName: string
  onTagNameChange: (oldName: string, newName: string) => void
}

const TagSettingsModal: React.FC<TagSettingsModalProps> = ({
  isOpen,
  onClose,
  tagName,
  onTagNameChange
}) => {
  const [localTagName, setLocalTagName] = useState(tagName || '')
  const { setTagColor } = useAppStore()
  const availableColors = getAvailableTagColors()

  useEffect(() => {
    setLocalTagName(tagName || '')
  }, [tagName])

  if (!isOpen || !tagName) return null

  const handleSave = () => {
    const trimmedName = localTagName.trim()
    
    if (trimmedName && trimmedName !== tagName) {
      // Allow any change - validation will be handled in the parent component
      onTagNameChange(tagName, trimmedName)
    }
    onClose()
  }

  const handleCancel = () => {
    setLocalTagName(tagName) // Reset to original
    onClose()
  }

  const handleColorChange = (colorKey) => {
    setTagColor(tagName, colorKey)
  }

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Tag Settings"
      icon={<Icons.Tag size={20} />}
      maxWidth="sm"
      closeOnEscape={true}
    >
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tag Name */}
        <div>
          <input
            type="text"
            value={localTagName}
            onChange={(e) => setLocalTagName(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            placeholder="Enter tag name..."
            autoFocus
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Color Selection */}
        <div>
          <div className="grid grid-cols-4 gap-3">
            {availableColors.map(({ key, name, preview }) => (
              <button
                key={key}
                onClick={() => handleColorChange(key)}
                className="group flex flex-col items-center p-2 rounded-md hover:bg-theme-bg-tertiary transition-colors"
                title={name}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 mb-1 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: preview.bg,
                    borderColor: preview.border
                  }}
                />
                <span className="text-xs text-theme-text-secondary text-center">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-theme-border-primary">
        <button
          onClick={handleCancel}
          className="px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 transition-colors"
        >
          Save
        </button>
      </div>
    </BaseModal>
  )
}

export default TagSettingsModal
