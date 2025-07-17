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
        absolute ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-1
        cursor-col-resize z-40 group
        hover:bg-theme-accent-primary/20 transition-all duration-200
        ${isDragging ? 'bg-theme-accent-primary/30 w-1' : ''}
      `}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      title="Drag to resize"
    >
      {/* Subtle line that appears on hover */}
      <div
        className={`
          absolute ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full
          transition-all duration-200
          ${isHovering || isDragging 
            ? 'w-0.5 bg-theme-accent-primary' 
            : 'w-px bg-theme-border-primary/50'
          }
        `}
      />
    </div>
  )
}

export default ResizeHandle
