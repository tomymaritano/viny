import React from 'react'
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem, DropdownHeader, DropdownDivider } from './DropdownMenu'
import { TAG_COLOR_OPTIONS } from '../../constants/theme'

interface TagContextMenuProps {
  isVisible: boolean
  position: {
    x: number
    y: number
  }
  tagName: string
  onEdit: () => void
  onChangeColor: () => void
  onRemove: () => void
  onClose: () => void
  showColorPicker: boolean
  onToggleColorPicker: () => void
  onSelectColor: (color: string) => void
  onFilterByTag: () => void
  onManageTags: () => void
}

const TagContextMenu: React.FC<TagContextMenuProps> = ({
  isVisible,
  position,
  tagName,
  onEdit,
  onChangeColor,
  onRemove,
  onClose,
  showColorPicker,
  onToggleColorPicker,
  onSelectColor,
  onFilterByTag,
  onManageTags,
}) => {
  if (!isVisible) return null

  const isTagsHeader = tagName === 'Tags'

  return (
    <DropdownMenu
      isOpen={isVisible}
      position="fixed"
      width="min-w-32"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <DropdownHeader>
        {isTagsHeader ? 'Tags' : `#${tagName}`}
      </DropdownHeader>

      {isTagsHeader ? (
        /* Tags Header Menu */
        <DropdownMenuItem
          onClick={onManageTags}
          icon={<Icons.Settings size={10} />}
        >
          Manage Tags
        </DropdownMenuItem>
      ) : (
        /* Individual Tag Menu */
        <>
          {/* Filter by Tag */}
          <DropdownMenuItem
            onClick={onFilterByTag}
            icon={<Icons.Search size={10} />}
          >
            Filter by Tag
          </DropdownMenuItem>

          {/* Edit Name */}
          <DropdownMenuItem
            onClick={onEdit}
            icon={<Icons.Edit size={10} />}
          >
            Edit Name
          </DropdownMenuItem>

          {/* Manage Tags */}
          <DropdownMenuItem
            onClick={onManageTags}
            icon={<Icons.Settings size={10} />}
          >
            Manage Tags
          </DropdownMenuItem>

          {/* Change Color */}
          <DropdownMenuItem
            onClick={onToggleColorPicker}
            icon={<div className="w-2 h-2 rounded-full bg-theme-accent-primary" />}
          >
            Change Color
          </DropdownMenuItem>

          {/* Color Picker */}
          {showColorPicker && (
            <div className="px-2 py-2 border-t border-theme-border-primary">
              <div className="grid grid-cols-5 gap-1">
                {TAG_COLOR_OPTIONS.map((colorClass, index) => {
                  const colorParts = colorClass.split(' ')
                  const bgClass = colorParts[0]
                  const borderClass = colorParts[1]
                  return (
                    <button
                      key={index}
                      onClick={() => onSelectColor(colorClass)}
                      className={`w-4 h-4 rounded border ${bgClass} ${borderClass} hover:scale-110 transition-transform`}
                      title={`Color ${index + 1}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Separator */}
          <DropdownDivider />

          {/* Remove Tag */}
          <DropdownMenuItem
            onClick={onRemove}
            icon={<Icons.Trash size={10} />}
            className="text-theme-accent-red hover:text-theme-accent-red"
          >
            Remove Tag
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenu>
  )
}

export default TagContextMenu