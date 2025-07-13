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
        height: '22px', // Más pequeño - 32px en lugar de 40px
        backgroundColor: 'rgba(255, 0, 0, 0.3)', // TEMPORAL: Rojo semi-transparente para testing
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
          backgroundColor: 'rgba(0, 255, 0, 0.2)', // TEMPORAL: Verde para área de drag izquierda
          border: '1px solid green',
        }}
        onMouseDown={handleMouseDown}
        title="DRAG AREA LEFT - 180px"
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
          backgroundColor: 'rgba(0, 0, 255, 0.2)', // TEMPORAL: Azul para área de drag derecha
          border: '1px solid blue',
        }}
        onMouseDown={handleMouseDown}
        title="DRAG AREA RIGHT - 180px"
      />
      
      {/* TEMPORAL: Info label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px black',
          pointerEvents: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}
      >
        TITLEBAR: 32px height | DRAG: 180px left + 180px right
      </div>
    </div>
  )
}

export default TitleBarCompact