import React, { useState, useRef, useEffect } from 'react'
import { Note } from '../../types'
import Icons from '../Icons'
import StandardDropdown from './StandardDropdown'

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Use the exact click position
    setPosition({
      x: e.clientX,
      y: e.clientY
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

  const dropdownItems = [
    {
      icon: <Icons.Pin size={16} className={note.isPinned ? 'text-theme-accent-primary' : ''} />,
      label: note.isPinned ? 'Unpin note' : 'Pin to top',
      onClick: handleAction(onPinToggle)
    },
    ...(onDuplicate ? [{
      icon: <Icons.Copy size={16} />,
      label: 'Duplicate note',
      onClick: handleAction(onDuplicate)
    }] : []),
    ...(onMoveToNotebook ? [{
      icon: <Icons.Move size={16} />,
      label: 'Move to notebook',
      onClick: handleAction(onMoveToNotebook)
    }] : []),
    { type: 'separator' as const },
    {
      icon: <Icons.Trash size={16} />,
      label: 'Move to trash',
      onClick: handleAction(onDelete),
      variant: 'danger' as const
    }
  ]

  return (
    <div 
      className={`relative ${className}`} 
      onContextMenu={handleContextMenu}
    >
      {children}

      <StandardDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={dropdownItems}
        width="md"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </div>
  )
}

export default NoteActionsDropdown