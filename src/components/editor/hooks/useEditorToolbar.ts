import { useCallback } from 'react'
import {
  createMarkdownFormatter,
  keyboardShortcuts,
} from '../utils/markdownFormatter'

export const useEditorToolbar = (value, onChange, editorRef) => {
  // Text insertion function that works with CodeMirror editor
  const insertText = useCallback(
    text => {
      // If we have an editor ref, use its insertText method
      if (editorRef?.current) {
        editorRef.current.insertText(text)
        return
      }

      // Fallback to simple text manipulation
      const activeElement = document.activeElement

      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        // For textarea elements, use selection API
        const start = activeElement.selectionStart
        const end = activeElement.selectionEnd
        const before = value.substring(0, start)
        const after = value.substring(end)
        const newValue = before + text + after

        onChange(newValue)

        // Restore cursor position after the inserted text
        setTimeout(() => {
          activeElement.selectionStart = activeElement.selectionEnd =
            start + text.length
        }, 0)
      } else {
        // For other cases, append at the end with proper formatting
        const lines = value.split('\n')
        const lastLine = lines[lines.length - 1]

        // If the last line is empty, insert at the end
        if (lastLine.trim() === '') {
          onChange(value + text)
        } else {
          // Add a newline before the text to ensure proper formatting
          onChange(value + '\n' + text)
        }
      }
    },
    [value, onChange, editorRef]
  )

  const formatSelection = useCallback(
    (prefix, suffix = '') => {
      // If we have an editor ref, use its formatSelection method
      if (editorRef?.current) {
        editorRef.current.formatSelection(prefix, suffix)
        return
      }

      // Fallback: just insert the formatted text
      insertText(prefix + 'text' + suffix)
    },
    [editorRef, insertText]
  )

  // Create formatter functions with both insertText and formatSelection
  const formatter = createMarkdownFormatter(insertText, formatSelection)

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    event => {
      const key = `${event.ctrlKey || event.metaKey ? (navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl') : ''}${event.shiftKey ? '+Shift' : ''}+${event.key}`

      const action = keyboardShortcuts[key]
      if (action && formatter[action]) {
        event.preventDefault()
        formatter[action]()
      }
    },
    [formatter]
  )

  return {
    // Formatting functions
    ...formatter,

    // Event handlers
    handleKeyDown,
    insertText,
  }
}
