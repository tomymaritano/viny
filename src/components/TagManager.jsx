import { useState, useEffect } from 'react'
import Icons from './Icons'

const TagManager = ({ note, onSave, onClose, allTags = [] }) => {
  const [tags, setTags] = useState(note?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [selectedColor, setSelectedColor] = useState('default')

  // Available tag colors
  const tagColors = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  }

  // Get stored tag colors from localStorage
  const getTagColors = () => {
    const stored = localStorage.getItem('inkrun-tag-colors')
    return stored ? JSON.parse(stored) : {}
  }

  // Save tag colors to localStorage
  const saveTagColors = colors => {
    localStorage.setItem('inkrun-tag-colors', JSON.stringify(colors))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim()
      setTags([...tags, trimmedTag])

      // Save tag color (including default)
      const tagColors = getTagColors()
      tagColors[trimmedTag] = selectedColor
      saveTagColors(tagColors)

      setNewTag('')
      setSelectedColor('default')
    }
  }

  const removeTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    const updatedNote = {
      ...note,
      tags: tags,
      updatedAt: new Date().toISOString(),
    }
    onSave(updatedNote)
    onClose()
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      addTag()
    }
  }

  const getTagColor = tag => {
    const storedColors = getTagColors()
    const colorKey = storedColors[tag] || 'default'
    return tagColors[colorKey] || tagColors.default
  }

  // Get available tags (not assigned to current note)
  const availableTags = allTags.filter(tag => !tags.includes(tag))

  const addExistingTag = tag => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-solarized-base02 border border-solarized-base01 rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-solarized-base5">
            Manage Tags
          </h2>
          <button
            onClick={onClose}
            className="text-solarized-base1 hover:text-solarized-base3 transition-colors border-0 bg-transparent hover:bg-transparent p-1"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* Current Tags */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-solarized-base3 mb-2">
            Current Tags
          </h3>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div
                  key={tag}
                  className={`text-xs px-2 py-1 rounded border flex items-center space-x-1 ${getTagColor(tag)}`}
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-current hover:text-red-400 transition-colors border-0 bg-transparent hover:bg-transparent p-0 ml-1"
                  >
                    <Icons.X size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-solarized-base0">No tags added yet</p>
          )}
        </div>

        {/* Available Tags */}
        {availableTags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-solarized-base3 mb-2">
              Available Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addExistingTag(tag)}
                  className={`text-xs px-2 py-1 rounded border transition-colors hover:opacity-80 ${getTagColor(tag)}`}
                >
                  <span>#{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Tag */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-solarized-base3 mb-2">
            Add New Tag
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tag name..."
              className="w-full px-3 py-2 bg-solarized-base01 border border-solarized-base00 rounded text-sm text-solarized-base2 placeholder-solarized-base0 focus:outline-none focus:border-solarized-blue focus:bg-solarized-base02"
            />

            {/* Color Selection */}
            <div>
              <label className="text-xs text-solarized-base1 mb-1 block">
                Tag Color
              </label>
              <div className="grid grid-cols-6 gap-1">
                {Object.entries(tagColors).map(([colorKey, colorClass]) => (
                  <button
                    key={colorKey}
                    onClick={() => setSelectedColor(colorKey)}
                    className={`w-6 h-6 rounded border-2 transition-all border-0 bg-transparent hover:bg-transparent p-0 ${
                      selectedColor === colorKey
                        ? 'ring-2 ring-solarized-blue ring-offset-1 ring-offset-solarized-base02'
                        : ''
                    }`}
                    title={colorKey}
                  >
                    <div
                      className={`w-full h-full rounded ${colorClass.split(' ')[0]} border`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addTag}
              disabled={!newTag.trim()}
              className="w-full px-3 py-2 bg-solarized-blue text-solarized-base5 rounded hover:bg-solarized-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border-0"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-solarized-base01">
          <button
            onClick={onClose}
            className="px-4 py-2 text-solarized-base1 hover:text-solarized-base3 transition-colors text-sm border-0 bg-transparent hover:bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-solarized-green text-solarized-base5 rounded hover:bg-solarized-cyan transition-colors text-sm border-0"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagManager
