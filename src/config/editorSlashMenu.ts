/**
 * Slash Menu System - Simplified popup menu for slash commands
 */

import { EditorView } from '@codemirror/view'
import { EditorSelection } from '@codemirror/state'

interface SlashCommand {
  id: string
  label: string
  description: string
  icon: string
  action: (view: EditorView, pos: number) => void
}

// Available commands
const COMMANDS: SlashCommand[] = [
  // Headings
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: 'H₁', 
    action: (v, p) => replaceCommand(v, p, '# ') },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: 'H₂', 
    action: (v, p) => replaceCommand(v, p, '## ') },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: 'H₃', 
    action: (v, p) => replaceCommand(v, p, '### ') },
  
  // Lists
  { id: 'bullet', label: 'Bullet List', description: 'Create a bullet point', icon: '•', 
    action: (v, p) => replaceCommand(v, p, '- ') },
  { id: 'todo', label: 'To-do List', description: 'Create a checkbox', icon: '☐', 
    action: (v, p) => replaceCommand(v, p, '- [ ] ') },
  { id: 'number', label: 'Numbered List', description: 'Create a numbered list', icon: '1.', 
    action: (v, p) => replaceCommand(v, p, '1. ') },
  
  // Blocks
  { id: 'code', label: 'Code Block', description: 'Insert a code block', icon: '</>', 
    action: (v, p) => replaceCommand(v, p, '```\n', '\n```') },
  { id: 'quote', label: 'Quote', description: 'Insert a quote block', icon: '"', 
    action: (v, p) => replaceCommand(v, p, '> ') },
  { id: 'divider', label: 'Divider', description: 'Insert horizontal line', icon: '—', 
    action: (v, p) => replaceCommand(v, p, '\n---\n') },
  
  // Media
  { id: 'link', label: 'Link', description: 'Insert a hyperlink', icon: '🔗', 
    action: (v, p) => replaceCommand(v, p, '[', '](url)') },
  { id: 'image', label: 'Image', description: 'Insert an image', icon: '🖼', 
    action: (v, p) => replaceCommand(v, p, '![', '](url)') },
  { id: 'table', label: 'Table', description: 'Insert a table', icon: '⊞', 
    action: (v, p) => replaceCommand(v, p, '\n| Col 1 | Col 2 |\n|-------|-------|\n| Cell  | Cell  |\n') },
]

// Replace slash command with content
function replaceCommand(view: EditorView, commandStart: number, prefix: string, suffix: string = '') {
  // Find the end of the slash command
  const line = view.state.doc.lineAt(commandStart)
  const textAfter = line.text.slice(commandStart - line.from)
  const match = textAfter.match(/^\/\w*/)
  const commandEnd = commandStart + (match ? match[0].length : 1)
  
  // Make sure we have focus before dispatching
  if (!view.hasFocus) {
    view.focus()
  }
  
  view.dispatch({
    changes: { from: commandStart, to: commandEnd, insert: prefix + suffix },
    selection: EditorSelection.cursor(commandStart + prefix.length)
  })
}

// Menu state
let menuElement: HTMLDivElement | null = null
let selectedIndex = 0
let currentView: EditorView | null = null
let commandStart = 0

