# 🔧 Viny Plugin API Reference

## Quick Reference

### API Structure

```javascript
const api = {
  notes: { getAll, getById, create, update, delete, search },
  ui: { showToast, addSidebarSection, addToolbarButton, addContextMenuItem, addSettingsPanel, showModal },
  editor: { addCommand, addSyntaxHighlight, addKeyBinding, addToolbarButton, onEditorCreated, onTextChange },
  exporters: { register },
  themes: { register },
  utils: { storage, http, file }
}
```

## Notes API

### `api.notes.getAll()`

Returns all notes in the application.

**Returns**: `Array<Note>`

```javascript
const notes = api.notes.getAll()
console.log(`Total notes: ${notes.length}`)
```

### `api.notes.getById(id)`

Retrieves a specific note by its ID.

**Parameters**:

- `id` (string): The note ID

**Returns**: `Note | undefined`

```javascript
const note = api.notes.getById('note-123')
if (note) {
  console.log(note.title)
}
```

### `api.notes.create(noteData)`

Creates a new note.

**Parameters**:

- `noteData` (object): Note data
  - `title` (string): Note title
  - `content` (string): Note content
  - `notebook` (string, optional): Notebook name
  - `tags` (Array<string>, optional): Tags array
  - `status` (string, optional): Note status

**Returns**: `Note`

```javascript
const newNote = api.notes.create({
  title: 'My New Note',
  content: '# Hello World\n\nThis is my first note!',
  notebook: 'Personal',
  tags: ['important', 'draft'],
  status: 'active',
})
```

### `api.notes.update(id, updates)`

Updates an existing note.

**Parameters**:

- `id` (string): Note ID
- `updates` (object): Fields to update

**Returns**: `Note`

```javascript
api.notes.update('note-123', {
  title: 'Updated Title',
  content: 'Updated content...',
  updatedAt: new Date().toISOString(),
})
```

### `api.notes.delete(id)`

Deletes a note (moves to trash).

**Parameters**:

- `id` (string): Note ID

```javascript
api.notes.delete('note-123')
```

### `api.notes.search(query)`

Searches notes by content, title, or tags.

**Parameters**:

- `query` (string): Search query

**Returns**: `Array<Note>`

```javascript
const results = api.notes.search('important meeting')
console.log(`Found ${results.length} matching notes`)
```

## UI API

### `api.ui.showToast(message, type)`

Displays a toast notification.

**Parameters**:

- `message` (string): Message to display
- `type` (string): 'success', 'error', 'warning', 'info'

```javascript
api.ui.showToast('Note saved successfully!', 'success')
api.ui.showToast('Failed to save note', 'error')
```

### `api.ui.addSidebarSection(config)`

Adds a section to the sidebar.

**Parameters**:

- `config` (object):
  - `id` (string): Unique section ID
  - `title` (string): Section title
  - `icon` (string): Icon (emoji or HTML)
  - `onClick` (function): Click handler
  - `content` (string, optional): Custom HTML content

```javascript
api.ui.addSidebarSection({
  id: 'my-plugin-section',
  title: 'My Plugin',
  icon: '🔧',
  onClick: () => {
    api.ui.showToast('Section clicked!', 'info')
  },
})
```

### `api.ui.addToolbarButton(config)`

Adds a button to the main toolbar.

**Parameters**:

- `config` (object):
  - `id` (string): Unique button ID
  - `title` (string): Button tooltip
  - `icon` (string): Button icon
  - `onClick` (function): Click handler

```javascript
api.ui.addToolbarButton({
  id: 'my-action-button',
  title: 'Perform Action',
  icon: '⚡',
  onClick: () => {
    // Perform action
  },
})
```

### `api.ui.addContextMenuItem(config)`

Adds an item to context menus.

**Parameters**:

- `config` (object):
  - `id` (string): Unique item ID
  - `label` (string): Menu item text
  - `icon` (string): Item icon
  - `onClick` (function): Click handler with context

```javascript
api.ui.addContextMenuItem({
  id: 'custom-action',
  label: 'Custom Action',
  icon: '🎯',
  onClick: context => {
    console.log('Context:', context)
    // Handle action with context
  },
})
```

### `api.ui.addSettingsPanel(config)`

Adds a panel to the settings dialog.

**Parameters**:

- `config` (object):
  - `id` (string): Unique panel ID
  - `title` (string): Panel title
  - `content` (string): Panel HTML content

```javascript
api.ui.addSettingsPanel({
  id: 'my-plugin-settings',
  title: 'My Plugin Settings',
  content: `
    <div>
      <label>
        <input type="checkbox" id="enable-feature"> 
        Enable Feature
      </label>
    </div>
  `,
})
```

### `api.ui.showModal(component)`

Displays a modal dialog.

**Parameters**:

- `component` (object): Modal configuration

