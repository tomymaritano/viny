import React from 'react'
import { Icons } from '../Icons'

const EmptyNoteState: React.FC = () => {
  return (
    <div className="flex-1 bg-theme-bg-primary flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-theme-bg-secondary/30 rounded-full flex items-center justify-center">
          <Icons.FileText size={40} className="text-theme-text-muted" />
        </div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-2">
          No Note Selected
        </h3>
        <p className="text-theme-text-secondary mb-6">
          Select a note from the list to view its content, or create a new note
          to get started.
        </p>
        <div className="text-xs text-theme-text-muted">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icons.Command size={12} />
              <span>+</span>
              <span className="font-mono">N</span>
              <span>New note</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icons.Command size={12} />
              <span>+</span>
              <span className="font-mono">K</span>
              <span>Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyNoteState
