import React, { useState, useRef, useEffect } from 'react'
import { Note } from '../../types'
import { Icons } from '../Icons'
import StandardDropdown from './StandardDropdown'

interface NoteActionsDropdownProps {
  note: Note
  onPinToggle: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onDelete: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onDuplicate?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onMoveToNotebook?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onRestoreNote?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  onPermanentDelete?: (e: React.MouseEvent, note: Note) => void | Promise<void>
  isTrashView?: boolean
  children: React.ReactNode
  className?: string
}

const NoteActionsDropdown: React.FC<NoteActionsDropdownProps> = ({
  note,
  onPinToggle,
  onDelete,
  onDuplicate,
  onMoveToNotebook,
  onRestoreNote,
  onPermanentDelete,
  isTrashView = false,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if we're in test environment - force web dropdown for E2E tests
    const isTestEnvironment = window.navigator.userAgent.includes('Playwright') || 
                              window.navigator.userAgent.includes('Test') ||
                              process.env.NODE_ENV === 'test'
    
    // Check if we're in Electron and should use native context menu
    if (window.electronAPI?.isElectron && !isTestEnvironment) {
      window.electronAPI.showNoteContextMenu(note)
    } else {
      // Use the exact click position for web version
      setPosition({
        x: e.clientX,
        y: e.clientY
      })
      
      // Add small delay to ensure state updates are processed properly for tests
      setTimeout(() => {
        setIsOpen(true)
      }, 10)
    }
  }

  const handleAction = (action: (e: React.MouseEvent, note: Note) => void | Promise<void>) => {
    return async (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsOpen(false)
      
      try {
        await action(e, note)
      } catch (error) {
        console.error('Error executing note action:', error)
        // The action handlers already show error messages to the user
      }
    }
  }

  const dropdownItems = isTrashView ? [
    // Trash view menu items
    {
      icon: <Icons.RotateCcw size={16} />,
      label: 'Restore Note',
      onClick: handleAction(onRestoreNote!),
      testId: 'restore-note-button'
    },
    { type: 'separator' as const },
    {
      icon: <Icons.Trash size={16} />,
      label: 'Delete Permanently',
      onClick: handleAction(onPermanentDelete!),
      variant: 'danger' as const,
      testId: 'permanent-delete-button'
    }
  ] : [
    // Normal view menu items
    {
      icon: <Icons.Pin size={16} className={note.isPinned ? 'text-theme-accent-primary' : ''} />,
      label: note.isPinned ? 'Unpin note' : 'Pin to top',
      onClick: handleAction(onPinToggle),
      testId: 'pin-note-button'
    },
    ...(onDuplicate ? [{
      icon: <Icons.Copy size={16} />,
      label: 'Duplicate note',
      onClick: handleAction(onDuplicate),
      testId: 'duplicate-note-button'
    }] : []),
    ...(onMoveToNotebook ? [{
      icon: <Icons.Move size={16} />,
      label: 'Move to notebook',
      onClick: handleAction(onMoveToNotebook),
      testId: 'move-note-button'
    }] : []),
    { type: 'separator' as const },
    {
      icon: <Icons.Trash size={16} />,
      label: 'Move to trash',
      onClick: handleAction(onDelete),
      variant: 'danger' as const,
      testId: 'delete-note-button'
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
        data-testid="note-actions-dropdown"
      />
    </div>
  )
}

export default NoteActionsDropdown