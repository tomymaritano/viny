/**
 * CodeMirror Keybindings for Markdown Formatting
 * Custom keyboard shortcuts that use formatSelection for better UX
 */

import { keymap } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { insertNewlineAndIndent } from '@codemirror/commands'

// Create a command that calls formatSelection if available
const createFormatCommand = (prefix: string, suffix: string = '') => {
  return (view: EditorView): boolean => {
    // Get the editor reference from the view's DOM element
    const editorElement = view.dom.closest('.cm-editor')
    if (editorElement && (editorElement as any).__formatSelection) {
      (editorElement as any).__formatSelection(prefix, suffix)
      return true
    }
    
    // Fallback: insert text directly
    const selection = view.state.selection.main
    const selectedText = view.state.doc.sliceString(selection.from, selection.to)
    const textToFormat = selectedText || 'text'
    const formattedText = prefix + textToFormat + suffix
    
    const transaction = view.state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: formattedText,
      },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + textToFormat.length,
      },
    })
    view.dispatch(transaction)
    return true
  }
}

// Define the keybindings
export const markdownKeybindings = keymap.of([
  // Basic editing
  { key: 'Enter', run: insertNewlineAndIndent },
  
  // Text formatting
  { key: 'Mod-b', run: createFormatCommand('**', '**') }, // Bold
  { key: 'Mod-i', run: createFormatCommand('*', '*') },   // Italic
  { key: 'Mod-e', run: createFormatCommand('`', '`') },   // Inline code
  { key: 'Mod-u', run: createFormatCommand('~~', '~~') }, // Strikethrough
  
  // Links and other formats
  { key: 'Mod-l', run: createFormatCommand('[', '](https://example.com)') }, // Link (changed from Mod-k)
  { key: 'Mod-Shift-c', run: (view: EditorView) => {
    const selection = view.state.selection.main
    const transaction = view.state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '\n```\ncode here\n```\n',
      },
    })
    view.dispatch(transaction)
    return true
  }}, // Code block
  
  // Lists
  { key: 'Mod-Shift-l', run: (view: EditorView) => {
    const selection = view.state.selection.main
    const transaction = view.state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '\n- Item 1\n- Item 2\n- Item 3\n',
      },
    })
    view.dispatch(transaction)
    return true
  }}, // Bulleted list
  
  // Quote
  { key: 'Mod-Shift-q', run: (view: EditorView) => {
    const selection = view.state.selection.main
    const transaction = view.state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '\n> Quote text\n',
      },
    })
    view.dispatch(transaction)
    return true
  }}, // Quote
])

// Helper function to attach formatSelection to the editor element
export const attachFormatSelection = (editorElement: HTMLElement, formatSelectionFn: (prefix: string, suffix?: string) => void) => {
  (editorElement as any).__formatSelection = formatSelectionFn
}