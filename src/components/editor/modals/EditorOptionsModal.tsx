import PropTypes from 'prop-types'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import { THEME_COLORS, ANIMATIONS, Z_INDEX } from '../../../constants/theme'

const EditorOptionsModal = ({
  isOpen,
  onClose,
  onDuplicate,
  onDelete,
  isClosing = false,
  isOpening = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-start justify-end" style={{ zIndex: Z_INDEX.MODAL }}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 ${ANIMATIONS.FADE_IN}`}
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        className="relative w-80 h-full border-l border-theme-border-primary shadow-xl transition-transform duration-300 ease-out"
        style={{ 
          backgroundColor: THEME_COLORS.MODAL_BG,
          transform: isClosing 
            ? 'translateX(100%)' 
            : isOpening 
              ? 'translateX(0)' 
              : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-theme-border-primary">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-theme-text-primary">
              Note Options
            </h2>
            <IconButton
              icon={Icons.X}
              onClick={onClose}
              title="Close"
              size={16}
              variant="default"
              aria-label="Close options"
              aria-pressed={false}
              aria-keyshortcuts=""
            />
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {/* Duplicate Note */}
          <button
            onClick={onDuplicate}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
          >
            <Icons.Copy size={16} className="text-theme-text-muted" />
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Duplicate Note
              </div>
              <div className="text-xs text-theme-text-muted">
                Create a copy of this note
              </div>
            </div>
          </button>

          {/* Delete Note */}
          <button
            onClick={onDelete}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors text-theme-accent-red"
          >
            <Icons.Trash size={16} className="text-theme-accent-red" />
            <div>
              <div className="text-sm font-medium">
                Delete Note
              </div>
              <div className="text-xs text-theme-text-muted">
                Permanently delete this note
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

EditorOptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  isOpening: PropTypes.bool,
}

export default EditorOptionsModal
