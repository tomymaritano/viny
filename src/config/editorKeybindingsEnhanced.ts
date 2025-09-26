/**
 * Enhanced CodeMirror Keybindings for Markdown
 * Includes Tab behavior, list continuation, and more
 */

import { keymap } from '@codemirror/view'
import type { EditorView } from '@codemirror/view'
import { 
  indentMore, 
  indentLess,
  insertNewlineAndIndent,
  deleteLine,
  selectLine
} from '@codemirror/commands'
import { EditorSelection } from '@codemirror/state'

// Helper to detect if cursor is in a list item
const isInList = (view: EditorView, pos: number): { isList: boolean; type: 'bullet' | 'ordered' | 'task' | null; indent: number } => {
  const line = view.state.doc.lineAt(pos)
  const lineText = line.text
  
  // Check for bullet list (-, *, +)
  const bulletMatch = lineText.match(/^(\s*)([-*+])\s/)
  if (bulletMatch) {
    return { isList: true, type: 'bullet', indent: bulletMatch[1].length }
  }
  
  // Check for ordered list
  const orderedMatch = lineText.match(/^(\s*)(\d+)[.)]\s/)
  if (orderedMatch) {
    return { isList: true, type: 'ordered', indent: orderedMatch[1].length }
  }
  
  // Check for task list
  const taskMatch = lineText.match(/^(\s*)([-*+])\s\[([ x])\]\s/)
  if (taskMatch) {
    return { isList: true, type: 'task', indent: taskMatch[1].length }
  }
  
  return { isList: false, type: null, indent: 0 }
}

// Helper to get the list marker for continuation
const getListMarker = (type: 'bullet' | 'ordered' | 'task', lineText: string): string => {
  switch (type) {
    case 'bullet':
      const bulletMatch = lineText.match(/^(\s*)([-*+])\s/)
      return bulletMatch ? bulletMatch[2] : '-'
    case 'ordered':
      const orderedMatch = lineText.match(/^(\s*)(\d+)([.)])\s/)
      if (orderedMatch) {
        const nextNum = parseInt(orderedMatch[2]) + 1
        return `${nextNum}${orderedMatch[3]}`
      }
      return '1.'
    case 'task':
      return '- [ ]'
    default:
      return '-'
  }
}

// Tab key handler for smart indentation
const handleTab = (view: EditorView): boolean => {
  const selection = view.state.selection.main
  const pos = selection.from
  const listInfo = isInList(view, pos)
  
  if (listInfo.isList) {
    // In a list, indent the line
    return indentMore(view)
  }
  
  // Not in a list, insert tab character
  view.dispatch({
    changes: { from: pos, to: selection.to, insert: '\t' },
    selection: EditorSelection.cursor(pos + 1)
  })
  return true
}

// Shift+Tab handler for unindenting
const handleShiftTab = (view: EditorView): boolean => {
  const selection = view.state.selection.main
  const pos = selection.from
  const listInfo = isInList(view, pos)
  
  if (listInfo.isList) {
    // In a list, unindent the line
    return indentLess(view)
  }
  
  // Not in a list, try to remove a tab or spaces
  const line = view.state.doc.lineAt(pos)
  const beforeCursor = line.text.substring(0, pos - line.from)
  
  if (beforeCursor.endsWith('\t')) {
    view.dispatch({
      changes: { from: pos - 1, to: pos },
      selection: EditorSelection.cursor(pos - 1)
    })
    return true
  } else if (beforeCursor.endsWith('    ')) {
    view.dispatch({
      changes: { from: pos - 4, to: pos },
      selection: EditorSelection.cursor(pos - 4)
    })
    return true
  }
  
  return false
}

// Enter key handler for list continuation
const handleEnter = (view: EditorView): boolean => {
  const selection = view.state.selection.main
  const pos = selection.from
  const line = view.state.doc.lineAt(pos)
  const listInfo = isInList(view, pos)
  
  if (listInfo.isList) {
    const lineText = line.text
    const indent = ' '.repeat(listInfo.indent)
    
    // Check if the current line is empty (just the list marker)
    const emptyListPattern = /^(\s*)([-*+]|\d+[.)]|[-*+]\s\[[ x]\])\s*$/
    if (emptyListPattern.test(lineText)) {
      // Empty list item, exit the list
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: '' },
        selection: EditorSelection.cursor(line.from)
      })
      return true
    }
    
    // Continue the list
    const marker = getListMarker(listInfo.type!, lineText)
    const newLine = `\n${indent}${marker} `
    
    view.dispatch({
      changes: { from: pos, to: selection.to, insert: newLine },
      selection: EditorSelection.cursor(pos + newLine.length)
    })
    return true
  }
  
  // Not in a list, use default behavior
  return insertNewlineAndIndent(view)
}

