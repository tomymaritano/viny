# 🧩 Viny Plugin System

Welcome to the **Viny Plugin System** - a powerful way to extend your note-taking experience with custom functionality, UI enhancements, and workflow automations.

## 🚀 Quick Start

### Installation

1. Open Viny
2. Go to **Settings** → **Plugins** → **Open Plugin Manager**
3. Choose your installation method:
   - **Drag & Drop**: Drop `.js` plugin files directly
   - **URL Install**: Enter a plugin URL
   - **File Upload**: Click to browse for plugin files
4. Click **Activate** to enable the plugin

### Try Example Plugins

We've included several example plugins to get you started:

| Plugin              | File                              | Description                              |
| ------------------- | --------------------------------- | ---------------------------------------- |
| 🎯 **Hello World**  | `examples/hello-world-plugin.js`  | Basic plugin template with core features |
| ⌨️ **Vim Mode**     | `examples/vim-mode-plugin.js`     | Complete Vim editing experience          |
| 😊 **Emoji Picker** | `examples/emoji-picker-plugin.js` | Visual emoji picker with search          |
| 📊 **Note Counter** | `examples/note-counter-plugin.js` | Productivity stats and analytics         |

## 🌟 Featured Plugins

### Vim Mode Plugin

Transform your editor into a full Vim environment:

- **All Vim modes**: Normal, Insert, Visual, Command
- **Complete keybindings**: h,j,k,l, w,b,e, dd,yy,p, and more
- **Ex commands**: :w, :q, :wq, :set, line numbers
- **Advanced features**: Marks, macros, registers, search
- **Status bar**: Shows current mode and macro recording
- **Configurable**: Custom escape sequences, settings

```javascript
// Quick toggle: Ctrl+Shift+V
// Enter Normal mode: ESC
// Save and quit: :wq
```

### Emoji Picker Plugin

Add personality to your notes with 400+ emojis:

- **Visual picker**: Browse by categories (Smileys, People, Nature, Food, etc.)
- **Smart search**: Find emojis by name or keywords
- **Autocompletion**: Type `:smile:` → 😊, `:heart:` → ❤️
- **Recent emojis**: Quick access to frequently used emojis
- **Keyboard shortcuts**: Ctrl+; to open, quick emoji shortcuts

```javascript
// Open picker: Ctrl+; or toolbar button
// Quick emojis: Ctrl+Shift+1-5
// Autocomplete: :emoji_name:
```

### Note Counter Plugin

Track your productivity and writing habits:

- **Statistics**: Total notes, words, daily/weekly/monthly counts
- **Productivity tracking**: Daily goals and progress
- **Analytics**: Most productive days, notebook distribution
- **Auto-refresh**: Real-time updates every 30 seconds
- **Export**: Notes with embedded statistics

## 🛠️ Plugin Development

### Basic Plugin Structure

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My awesome plugin',
  author: 'Your Name',

  config: {
    enabled: true,
    customSetting: 'value',
  },

  activate(api) {
    // Plugin initialization
    api.ui.showToast('Plugin activated!', 'success')

    // Add UI elements
    api.ui.addToolbarButton({
      id: 'my-button',
      title: 'My Action',
      icon: '🚀',
      onClick: () => this.performAction(api),
    })
  },

  deactivate() {
    // Cleanup when plugin is disabled
    console.log('Plugin deactivated')
  },

  performAction(api) {
    // Your plugin logic here
    const notes = api.notes.getAll()
    api.ui.showToast(`Found ${notes.length} notes`, 'info')
  },
}
```

### Rich API Access

The plugin API provides comprehensive access to:

- **📝 Notes**: Create, read, update, delete, search
- **🎨 UI**: Toolbars, sidebars, modals, notifications
- **✏️ Editor**: Commands, keybindings, syntax highlighting
- **📤 Export**: Custom export formats
- **🎯 Utils**: Storage, HTTP requests, file operations

### Example: Adding a Custom Command

```javascript
activate(api) {
  // Add keyboard shortcut
  api.editor.addCommand({
    id: 'insert-timestamp',
    name: 'Insert Current Timestamp',
    keybinding: 'Ctrl+Shift+T',
    callback: () => {
      const timestamp = new Date().toISOString()
      api.editor.insertText(timestamp)
      api.ui.showToast('Timestamp inserted!', 'success')
    }
  })
}
```

### Example: Custom Export Format

```javascript
activate(api) {
  api.exporters.register({
    id: 'word-count-txt',
    name: 'Text with Word Count',
    extension: 'txt',
    mimeType: 'text/plain',
    export: (notes) => {
      return notes.map(note => {
        const wordCount = note.content.split(' ').length
        return `${note.title} (${wordCount} words)\n${'='.repeat(50)}\n${note.content}\n\n`
      }).join('')
    }
  })
}
```

## 📚 Documentation

### Complete Guides

- **[Plugin System Overview](docs/PLUGINS.md)** - Complete guide with examples
- **[API Reference](docs/PLUGIN-API.md)** - Detailed API documentation
- **[Development Guide](docs/PLUGINS.md#development-guide)** - Best practices and patterns

### Key Features Explained

#### Safe Execution Environment

- Plugins run in a secure sandbox
- No access to sensitive system APIs
- Isolated storage per plugin
- Safe error handling and recovery

#### Monaco Editor Integration

```javascript
api.editor.onEditorCreated(editor => {
  // Direct access to Monaco Editor instance
  editor.addAction({
    id: 'my-action',
    label: 'My Custom Action',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM],
    run: () => {
      // Custom editor logic
    },
  })
})
```

#### Event System

```javascript
// Listen for note changes
api.events.on('note-updated', note => {
  console.log(`Note "${note.title}" was updated`)
})

