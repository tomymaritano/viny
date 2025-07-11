import React from 'react'
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem, DropdownHeader, DropdownDivider } from './DropdownMenu'
import { getAvailableTagColors } from '../../utils/customTagColors'

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
  onSelectColor: (colorKey: string) => void
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
      width="min-w-48"
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
              <div className="grid grid-cols-4 gap-2">
                {getAvailableTagColors().map(({ key, name, preview }) => (
                  <button
                    key={key}
                    onClick={() => onSelectColor(key)}
                    className="group flex flex-col items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={name}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: preview.bg,
                        borderColor: preview.border
                      }}
                    />
                    <span className="text-xs text-theme-text-secondary mt-1 truncate w-full text-center">
                      {name}
                    </span>
                  </button>
                ))}
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