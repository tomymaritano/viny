import React, { useState } from 'react'
import CustomTag from '../ui/CustomTag'
import TagColorPicker from '../ui/TagColorPicker'
import { getAvailableTagColors, getCustomTagColor } from '../../utils/customTagColors'
import { PREDEFINED_TAG_COLORS } from '../../constants/theme'

const TagColorsDemo: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customTagColors, setCustomTagColors] = useState<Record<string, string>>({})

  const sampleTags = [
    'project', 'work', 'personal', 'urgent', 'important', 'idea', 
    'note', 'todo', 'meeting', 'draft', 'completed', 'review', 
    'bug', 'feature', 'documentation'
  ]

  const availableColors = getAvailableTagColors()

  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName)
    setShowColorPicker(true)
  }

  const handleColorChange = (colorKey: string) => {
    if (selectedTag) {
      setCustomTagColors(prev => ({
        ...prev,
        [selectedTag]: colorKey
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Custom Tag Colors Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Click on any tag to change its color. The system uses beautiful, custom colors instead of generic Tailwind colors.
        </p>
      </div>

      {/* Sample Tags Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Sample Tags with Predefined Colors
        </h2>
        <div className="flex flex-wrap gap-2">
          {sampleTags.map((tag) => (
            <CustomTag
              key={tag}
              tagName={tag}
              size="md"
              onClick={() => handleTagClick(tag)}
              className="cursor-pointer hover:scale-105 transition-transform"
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          These tags use predefined colors based on their semantic meaning.
        </p>
      </div>

      {/* Color Palette Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Available Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableColors.map(({ key, name, preview }) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div
                className="w-6 h-6 rounded-full border-2"
                style={{
                  backgroundColor: preview.bg,
                  borderColor: preview.border
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {name}
                </div>
                <div 
                  className="text-xs font-mono"
                  style={{ color: preview.text }}
                >
                  {key}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Different Sizes Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Tag Sizes
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-gray-600 dark:text-gray-400">Small:</span>
            <div className="flex gap-2">
              <CustomTag tagName="project" size="sm" onClick={() => handleTagClick('project')} />
              <CustomTag tagName="urgent" size="sm" onClick={() => handleTagClick('urgent')} />
              <CustomTag tagName="idea" size="sm" onClick={() => handleTagClick('idea')} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-gray-600 dark:text-gray-400">Medium:</span>
            <div className="flex gap-2">
              <CustomTag tagName="project" size="md" onClick={() => handleTagClick('project')} />
              <CustomTag tagName="urgent" size="md" onClick={() => handleTagClick('urgent')} />
              <CustomTag tagName="idea" size="md" onClick={() => handleTagClick('idea')} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-gray-600 dark:text-gray-400">Large:</span>
            <div className="flex gap-2">
              <CustomTag tagName="project" size="lg" onClick={() => handleTagClick('project')} />
              <CustomTag tagName="urgent" size="lg" onClick={() => handleTagClick('urgent')} />
              <CustomTag tagName="idea" size="lg" onClick={() => handleTagClick('idea')} />
            </div>
          </div>
        </div>
      </div>

      {/* Color Mapping Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Predefined Color Mappings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(PREDEFINED_TAG_COLORS).map(([tag, colorKey]) => {
            const colorObj = getCustomTagColor(tag, {})
            return (
              <div key={tag} className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-600">
                <span className="font-mono text-gray-600 dark:text-gray-400">#{tag}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{colorObj.name}</span>
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: colorObj.bg,
                      borderColor: colorObj.border
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && selectedTag && (
        <TagColorPicker
          tagName={selectedTag}
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onColorChange={handleColorChange}
          currentColorKey={customTagColors[selectedTag]}
        />
      )}
    </div>
  )
}

export default TagColorsDemo