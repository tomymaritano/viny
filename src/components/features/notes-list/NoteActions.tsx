/**
 * NoteActions - Action buttons for note items
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'
import IconButton from '../../ui/IconButton'
import { Note } from '../../../types'

interface NoteActionsProps {
  note: Note
  onPinToggle: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

const NoteActions: React.FC<NoteActionsProps> = ({
  note,
  onPinToggle,
  onDelete
}) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Pin/Unpin Button */}
      <IconButton
        icon={note.isPinned ? Icons.PinOff : Icons.Pin}
        onClick={onPinToggle}
        title={note.isPinned ? 'Unpin note' : 'Pin note'}
        size={14}
        variant="default"
        className={`hover:bg-theme-bg-tertiary ${
          note.isPinned ? 'text-theme-accent-orange' : 'text-theme-text-muted'
        }`}
      />
      
      {/* Delete Button */}
      <IconButton
        icon={Icons.Trash}
        onClick={onDelete}
        title="Move to trash"
        size={14}
        variant="default"
        className="hover:bg-theme-bg-tertiary text-theme-text-muted hover:text-theme-accent-red"
      />
    </div>
  )
}

export default NoteActions
