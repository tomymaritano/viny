import React, { useMemo, memo } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Icons } from '../Icons'
import { useAppStore } from '../../stores/newSimpleStore'
import { useNotebooks } from '../../hooks/useNotebooks'

interface SidebarBreadcrumbProps {
  onNotebookClick?: (notebookId: string) => void
  focusedNotebookId?: string | null
}

const SidebarBreadcrumb: React.FC<SidebarBreadcrumbProps> = ({
  onNotebookClick,
  focusedNotebookId,
}) => {
  const { selectedNoteId, notes, sidebarWidth, exitFocusMode } = useAppStore()
  const { getNotebook } = useNotebooks()

  // Get current note
  const currentNote = selectedNoteId
    ? notes.find(n => n.id === selectedNoteId)
    : null

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
                {focusedNotebookId && (
                  <>
                    <button
                      onClick={exitFocusMode}
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
                  className="group relative flex items-center"
                >
                  <span className="text-theme-text-muted hover:text-theme-text-primary transition-colors duration-150 max-w-[100px] sm:max-w-[120px] md:max-w-[160px] truncate cursor-pointer px-1 -mx-1">
                    {currentNotebook.name}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-px bg-theme-text-primary origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                </button>

                <AnimatePresence>
                  {currentNote && (
                    <div
                      key={`note-${currentNote.id}`}
                      className="flex items-center ml-2"
                    >
                      <span className="mx-1.5 text-theme-text-muted opacity-50">
                        ›
                      </span>
                      <Icons.FileText
                        size={14}
                        className="text-theme-text-muted mr-1.5 flex-shrink-0 transition-transform duration-150 hover:scale-110"
                      />
                      <span
                        className="text-theme-text-primary font-semibold max-w-[80px] sm:max-w-[100px] md:max-w-[160px] truncate"
                        title={currentNote.title || 'Untitled'}
                      >
                        {currentNote.title || 'Untitled'}
                      </span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : currentNote ? (
              <div key="note-only" className="flex items-center">
                <Icons.FileText
                  size={14}
                  className="text-theme-text-muted mr-1.5 flex-shrink-0 transition-transform duration-150 hover:scale-110"
                />
                <span
                  className="text-theme-text-primary font-semibold max-w-[160px] truncate"
                  title={currentNote.title || 'Untitled'}
                >
                  {currentNote.title || 'Untitled'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-theme-text-muted opacity-75">
                {/* Show clickable "All Notes" when in focus mode */}
                {focusedNotebookId ? (
                  <button
                    onClick={exitFocusMode}
                    className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary transition-colors duration-150"
                  >
                    <Icons.FileText size={14} className="flex-shrink-0" />
                    <span>All Notes</span>
                  </button>
                ) : (
                  <>
                    <Icons.Book size={14} className="flex-shrink-0" />
                    <span>Select a notebook or note</span>
                  </>
                )}
              </div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </motion.div>
  )
}

export default memo(SidebarBreadcrumb)
