import { useEffect, useRef } from 'react'
import SearchBar from './SearchBar'
import Icons from './Icons'

const SearchModal = ({
  isOpen = false,
  onClose = () => {},
  onSelectNote = () => {},
  notes = [],
  className = '',
  onPinNote = null,
  onDeleteNote = null,
  onMoveNote = null,
}) => {
  const modalRef = useRef(null)
  const searchBarRef = useRef(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = e => {
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
    const handleClickOutside = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
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
        const input = searchBarRef.current.querySelector('input')
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-16 px-4 pb-4">
        <div
          ref={modalRef}
          className={`relative w-full max-w-2xl bg-solarized-base02 rounded-xl shadow-2xl border border-solarized-base01 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-solarized-base01">
            <div className="flex items-center space-x-2">
              <Icons.Search size={18} className="text-solarized-base1" />
              <h2 className="text-lg font-medium text-solarized-base3">
                Search Notes
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-solarized-base1 hover:text-solarized-base3 transition-colors p-1 rounded-md hover:bg-solarized-base01"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Search Content */}
          <div className="p-4">
            <div ref={searchBarRef}>
              <SearchBar
                notes={notes}
                onSelectResult={note => {
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

            {/* Keyboard Shortcuts Help */}
            <div className="mt-6 pt-4 border-t border-solarized-base01">
              <div className="text-xs text-solarized-base1 space-y-2">
                <div className="font-medium mb-3">Keyboard Shortcuts</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span>Navigate results</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        ↑
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        ↓
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        Tab
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Select note</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                      Enter
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>First/Last result</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        Home
                      </kbd>
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        End
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Close search</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                      Esc
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Open with modifier</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        Cmd
                      </kbd>
                      <span className="text-solarized-base0">+</span>
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        Enter
                      </kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Clear search</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 text-xs bg-solarized-base01 rounded border border-solarized-base00">
                        Esc
                      </kbd>
                      <span className="text-solarized-base0">twice</span>
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
export const QuickSearch = ({
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
