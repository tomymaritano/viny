import React, { useState } from 'react'

interface ResizeHandleProps {
  onMouseDown: (clientX: number) => void
  position?: 'right' | 'left'
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown, position = 'right' }) => {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Only handle left mouse button
    if (e.button !== 0) return

    // Prevent event bubbling to parent elements
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    onMouseDown(e.clientX)

    const handleMouseUp = (): void => {
      setIsDragging(false)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className={`
        absolute ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-4
        cursor-col-resize z-40 group pointer-events-auto
        ${isHovering || isDragging ? 'bg-theme-accent-primary/30' : 'bg-transparent'}
        hover:bg-theme-accent-primary/30 transition-colors duration-150
      `}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        transform:
          position === 'right' ? 'translateX(2px)' : 'translateX(-2px)',
      }}
      title={`Drag to resize ${position === 'right' ? 'notes list' : 'preview panel'}`}
    >
      {/* Visual indicator line */}
      <div
        className={`
          absolute ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-0.5
          ${isHovering || isDragging ? 'bg-theme-accent-primary' : 'bg-transparent'}
          transition-all duration-150
        `}
      />

      {/* Grip handle - always visible for testing */}
      <div
        className={`
          absolute top-1/2 transform -translate-y-1/2 
          ${position === 'right' ? 'right-0.5' : 'left-0.5'}
          w-3 h-12 rounded-sm flex items-center justify-center
          ${isHovering || isDragging ? 'bg-theme-accent-primary' : 'bg-theme-bg-tertiary'}
          transition-all duration-150 opacity-60 group-hover:opacity-100
          border border-theme-border-primary
        `}
      >
        {/* Grip dots */}
        <div className="flex flex-col space-y-1">
          <div className="w-1 h-1 bg-solarized-base5 rounded-full"></div>
          <div className="w-1 h-1 bg-solarized-base5 rounded-full"></div>
          <div className="w-1 h-1 bg-solarized-base5 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default ResizeHandle
