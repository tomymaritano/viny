import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import CustomTag from '../../ui/CustomTag'
import { THEME_COLORS, ANIMATIONS } from '../../../constants/theme'
import { getAvailableTagColors } from '../../../utils/customTagColors'
import { useSimpleStore } from '../../../stores/simpleStore'

const TagSettingsModal = ({
  isOpen,
  onClose,
  tagName,
  onTagNameChange
}) => {
  const [localTagName, setLocalTagName] = useState(tagName || '')
  const { setTagColor } = useSimpleStore()
  const availableColors = getAvailableTagColors()

  useEffect(() => {
    setLocalTagName(tagName || '')
  }, [tagName])

  if (!isOpen || !tagName) return null

  const handleSave = () => {
    if (localTagName.trim() && localTagName !== tagName) {
      onTagNameChange(tagName, localTagName.trim())
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
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${ANIMATIONS.FADE_IN}`}
      onClick={handleCancel}
    >
      <div
        className={`border border-theme-border-primary rounded-lg shadow-xl w-full max-w-sm mx-4 ${ANIMATIONS.ZOOM_IN}`}
        style={{ backgroundColor: THEME_COLORS.MODAL_BG }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            Tag Settings
          </h3>
          <IconButton
            icon={Icons.X}
            onClick={handleCancel}
            title="Close"
            size={16}
            variant="default"
            aria-label="Close tag settings modal"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">

          {/* Tag Name */}
          <div>
            <input
              type="text"
              value={localTagName}
              onChange={(e) => setLocalTagName(e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              placeholder="Enter tag name..."
              autoFocus
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
      </div>
    </div>
  )
}

TagSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tagName: PropTypes.string,
  onTagNameChange: PropTypes.func.isRequired,
}

export default TagSettingsModal