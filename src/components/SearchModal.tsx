import React, { useEffect, useRef } from 'react'
import SearchBar from './SearchBar'
import SearchErrorBoundary from './errors/SearchErrorBoundary'
import Icons from './Icons'

interface Note {
  id: string
  title: string
  content: string
  [key: string]: any
}

interface SearchModalProps {
  isOpen?: boolean
  onClose?: () => void
  onSelectNote?: (note: Note) => void
  notes?: Note[]
  className?: string
  onPinNote?: ((note: Note) => void) | null
  onDeleteNote?: ((note: Note) => void) | null
  onMoveNote?: ((note: Note, notebook: string) => void) | null
}

interface QuickSearchProps {
  notes?: Note[]
  onSelectNote?: (note: Note) => void
  placeholder?: string
  className?: string
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen = false,
  onClose = () => {},
  onSelectNote = () => {},
  notes = [],
  className = '',
  onPinNote = null,
  onDeleteNote = null,
  onMoveNote = null,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchBarRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const input = searchBarRef.current?.querySelector('input')
        if (input) {
          input.focus()
        }
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-16 px-4 pb-4">
        <div
          ref={modalRef}
          className={`relative w-full max-w-2xl bg-theme-bg-secondary rounded-xl shadow-2xl border border-theme-border-primary animate-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
            <div className="flex items-center space-x-2">
              <Icons.Search size={18} className="text-theme-text-tertiary" />
              <h2 className="text-lg font-medium text-theme-text-secondary">
                Search Notes
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-theme-text-tertiary hover:text-theme-text-secondary transition-colors p-1 rounded-md hover:bg-theme-bg-tertiary"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Search Content */}
          <div className="p-4">
            <SearchErrorBoundary
              fallbackMessage="Search failed due to complex search terms or filtering. Try simplifying your search."
              onClearSearch={() => {
                // Reset search - this would need to be implemented in SearchBar
                console.log('Clearing search due to error')
              }}
              onClose={onClose}
            >
              <div ref={searchBarRef}>
                <SearchBar
                  notes={notes}
                  onSelectResult={(note) => {
                    onSelectNote(note)
                    onClose()
                  }}
                  onPinNote={onPinNote}
                  onDeleteNote={onDeleteNote}
                  onMoveNote={onMoveNote}
                  placeholder="Search by title, content, tags, or notebook..."
                  autoFocus={true}
                  showResults={true}
                  showHistory={true}
                  className="w-full"
                />
              </div>
            </SearchErrorBoundary>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-6 pt-4 border-t border-theme-border-primary">
              <div className="text-xs text-theme-text-tertiary space-y-2">
                <div className="font-medium mb-3">Keyboard Shortcuts</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span>Navigate results</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        ↑
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        ↓
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        Tab
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Select note</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                      Enter
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>First/Last result</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        Home
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        End
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Close search</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                      Esc
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Open with modifier</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        Cmd
                      </kbd>
                      <span className="text-theme-text-muted">+</span>
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        Enter
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Clear search</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-theme-bg-tertiary rounded border border-theme-border-secondary">
                        Esc
                      </kbd>
                      <span className="text-theme-text-muted">twice</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Search Component - simpler version for inline use
export const QuickSearch: React.FC<QuickSearchProps> = ({
  notes = [],
  onSelectNote = () => {},
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <SearchBar
      notes={notes}
      onSelectResult={onSelectNote}
      placeholder={placeholder}
      showResults={true}
      showHistory={false}
      className={className}
    />
  )
}

export default SearchModal