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
        height: '32px', // Más pequeño - 32px en lugar de 40px
        backgroundColor: 'transparent', // Transparente como el original
        zIndex: 1000,
        userSelect: 'none',
        cursor: 'default',
        pointerEvents: 'none', // Importante: none por defecto
      }}
    >
      {/* Drag area - only around window controls and empty areas */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '180px', // Área más pequeña que la original (200px)
          height: '100%',
          pointerEvents: 'auto',
          cursor: 'grab',
        }}
        onMouseDown={handleMouseDown}
      />
      {/* Additional drag area in the right side where there's empty space */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px', // Área más pequeña que la original (200px)
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