import React, { useEffect, useCallback, useState, useRef } from 'react'
import { Icons } from '../Icons'
import { cn } from '../../lib/utils'
import { editorLogger } from '../../utils/logger'

interface ZenModeProps {
  isActive: boolean
  onToggle: () => void
  children: React.ReactNode
  theme?: 'light' | 'dark' | 'auto'
}

export const ZenMode: React.FC<ZenModeProps> = ({
  isActive,
  onToggle,
  children,
  theme = 'auto',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const zenContainerRef = useRef<HTMLDivElement>(null)

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Enter/Exit fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      editorLogger.error('Fullscreen toggle failed:', error)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Esc to exit zen mode
      if (e.key === 'Escape' && isActive) {
        e.preventDefault()
        onToggle()
      }
      
      // Cmd/Ctrl + . to toggle zen mode
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        onToggle()
      }
      
      // F11 or Cmd/Ctrl + Shift + F for fullscreen
      if (e.key === 'F11' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F')) {
        e.preventDefault()
        if (isActive) {
          toggleFullscreen()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isActive, onToggle, toggleFullscreen])

  // Exit fullscreen when exiting zen mode
  useEffect(() => {
    if (!isActive && document.fullscreenElement) {
      document.exitFullscreen()
    }
  }, [isActive])

  if (!isActive) {
    return <>{children}</>
  }

  return (
    <div
      ref={zenContainerRef}
      className={cn(
        'fixed inset-0 z-50 bg-theme-bg-primary',
        'animate-fadeIn',
        isFullscreen && 'fullscreen'
      )}
      data-theme={theme}
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Zen Mode Header */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggle}
            className="text-theme-text-muted hover:text-theme-text-primary transition-colors"
            title="Exit zen mode (Esc)"
          >
            <Icons.X size={20} />
          </button>
          
          <span className="text-sm text-theme-text-muted">
            Zen Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-theme-text-muted hover:text-theme-text-primary transition-colors rounded hover:bg-theme-bg-secondary"
            title={isFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen (F11)'}
          >
            {isFullscreen ? (
              <Icons.Minimize size={18} />
            ) : (
              <Icons.Maximize size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="h-full pt-12" style={{ animation: 'slideUp 0.4s ease-out' }}>
        <div className="h-full max-w-4xl mx-auto px-8">
          <style>
            {`
              .zen-mode-active .editor-toolbar,
              .zen-mode-active .note-metadata,
              .zen-mode-active .sidebar,
              .zen-mode-active .floating-controls {
                display: none !important;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              
              @keyframes fadeInOut {
                0% { opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; }
              }
            `}
          </style>
          {children}
        </div>
      </div>

      {/* Writing Tips (shown briefly) */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{ animation: 'fadeInOut 5s ease-out forwards' }}
      >
        <div className="text-sm text-theme-text-muted opacity-50 text-center space-y-1">
          <p>Press <kbd className="px-1 py-0.5 bg-theme-bg-secondary rounded text-xs">Esc</kbd> to exit</p>
          <p>Press <kbd className="px-1 py-0.5 bg-theme-bg-secondary rounded text-xs">F11</kbd> for fullscreen</p>
        </div>
      </div>

    </div>
  )
}

export default ZenMode