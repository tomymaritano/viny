/**
 * NoteStatusIndicator - Status indicator for notes
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import { Note } from '../../../types'

interface NoteStatusIndicatorProps {
  status: Note['status']
}

const STATUS_CONFIG = {
  draft: { color: 'bg-gray-400', label: 'Draft' },
  'in-progress': { color: 'bg-blue-400', label: 'In Progress' },
  review: { color: 'bg-yellow-400', label: 'Review' },
  completed: { color: 'bg-green-400', label: 'Completed' },
  archived: { color: 'bg-red-400', label: 'Archived' },
} as const

const NoteStatusIndicator: React.FC<NoteStatusIndicatorProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  
  return (
    <div
      className={`w-1.5 h-1.5 rounded-full ${config.color} flex-shrink-0`}
      title={`Status: ${config.label}`}
    />
  )
}

export default NoteStatusIndicator
