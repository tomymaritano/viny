/**
 * TagsSection - Tags management with context menu
 * Extracted from SidebarSimple.tsx
 */

import React from 'react'

interface Tag {
  tag: string
  count: number
}

interface TagColor {
  bg: string
  border: string
  text: string
}

interface TagsSectionProps {
  tags: Tag[]
  isExpanded: boolean
  activeSection: string
  tagColors: Record<string, string>
  onToggleExpansion: () => void
  onSectionClick: (sectionId: string) => void
  onTagRightClick: (e: React.MouseEvent, tagName: string) => void
  getTagColor: (tag: string) => TagColor
  renderIcon: (iconName: string, size?: number) => React.ReactNode
}

const TagsSection: React.FC<TagsSectionProps> = ({
  tags,
  isExpanded,
  activeSection,
  onToggleExpansion,
  onSectionClick,
  onTagRightClick,
  getTagColor,
  renderIcon
}) => {
  return (
    <div className="px-2">
      {/* Section Header */}
      <button
        onClick={onToggleExpansion}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-theme-text-muted hover:text-theme-text-secondary transition-colors"
      >
        <span>Tags</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          {renderIcon('ChevronDown', 12)}
        </span>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
          {tags.length > 0 ? (
            tags.map(({ tag, count }) => {
              const isActive = activeSection === `tag:${tag}`
              const tagColor = getTagColor(tag)
              
              return (
                <button
                  key={tag}
                  onClick={() => onSectionClick(`tag:${tag}`)}
                  onContextMenu={(e) => onTagRightClick(e, tag)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
                    ${isActive
                      ? 'bg-theme-bg-secondary text-theme-text-primary'
                      : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tagColor.text }}
                    />
                    <span className="font-medium truncate">#{tag}</span>
                  </div>
                  <span className="text-xs bg-theme-bg-tertiary text-theme-text-muted px-1.5 py-0.5 rounded flex-shrink-0">
                    {count}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center text-sm text-theme-text-muted italic">
              No tags found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TagsSection