// Emit custom events
api.events.emit('my-plugin-event', { data: 'value' })
```

#### Persistent Storage

```javascript
// Store plugin data
api.utils.storage.set('user-preferences', { theme: 'dark' })

// Retrieve stored data
const prefs = api.utils.storage.get('user-preferences', { theme: 'light' })
```

## 🔧 Advanced Features

### Plugin Communication

```javascript
// Plugin A emits data
api.events.emit('data-updated', { type: 'notes', count: 42 })

// Plugin B listens and responds
api.events.on('data-updated', data => {
  this.updateDisplay(data.count)
})
```

### Custom Themes

```javascript
api.themes.register({
  id: 'cyberpunk',
  name: 'Cyberpunk',
  type: 'dark',
  colors: {
    background: '#0a0a0a',
    foreground: '#00ff41',
    accent: '#ff0080',
  },
})
```

### HTTP Integration

```javascript
async activate(api) {
  try {
    const response = await api.utils.http.get('https://api.quotes.com/random')
    const quote = await response.json()

    api.ui.addSidebarSection({
      id: 'daily-quote',
      title: 'Daily Quote',
      content: `<blockquote>${quote.text}</blockquote>`
    })
  } catch (error) {
    console.error('Failed to load quote:', error)
  }
}
```

## 🎯 Plugin Ideas

Here are some ideas for plugins you could create:

### Productivity

- **Pomodoro Timer**: Focus sessions with break reminders
- **Goal Tracker**: Daily/weekly writing goals
- **Time Tracker**: Track time spent on different notes
- **Word Frequency**: Analyze writing patterns

### Content Enhancement

- **Grammar Check**: Integration with grammar services
- **Spell Check**: Real-time spelling correction
- **Translation**: Translate notes to different languages
- **Citation Manager**: Bibliography and reference management

### Integration

- **Cloud Sync**: Sync with external services
- **Calendar Integration**: Link notes to calendar events
- **Task Management**: Convert notes to tasks
- **Social Sharing**: Share notes on social platforms

### UI/UX

- **Custom Themes**: Unique color schemes
- **Font Manager**: Custom fonts and typography
- **Layout Modes**: Different note display layouts
- **Animations**: Smooth transitions and effects

### Data

- **Backup Manager**: Automated backups
- **Import Tools**: Import from other note apps
- **Analytics**: Detailed usage analytics
- **Search Enhancement**: Advanced search capabilities

## 🤝 Contributing

### Sharing Your Plugin

1. Test thoroughly across different scenarios
2. Write clear documentation and examples
3. Follow security best practices
4. Submit to the community plugin registry

### Community

- **GitHub**: [Plugin Repository](https://github.com/viny/plugins)
- **Discussions**: Share ideas and get help
- **Examples**: Learn from community plugins

## 🚨 Security & Best Practices

### Security Guidelines

- ✅ Validate all user inputs
- ✅ Use HTTPS for external requests
- ✅ Sanitize HTML content
- ❌ Avoid `eval()` and similar functions
- ❌ Don't store sensitive data in plain text

### Performance Tips

- Debounce frequent operations
- Clean up event listeners in `deactivate()`
- Use lazy loading for heavy resources
- Minimize DOM operations

### Code Quality

- Use clear, descriptive names
- Handle errors gracefully
- Provide helpful user feedback
- Follow consistent code style

## 📋 Troubleshooting

### Common Issues

**Plugin Won't Load**

```javascript
// Check required fields
export default {
  name: 'required',
  version: 'required',
  description: 'required',
  activate: function () {}, // required
}
```

**API Method Not Available**

```javascript
// Check API availability
if (api.editor.addCommand) {
  api.editor.addCommand({...})
} else {
  console.warn('Command API not available in this version')
}
```

**Memory Leaks**

```javascript
deactivate() {
  // Always clean up in deactivate
  clearInterval(this.timer)
  document.removeEventListener('click', this.handler)
  this.element?.remove()
}
```

### Debugging Tips

1. Check browser console for errors
2. Use `console.log()` for debugging
3. Test with other plugins disabled
4. Verify API method signatures
5. Check plugin configuration

## 🎉 Get Started Today!

1. **Try the examples**: Install and explore the included plugins
2. **Read the docs**: Check out the complete documentation
3. **Build your first plugin**: Start with the Hello World template
4. **Join the community**: Share your creations and get help

The Viny Plugin System is designed to be powerful yet approachable. Whether you're customizing your workflow or building complex integrations, the plugin system gives you the tools you need.

**Happy coding! 🚀**

---

_For detailed documentation, examples, and API reference, see the `/docs` folder._
