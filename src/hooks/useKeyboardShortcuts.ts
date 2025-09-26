/**
 * Custom hook for keyboard shortcuts
 */
import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  // Note actions
  onNewNote?: () => void
  onSaveNote?: () => void
  onDeleteNote?: () => void
  onTogglePin?: () => void
  onDuplicateNote?: () => void
  onViewHistory?: () => void
  
  // Navigation
  onSearch?: () => void
  onEscape?: () => void
  
  // Legacy props (for backward compatibility)
  onCreateNew?: () => void
  onExport?: () => void
  onSettings?: () => void
}

export const useKeyboardShortcuts = (props: UseKeyboardShortcutsProps) => {
  const {
    // Note actions
    onNewNote,
    onSaveNote,
    onDeleteNote,
    onTogglePin,
    onDuplicateNote,
    onViewHistory,
    
    // Navigation
    onSearch,
    onEscape,
    
    // Legacy
    onCreateNew,
    onExport,
    onSettings,
  } = props

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement
      const isTyping =
        target && ['input', 'textarea'].includes(target.tagName.toLowerCase())
      
      // Don't handle shortcuts when in CodeMirror editor
      if (target?.closest('.cm-editor')) {
        return
      }

      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
      }

      // Cmd/Ctrl + N - New note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isTyping) {
        e.preventDefault()
        ;(onNewNote || onCreateNew)?.()
      }

      // Cmd/Ctrl + S - Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSaveNote?.()
      }

      // Cmd/Ctrl + D - Duplicate note
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && !isTyping) {
        e.preventDefault()
        onDuplicateNote?.()
      }

      // Cmd/Ctrl + P - Toggle pin
      if ((e.metaKey || e.ctrlKey) && e.key === 'p' && !isTyping) {
        e.preventDefault()
        onTogglePin?.()
      }

      // Cmd/Ctrl + H - View history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h' && !isTyping) {
        e.preventDefault()
        onViewHistory?.()
      }

      // Delete/Backspace - Delete note (with confirmation)
      if ((e.key === 'Delete' || (e.key === 'Backspace' && (e.metaKey || e.ctrlKey))) && !isTyping) {
        e.preventDefault()
        onDeleteNote?.()
      }

      // Escape - Close modals/dialogs
      if (e.key === 'Escape') {
        onEscape?.()
      }

      // Legacy shortcuts
      // Cmd/Ctrl + E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        onExport?.()
      }

      // Cmd/Ctrl + , - Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        onSettings?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    onNewNote,
    onSaveNote,
    onDeleteNote,
    onTogglePin,
    onDuplicateNote,
    onViewHistory,
    onSearch,
    onEscape,
    onCreateNew,
    onExport,
    onSettings,
  ])
}