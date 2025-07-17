import React, { useState, useEffect } from 'react'
import { Icons } from '../../Icons'
import BaseModal from '../../ui/BaseModal'
import TagManager from './TagManager'
import TagSettingsModal from './TagSettingsModal'
import { Note } from '../../../types'
import { useAppStore } from '../../../stores/newSimpleStore'
import { getAvailableTagColors } from '../../../utils/customTagColors'

interface TagModalProps {
  isOpen: boolean
  onClose: () => void
  currentTags?: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
  mode?: 'note' | 'global' // New prop to distinguish context
  filteredNotes?: Note[] // For statistics in global mode
}

const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  currentTags = [],
  onTagsChange,
  availableTags = [],
  mode = 'note',
  filteredNotes = [],
}) => {
  const [localTags, setLocalTags] = useState(currentTags)
  const [tagSettingsModal, setTagSettingsModal] = useState({ show: false, tagName: '' })
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('ocean')
  const { addNote, setTagColor, removeTagFromAllNotes, showSuccess, showError } = useAppStore()
  const availableColors = getAvailableTagColors()

  useEffect(() => {
    setLocalTags(currentTags)
    
    // Check if we need to open tag settings for a specific tag
    if (isOpen && mode === 'global') {
      try {
        const tempAction = window.localStorage.getItem('temp-tag-action')
        if (tempAction) {
          const { tag, action } = JSON.parse(tempAction)
          window.localStorage.removeItem('temp-tag-action')
          
          if (action === 'color' && tag) {
            // Open the tag settings modal for color change
            setTimeout(() => {
              setTagSettingsModal({ show: true, tagName: tag })
            }, 100)
          }
        }
      } catch (error) {
        console.error('Error parsing temp tag action:', error)
      }
    }
  }, [currentTags, isOpen, mode])

  if (!isOpen) return null

  const handleSave = () => {
    onTagsChange(localTags)
    onClose()
  }

  // Handler for creating new tag with color selection
  const handleCreateNewTag = () => {
    if (newTagName.trim()) {
      const trimmedName = newTagName.trim()
      // Set the color for the new tag
      setTagColor(trimmedName, selectedColor)
      // Add to local tags if not already present
      if (!localTags.includes(trimmedName)) {
        setLocalTags([...localTags, trimmedName])
      }
      // Reset form
      setNewTagName('')
      setSelectedColor('ocean')
    }
  }

  // Handler for tag input key down
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCreateNewTag()
    }
  }

  // Handler for opening tag color picker
  const handleOpenTagSettings = (tagName: string) => {
    setTagSettingsModal({ show: true, tagName })
  }

  // Handler for tag name changes
  const handleTagNameChange = (oldName: string, newName: string) => {
    // Update the tag name in available tags list and notify parent
    // This would typically update all notes that use this tag
    console.log('Tag name change:', oldName, '->', newName)
  }

  // Handler for deleting tags
  const handleDeleteTag = (tagName: string) => {
    const confirmMessage = `Are you sure you want to remove the tag "${tagName}" from all notes? This action cannot be undone.`
    
    if (window.confirm(confirmMessage)) {
      try {
        removeTagFromAllNotes(tagName)
        // Success notification is handled by the store function
      } catch (error) {
        console.error('Failed to delete tag:', error)
        showError(`Failed to remove tag "${tagName}". Please try again.`)
      }
    }
  }

  const handleCancel = () => {
    setLocalTags(currentTags) // Reset to original
    onClose()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={mode === 'global' ? 'Manage Global Tags' : 'Manage Tags'}
      icon={<Icons.Tag size={20} />}
      maxWidth="md"
      closeOnEscape={true}
    >
      {/* Content */}
      <div className="p-4 space-y-4" onKeyDown={handleKeyDown}>
        {mode === 'global' ? (
          /* Global Mode - Show all existing tags with management options */
          <div className="space-y-4">
            {/* Create new tag section */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Create new tag
              </label>
              
              {/* Tag name input */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type new tag name..."
                    className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-theme-text-muted">
                    ⌘↵
                  </span>
                </div>
                
                {/* Color selection */}
                <div>
                  <label className="block text-xs font-medium text-theme-text-muted mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.slice(0, 8).map(({ key, name, preview }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedColor(key)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedColor === key ? 'ring-2 ring-theme-accent-primary ring-offset-2 ring-offset-theme-bg-primary' : ''
                        }`}
                        style={{
                          backgroundColor: preview.bg,
                          borderColor: preview.border
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Create button */}
                <button
                  onClick={handleCreateNewTag}
                  disabled={!newTagName.trim()}
                  className="w-full px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Tag
                </button>
              </div>
              
              <p className="text-xs text-theme-text-muted mt-2">
                Press ⌘+Enter or click "Create Tag" to add the new tag.
              </p>
            </div>
            
            {/* Existing tags section */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                All existing tags ({availableTags.length})
              </label>
              
              {availableTags.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableTags.map(tag => (
                    <div key={tag} className="flex items-center justify-between p-3 border border-theme-border-primary rounded-md">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">#{tag}</span>
                        <span className="text-xs text-theme-text-muted">
                          {filteredNotes.filter(note => note.tags.includes(tag)).length} notes
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Color selector */}
                        <div className="flex items-center space-x-1">
                          {availableColors.slice(0, 6).map(({ key, preview }) => (
                            <button
                              key={key}
                              onClick={() => setTagColor(tag, key)}
                              className="w-4 h-4 rounded-full border transition-all hover:scale-110"
                              style={{
                                backgroundColor: preview.bg,
                                borderColor: preview.border
                              }}
                              title={`Change to ${preview.name}`}
                            />
                          ))}
                        </div>
                        
                        {/* Rename button */}
                        <button
                          onClick={() => handleOpenTagSettings(tag)}
                          className="p-1 text-theme-text-muted hover:text-theme-accent-primary transition-colors"
                          title="Rename tag"
                        >
                          <Icons.Edit size={14} />
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="p-1 text-theme-text-muted hover:text-red-500 transition-colors"
                          title="Delete tag"
                        >
                          <Icons.Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-theme-text-muted py-4 text-center">
                  No tags exist yet. Create your first tag above.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Note Mode - Original TagManager behavior */
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
              Press Enter to add a tag, or use suggestions. Use Backspace to remove the last tag.
            </p>
          </div>
        )}

        {/* Available tags - Only show in note mode */}
        {mode === 'note' && availableTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-theme-text-secondary">
                {currentTags.length > 0 ? 'Add more tags' : 'Choose from existing tags'}
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
                    className="px-2 py-1 text-xs text-theme-text-secondary border border-theme-border-primary hover:border-theme-accent-primary hover:text-theme-accent-primary rounded-md transition-colors"
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
        {mode === 'global' ? (
          <button
            onClick={handleCancel}
            className="px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 transition-colors"
          >
            Close
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Tag Settings Modal */}
      <TagSettingsModal
        isOpen={tagSettingsModal.show}
        onClose={() => setTagSettingsModal({ show: false, tagName: '' })}
        tagName={tagSettingsModal.tagName}
        onTagNameChange={handleTagNameChange}
      />
    </BaseModal>
  )
}

export { TagModal }