// Create menu element
function createMenu(commands: SlashCommand[], filter: string, view: EditorView, slashStart: number): HTMLDivElement {
  const menu = document.createElement('div')
  menu.className = 'viny-slash-menu'
  menu.style.cssText = `
    position: fixed;
    background: var(--color-bg-secondary, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 4px;
    min-width: 200px;
    max-width: 300px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 9999;
    font-size: 14px;
  `
  
  // Filter commands with smart matching
  const filtered = filter 
    ? commands.filter(cmd => {
        const searchTerm = filter.toLowerCase()
        // Check if ID starts with filter (priority)
        if (cmd.id.toLowerCase().startsWith(searchTerm)) return true
        // Check if label starts with filter
        if (cmd.label.toLowerCase().startsWith(searchTerm)) return true
        // Check if ID contains filter
        if (cmd.id.toLowerCase().includes(searchTerm)) return true
        // Check if label contains filter
        if (cmd.label.toLowerCase().includes(searchTerm)) return true
        // Check if description contains filter
        if (cmd.description.toLowerCase().includes(searchTerm)) return true
        return false
      }).sort((a, b) => {
        // Prioritize commands that start with the filter
        const searchTerm = filter.toLowerCase()
        const aIdStarts = a.id.toLowerCase().startsWith(searchTerm)
        const bIdStarts = b.id.toLowerCase().startsWith(searchTerm)
        const aLabelStarts = a.label.toLowerCase().startsWith(searchTerm)
        const bLabelStarts = b.label.toLowerCase().startsWith(searchTerm)
        
        // First priority: ID starts with search term
        if (aIdStarts && !bIdStarts) return -1
        if (!aIdStarts && bIdStarts) return 1
        
        // Second priority: Label starts with search term
        if (aLabelStarts && !bLabelStarts) return -1
        if (!aLabelStarts && bLabelStarts) return 1
        
        // Otherwise keep original order
        return 0
      })
    : commands
  
  if (filtered.length === 0) {
    const empty = document.createElement('div')
    empty.style.cssText = 'padding: 8px 12px; color: var(--color-text-secondary, #666);'
    empty.textContent = 'No matching commands'
    menu.appendChild(empty)
    return menu
  }
  
  // Store filtered commands for keyboard navigation
  ;(menu as any).filteredCommands = filtered
  ;(menu as any).slashStart = slashStart
  
  // Render commands
  filtered.forEach((cmd, index) => {
    const item = document.createElement('div')
    item.className = 'slash-menu-item'
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      ${index === selectedIndex ? 'background: var(--color-bg-hover, #f0f0f0);' : ''}
    `
    
    // Icon
    const icon = document.createElement('span')
    icon.style.cssText = 'width: 24px; text-align: center; margin-right: 8px; opacity: 0.8;'
    icon.textContent = cmd.icon
    item.appendChild(icon)
    
    // Text
    const text = document.createElement('div')
    text.style.flex = '1'
    
    const label = document.createElement('div')
    label.style.fontWeight = '500'
    label.textContent = cmd.label
    text.appendChild(label)
    
    const desc = document.createElement('div')
    desc.style.cssText = 'font-size: 12px; color: var(--color-text-secondary, #666);'
    desc.textContent = cmd.description
    text.appendChild(desc)
    
    item.appendChild(text)
    
    // Hover
    item.onmouseenter = () => {
      selectedIndex = index
      updateMenuSelection()
    }
    
    // Click
    item.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      hideMenu()
      setTimeout(() => {
        view.focus()
        cmd.action(view, slashStart)
      }, 10)
    }
    
    menu.appendChild(item)
  })
  
  return menu
}

// Update menu selection
function updateMenuSelection() {
  if (!menuElement) return
  const items = menuElement.querySelectorAll('.slash-menu-item')
  items.forEach((item, index) => {
    const el = item as HTMLElement
    if (index === selectedIndex) {
      el.style.background = 'var(--color-bg-hover, #f0f0f0)'
    } else {
      el.style.background = 'transparent'
    }
  })
}

// Show menu
function showMenu(view: EditorView, pos: number, filter: string) {
  // Always recreate menu to ensure proper filtering
  hideMenu()
  
  currentView = view
  commandStart = pos
  selectedIndex = 0
  
  // Create menu
  menuElement = createMenu(COMMANDS, filter, view, pos)
  document.body.appendChild(menuElement)
  
  // Position menu at cursor
  const coords = view.coordsAtPos(pos)
  if (coords) {
    menuElement.style.left = coords.left + 'px'
    menuElement.style.top = (coords.bottom + 5) + 'px'
  }
  
  // Keyboard handler
  const keyHandler = (e: KeyboardEvent) => {
    if (!menuElement) return
    
    const filteredItems = (menuElement as any).filteredCommands || []
    const slashPos = (menuElement as any).slashStart || commandStart
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex = (selectedIndex + 1) % filteredItems.length
        updateMenuSelection()
        break
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex = selectedIndex === 0 ? filteredItems.length - 1 : selectedIndex - 1
        updateMenuSelection()
        break
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        // Execute the first filtered command (or selected if using arrows)
        if (filteredItems.length > 0) {
          // Ensure selectedIndex is valid, default to 0 (first item)
          const index = Math.min(Math.max(0, selectedIndex), filteredItems.length - 1)
          const command = filteredItems[index]
          hideMenu()
          // Execute command after menu is hidden
          setTimeout(() => {
            view.focus() // Ensure view has focus
            command.action(view, slashPos)
          }, 10) // Small delay to ensure menu is fully removed
        }
        break
      case 'Escape':
        e.preventDefault()
        hideMenu()
        break
    }
  }
  
  document.addEventListener('keydown', keyHandler, true) // Use capture phase
  menuElement.dataset.keyHandler = 'true'
  
  // Store handler for cleanup
  ;(menuElement as any).keyHandler = keyHandler
}

// Hide menu
function hideMenu() {
  if (menuElement) {
    if ((menuElement as any).keyHandler) {
      document.removeEventListener('keydown', (menuElement as any).keyHandler, true)
    }
    menuElement.remove()
    menuElement = null
  }
  currentView = null
}

// Extension
export const slashMenuExtension = EditorView.updateListener.of(update => {
  if (!update.docChanged && !update.selectionSet) return
  
  const { state, view } = update
  const { from } = state.selection.main
  const line = state.doc.lineAt(from)
  const textBefore = line.text.slice(0, from - line.from)
  
  // Check for slash pattern
  const match = textBefore.match(/\/([\w]*)$/)
  if (match) {
    const slashPos = line.from + match.index!
    const filter = match[1] || ''
    showMenu(view, slashPos, filter)
  } else {
    hideMenu()
  }
  
  // Also hide on click outside
  if (update.transactions.some(tr => tr.isUserEvent('select'))) {
    if (!match) hideMenu()
  }
})