import React from 'react'
import { Icons } from '../Icons'

interface ElectronTitleBarProps {
  title?: string
  onMinimize?: () => void
  onMaximize?: () => void
  onClose?: () => void
}

const ElectronTitleBar: React.FC<ElectronTitleBarProps> = ({
  title = 'Viny',
  onMinimize,
  onMaximize,
  onClose,
}) => {
  const isElectron =
    typeof window !== 'undefined' && (window.electronAPI || window.electron)

  // Get platform safely
  const platform = React.useMemo(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.platform) {
      return window.electronAPI.platform
    }
    return 'darwin' // Default to macOS for web/unknown
  }, [])

  if (!isElectron) {
    return null
  }

  // Add electron and platform classes to body for CSS targeting
  React.useEffect(() => {
    if (isElectron) {
      document.body.classList.add('electron')
      if (platform) {
        document.body.classList.add(`platform-${platform}`)
      }
    }
    return () => {
      document.body.classList.remove('electron')
      document.body.classList.remove('platform-darwin')
      document.body.classList.remove('platform-win32')
      document.body.classList.remove('platform-linux')
    }
  }, [isElectron, platform])

  return (
    <div
      className="electron-titlebar"
      style={{
        width: '100%',
        height: '30px',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        WebkitAppRegion: 'drag',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        borderBottom: '1px solid #333',
      }}
    >
      {/* Left side - Empty for macOS */}
      <div style={{ width: '70px' }} />

      {/* Center - Title */}
      <div
        style={{
          fontSize: '13px',
          color: '#ffffff',
          fontWeight: 500,
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {title}
      </div>

      {/* Right side - Window controls (for Windows/Linux) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          WebkitAppRegion: 'no-drag',
        }}
      >
        {platform !== 'darwin' && (
          <>
            <button
              onClick={onMinimize}
              style={{
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#333'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icons.Minus size={12} />
            </button>

            <button
              onClick={onMaximize}
              style={{
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#333'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icons.Square size={12} />
            </button>

            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#e74c3c'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icons.X size={12} />
            </button>
          </>
        )}

        {/* For macOS, just add some padding */}
        {platform === 'darwin' && <div style={{ width: '70px' }} />}
      </div>
    </div>
  )
}

export default ElectronTitleBar
