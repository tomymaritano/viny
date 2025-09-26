/**
 * Simplified Slash Commands System for CodeMirror
 * A more stable implementation that doesn't interfere with editor functionality
 */

import { EditorView } from '@codemirror/view'
import { EditorSelection } from '@codemirror/state'

// Slash command definition
interface SlashCommand {
  trigger: string
  label: string
  action: (view: EditorView, pos: number) => void
}

// Define available slash commands
const SLASH_COMMANDS: SlashCommand[] = [
  // Headings
  {
    trigger: '/h1',
    label: 'Heading 1',
    action: (view, pos) => replaceSlashCommand(view, pos, '# ')
  },
  {
    trigger: '/h2',
    label: 'Heading 2',
    action: (view, pos) => replaceSlashCommand(view, pos, '## ')
  },
  {
    trigger: '/h3',
    label: 'Heading 3',
    action: (view, pos) => replaceSlashCommand(view, pos, '### ')
  },
  {
    trigger: '/h4',
    label: 'Heading 4',
    action: (view, pos) => replaceSlashCommand(view, pos, '#### ')
  },
  
  // Lists
  {
    trigger: '/bullet',
    label: 'Bullet List',
    action: (view, pos) => replaceSlashCommand(view, pos, '- ')
  },
  {
    trigger: '/todo',
    label: 'Todo List',
    action: (view, pos) => replaceSlashCommand(view, pos, '- [ ] ')
  },
  {
    trigger: '/number',
    label: 'Numbered List',
    action: (view, pos) => replaceSlashCommand(view, pos, '1. ')
  },
  
  // Blocks
  {
    trigger: '/code',
    label: 'Code Block',
    action: (view, pos) => replaceSlashCommand(view, pos, '```\n', '\n```')
  },
  {
    trigger: '/quote',
    label: 'Quote',
    action: (view, pos) => replaceSlashCommand(view, pos, '> ')
  },
  {
    trigger: '/divider',
    label: 'Divider',
    action: (view, pos) => replaceSlashCommand(view, pos, '\n---\n')
  },
  
  // Media
  {
    trigger: '/link',
    label: 'Link',
    action: (view, pos) => replaceSlashCommand(view, pos, '[', '](url)')
  },
  {
    trigger: '/image',
    label: 'Image',
    action: (view, pos) => replaceSlashCommand(view, pos, '![', '](url)')
  },
  
  // Advanced
  {
    trigger: '/table',
    label: 'Table',
    action: (view, pos) => replaceSlashCommand(view, pos, '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n')
  },
  {
    trigger: '/math',
    label: 'Math Block',
    action: (view, pos) => replaceSlashCommand(view, pos, '$$\n', '\n$$')
  }
]

// Helper to replace slash command with content
function replaceSlashCommand(view: EditorView, commandStart: number, prefix: string, suffix: string = '') {
  const currentPos = view.state.selection.main.from
  
  view.dispatch({
    changes: { 
      from: commandStart, 
      to: currentPos, 
      insert: prefix + suffix 
    },
    selection: EditorSelection.cursor(commandStart + prefix.length)
  })
  
  view.focus()
}

// Simple slash commands extension that checks on input
export const simpleSlashCommandsExtension = EditorView.inputHandler.of((view, from, to, text) => {
  // Only process if typing a single character
  if (text.length !== 1) return false
  
  // Get the current line text including the new character
  const line = view.state.doc.lineAt(from)
  const textBefore = line.text.slice(0, from - line.from) + text
  
  // Check each command to see if it matches
  for (const command of SLASH_COMMANDS) {
    if (textBefore.endsWith(command.trigger)) {
      // Calculate where the command starts
      const commandStart = line.from + textBefore.length - command.trigger.length
      
      // Schedule the replacement for next tick to avoid conflicts
      setTimeout(() => {
        command.action(view, commandStart)
      }, 0)
      
      // Let the character be inserted first
      return false
    }
  }
  
  return false
})

// Export a help text that can be shown in the UI
export const slashCommandsHelp = `
Slash Commands:
• /h1, /h2, /h3 - Headings
• /bullet - Bullet list
• /todo - Todo list  
• /number - Numbered list
• /code - Code block
• /quote - Quote block
• /link - Insert link
• /image - Insert image
• /table - Insert table
• /divider - Horizontal line
• /math - Math block
`