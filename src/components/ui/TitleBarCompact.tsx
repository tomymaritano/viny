import React from 'react'

interface TitleBarCompactProps {
  title?: string
}

const TitleBarCompact: React.FC<TitleBarCompactProps> = ({ title = 'Nototo' }) => {
  // Don't render anything if not in Electron
  if (typeof window === 'undefined' || !window.electronAPI) {
    return null
  }

  let isDragging = false
  let startX = 0
  let startY = 0

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking on empty area (not buttons)
    if ((e.target as Element).closest('button') || (e.target as Element).closest('a')) {
      return
    }
    
    isDragging = true
    startX = e.screenX
    startY = e.screenY
    
    // Start window dragging via IPC
    window.electronAPI.startWindowDrag({
      startX: e.screenX,
      startY: e.screenY
    })
    
    // Add temporary listeners
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return
      
      window.electronAPI.continueWindowDrag({
        currentX: event.screenX,
        currentY: event.screenY,
        deltaX: event.screenX - startX,
        deltaY: event.screenY - startY
      })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false
        window.electronAPI.endWindowDrag()
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="compact-titlebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px', // Más pequeño - 32px en lugar de 44px
        backgroundColor: 'rgba(37, 42, 48, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 1000,
        userSelect: 'none',
        cursor: 'default',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Drag area - left side around traffic lights */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '180px', // Área más pequeña
          height: '100%',
          pointerEvents: 'auto',
          cursor: 'grab',
        }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Title */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '13px', // Texto más pequeño
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.8)',
          pointerEvents: 'none',
        }}
      >
        {title}
      </div>
      
      {/* Additional drag area on the right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px', // Área más pequeña
          height: '100%',
          pointerEvents: 'auto',
          cursor: 'grab',
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

export default TitleBarCompact