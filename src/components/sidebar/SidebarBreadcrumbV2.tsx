/**
 * SidebarBreadcrumbV2 - Clean Architecture Implementation
 * Breadcrumb navigation that works with V2 context
 */

import React, { useMemo, memo } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Icons } from '../Icons'
import { useCleanUIStore } from '../../stores/cleanUIStore'
import { useSelectedNoteQueryV2 } from '../../hooks/queries/useNotesServiceQueryV2'

interface SidebarBreadcrumbV2Props {
  onNotebookClick?: (notebookId: string) => void
  focusedNotebookId?: string | null
  onExitFocus?: () => void
  getNotebook: (id: string) => any
}

const SidebarBreadcrumbV2: React.FC<SidebarBreadcrumbV2Props> = ({
  onNotebookClick,
  focusedNotebookId,
  onExitFocus,
  getNotebook,
}) => {
  const selectedNoteId = useCleanUIStore(state => state.selectedNoteId)
  const sidebarWidth = useCleanUIStore(state => state.sidebarWidth)
  const { data: currentNote } = useSelectedNoteQueryV2(selectedNoteId || '')

  // Get current notebook - either from focus mode or from current note
  const currentNotebook = useMemo(() => {
    // In focus mode, always show the focused notebook
    if (focusedNotebookId) {
      return getNotebook(focusedNotebookId)
    }

    // Only show breadcrumb if we have a note with a notebook
    if (currentNote?.notebook) {
      return getNotebook(currentNote.notebook)
    }

    return null
  }, [currentNote, getNotebook, focusedNotebookId])

  // Check if sidebar is collapsed
  const isSidebarCollapsed = sidebarWidth < 100

  // Check if we're in Electron
  const isElectron =
    typeof window !== 'undefined' && window.electronAPI?.isElectron
  const platform = typeof window !== 'undefined' && window.electronAPI?.platform

  // Adjust sticky position for macOS
  const stickyClass =
    isElectron && platform === 'darwin' ? 'sticky top-8' : 'sticky top-0'

  // Only show breadcrumb when inside a notebook
  if (!currentNotebook && !focusedNotebookId) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={`${stickyClass} z-20 bg-theme-bg-primary border-b border-theme-border-primary overflow-hidden flex items-center justify-between ${
        isSidebarCollapsed
          ? 'opacity-0 scale-95 -translate-x-2'
          : 'opacity-100 scale-100 translate-x-0'
      }`}
    >
      <div className="flex items-center text-xs px-3 py-2 min-w-0 flex-1">
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {currentNotebook ? (
              <div
                key={`breadcrumb-${currentNotebook.id}`}
                className="flex items-center w-full"
              >
                {/* Show only icon for "All Notes" when in focus mode */}
                {focusedNotebookId && onExitFocus && (
                  <>
                    <button
                      onClick={onExitFocus}
                      className="text-theme-text-muted hover:text-theme-text-primary transition-colors duration-150 p-1"
                      title="All Notes"
                    >
                      <Icons.FileText size={14} />
                    </button>
                    <Icons.ChevronRight
                      size={12}
                      className="mx-1 text-theme-text-muted"
                    />
                  </>
                )}

                <Icons.Book
                  size={14}
                  className="text-theme-text-muted mr-1.5 flex-shrink-0 transition-transform duration-150 hover:scale-110"
                />

                <button
                  onClick={() => {
                    if (onNotebookClick) {
                      onNotebookClick(currentNotebook.id)
                    }
                  }}
                  className="text-theme-text-primary hover:text-theme-accent-primary font-medium flex items-center group transition-colors duration-150 truncate cursor-pointer"
                  title={currentNotebook.name}
                >
                  <motion.span
                    layoutId={`notebook-name-${currentNotebook.id}`}
                    className="relative truncate"
                  >
                    {currentNotebook.name}
                  </motion.span>
                  <Icons.ChevronRight
                    size={12}
                    className="ml-1 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            ) : null}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </motion.div>
  )
}

export default memo(SidebarBreadcrumbV2)