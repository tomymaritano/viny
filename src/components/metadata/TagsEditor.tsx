/**
 * Tags editor component for tag management
 */
import React from 'react'
import Icons from '../Icons'
import TagEditInput from '../ui/TagEditInput'
import TagContextMenu from '../ui/TagContextMenu'

interface TagsEditorProps {
  tags: string[]
  onTagAdd: (tag: string) => void
  onTagUpdate: (oldTag: string, newTag: string) => void
  onTagDelete: (tag: string) => void
  onTagsChange: (tags: string[]) => void
  contextMenu: {
    isOpen: boolean
    position: { x: number, y: number }
    tagValue: string
  }
  onContextMenuClose: () => void
  className?: string
}

const TagsEditor: React.FC<TagsEditorProps> = ({
  tags,
  onTagAdd,
  onTagUpdate,
  onTagDelete,
  onTagsChange,
  contextMenu,
  onContextMenuClose,
  className = ''
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Icons.Tag size={14} className="text-theme-accent-purple" />
        <span className="text-sm font-medium text-theme-text-secondary">Tags</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagEditInput
            key={tag}
            tag={tag}
            onUpdate={(newTag) => onTagUpdate(tag, newTag)}
            onDelete={() => onTagDelete(tag)}
          />
        ))}
        
        <TagEditInput
          tag=""
          onUpdate={onTagAdd}
          onDelete={() => {}}
          isNew={true}
          placeholder="Add tag..."
        />
      </div>

      <TagContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        tagValue={contextMenu.tagValue}
        onClose={onContextMenuClose}
        onUpdate={onTagUpdate}
        onDelete={onTagDelete}
      />
    </div>
  )
}

export default TagsEditor