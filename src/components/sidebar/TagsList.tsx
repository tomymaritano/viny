import React, { memo } from 'react'

interface Tag {
  tag: string
  count: number
}

interface TagsListProps {
  tags: Tag[]
  activeSection: string
  getTagColor: (tag: string) => {
    bg: string
    border: string
    text: string
    name: string
  }
  onSectionClick: (section: string) => void
  onContextMenu: (e: React.MouseEvent, tagName: string) => void
}

const TagsList: React.FC<TagsListProps> = ({
  tags,
  activeSection,
  getTagColor,
  onSectionClick,
  onContextMenu,
}) => {
  return (
    <div className="space-y-1">
      {tags.map(({ tag, count }, index) => {
        const sectionKey = `tag-${tag.toLowerCase()}`
        const isActive = activeSection === sectionKey
        const tagColor = getTagColor(tag)

        return (
          <div
            key={tag}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors duration-150 cursor-pointer rounded ${
              isActive
                ? 'text-theme-text-primary bg-theme-accent-primary/10'
                : 'text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-bg-tertiary/30'
            }`}
            onClick={() => onSectionClick(sectionKey)}
            onContextMenu={e => {
              if (window.electronAPI?.isElectron) {
                e.preventDefault()
                window.electronAPI.showContextMenu('tag', { name: tag })
              } else {
                onContextMenu(e, tag)
              }
            }}
          >
            <div
              className="w-3 h-3 rounded-full border-2 flex-shrink-0 transition-transform duration-150 hover:scale-110"
              style={{
                backgroundColor: tagColor.text + '40',
                borderColor: tagColor.text,
              }}
            />
            <span className="truncate flex-1">#{tag}</span>
            {count > 0 && <span className="text-xs opacity-60">{count}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default memo(TagsList)
