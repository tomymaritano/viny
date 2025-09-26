import React from 'react'
import { Icons } from '../Icons'
import NotesHeader from './NotesHeader'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface EmptyNotesStateProps {
  title: string
  currentSection: string
  currentSortBy: SortField
  currentSortDirection: SortDirection
  onSort: (field: SortField, direction: SortDirection) => void
  onNewNote: () => void
}

const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({
  title,
  currentSection,
  currentSortBy,
  currentSortDirection,
  onSort,
  onNewNote,
}) => {
  const getEmptyStateContent = () => {
    if (currentSection === 'trash') {
      return {
        title: 'Trash is empty',
        description:
          'Deleted notes will appear here. You can restore them or delete them permanently.',
        showCreateButton: false,
      }
    }

    if (currentSection?.startsWith('tag-')) {
      const tagName = currentSection.replace('tag-', '')
      return {
        title: 'No notes found',
        description: `No notes with the tag "${tagName}" yet.`,
        showCreateButton: true,
      }
    }

    if (currentSection?.startsWith('notebook-')) {
      return {
        title: 'No notes found',
        description: 'No notes in this notebook yet.',
        showCreateButton: true,
      }
    }

    return {
      title: 'No notes found',
      description: 'Create your first note to get started with Viny.',
      showCreateButton: true,
    }
  }

  const {
    title: emptyTitle,
    description,
    showCreateButton,
  } = getEmptyStateContent()

  return (
    <div className="h-full flex flex-col bg-theme-bg-primary">
      {/* Header */}
      <NotesHeader
        title={title}
        notesCount={0}
        currentSortBy={currentSortBy}
        currentSortDirection={currentSortDirection}
        onSort={onSort}
        onNewNote={onNewNote}
      />

      {/* Empty state content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-theme-bg-secondary/30 rounded-full flex items-center justify-center">
            <Icons.NotebookText
              size={32}
              className="text-theme-text-muted/50"
            />
          </div>
          <h3 className="text-xl font-medium text-theme-text-secondary mb-3">
            {emptyTitle}
          </h3>
          <p className="text-sm text-theme-text-muted mb-6 leading-relaxed">
            {description}
          </p>

          {showCreateButton && (
            <div className="space-y-4">
              <button
                onClick={onNewNote}
                className="px-6 py-3 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors font-medium"
              >
                <Icons.Plus size={16} className="inline mr-2" />
                Create your first note
              </button>

              <div className="text-xs text-theme-text-muted">
                <div className="flex items-center justify-center gap-2">
                  <span>Press</span>
                  <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
                    N
                  </kbd>
                  <span className="ml-1">to create a note, or</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span>Press</span>
                  <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-theme-bg-tertiary text-theme-text-muted rounded text-xs">
                    K
                  </kbd>
                  <span className="ml-1">to search</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyNotesState
