/**
 * FilterBarV2 - Clean Architecture Implementation
 * Filter bar that works with V2 stores
 */

import React, { useMemo } from 'react'
import { Icons } from '../Icons'
import { useCleanUIStore } from '../../stores/cleanUIStore'
import { useSidebarContext } from '../sidebar/SidebarLogicProviderV2'

const FilterBarV2: React.FC = () => {
  const notebookFilter = useCleanUIStore(state => state.notebookFilter)
  const tagFilters = useCleanUIStore(state => state.tagFilters)
  const statusFilter = useCleanUIStore(state => state.statusFilter)
  const clearAllFilters = useCleanUIStore(state => state.clearAllFilters)
  const setNotebookFilter = useCleanUIStore(state => state.setNotebookFilter)
  const removeTagFilter = useCleanUIStore(state => state.removeTagFilter)
  const setStatusFilter = useCleanUIStore(state => state.setStatusFilter)

  const { getNotebook } = useSidebarContext()

  // Calculate if there are active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      notebookFilter ||
      tagFilters.length > 0 ||
      statusFilter
    )
  }, [notebookFilter, tagFilters, statusFilter])

  // Calculate filter count
  const filterCount = useMemo(() => {
    let count = 0
    if (notebookFilter) count++
    if (tagFilters.length > 0) count += tagFilters.length
    if (statusFilter) count++
    return count
  }, [notebookFilter, tagFilters, statusFilter])

  if (!hasActiveFilters) {
    return null
  }

  const notebookName = useMemo(() => {
    if (!notebookFilter) return null
    try {
      return getNotebook(notebookFilter)?.name || null
    } catch {
      return null
    }
  }, [notebookFilter, getNotebook])

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
              className="ml-1 hover:text-theme-accent-primary transition-colors"
            >
              <Icons.X size={12} />
            </button>
          </div>
        )}

        {/* Tag filters */}
        {tagFilters.map(tag => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-tertiary rounded-md text-xs"
          >
            <Icons.Hash size={12} />
            <span>{tag}</span>
            <button
              onClick={() => removeTagFilter(tag)}
              className="ml-1 hover:text-theme-accent-primary transition-colors"
            >
              <Icons.X size={12} />
            </button>
          </div>
        ))}

        {/* Status filter */}
        {statusFilter && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-theme-bg-tertiary rounded-md text-xs">
            <Icons.Circle size={12} />
            <span>{statusFilter}</span>
            <button
              onClick={() => setStatusFilter(null)}
              className="ml-1 hover:text-theme-accent-primary transition-colors"
            >
              <Icons.X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterBarV2