/**
 * Custom hook for keyboard shortcuts
 */
import { useEffect } from 'react'
import { Note } from '../types'

interface UseKeyboardShortcutsProps {
  currentNote: Note | null
  onCreateNew: () => void
  onSave: (note: Note) => void
  onSearch: () => void
  onExport: () => void
  onSettings: () => void
}

export const useKeyboardShortcuts = ({
  currentNote,
  onCreateNew,
  onSave,
  onSearch,
  onExport,
  onSettings
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isTyping = ['input', 'textarea'].includes(
        (e.target as HTMLElement).tagName.toLowerCase()
      )
      
      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
      }
      
      // Cmd/Ctrl + N - New note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isTyping) {
        e.preventDefault()
        onCreateNew()
      }
      
      // Cmd/Ctrl + S - Save (when in editor)
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && currentNote) {
        e.preventDefault()
        onSave(currentNote)
      }
      
      // Cmd/Ctrl + E - Export current note
      if ((e.metaKey || e.ctrlKey) && e.key === 'e' && currentNote) {
        e.preventDefault()
        onExport()
      }
      
      // Cmd/Ctrl + , - Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        onSettings()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentNote, onCreateNew, onSave, onSearch, onExport, onSettings])
}
