/**
 * Slash Commands System for CodeMirror
 * Provides Notion-like slash commands for quick formatting
 */

import { EditorView, Decoration, WidgetType } from '@codemirror/view'
import { StateField, StateEffect, EditorSelection } from '@codemirror/state'
import { editorLogger } from '../utils/logger'

// Slash command definition
interface SlashCommand {
  id: string
  label: string
  description: string
  icon?: string
  shortcut?: string
  action: (view: EditorView) => void
  category: 'basic' | 'heading' | 'list' | 'media' | 'advanced'
}

// Define available slash commands
export const SLASH_COMMANDS: SlashCommand[] = [
  // Headings
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    shortcut: 'Cmd+1',
    category: 'heading',
    action: (view) => insertText(view, '# ', '\n')
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    shortcut: 'Cmd+2',
    category: 'heading',
    action: (view) => insertText(view, '## ', '\n')
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    shortcut: 'Cmd+3',
    category: 'heading',
    action: (view) => insertText(view, '### ', '\n')
  },
  
  // Basic blocks
  {
    id: 'text',
    label: 'Text',
    description: 'Plain text paragraph',
    icon: 'T',
    category: 'basic',
    action: (view) => insertText(view, '', '\n')
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Quote or callout',
    icon: '"',
    category: 'basic',
    action: (view) => insertText(view, '> ', '\n')
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal line',
    icon: '—',
    category: 'basic',
    action: (view) => insertText(view, '\n---\n\n', '')
  },
  
  // Lists
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Unordered list',
    icon: '•',
    shortcut: 'Cmd+Shift+8',
    category: 'list',
    action: (view) => insertText(view, '- ', '\n')
  },
  {
    id: 'number',
    label: 'Numbered List',
    description: 'Ordered list',
    icon: '1.',
    shortcut: 'Cmd+Shift+7',
    category: 'list',
    action: (view) => insertText(view, '1. ', '\n')
  },
  {
    id: 'todo',
    label: 'To-do List',
    description: 'Checkbox list',
    icon: '☐',
    shortcut: 'Cmd+Shift+9',
    category: 'list',
    action: (view) => insertText(view, '- [ ] ', '\n')
  },
  
  // Media
  {
    id: 'image',
    label: 'Image',
    description: 'Add an image',
    icon: '🖼',
    category: 'media',
    action: (view) => insertText(view, '![alt text](', ')')
  },
  {
    id: 'link',
    label: 'Link',
    description: 'Add a hyperlink',
    icon: '🔗',
    shortcut: 'Cmd+K',
    category: 'media',
    action: (view) => insertText(view, '[link text](', ')')
  },
  
  // Advanced
  {
    id: 'code',
    label: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: '</>',
    shortcut: 'Cmd+Shift+C',
    category: 'advanced',
    action: (view) => insertText(view, '\n```javascript\n', '\n```\n')
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Add a table',
    icon: '⊞',
    category: 'advanced',
    action: (view) => insertText(view, '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '\n')
  },
  {
    id: 'math',
    label: 'Math Block',
    description: 'LaTeX math expression',
    icon: '∑',
    category: 'advanced',
    action: (view) => insertText(view, '\n$$\n', '\n$$\n')
  }
]

// Helper to insert text at cursor
function insertText(view: EditorView, prefix: string, suffix: string) {
  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert: prefix + suffix },
    selection: EditorSelection.cursor(from + prefix.length)
  })
  view.focus()
}

// Widget for slash command menu
class SlashCommandWidget extends WidgetType {
  constructor(
    private commands: SlashCommand[],
    private selectedIndex: number,
    private filter: string,
    private onSelect: (command: SlashCommand) => void,
    private onCancel: () => void
  ) {
    super()
  }

  toDOM() {
    try {
      const container = document.createElement('div')
      container.className = 'slash-command-menu'
      container.style.cssText = `
        position: absolute;
        background: var(--color-bg-secondary, #fff);
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px;
        min-width: 250px;
        max-width: 350px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        font-family: inherit;
      `

    // Filter commands
    const filtered = this.filter
      ? this.commands.filter(cmd => 
          cmd.label.toLowerCase().includes(this.filter.toLowerCase()) ||
          cmd.description.toLowerCase().includes(this.filter.toLowerCase())
        )
      : this.commands

    // Group by category
    const grouped = filtered.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    }, {} as Record<string, SlashCommand[]>)

