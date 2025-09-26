/**
 * NotesListWrapper - Conditionally renders V1 or V2 based on feature flag
 */

import React from 'react'
import { featureFlags } from '../../config/featureFlags'
import NotesListSimpleQuery from './NotesListSimpleQuery'
import NotesListV2 from './NotesListV2'
import QueryErrorBoundaryWrapper from '../errors/QueryErrorBoundary'
import UIErrorBoundary from '../errors/UIErrorBoundary'
import type { Note } from '../../types'

interface NotesListWrapperProps {
  selectedNoteId?: string
  onOpenNote: (noteId: string) => void
  onNewNote: () => void
  onMoveToNotebook?: (note: Note) => void
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  currentSection?: string
  isTrashView?: boolean
  onSortNotes?: (sortBy: string) => void
}

/**
 * Wrapper component that selects the appropriate NotesList implementation
 * based on the feature flag for clean architecture
 */
const NotesListWrapper: React.FC<NotesListWrapperProps> = (props) => {
  // Use V2 if clean architecture is enabled
  if (featureFlags.useCleanArchitecture) {
    // V2 has a simpler interface - only needs onNewNote
    return (
      <QueryErrorBoundaryWrapper>
        <UIErrorBoundary componentName="NotesList">
          <NotesListV2 onNewNote={props.onNewNote} />
        </UIErrorBoundary>
      </QueryErrorBoundaryWrapper>
    )
  }
  
  // Otherwise use the existing V1 implementation
  return <NotesListSimpleQuery {...props} />
}

export default NotesListWrapper