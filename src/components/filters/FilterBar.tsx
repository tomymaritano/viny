import React from 'react'
import { Icons } from '../Icons'
import { useAppStore } from '../../stores/newSimpleStore'
import { useNotebooks } from '../../hooks/useNotebooks'

const FilterBar: React.FC = () => {
  const {
    notebookFilter,
    tagFilters,
    statusFilter,
    clearAllFilters,
    setNotebookFilter,
    removeTagFilter,
    setStatusFilter,
    hasActiveFilters,
    getActiveFilterCount,
  } = useAppStore()

  const { getNotebook } = useNotebooks()

  if (!hasActiveFilters()) {
    return null
  }

  const notebookName = notebookFilter ? getNotebook(notebookFilter)?.name : null
  const filterCount = getActiveFilterCount()

  return (
    <div className="px-3 py-2 bg-theme-bg-secondary border-b border-theme-border-primary">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
          <Icons.Filter size={14} />
          <span>Active filters ({filterCount})</span>
        </div>

        <button
          onClick={clearAllFilters}
          className="text-xs text-theme-text-muted hover:text-theme-text-primary transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {/* Notebook filter */}
        {notebookName && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-tertiary rounded-md text-xs">
            <Icons.Book size={12} />
            <span>{notebookName}</span>
            <button
              onClick={() => setNotebookFilter(null)}
              className="ml-1 hover:text-theme-text-primary transition-colors"
            >
              <Icons.X size={10} />
            </button>
          </div>
        )}

        {/* Tag filters */}
        {tagFilters.map(tag => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-tertiary rounded-md text-xs"
          >
            <Icons.Tag size={12} />
            <span>{tag}</span>
            <button
              onClick={() => removeTagFilter(tag)}
              className="ml-1 hover:text-theme-text-primary transition-colors"
            >
              <Icons.X size={10} />
            </button>
          </div>
        ))}

        {/* Status filter */}
        {statusFilter && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-tertiary rounded-md text-xs">
            <Icons.FileChartLine size={12} />
            <span>{statusFilter}</span>
            <button
              onClick={() => setStatusFilter(null)}
              className="ml-1 hover:text-theme-text-primary transition-colors"
            >
              <Icons.X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterBar
