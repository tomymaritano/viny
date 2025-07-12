import React from 'react'
import { Notebook } from '../../types/notebook'
import Icons from '../Icons'

interface NotebookBreadcrumbsProps {
  currentNotebook: Notebook | null
  notebooks: Notebook[]
  onNavigate: (notebookName: string) => void
  className?: string
}

const NotebookBreadcrumbs: React.FC<NotebookBreadcrumbsProps> = ({
  currentNotebook,
  notebooks,
  onNavigate,
  className = ''
}) => {
  if (!currentNotebook) return null

  // Build breadcrumb path
  const buildBreadcrumbs = (): Notebook[] => {
    const path: Notebook[] = []
    let current: Notebook | undefined = currentNotebook

    while (current) {
      path.unshift(current)
      current = current.parentId ? notebooks.find(n => n.id === current!.parentId) : undefined
    }

    return path
  }

  const breadcrumbs = buildBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      <Icons.Book size={14} className="text-theme-text-muted" />
      
      {breadcrumbs.map((notebook, index) => (
        <React.Fragment key={notebook.id}>
          {index > 0 && (
            <Icons.ChevronRight size={12} className="text-theme-text-muted" />
          )}
          
          <button
            onClick={() => onNavigate(`notebook-${notebook.name.toLowerCase()}`)}
            className={`px-2 py-1 rounded transition-colors text-left ${
              index === breadcrumbs.length - 1
                ? 'text-theme-text-primary bg-theme-bg-tertiary cursor-default'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
            }`}
            disabled={index === breadcrumbs.length - 1}
          >
            <div className="flex items-center space-x-1">
              <div 
                className={`w-2 h-2 rounded-full ${notebook.color}`}
                style={{ backgroundColor: 
                  notebook.color === 'blue' ? '#3b82f6' : 
                  notebook.color === 'green' ? '#10b981' :
                  notebook.color === 'orange' ? '#f97316' :
                  notebook.color === 'yellow' ? '#eab308' :
                  notebook.color === 'red' ? '#ef4444' :
                  notebook.color === 'purple' ? '#a855f7' : '#06b6d4'
                }}
              />
              <span>{notebook.name}</span>
            </div>
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

export default NotebookBreadcrumbs