    // Render categories
    Object.entries(grouped).forEach(([category, commands]) => {
      // Category header
      const header = document.createElement('div')
      header.style.cssText = `
        font-size: 11px;
        text-transform: uppercase;
        color: var(--color-text-secondary, #666);
        padding: 4px 8px;
        margin-top: 4px;
      `
      header.textContent = category
      container.appendChild(header)

      // Commands
      commands.forEach((cmd, index) => {
        const item = document.createElement('div')
        const isSelected = filtered.indexOf(cmd) === this.selectedIndex
        
        item.className = 'slash-command-item'
        item.style.cssText = `
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          background: ${isSelected ? 'var(--color-bg-hover, #f5f5f5)' : 'transparent'};
          transition: background 0.1s;
        `
        
        // Icon
        const icon = document.createElement('span')
        icon.style.cssText = `
          width: 24px;
          text-align: center;
          margin-right: 12px;
          font-size: 16px;
          opacity: 0.8;
        `
        icon.textContent = cmd.icon || '•'
        item.appendChild(icon)
        
        // Content
        const content = document.createElement('div')
        content.style.flex = '1'
        
        const label = document.createElement('div')
        label.style.cssText = `
          font-weight: 500;
          color: var(--color-text-primary, #000);
        `
        label.textContent = cmd.label
        content.appendChild(label)
        
        const description = document.createElement('div')
        description.style.cssText = `
          font-size: 12px;
          color: var(--color-text-secondary, #666);
          margin-top: 2px;
        `
        description.textContent = cmd.description
        content.appendChild(description)
        
        item.appendChild(content)
        
        // Shortcut
        if (cmd.shortcut) {
          const shortcut = document.createElement('span')
          shortcut.style.cssText = `
            font-size: 11px;
            color: var(--color-text-secondary, #666);
            background: var(--color-bg-tertiary, #f0f0f0);
            padding: 2px 6px;
            border-radius: 3px;
            margin-left: 8px;
          `
          shortcut.textContent = cmd.shortcut
          item.appendChild(shortcut)
        }
        
        // Events
        item.onmouseenter = () => {
          item.style.background = 'var(--color-bg-hover, #f5f5f5)'
        }
        item.onmouseleave = () => {
          if (!isSelected) {
            item.style.background = 'transparent'
          }
        }
        item.onclick = () => this.onSelect(cmd)
        
        container.appendChild(item)
      })
    })

    // Keyboard navigation
    setTimeout(() => {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          const newIndex = (this.selectedIndex + 1) % filtered.length
          this.selectedIndex = newIndex
          this.onCancel() // Re-render
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          const newIndex = this.selectedIndex === 0 ? filtered.length - 1 : this.selectedIndex - 1
          this.selectedIndex = newIndex
          this.onCancel() // Re-render
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filtered[this.selectedIndex]) {
            this.onSelect(filtered[this.selectedIndex])
          }
        } else if (e.key === 'Escape') {
          e.preventDefault()
          this.onCancel()
        }
      }
      document.addEventListener('keydown', handleKeydown)
      
      // Cleanup
      container.addEventListener('destroy', () => {
        document.removeEventListener('keydown', handleKeydown)
      })
    }, 0)

      return container
    } catch (error) {
      editorLogger.error('Error creating slash command menu:', error)
      // Return empty div to prevent editor crash
      return document.createElement('div')
    }
  }

  eq(other: SlashCommandWidget) {
    return false // Always re-render for now
  }
}

// State effect for showing/hiding menu
const showSlashMenu = StateEffect.define<{ pos: number; filter: string }>()
const hideSlashMenu = StateEffect.define<void>()

// State field for slash menu
export const slashMenuField = StateField.define<{ pos: number; filter: string; selectedIndex: number } | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(showSlashMenu)) {
        return { ...effect.value, selectedIndex: 0 }
      } else if (effect.is(hideSlashMenu)) {
        return null
      }
    }
    return value
  },
  provide: field => EditorView.decorations.from(field, state => {
    const menu = state.field(field)
    if (!menu) return Decoration.none
    
    return Decoration.set([
      Decoration.widget({
        widget: new SlashCommandWidget(
          SLASH_COMMANDS,
          menu.selectedIndex,
          menu.filter,
          (command) => {
            // Execute command
            const view = (window as any).currentEditorView
            if (view) {
              // Remove the slash and filter text
              const from = menu.pos
              const to = view.state.selection.main.from
              view.dispatch({
                changes: { from, to, insert: '' },
                effects: hideSlashMenu.of()
              })
              
              // Execute the command
              command.action(view)
            }
          },
          () => {
            // Cancel
            const view = (window as any).currentEditorView
            if (view) {
              view.dispatch({ effects: hideSlashMenu.of() })
            }
          }
        ),
        side: 1
      }).range(menu.pos)
    ])
  })
})

// Extension for slash commands
export const slashCommandsExtension = [
  slashMenuField,
  EditorView.updateListener.of(update => {
    // Only check on selection changes, not doc changes
    if (!update.selectionSet && !update.docChanged) return
    
    const { state, view } = update
    const { from, to } = state.selection.main
    
    // Store view reference for widget
    ;(window as any).currentEditorView = view
    
    // Only check when cursor is at a single position
    if (from !== to) {
      // Hide menu if there's a selection
      const currentMenu = state.field(slashMenuField)
      if (currentMenu) {
        view.dispatch({ effects: hideSlashMenu.of() })
      }
      return
    }
    
    // Check if we should show slash menu
    const line = state.doc.lineAt(from)
    const textBefore = line.text.slice(0, from - line.from)
    
    // Check for slash command pattern
    const slashMatch = textBefore.match(/\/(\w*)$/)
    if (slashMatch) {
      const slashPos = line.from + slashMatch.index!
      const filter = slashMatch[1] || ''
      
      // Only show menu if not already showing
      const currentMenu = state.field(slashMenuField)
      if (!currentMenu || currentMenu.pos !== slashPos || currentMenu.filter !== filter) {
        view.dispatch({
          effects: showSlashMenu.of({ pos: slashPos, filter })
        })
      }
    } else {
      // Hide menu if no slash
      const currentMenu = state.field(slashMenuField)
      if (currentMenu) {
        view.dispatch({ effects: hideSlashMenu.of() })
      }
    }
  })
]