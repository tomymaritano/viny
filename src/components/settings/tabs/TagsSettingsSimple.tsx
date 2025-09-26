import React, { useMemo, useState } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { Icons } from '../../Icons'
import {
  getCustomTagColor,
  getAvailableTagColors,
} from '../../../utils/customTagColors'

const TagsSettings: React.FC = () => {
  const { notes, tagColors, setTagColor } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const availableColors = getAvailableTagColors()

  // Calculate basic tag metrics
  const tagMetrics = useMemo(() => {
    const metrics: Record<
      string,
      { name: string; count: number; color: string }
    > = {}

    notes.forEach(note => {
      if (note.isTrashed) return

      note.tags.forEach(tag => {
        if (!metrics[tag]) {
          metrics[tag] = {
            name: tag,
            count: 0,
            color: getCustomTagColor(tag, tagColors).text,
          }
        }
        metrics[tag].count++
      })
    })

    return Object.values(metrics).sort((a, b) => b.count - a.count)
  }, [notes, tagColors])

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tagMetrics
    return tagMetrics.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tagMetrics, searchTerm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Tags Management
        </h3>
        <p className="text-sm text-theme-text-secondary">
          Manage colors and view usage statistics for your tags.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border-primary">
          <div className="flex items-center justify-between">
            <Icons.Tag size={20} className="text-theme-accent-primary" />
            <span className="text-2xl font-bold text-theme-text-primary">
              {tagMetrics.length}
            </span>
          </div>
          <p className="text-sm text-theme-text-secondary mt-2">Total Tags</p>
        </div>

        <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border-primary">
          <div className="flex items-center justify-between">
            <Icons.FileText size={20} className="text-blue-500" />
            <span className="text-2xl font-bold text-theme-text-primary">
              {
                notes.filter(note => !note.isTrashed && note.tags.length > 0)
                  .length
              }
            </span>
          </div>
          <p className="text-sm text-theme-text-secondary mt-2">Tagged Notes</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">
          Search Tags
        </label>
        <div className="relative">
          <Icons.Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="pl-10 pr-4 py-2 w-full text-sm bg-theme-bg-secondary border border-theme-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          />
        </div>
      </div>

      {/* Tags List */}
      <div>
        <h4 className="text-sm font-medium text-theme-text-primary mb-3">
          All Tags ({filteredTags.length})
        </h4>

        <div className="bg-theme-bg-secondary rounded-lg border border-theme-border-primary max-h-96 overflow-y-auto">
          {filteredTags.length === 0 ? (
            <div className="p-6 text-center text-theme-text-muted">
              <Icons.Tag size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tags found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredTags.map(tag => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-theme-bg-tertiary transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium text-theme-text-primary">
                        #{tag.name}
                      </span>
                      <span className="text-xs text-theme-text-muted ml-2">
                        {tag.count} {tag.count === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                  </div>

                  {/* Color Options */}
                  <div className="flex items-center space-x-1">
                    {availableColors.slice(0, 6).map(({ key, preview }) => (
                      <button
                        key={key}
                        onClick={() => setTagColor(tag.name, key)}
                        className="w-5 h-5 rounded-full border border-theme-border-primary hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: preview.bg,
                          borderColor: preview.border,
                        }}
                        title={`Change to ${preview.name}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Future Features Note */}
      <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border-primary">
        <div className="flex items-start space-x-3">
          <Icons.Info size={20} className="text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-theme-text-primary mb-1">
              Advanced Tag Management
            </h4>
            <p className="text-xs text-theme-text-secondary">
              More advanced tag management features like bulk operations,
              analytics, and export/import will be available in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TagsSettings
