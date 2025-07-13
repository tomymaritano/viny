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
      } else {
        body.classList.add('web-app')
      }
      
      // Cleanup function
      return () => {
        body.classList.remove('electron-app', 'web-app')
        body.classList.remove(`platform-${window.electronAPI?.platform}`)
      }
    }
  }, [])

  // Don't render anything if not in Electron
  if (typeof window === 'undefined' || !window.electronAPI) {
    return null
  }

  return (
    <>
      {/* Main titlebar */}
      <div className="electron-titlebar">
        <div className="title">
          {title}
        </div>
        
        <div className="window-controls">
          {/* Future window controls can go here */}
          {/* For now, this is just a non-draggable area */}
        </div>
      </div>

      {/* Invisible overlay for better drag UX */}
      <div className="electron-titlebar-overlay" />
    </>
  )
}

export default TitleBarModern