```javascript
api.ui.showModal({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  buttons: [
    { text: 'Cancel', action: 'close' },
    { text: 'Confirm', action: 'confirm', style: 'primary' },
  ],
})
```

## Editor API

### `api.editor.addCommand(config)`

Adds a command to the editor.

**Parameters**:

- `config` (object):
  - `id` (string): Unique command ID
  - `name` (string): Command name
  - `keybinding` (string, optional): Keyboard shortcut
  - `callback` (function): Command handler

```javascript
api.editor.addCommand({
  id: 'my-plugin.insert-timestamp',
  name: 'Insert Current Timestamp',
  keybinding: 'Ctrl+Shift+T',
  callback: () => {
    const timestamp = new Date().toISOString()
    api.editor.insertText(timestamp)
  },
})
```

### `api.editor.addSyntaxHighlight(config)`

Adds custom syntax highlighting.

**Parameters**:

- `config` (object):
  - `language` (string): Language identifier
  - `rules` (Array): Token rules for highlighting

```javascript
api.editor.addSyntaxHighlight({
  language: 'custom-markup',
  rules: [
    { token: 'keyword', foreground: 'ff0000', fontStyle: 'bold' },
    { token: 'string', foreground: '00ff00' },
    { token: 'comment', foreground: '999999', fontStyle: 'italic' },
  ],
})
```

### `api.editor.addKeyBinding(config)`

Adds custom key bindings.

**Parameters**:

- `config` (object):
  - `key` (string): Key combination
  - `command` (function): Key handler
  - `when` (string, optional): Context condition

```javascript
api.editor.addKeyBinding({
  key: 'Ctrl+K',
  command: () => {
    api.ui.showToast('Custom keybinding triggered!', 'info')
  },
  when: 'editorTextFocus',
})
```

### `api.editor.addToolbarButton(config)`

Adds a button to the editor toolbar.

**Parameters**:

- `config` (object):
  - `id` (string): Unique button ID
  - `title` (string): Button tooltip
  - `icon` (string): Button icon
  - `onClick` (function): Click handler

```javascript
api.editor.addToolbarButton({
  id: 'format-code',
  title: 'Format Code',
  icon: '🎨',
  onClick: () => {
    // Format current code block
  },
})
```

### `api.editor.onEditorCreated(callback)`

Registers a callback for when Monaco Editor instances are created.

**Parameters**:

- `callback` (function): Called with editor instance

```javascript
api.editor.onEditorCreated(editor => {
  console.log('New editor created:', editor)

  // Setup custom decorations
  editor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(1, 1, 1, 10),
        options: {
          inlineClassName: 'my-highlight',
        },
      },
    ]
  )
})
```

### `api.editor.onTextChange(callback)`

Registers a callback for text changes.

**Parameters**:

- `callback` (function): Called with change details

```javascript
api.editor.onTextChange(changes => {
  console.log('Text changed:', changes)
  // Handle auto-save, live preview, etc.
})
```

### Editor Utility Methods

```javascript
// Insert text at cursor position
api.editor.insertText('Hello World!')

// Replace selected text
api.editor.replaceSelection('New text')

// Get current selection
const selection = api.editor.getSelection()

// Set cursor position
api.editor.setCursor(10, 5) // line 10, column 5

// Get full editor content
const content = api.editor.getContent()

// Set editor content
api.editor.setContent('New content...')
```

## Exporters API

### `api.exporters.register(config)`

Registers a custom export format.

**Parameters**:

- `config` (object):
  - `id` (string): Unique exporter ID
  - `name` (string): Display name
  - `extension` (string): File extension
  - `mimeType` (string): MIME type
  - `export` (function): Export function

```javascript
api.exporters.register({
  id: 'custom-json',
  name: 'Custom JSON Format',
  extension: 'json',
  mimeType: 'application/json',
  export: notes => {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalNotes: notes.length,
        notes: notes.map(note => ({
          title: note.title,
          content: note.content,
          wordCount: note.content.split(' ').length,
        })),
      },
      null,
      2
    )
  },
})
```

## Themes API

### `api.themes.register(config)`

Registers a custom theme.

**Parameters**:

- `config` (object):
  - `id` (string): Unique theme ID
  - `name` (string): Theme display name
  - `type` (string): 'light' or 'dark'
  - `colors` (object): Color definitions
  - `monaco` (object): Monaco editor theme

```javascript
api.themes.register({
  id: 'ocean-blue',
  name: 'Ocean Blue',
  type: 'dark',
  colors: {
    background: '#0c1021',
    foreground: '#8bb8e8',
    accent: '#00d4ff',
    sidebar: '#0a0e1a',
    border: '#1a2332',
  },
  monaco: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#0c1021',
      'editor.foreground': '#8bb8e8',
    },
  },
})
```

## Utils API

