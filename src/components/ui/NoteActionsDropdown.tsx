import React, { useState, useRef, useEffect } from 'react'
import { Note } from '../../types'
import Icons from '../Icons'

interface NoteActionsDropdownProps {
  note: Note
  onPinToggle: (e: React.MouseEvent, note: Note) => void
  onDelete: (e: React.MouseEvent, note: Note) => void
  onDuplicate?: (e: React.MouseEvent, note: Note) => void
  onMoveToNotebook?: (e: React.MouseEvent, note: Note) => void
  children: React.ReactNode
  className?: string
}

const NoteActionsDropdown: React.FC<NoteActionsDropdownProps> = ({
  note,
  onPinToggle,
  onDelete,
  onDuplicate,
  onMoveToNotebook,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Get click position relative to the viewport
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsOpen(true)
  }

  const handleAction = (action: (e: React.MouseEvent, note: Note) => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsOpen(false)
      action(e, note)
    }
  }

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onContextMenu={handleContextMenu}
    >
      {children}

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute z-50 min-w-48 bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
        >
          
          {/* Pin/Unpin */}
          <button
            onClick={handleAction(onPinToggle)}
            className="w-full px-3 py-2 text-left text-sm text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors flex items-center gap-3"
          >
            <Icons.Pin size={16} className={note.isPinned ? 'text-theme-accent-primary' : ''} />
            {note.isPinned ? 'Unpin note' : 'Pin to top'}
          </button>

          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={handleAction(onDuplicate)}
              className="w-full px-3 py-2 text-left text-sm text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors flex items-center gap-3"
            >
              <Icons.Copy size={16} />
              Duplicate note
            </button>
          )}

          {/* Move to notebook */}
          {onMoveToNotebook && (
            <button
              onClick={handleAction(onMoveToNotebook)}
              className="w-full px-3 py-2 text-left text-sm text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors flex items-center gap-3"
            >
              <Icons.Move size={16} />
              Move to notebook
            </button>
          )}

          {/* Separator */}
          <div className="h-px bg-theme-border-primary my-1" />

          {/* Delete */}
          <button
            onClick={handleAction(onDelete)}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
          >
            <Icons.Trash size={16} />
            Move to trash
          </button>
        </div>
      )}
    </div>
  )
}

export default NoteActionsDropdown