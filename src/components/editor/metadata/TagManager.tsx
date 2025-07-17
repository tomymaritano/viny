import React from 'react'
import { Icons } from '../../Icons'
import TagContextMenu from '../../ui/TagContextMenu'
import TagSettingsModal from '../tags/TagSettingsModal'
import { useTagManager } from '../../../hooks/useTagManager'
import { useAppStore } from '../../../stores/newSimpleStore'

interface TagManagerProps {
  note: any
  onTagsChange: (tags: string[]) => void
  isPreviewMode?: boolean
}

const TagManager: React.FC<TagManagerProps> = ({ note, onTagsChange, isPreviewMode = false }) => {
  const { getTagColor } = useAppStore()
  const {
    tagInput,
    showTagSuggestions,
    selectedSuggestionIndex,
    contextMenu,
    tagSettingsModal,
    filteredSuggestions,
    setTagInput,
    setShowTagSuggestions,
    setContextMenu,
    setTagSettingsModal,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyDown,
    handleTagContextMenu,
    handleContextMenuAction,
    handleTagColorSave,
  } = useTagManager(note, onTagsChange)

  if (isPreviewMode) {
    return (
      <div className="flex flex-wrap gap-1">
        {note?.tags?.length > 0 ? (
          note.tags.map((tag: string, index: number) => {
            const tagColor = getTagColor(tag)
            return (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                style={{
                  backgroundColor: tagColor ? `${tagColor}20` : 'var(--color-base01)',
                  borderColor: tagColor || 'var(--color-base01)',
                  color: tagColor || 'var(--color-base1)',
                }}
              >
                {tag}
              </span>
            )
          })
        ) : (
          <span className="text-xs text-theme-text-muted italic">No tags</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-1">
        {note?.tags?.map((tag: string, index: number) => {
          const tagColor = getTagColor(tag)
          return (
            <span
              key={`${tag}-${index}`}
              onContextMenu={(e) => handleTagContextMenu(e, tag, index)}
              className="group inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: tagColor ? `${tagColor}20` : 'var(--color-base01)',
                borderColor: tagColor || 'var(--color-base01)',
                color: tagColor || 'var(--color-base1)',
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(index)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                title="Remove tag"
              >
                <Icons.X size={12} />
              </button>
            </span>
          )
        })}
      </div>

      {/* Tag Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setShowTagSuggestions(e.target.value.length > 0)
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => tagInput.length > 0 && setShowTagSuggestions(true)}
              className="w-full px-3 py-2 text-sm border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
            />
            
            {/* Tag Suggestions */}
            {showTagSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-theme-bg-secondary border border-theme-border-primary rounded-md shadow-lg z-50 max-h-32 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setTagInput(suggestion)
                      handleAddTag()
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-theme-bg-tertiary transition-colors ${
                      index === selectedSuggestionIndex ? 'bg-theme-bg-tertiary' : ''
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="px-3 py-2 bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icons.Plus size={14} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <TagContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })}
        />
      )}

      {/* Tag Settings Modal */}
      {tagSettingsModal.show && (
        <TagSettingsModal
          isOpen={tagSettingsModal.show}
          onClose={() => setTagSettingsModal({ show: false, tagName: '', tagIndex: null })}
          tagName={tagSettingsModal.tagName}
          onSave={handleTagColorSave}
        />
      )}
    </div>
  )
}

export default TagManager