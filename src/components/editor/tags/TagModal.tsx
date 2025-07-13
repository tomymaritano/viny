import React, { useState, useEffect } from 'react'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import TagManager from './TagManager'
import { THEME_COLORS, ANIMATIONS } from '../../../constants/theme'

interface TagModalProps {
  isOpen: boolean
  onClose: () => void
  currentTags?: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
}

const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  currentTags = [],
  onTagsChange,
  availableTags = [],
}) => {
  const [localTags, setLocalTags] = useState(currentTags)

  useEffect(() => {
    setLocalTags(currentTags)
  }, [currentTags])

  if (!isOpen) return null

  const handleSave = () => {
    onTagsChange(localTags)
    onClose()
  }

  const handleCancel = () => {
    setLocalTags(currentTags) // Reset to original
    onClose()
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
        className={`border border-theme-border-primary rounded-lg shadow-xl w-full max-w-md mx-4 ${ANIMATIONS.ZOOM_IN}`}
        style={{ backgroundColor: THEME_COLORS.MODAL_BG }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            Manage Tags
          </h3>
          <IconButton
            icon={Icons.X}
            onClick={handleCancel}
            title="Close"
            size={16}
            variant="default"
            aria-label="Close tag modal"
            aria-pressed={false}
            aria-keyshortcuts=""
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Tags for this note
            </label>
            <TagManager
              tags={localTags}
              availableTags={availableTags}
              onTagsChange={setLocalTags}
              placeholder="Type to add tags..."
            />
            <p className="text-xs text-theme-text-muted mt-2">
              Press Enter to add a tag, or use suggestions. Use Backspace to
              remove the last tag.
            </p>
          </div>

          {/* Popular tags */}
          {availableTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-theme-text-secondary">
                  Popular tags
                </label>
                <span className="text-xs text-theme-text-muted">
                  {availableTags.filter(tag => !localTags.includes(tag)).length} available
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {availableTags
                  .filter(tag => !localTags.includes(tag))
                  .slice(0, 15)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => setLocalTags(prev => [...prev, tag])}
                      className="px-2 py-1 text-xs border border-theme-border-primary hover:border-theme-accent-primary hover:text-theme-accent-primary rounded-md transition-colors"
                    >
                      <span>#</span>
                      <span>{tag}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
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
            Save Tags
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagModal
