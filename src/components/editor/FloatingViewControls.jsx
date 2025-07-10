import { Eye, EyeOff, PanelRightOpen, PanelRightClose } from 'lucide-react'
import PropTypes from 'prop-types'

const FloatingViewControls = ({ viewMode, onViewModeChange }) => {
  const handlePreviewOnlyToggle = () => {
    onViewModeChange(viewMode === 'preview' ? 'editor' : 'preview')
  }

  const handleSplitToggle = () => {
    onViewModeChange(viewMode === 'split' ? 'editor' : 'split')
  }

  const buttonBaseStyle =
    'p-2 rounded-full transition-all duration-300 border border-white/10 shadow-lg'

  const getButtonStyle = isActive => ({
    backgroundColor: isActive
      ? 'rgba(50, 61, 75, 0.7)'
      : 'rgba(50, 61, 75, 0.15)',
    '--tw-shadow-color': '#323D4B',
  })

  const handleMouseEnter = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'rgba(50, 61, 75, 0.25)'
    }
  }

  const handleMouseLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'rgba(50, 61, 75, 0.15)'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Preview Only Button */}
      <button
        onClick={handlePreviewOnlyToggle}
        className={`${buttonBaseStyle} ${
          viewMode === 'preview'
            ? 'text-white shadow-[#323D4B]/25'
            : 'text-theme-text-primary hover:scale-105 shadow-[#323D4B]/10'
        }`}
        style={getButtonStyle(viewMode === 'preview')}
        onMouseEnter={e => handleMouseEnter(e, viewMode === 'preview')}
        onMouseLeave={e => handleMouseLeave(e, viewMode === 'preview')}
        title={viewMode === 'preview' ? 'Close preview' : 'Open preview only'}
      >
        {viewMode === 'preview' ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Split View Button */}
      <button
        onClick={handleSplitToggle}
        className={`${buttonBaseStyle} ${
          viewMode === 'split'
            ? 'text-white shadow-[#323D4B]/25'
            : 'text-theme-text-primary hover:scale-105 shadow-[#323D4B]/10'
        }`}
        style={getButtonStyle(viewMode === 'split')}
        onMouseEnter={e => handleMouseEnter(e, viewMode === 'split')}
        onMouseLeave={e => handleMouseLeave(e, viewMode === 'split')}
        title={viewMode === 'split' ? 'Close split view' : 'Open split view'}
      >
        {viewMode === 'split' ? (
          <PanelRightClose size={16} />
        ) : (
          <PanelRightOpen size={16} />
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
