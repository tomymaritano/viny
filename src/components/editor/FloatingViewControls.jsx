import PropTypes from 'prop-types'
import Icons from '../Icons'

const FloatingViewControls = ({ viewMode, onViewModeChange }) => {
  const handlePreviewOnlyToggle = () => {
    onViewModeChange(viewMode === 'preview' ? 'editor' : 'preview')
  }

  const handleSplitToggle = () => {
    onViewModeChange(viewMode === 'split' ? 'editor' : 'split')
  }

  const buttonBaseStyle =
    'p-1.5 rounded-full transition-all duration-200 border border-transparent'

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50 flex flex-col gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Preview Only Button */}
      <button
        onClick={handlePreviewOnlyToggle}
        className={`${buttonBaseStyle} ${
          viewMode === 'preview'
            ? 'text-white border-white/20 bg-white/10'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:border-white/10 hover:bg-white/5'
        }`}
        title={viewMode === 'preview' ? 'Close preview' : 'Open preview only'}
        aria-label={
          viewMode === 'preview' ? 'Close preview' : 'Open preview only'
        }
      >
        {viewMode === 'preview' ? (
          <Icons.EyeOff size={16} />
        ) : (
          <Icons.Eye size={16} />
        )}
      </button>

      {/* Split View Button */}
      <button
        onClick={handleSplitToggle}
        className={`${buttonBaseStyle} ${
          viewMode === 'split'
            ? 'text-white border-white/20 bg-white/10'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:border-white/10 hover:bg-white/5'
        }`}
        title={viewMode === 'split' ? 'Close split view' : 'Open split view'}
        aria-label={
          viewMode === 'split' ? 'Close split view' : 'Open split view'
        }
      >
        {viewMode === 'split' ? (
          <Icons.Sidebar size={16} />
        ) : (
          <Icons.PanelRight size={16} />
        )}
      </button>
    </div>
  )
}

FloatingViewControls.propTypes = {
  viewMode: PropTypes.oneOf(['editor', 'preview', 'split']).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
}

export default FloatingViewControls
