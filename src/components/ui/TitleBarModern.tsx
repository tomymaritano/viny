import React, { useEffect } from 'react'

interface TitleBarModernProps {
  title?: string
}

/**
 * Modern TitleBar component using CSS -webkit-app-region
 * This is the recommended Electron approach - much more efficient
 * than manual IPC-based dragging
 */
const TitleBarModern: React.FC<TitleBarModernProps> = ({ 
  title = 'Nototo'
}) => {
  useEffect(() => {
    // Add platform and app type classes to body for CSS targeting
    if (typeof window !== 'undefined') {
      const body = document.body
      
      // Add platform class
      if (window.electronAPI) {
        body.classList.add('electron-app')
        body.classList.add(`platform-${window.electronAPI.platform}`)
        
        // Debug info in development
        if (process.env.NODE_ENV === 'development') {
          console.log('TitleBar: Electron detected, platform:', window.electronAPI.platform)
          console.log('TitleBar: Body classes added:', body.className)
        }
      } else {
        body.classList.add('web-app')
        
        if (process.env.NODE_ENV === 'development') {
          console.log('TitleBar: Web mode detected')
        }
      }
      
      // Cleanup function
      return () => {
        body.classList.remove('electron-app', 'web-app')
        body.classList.remove(`platform-${window.electronAPI?.platform}`)
      }
    }
  }, [])

  // In web environment, render a simple non-draggable header
  if (typeof window === 'undefined' || !window.electronAPI) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '44px',
          background: 'linear-gradient(135deg, rgba(37, 42, 48, 0.95), rgba(42, 47, 54, 0.95))',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '20px',
          zIndex: 1000,
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.2px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        {title} (Web Mode)
      </div>
    )
  }

  return (
    <>
      {/* Main titlebar */}
      <div 
        className="electron-titlebar"
        onMouseEnter={(e) => {
          // Visual feedback for draggable area
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(47, 52, 58, 0.98), rgba(52, 57, 64, 0.98))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37, 42, 48, 0.95), rgba(42, 47, 54, 0.95))'
        }}
      >
        <div className="title">
          {title}
          {process.env.NODE_ENV === 'development' && (
            <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px' }}>
              [Draggable Area]
            </span>
          )}
        </div>
        
        <div className="window-controls">
          {/* Future window controls can go here */}
          {process.env.NODE_ENV === 'development' && (
            <span style={{ fontSize: '10px', opacity: 0.5 }}>
              No-drag zone
            </span>
          )}
        </div>
      </div>

      {/* Invisible overlay for better drag UX */}
      <div 
        className="electron-titlebar-overlay"
        title="Drag here to move window"
      />
    </>
  )
}

export default TitleBarModern