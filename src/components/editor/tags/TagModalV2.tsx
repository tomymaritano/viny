import React, { useState, useEffect } from 'react'
import { Icons } from '../../Icons'
import { StandardModal } from '../../ui/StandardModal'
import TagManager from './TagManager'
import TagSettingsModal from './TagSettingsModal'
import { useConfirmDialog } from '../../../hooks/useConfirmDialog'
import type { Note } from '../../../types'
import { useTagsQuery } from '../../../hooks/queries/useTagsQuery'
import { useActiveNotesQueryV2 } from '../../../hooks/queries/useNotesServiceQueryV2'
import { useUpdateSettingsMutationV2 } from '../../../hooks/queries/useSettingsServiceQueryV2'
import { getAvailableTagColors } from '../../../utils/customTagColors'
import { noteLogger } from '../../../utils/logger'
import { useToast } from '../../../hooks/useToast'

interface TagModalV2Props {
  isOpen: boolean
  onClose: () => void
  currentTags?: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
  mode?: 'note' | 'global'
}

const TagModalV2: React.FC<TagModalV2Props> = ({
  isOpen,
  onClose,
  currentTags = [],
  onTagsChange,
  mode = 'note',
}) => {
  const [localTags, setLocalTags] = useState(currentTags)
  const [tagSettingsModal, setTagSettingsModal] = useState({
    show: false,
    tagName: '',
  })
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('ocean')
  // Use centralized confirm dialog hook
  const { showConfirm } = useConfirmDialog()

  // V2 Hooks
  const { data: tagsData = [] } = useTagsQuery()
  const { data: notes = [] } = useActiveNotesQueryV2()
  const updateSettingsMutation = useUpdateSettingsMutationV2()
  const { showToast } = useToast()
  const availableColors = getAvailableTagColors()

  // Extract unique tags from the query data
  const availableTags = tagsData.map(t => t.name)

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
            setTimeout(() => {
              setTagSettingsModal({ show: true, tagName: tag })
            }, 100)
          }
        }
      } catch (error) {
        noteLogger.error('Error parsing temp tag action:', error)
      }
    }
  }, [currentTags, isOpen, mode])

  if (!isOpen) return null

  const handleSave = () => {
    onTagsChange(localTags)
    onClose()
  }

  // Handler for setting tag color
  const setTagColor = async (tagName: string, color: string) => {
    try {
      // Update tag colors in settings
      // TODO: Implement tag color update with settings service
      showToast(`Tag color update coming soon`, 'info')
    } catch (error) {
      noteLogger.error('Failed to update tag color:', error)
      showToast('Failed to update tag color', 'error')
    }
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
    // TODO: Implement tag rename with service
    showToast('Tag rename coming soon', 'info')
  }

  // Handler for deleting tags
  const handleDeleteTag = async (tagName: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Tag',
      message: `Are you sure you want to remove the tag "${tagName}" from all notes? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          // TODO: Implement tag removal from all notes with service
          showToast('Tag removal coming soon', 'info')
        } catch (error) {
          noteLogger.error('Failed to delete tag:', error)
          showToast(`Failed to remove tag "${tagName}"`, 'error')
        }
      }
    })
  }

  const handleCancel = () => {
    setLocalTags(currentTags)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={mode === 'global' ? 'Manage Global Tags' : 'Manage Tags'}
      icon={<Icons.Tag size={20} />}
      size="md"
      closeOnEscape={true}
      footer={
        mode === 'global' ? (
          <button
            onClick={handleCancel}
            className="px-3 py-2 text-sm bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 transition-colors"
          >
            Close
          </button>
        ) : (
          <div className="flex gap-2">
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
        )
      }
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
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
                    onChange={e => setNewTagName(e.target.value)}
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
                    {availableColors
                      .slice(0, 8)
                      .map(({ key, name, preview }) => (
                        <button
                          key={key}
                          onClick={() => setSelectedColor(key)}
                          className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === key
                              ? 'ring-2 ring-theme-accent-primary ring-offset-2 ring-offset-theme-bg-primary'
                              : ''
                          }`}
                          style={{
                            backgroundColor: preview.bg,
                            borderColor: preview.border,
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
                    <div
                      key={tag}
                      className="flex items-center justify-between p-3 border border-theme-border-primary rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">#{tag}</span>
                        <span className="text-xs text-theme-text-muted">
                          {
                            notes.filter(note =>
                              note.tags.includes(tag)
                            ).length
                          }{' '}
                          notes
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Color selector */}
                        <div className="flex items-center space-x-1">
                          {availableColors
                            .slice(0, 6)
                            .map(({ key, preview }) => (
                              <button
                                key={key}
                                onClick={() => setTagColor(tag, key)}
                                className="w-4 h-4 rounded-full border transition-all hover:scale-110"
                                style={{
                                  backgroundColor: preview.bg,
                                  borderColor: preview.border,
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
                          <Icons.Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-theme-text-muted">
                  No tags found. Create one above.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Note Mode - Manage tags for current note */
          <div className="space-y-3">
            {/* Note's current tags */}
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                Current tags
              </label>
              <TagManager
                tags={localTags}
                onTagsChange={setLocalTags}
                availableTags={availableTags}
                onOpenTagSettings={handleOpenTagSettings}
                onDeleteTag={handleDeleteTag}
              />
            </div>

            {/* Keyboard shortcut info */}
            <p className="text-xs text-theme-text-muted">
              Press ⌘+Enter to save tags
            </p>
          </div>
        )}

        {/* Tag Settings Modal */}
        <TagSettingsModal
          isOpen={tagSettingsModal.show}
          onClose={() => setTagSettingsModal({ show: false, tagName: '' })}
          tagName={tagSettingsModal.tagName}
          onNameChange={handleTagNameChange}
          onDelete={handleDeleteTag}
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog({ isOpen: false, tagName: '' })}
          title="Delete Tag"
          message={`Are you sure you want to remove the tag "${confirmDialog.tagName}" from all notes? This action cannot be undone.`}
          confirmText="Delete"
          confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        />
      </div>
    </StandardModal>
  )
}

export { TagModalV2 }