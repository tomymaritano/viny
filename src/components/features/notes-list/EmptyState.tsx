/**
 * EmptyState - Empty state component for different scenarios
 * Extracted from NotesListSimple.tsx
 */

import React from 'react'
import Icons from '../../Icons'
import StyledButton from '../../ui/StyledButton'

interface EmptyStateProps {
  type: 'initial' | 'no-results' | 'trash' | 'search'
  currentSection?: string
  searchTerm?: string
  onNewNote: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  currentSection, 
  searchTerm,
  onNewNote 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'initial':
        return {
          icon: <Icons.FileText size={48} className="text-theme-text-muted" />,
          title: "Welcome to Nototo",
          message: "Start by creating your first note",
          showButton: true,
          buttonText: "Create New Note"
        }

      case 'no-results':
        return {
          icon: <Icons.Search size={48} className="text-theme-text-muted" />,
          title: "No notes found",
          message: searchTerm 
            ? `No notes match "${searchTerm}"`
            : `No notes in ${currentSection || 'this section'}`,
          showButton: type !== 'search',
          buttonText: "Create New Note"
        }

      case 'search':
        return {
          icon: <Icons.Search size={48} className="text-theme-text-muted" />,
          title: "No results found",
          message: searchTerm 
            ? `No notes match "${searchTerm}". Try different keywords or create a new note.`
            : "Try different search terms",
          showButton: true,
          buttonText: "Create New Note"
        }

      case 'trash':
        return {
          icon: <Icons.Trash size={48} className="text-theme-text-muted" />,
          title: "Trash is empty",
          message: "Deleted notes will appear here",
          showButton: false,
          buttonText: ""
        }

      default:
        return {
          icon: <Icons.FileText size={48} className="text-theme-text-muted" />,
          title: "No notes",
          message: "No notes available",
          showButton: true,
          buttonText: "Create New Note"
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          {content.icon}
        </div>
        
        <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
          {content.title}
        </h3>
        
        <p className="text-theme-text-secondary mb-6 leading-relaxed">
          {content.message}
        </p>
        
        {content.showButton && (
          <StyledButton
            variant="primary"
            onClick={onNewNote}
            className="px-6 py-3"
          >
            <Icons.Plus size={16} className="mr-2" />
            {content.buttonText}
          </StyledButton>
        )}
      </div>
    </div>
  )
}

export default EmptyState
