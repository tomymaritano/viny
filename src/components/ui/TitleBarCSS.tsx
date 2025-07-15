import React from 'react'

interface TitleBarCSSProps {
  title?: string
  className?: string
}

/**
 * Modern TitleBar component using CSS -webkit-app-region
 * This is the recommended Electron approach for window dragging
 * Much more efficient than manual IPC-based dragging
 */
const TitleBarCSS: React.FC<TitleBarCSSProps> = ({ 
  title = 'Viny',
  className = ''
}) => {
  // Don't render anything if not in Electron
  if (typeof window === 'undefined' || !window.electronAPI) {
    return null
  }

  return (
    <>
      {/* CSS for the draggable region */}
      <style jsx>{`
        .titlebar-drag {
          -webkit-app-region: drag;
        }
        
        .titlebar-no-drag {
          -webkit-app-region: no-drag;
        }
        
        .titlebar-drag * {
          -webkit-app-region: no-drag;
        }
        
        .titlebar-drag .draggable-area {
          -webkit-app-region: drag;
        }
      `}</style>

      {/* Main titlebar container */}
      <div
        className={`titlebar-drag ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: 'transparent',
          zIndex: 1000,
          userSelect: 'none',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '80px', // Space for traffic lights
          paddingRight: '20px',
        }}
      >
        {/* Left side - draggable area */}
        <div 
          className="draggable-area"
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '20px',
          }}
        >
          {/* App title */}
          <span 
            className="draggable-area"
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-text-secondary, #888)',
              opacity: 0.8,
            }}
          >
            {title}
          </span>
        </div>

        {/* Right side - for future window controls if needed */}
        <div 
          className="titlebar-no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '100%',
          }}
        >
          {/* Future window controls can go here */}
          {/* For now, this area is non-draggable for potential buttons */}
        </div>
      </div>

      {/* Invisible draggable area covering full width for better UX */}
      <div
        className="draggable-area"
        style={{
          position: 'fixed',
          top: '0',
          left: '80px', // After traffic lights
          right: '0',
          height: '30px', // Slightly less than titlebar
          zIndex: 999,
          pointerEvents: 'auto',
          cursor: 'default',
        }}
      />
    </>
  )
}

export default TitleBarCSS