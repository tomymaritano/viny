import React from 'react'
import PropTypes from 'prop-types'
import { Icons } from '../Icons'

const FloatingViewControls = ({
  viewMode,
  onViewModeChange,
  splitRatio = 50,
}) => {
  // Split view toggle - always toggles split on/off
  const handleSplitToggle = () => {
    if (viewMode === 'split') {
      // If we're in split, go back to editor
      onViewModeChange('editor')
    } else {
      // If we're in editor or preview, go to split
      onViewModeChange('split')
    }
  }

  // Editor/Preview toggle - switches between editor and preview
  const handleEditorPreviewToggle = () => {
    switch (viewMode) {
      case 'editor':
        onViewModeChange('preview')
        break
      case 'preview':
        onViewModeChange('editor')
        break
      case 'split':
        // When in split view, this button switches to preview only
        onViewModeChange('preview')
        break
      default:
        onViewModeChange('editor')
    }
  }

  const getEditorPreviewIcon = () => {
    // Show the icon for what we'll switch TO
    if (viewMode === 'preview') {
      return Icons.Edit // Will switch to editor
    } else {
      return Icons.Eye // Will switch to preview
    }
  }

  const getEditorPreviewTitle = () => {
    switch (viewMode) {
      case 'editor':
        return 'Switch to Preview'
      case 'preview':
        return 'Switch to Editor'
      case 'split':
        return 'Switch to Preview Only'
      default:
        return 'Toggle Editor/Preview'
    }
  }

  const buttonStyle = `
    p-2.5 rounded-full bg-black/30 backdrop-blur-sm border
    transition-all duration-200 shadow-lg hover:shadow-xl
    hover:scale-105 active:scale-95
  `

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {/* Split View Toggle */}
      <button
        onClick={handleSplitToggle}
        className={`${buttonStyle} ${
          viewMode === 'split'
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-white/20 text-white/80 hover:text-white hover:border-white/30'
        }`}
        title={viewMode === 'split' ? 'Exit Split View' : 'Toggle Split View'}
        aria-label={
          viewMode === 'split' ? 'Exit Split View' : 'Toggle Split View'
        }
        data-testid="split-view-toggle"
      >
        {viewMode === 'split' && splitRatio > 50 ? (
          <Icons.PanelLeft size={18} />
        ) : (
          <Icons.PanelRight size={18} />
        )}
      </button>

      {/* Editor/Preview Toggle */}
      <button
        onClick={handleEditorPreviewToggle}
        className={`${buttonStyle} border-white/20 text-white/80 hover:text-white hover:border-white/30`}
        title={getEditorPreviewTitle()}
        aria-label={getEditorPreviewTitle()}
        data-testid="preview-toggle"
      >
        {React.createElement(getEditorPreviewIcon(), { size: 18 })}
      </button>
    </div>
  )
}

FloatingViewControls.propTypes = {
  viewMode: PropTypes.oneOf(['editor', 'preview', 'split']).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  splitRatio: PropTypes.number,
}

export default FloatingViewControls