// Create format command (existing helper)
const createFormatCommand = (prefix: string, suffix = '') => {
  return (view: EditorView): boolean => {
    const editorElement = view.dom.closest('.cm-editor')
    if (editorElement && (editorElement as any).__formatSelection) {
      ;(editorElement as any).__formatSelection(prefix, suffix)
      return true
    }

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

// Header shortcuts (Cmd/Ctrl + 1-6)
const createHeaderCommand = (level: number) => {
  return (view: EditorView): boolean => {
    const selection = view.state.selection.main
    const line = view.state.doc.lineAt(selection.from)
    const lineText = line.text
    
    // Remove existing header markers
    const cleanedText = lineText.replace(/^#{1,6}\s*/, '')
    const headerPrefix = '#'.repeat(level) + ' '
    const newText = headerPrefix + cleanedText
    
    view.dispatch({
      changes: { from: line.from, to: line.to, insert: newText },
      selection: EditorSelection.cursor(line.from + newText.length)
    })
    
    return true
  }
}

// Enhanced keybindings
export const enhancedMarkdownKeybindings = keymap.of([
  // Tab handling
  { key: 'Tab', run: handleTab },
  { key: 'Shift-Tab', run: handleShiftTab },
  
  // Smart Enter for list continuation
  { key: 'Enter', run: handleEnter },
  
  // Text formatting (existing)
  { key: 'Mod-b', run: createFormatCommand('**', '**') }, // Bold
  { key: 'Mod-i', run: createFormatCommand('*', '*') }, // Italic
  { key: 'Mod-e', run: createFormatCommand('`', '`') }, // Inline code
  { key: 'Mod-u', run: createFormatCommand('~~', '~~') }, // Strikethrough
  
  // Header shortcuts (new)
  { key: 'Mod-1', run: createHeaderCommand(1) },
  { key: 'Mod-2', run: createHeaderCommand(2) },
  { key: 'Mod-3', run: createHeaderCommand(3) },
  { key: 'Mod-4', run: createHeaderCommand(4) },
  { key: 'Mod-5', run: createHeaderCommand(5) },
  { key: 'Mod-6', run: createHeaderCommand(6) },
  
  // Links and formatting
  { key: 'Mod-k', run: createFormatCommand('[', '](https://example.com)') }, // Link
  { key: 'Mod-Shift-c', run: (view: EditorView) => {
    const selection = view.state.selection.main
    const selectedText = view.state.doc.sliceString(selection.from, selection.to)
    const codeBlock = selectedText 
      ? `\n\`\`\`\n${selectedText}\n\`\`\`\n`
      : '\n```javascript\n// code here\n```\n'
    
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: codeBlock }
    })
    return true
  }}, // Code block
  
  // List shortcuts
  { key: 'Mod-Shift-8', run: (view: EditorView) => {
    const pos = view.state.selection.main.from
    view.dispatch({
      changes: { from: pos, to: pos, insert: '\n- ' }
    })
    return true
  }}, // Bullet list
  
  { key: 'Mod-Shift-7', run: (view: EditorView) => {
    const pos = view.state.selection.main.from
    view.dispatch({
      changes: { from: pos, to: pos, insert: '\n1. ' }
    })
    return true
  }}, // Ordered list
  
  { key: 'Mod-Shift-9', run: (view: EditorView) => {
    const pos = view.state.selection.main.from
    view.dispatch({
      changes: { from: pos, to: pos, insert: '\n- [ ] ' }
    })
    return true
  }}, // Task list
  
  // Selection commands
  { key: 'Mod-l', run: selectLine }, // Select line
  { key: 'Mod-Shift-k', run: deleteLine }, // Delete line
  
  // Quote
  { key: 'Mod-Shift-q', run: (view: EditorView) => {
    const selection = view.state.selection.main
    const selectedText = view.state.doc.sliceString(selection.from, selection.to)
    const quote = selectedText 
      ? `\n> ${selectedText.split('\n').join('\n> ')}\n`
      : '\n> Quote text\n'
    
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: quote }
    })
    return true
  }},
])

// Export the attach function (same as before)
export { attachFormatSelection } from './editorKeybindings'