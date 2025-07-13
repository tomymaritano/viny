import React from 'react'

interface Tag {
  tag: string
  count: number
}

interface TagsListProps {
  tags: Tag[]
  activeSection: string
  getTagColor: (tag: string) => { bg: string; border: string }
  onSectionClick: (section: string) => void
  onTagRightClick: (e: React.MouseEvent, tagName: string) => void
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  activeSection,
  getTagColor,
  onSectionClick,
  onTagRightClick
}) => {
  return (
    <div className="space-y-0.5">
      {tags.map(({ tag, count }) => {
        const sectionKey = `tag-${tag.toLowerCase()}`
        const isActive = activeSection === sectionKey
        const tagColor = getTagColor(tag)

        return (
          <button
            key={tag}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-all duration-200 ${
              isActive
                ? 'text-theme-text-primary relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            style={isActive ? {
              backgroundColor: 'var(--color-active-bg)',
              boxShadow: 'inset 3px 0 0 var(--color-active-border)'
            } : {}}
            onClick={() => onSectionClick(sectionKey)}
            onContextMenu={(e) => onTagRightClick(e, tag)}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-theme-accent-primary/60" />
              </div>
              <span className="text-sm truncate flex-1 min-w-0">
                #{tag}
              </span>
            </div>
            
            <span 
              className="text-xs px-1.5 py-0.5 bg-theme-accent-primary/20 text-theme-accent-primary rounded-full min-w-[20px] text-center flex-shrink-0"
              title={`${count} notes with this tag`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default TagsList