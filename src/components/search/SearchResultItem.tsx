/**
 * Individual search result item component
 */
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'
import { 
  highlightText, 
  extractPreview, 
  formatSearchDate, 
  getSearchResultIcon 
} from '../../utils/searchUtils'

const SearchResultItem = ({
  note,
  searchTerm = '',
  isSelected = false,
  index,
  onClick,
  onPinNote,
  onDeleteNote,
  onMoveNote,
}) => {
  const handleClick = () => {
    onClick?.(note)
  }

  const handlePin = (e) => {
    e.stopPropagation()
    onPinNote?.(note)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDeleteNote?.(note)
  }

  const handleMove = (e) => {
    e.stopPropagation()
    onMoveNote?.(note)
  }

  const icon = getSearchResultIcon(note)
  const preview = extractPreview(note.content, searchTerm)
  const formattedDate = formatSearchDate(note.lastModified)
  
  // Get the icon component dynamically
  const IconComponent = Icons[icon]

  return (
    <div
      data-result-index={index}
      className={`search-result-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="search-result-content">
        <div className="search-result-header">
          <div className="search-result-icon">
            {IconComponent && <IconComponent />}
          </div>
          
          <div className="search-result-title">
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(note.title || 'Untitled', searchTerm)
              }}
            />
          </div>
          
          {note.isPinned && (
            <div className="search-result-pin-indicator">
              <Icons.Pin />
            </div>
          )}
        </div>

        {preview && (
          <div className="search-result-preview">
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(preview, searchTerm)
              }}
            />
          </div>
        )}

        <div className="search-result-meta">
          {note.notebook && (
            <span className="search-result-notebook">
              <Icons.FolderOpen />
              {note.notebook}
            </span>
          )}
          
          {note.tags && note.tags.length > 0 && (
            <div className="search-result-tags">
              {note.tags.slice(0, 3).map((tag, tagIndex) => (
                <span key={tagIndex} className="search-result-tag">
                  {tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="search-result-tag-more">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {formattedDate && (
            <span className="search-result-date">
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {(onPinNote || onDeleteNote || onMoveNote) && (
        <div className="search-result-actions">
          <DropdownMenu
            trigger={
              <button className="search-result-menu-button">
                <Icons.MoreHorizontal />
              </button>
            }
            align="right"
          >
            {onPinNote && (
              <DropdownMenuItem onClick={handlePin}>
                <Icons.Pin />
                {note.isPinned ? 'Unpin note' : 'Pin note'}
              </DropdownMenuItem>
            )}
            
            {onMoveNote && (
              <DropdownMenuItem onClick={handleMove}>
                <Icons.FolderOpen />
                Move to notebook
              </DropdownMenuItem>
            )}
            
            {onDeleteNote && (
              <DropdownMenuItem onClick={handleDelete} variant="danger">
                <Icons.Trash />
                Delete note
              </DropdownMenuItem>
            )}
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export default SearchResultItem
