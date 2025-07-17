# 🧩 Viny Plugin System Documentation

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Plugin API Reference](#plugin-api-reference)
- [Example Plugins](#example-plugins)
- [Advanced Features](#advanced-features)
- [Development Guide](#development-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Viny Plugin System allows you to extend the functionality of your note-taking application with custom features, UI enhancements, and workflow automations. Plugins are JavaScript modules that integrate seamlessly with Viny's core functionality.

### 🌟 Key Features

- **Safe Execution**: Plugins run in a secure sandbox environment
- **Rich API**: Comprehensive access to notes, UI, editor, and utilities
- **Hot Loading**: Install and activate plugins without restarting
- **Local Storage**: Isolated storage for each plugin
- **Event System**: Hook into application events and extend functionality
- **Monaco Integration**: Full editor customization capabilities

## Getting Started

### Installing Plugins

1. **Via Plugin Manager**:
   - Go to `Settings` → `Plugins` → `Open Plugin Manager`
   - Choose installation method:
     - **File Upload**: Drag & drop `.js` files
     - **URL Install**: Enter plugin URL
   - Click `Activate` to enable the plugin

2. **Quick Access**:
   - Use `Ctrl+Shift+V` to toggle plugin features
   - Access plugin settings in the main Settings panel

### Plugin Structure

Every Viny plugin follows this basic structure:

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My awesome plugin',
  author: 'Your Name',

  config: {
    // Plugin configuration options
    enabled: true,
    customSetting: 'value',
  },

  activate(api) {
    // Plugin initialization code
    console.log('Plugin activated!')

    // Use the API to extend Viny
    api.ui.showToast('Hello from my plugin!', 'success')
  },

  deactivate() {
    // Cleanup code when plugin is deactivated
    console.log('Plugin deactivated!')
  },
}
```

## Plugin API Reference

### Core API Structure

The plugin API is passed to your `activate()` function and provides access to:

```javascript
const api = {
  notes: {
    /* Note management */
  },
  ui: {
    /* User interface */
  },
  editor: {
    /* Editor extensions */
  },
  exporters: {
    /* Custom export formats */
  },
  themes: {
    /* Theme system */
  },
  utils: {
    /* Utilities and helpers */
  },
}
```

### 📝 Notes API

Manage and interact with notes:

```javascript
// Get all notes
const allNotes = api.notes.getAll()

// Get specific note
const note = api.notes.getById('note-id')

// Create new note
const newNote = api.notes.create({
  title: 'New Note',
  content: 'Note content...',
  notebook: 'Personal',
  tags: ['important'],
})

// Update existing note
api.notes.update('note-id', {
  title: 'Updated Title',
  content: 'Updated content...',
  updatedAt: new Date().toISOString(),
})

// Delete note
api.notes.delete('note-id')

// Search notes
const results = api.notes.search('search query')
```

### 🎨 UI API

Extend the user interface:

```javascript
// Show notifications
api.ui.showToast('Message', 'success') // success, error, warning, info

// Add sidebar sections
api.ui.addSidebarSection({
  id: 'my-section',
  title: 'My Section',
  icon: '🎯',
  onClick: () => {
    /* handle click */
  },
})

// Add toolbar buttons
api.ui.addToolbarButton({
  id: 'my-button',
  title: 'My Button',
  icon: '🔧',
  onClick: () => {
    /* handle click */
  },
})

// Add context menu items
api.ui.addContextMenuItem({
  id: 'my-menu-item',
  label: 'My Action',
  icon: '⚡',
  onClick: context => {
    /* handle click */
  },
})

// Add settings panels
api.ui.addSettingsPanel({
  id: 'my-settings',
  title: 'My Plugin Settings',
  content: '<div>Settings UI</div>',
})

// Show modal dialogs
api.ui.showModal(customComponent)
```

### ✏️ Editor API

Enhance the Monaco Editor:

```javascript
// Add editor commands
api.editor.addCommand({
  id: 'my-command',
  name: 'My Command',
  keybinding: 'Ctrl+Shift+M',
  callback: () => {
    /* command logic */
  },
})

// Add custom syntax highlighting
api.editor.addSyntaxHighlight({
  language: 'custom-lang',
  rules: [{ token: 'keyword', foreground: 'ff0000' }],
})

// Add key bindings
api.editor.addKeyBinding({
  key: 'Ctrl+K',
  command: () => {
    /* key handler */
  },
  when: 'editorTextFocus',
})

// Add toolbar buttons
api.editor.addToolbarButton({
  id: 'editor-button',
  title: 'Editor Action',
  icon: '📝',
  onClick: () => {
    /* button action */
  },
})
```

### 📤 Exporters API

Create custom export formats:

```javascript
api.exporters.register({
  id: 'my-format',
  name: 'My Custom Format',
  extension: 'mycf',
  mimeType: 'application/x-my-format',
  export: notes => {
    // Transform notes to your format
    return notes
      .map(note => `# ${note.title}\n\n${note.content}`)
      .join('\n\n---\n\n')
  },
})
```

### 🎨 Themes API

Register custom themes:

```javascript
api.themes.register({
  id: 'my-theme',
  name: 'My Theme',
  type: 'dark', // or 'light'
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    accent: '#007acc',
  },
  monaco: {
    base: 'vs-dark',
    rules: [{ token: 'comment', foreground: '6A9955' }],
  },
})
```

### 🛠️ Utils API

Utility functions and helpers:

```javascript
// Plugin-specific storage
api.utils.storage.set('key', 'value')
const value = api.utils.storage.get('key')
api.utils.storage.remove('key')

// HTTP requests
const response = await api.utils.http.get('https://api.example.com/data')
const result = await api.utils.http.post('https://api.example.com/save', {
  data: 'payload',
})

// File operations (if available)
const content = await api.utils.file.read('/path/to/file')
await api.utils.file.write('/path/to/file', 'content')
```

## Example Plugins

### 1. Hello World Plugin

Basic plugin demonstrating core concepts:

```javascript
export default {
  name: 'hello-world',
  version: '1.0.0',
  description: 'Simple greeting plugin',
  author: 'Demo',

  activate(api) {
    api.ui.addToolbarButton({
      id: 'hello-button',
      title: 'Say Hello',
      icon: '👋',
      onClick: () => {
        api.ui.showToast('Hello, World! 👋', 'success')
      },
    })
  },

  deactivate() {
    console.log('Goodbye!')
  },
}
```

### 2. Vim Mode Plugin

Advanced editor enhancement:

```javascript
export default {
  name: 'vim-mode',
  version: '2.0.0',
  description: 'Complete Vim mode for editor',

  config: {
    enabled: true,
    showStatusBar: true,
    escapeSequence: 'jk',
  },

  activate(api) {
    this.vimState = { mode: 'normal' }

    // Add vim keybindings
    api.editor.addKeyBinding({
      key: 'Escape',
      command: () => this.enterNormalMode(),
      when: 'editorTextFocus',
    })

    // Add status bar
    this.createStatusBar(api)

    api.ui.showToast('Vim mode activated! Press ESC for Normal mode', 'success')
  },

  enterNormalMode() {
    this.vimState.mode = 'normal'
    this.updateStatusBar()
  },

  createStatusBar(api) {
    // Implementation details...
  },
}
```

### 3. Emoji Picker Plugin

Rich UI enhancement:

```javascript
export default {
  name: 'emoji-picker',
  version: '1.5.0',
  description: 'Visual emoji picker with search',

  activate(api) {
    this.emojiData = this.loadEmojiDatabase()

    // Add toolbar button
    api.editor.addToolbarButton({
      id: 'emoji-picker',
      title: 'Insert Emoji',
      icon: '😊',
      onClick: () => this.showEmojiPicker(),
    })

    // Add keyboard shortcut
    api.editor.addCommand({
      id: 'emoji-picker.toggle',
      name: 'Toggle Emoji Picker',
      keybinding: 'Ctrl+;',
      callback: () => this.toggleEmojiPicker(),
    })

    // Setup autocompletion
    this.setupAutoCompletion(api)
  },
}
```

## Advanced Features

### Plugin Communication

Plugins can communicate with each other through the event system:

```javascript
// Plugin A - Emit event
api.events.emit('data-updated', { type: 'note', id: 'note-123' })

// Plugin B - Listen for event
api.events.on('data-updated', data => {
  console.log('Data updated:', data)
})
```

### Monaco Editor Integration

Deep integration with Monaco Editor:

```javascript
activate(api) {
  // Access Monaco instance
  api.editor.onEditorCreated((editor) => {
    // Register completion provider
    editor.getModel().onDidChangeContent(() => {
      this.updateCompletions(editor)
    })

    // Add custom decorations
    editor.deltaDecorations([], [{
      range: new monaco.Range(1, 1, 1, 10),
      options: {
        inlineClassName: 'my-highlight'
      }
    }])
  })
}
```

### Async Operations

Handle asynchronous operations properly:

```javascript
async activate(api) {
  // Load external data
  const config = await this.loadConfig()

  // Setup with loaded data
  this.setupFeatures(api, config)

  // Periodic updates
  setInterval(() => {
    this.updateData(api)
  }, 30000)
}
```

## Development Guide

### Setting Up Development Environment

1. **Create plugin file**:

   ```bash
   touch my-plugin.js
   ```

2. **Basic template**:

   ```javascript
   export default {
     name: 'my-plugin',
     version: '1.0.0',
     description: 'My plugin description',
     author: 'Your Name',

     activate(api) {
       // Your plugin code here
     },

     deactivate() {
       // Cleanup code here
     },
   }
   ```

3. **Test in Viny**:
   - Install via Plugin Manager
   - Check browser console for errors
   - Use `console.log()` for debugging

### Plugin Lifecycle

1. **Installation**: Plugin file is validated and registered
2. **Activation**: `activate(api)` method is called
3. **Runtime**: Plugin responds to events and user interactions
4. **Deactivation**: `deactivate()` method is called
5. **Uninstallation**: All plugin data is cleaned up

### Error Handling

Always handle errors gracefully:

```javascript
activate(api) {
  try {
    this.setupFeatures(api)
  } catch (error) {
    console.error('Plugin setup failed:', error)
    api.ui.showToast('Plugin failed to load', 'error')
  }
}
```

## Best Practices

### 🏗️ Architecture

- **Single Responsibility**: Each plugin should have one clear purpose
- **Modular Design**: Break complex plugins into smaller modules
- **Event-Driven**: Use events for loose coupling between components
- **Graceful Degradation**: Handle missing APIs or features

### 🚀 Performance

- **Lazy Loading**: Load heavy resources only when needed
- **Debouncing**: Limit frequent operations (search, auto-save)
- **Memory Management**: Clean up event listeners and timers
- **Efficient Queries**: Minimize DOM operations and API calls

### 🔒 Security

- **Input Validation**: Sanitize user input and external data
- **Safe HTML**: Use textContent instead of innerHTML when possible
- **HTTPS Only**: Only fetch from secure endpoints
- **No Eval**: Avoid `eval()` and similar dangerous functions

### 📝 Code Quality

- **Clear Naming**: Use descriptive variable and function names
- **Comments**: Document complex logic and API usage
- **Error Messages**: Provide helpful error messages to users
- **Version Control**: Use semantic versioning for updates

### 🎨 User Experience

- **Consistent UI**: Match Viny's design language
- **Keyboard Accessible**: Support keyboard navigation
- **Responsive Feedback**: Show loading states and confirmations
- **Progressive Enhancement**: Core features work without plugins

## Troubleshooting

### Common Issues

#### Plugin Won't Load

```javascript
// Check console for errors
console.error('Plugin validation failed')

// Verify plugin structure
export default {
  name: 'required',
  version: 'required',
  description: 'required',
  activate: function () {}, // required
}
```

#### API Method Not Found

```javascript
// Check API availability
if (api.editor.addCommand) {
  api.editor.addCommand({...})
} else {
  console.warn('Command API not available')
}
```

#### Memory Leaks

```javascript
deactivate() {
  // Clean up event listeners
  document.removeEventListener('click', this.handler)

  // Clear timers
  clearInterval(this.timer)

  // Remove DOM elements
  this.element?.remove()
}
```

### Debugging Tips

1. **Use Browser DevTools**: Check Console, Network, and Application tabs
2. **Enable Verbose Logging**: Add detailed console.log statements
3. **Test in Isolation**: Disable other plugins to isolate issues
4. **Check API Compatibility**: Ensure you're using supported API methods
5. **Validate Input Data**: Check that note data matches expected format

### Getting Help

- **Documentation**: Check this guide and API reference
- **Console Logs**: Look for error messages in browser console
- **Community**: Ask questions in Viny community forums
- **Examples**: Study the example plugins for common patterns

## Plugin Registry

### Available Plugins

| Plugin           | Description                          | Version | Author    |
| ---------------- | ------------------------------------ | ------- | --------- |
| **Vim Mode**     | Complete Vim editing experience      | 2.0.0   | Viny Team |
| **Emoji Picker** | Visual emoji picker with search      | 1.5.0   | Community |
| **Note Counter** | Productivity statistics and tracking | 1.2.0   | Community |
| **Hello World**  | Basic plugin template and examples   | 1.0.0   | Viny Team |

### Contributing Plugins

To share your plugin with the community:

1. Test thoroughly in different scenarios
2. Write clear documentation
3. Follow security best practices
4. Submit to plugin registry
5. Provide example usage

---

**Happy Plugin Development! 🚀**

The Viny Plugin System is designed to be powerful yet simple. Start with the basic examples and gradually explore more advanced features as you become comfortable with the API.

For questions or contributions, please visit our [GitHub repository](https://github.com/viny/plugins) or join our community discussions.