### Storage

Plugin-specific local storage:

```javascript
// Store data
api.utils.storage.set('my-setting', 'value')
api.utils.storage.set('user-preferences', { theme: 'dark', lang: 'en' })

// Retrieve data
const setting = api.utils.storage.get('my-setting')
const prefs = api.utils.storage.get('user-preferences', { theme: 'light' }) // default value

// Remove data
api.utils.storage.remove('my-setting')

// Clear all plugin data
api.utils.storage.clear()
```

### HTTP

Make HTTP requests:

```javascript
// GET request
try {
  const response = await api.utils.http.get('https://api.example.com/data')
  const data = await response.json()
  console.log(data)
} catch (error) {
  console.error('Request failed:', error)
}

// POST request
const result = await api.utils.http.post(
  'https://api.example.com/save',
  {
    title: 'New Post',
    content: 'Post content...',
  },
  {
    headers: {
      Authorization: 'Bearer token123',
    },
  }
)

// PUT request
await api.utils.http.put('https://api.example.com/update/123', {
  status: 'published',
})

// DELETE request
await api.utils.http.delete('https://api.example.com/posts/123')
```

### File Operations

File system access (when available):

```javascript
// Read file
const content = await api.utils.file.read('/path/to/file.txt')

// Write file
await api.utils.file.write('/path/to/output.txt', 'File content...')

// Check if file exists
const exists = await api.utils.file.exists('/path/to/file.txt')

// Get file info
const stats = await api.utils.file.stat('/path/to/file.txt')
console.log('File size:', stats.size)

// List directory
const files = await api.utils.file.readdir('/path/to/directory')
```

## Data Types

### Note Object

```typescript
interface Note {
  id: string
  title: string
  content: string
  notebook: string
  tags: string[]
  status: 'draft' | 'active' | 'archived'
  isPinned: boolean
  isTrashed: boolean
  createdAt: string // ISO date
  updatedAt: string // ISO date
  trashedAt?: string // ISO date
  metadata?: {
    wordCount: number
    readingTime: number
    [key: string]: any
  }
}
```

### Context Object

```typescript
interface Context {
  note?: Note
  selection?: {
    text: string
    start: number
    end: number
  }
  cursor?: {
    line: number
    column: number
  }
  editor?: MonacoEditor
}
```

## Error Handling

Always handle errors in your plugins:

```javascript
activate(api) {
  try {
    // Plugin initialization
    this.setupFeatures(api)
  } catch (error) {
    console.error('Plugin activation failed:', error)
    api.ui.showToast('Plugin failed to load', 'error')
  }
}

async loadExternalData() {
  try {
    const data = await api.utils.http.get('https://api.example.com/data')
    return await data.json()
  } catch (error) {
    console.error('Failed to load data:', error)
    api.ui.showToast('Failed to load external data', 'warning')
    return null
  }
}
```

## Events System

Listen for and emit custom events:

```javascript
// Listen for events
api.events.on('note-created', note => {
  console.log('New note created:', note.title)
})

api.events.on('note-updated', note => {
  this.updatePluginState(note)
})

// Emit events
api.events.emit('plugin-action', { type: 'custom', data: 'value' })

// One-time listeners
api.events.once('app-ready', () => {
  this.performInitialSetup()
})

// Remove listeners
const handler = data => console.log(data)
api.events.on('custom-event', handler)
api.events.off('custom-event', handler)
```

## Lifecycle Hooks

Additional lifecycle methods for advanced plugins:

```javascript
export default {
  name: 'advanced-plugin',

  // Called before activation
  beforeActivate(api) {
    console.log('Preparing to activate...')
    return this.checkCompatibility(api)
  },

  // Main activation
  activate(api) {
    this.setupPlugin(api)
  },

  // Called when settings change
  onConfigChange(newConfig, oldConfig) {
    console.log('Config changed:', newConfig)
    this.updateSettings(newConfig)
  },

  // Called before deactivation
  beforeDeactivate() {
    return this.saveState()
  },

  // Main deactivation
  deactivate() {
    this.cleanup()
  },
}
```

## Performance Considerations

### Debouncing

```javascript
// Debounce frequent operations
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const debouncedSearch = debounce(query => {
  this.performSearch(query)
}, 300)
```

### Throttling

```javascript
// Throttle scroll/resize events
const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
```

### Memory Management

```javascript
deactivate() {
  // Clear intervals and timeouts
  clearInterval(this.updateTimer)
  clearTimeout(this.saveTimeout)

  // Remove event listeners
  this.eventHandlers.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler)
  })

  // Clean up DOM elements
  this.createdElements.forEach(element => element.remove())

  // Clear references
  this.api = null
  this.cache = null
}
```

This API reference provides comprehensive coverage of the Viny Plugin System. Use it as a reference while developing your plugins!
