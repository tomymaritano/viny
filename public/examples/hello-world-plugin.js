// Viny Plugin: Hello World
// This is an example plugin that demonstrates basic Viny plugin functionality

export default {
  name: 'hello-world',
  version: '1.0.0',
  description: 'A simple example plugin that adds a greeting feature to Viny',
  author: 'Viny Team',
  
  // Plugin configuration
  config: {
    greeting: 'Hello',
    showInSidebar: true,
    enableNotifications: true
  },

  // Called when the plugin is activated
  activate(api) {
    console.log('Hello World plugin activated!')
    
    // Add a sidebar section
    if (this.config.showInSidebar) {
      api.ui.addSidebarSection({
        id: 'hello-world-section',
        title: 'Hello World',
        icon: '👋',
        onClick: () => {
          this.showGreeting(api)
        }
      })
    }

    // Add a toolbar button to the editor
    api.editor.addToolbarButton({
      id: 'hello-world-button',
      title: 'Say Hello',
      icon: '👋',
      onClick: () => {
        this.insertGreeting(api)
      }
    })

    // Add a custom command
    api.editor.addCommand({
      id: 'hello-world.greet',
      name: 'Hello World: Insert Greeting',
      keybinding: 'Ctrl+Shift+H',
      callback: () => {
        this.insertGreeting(api)
      }
    })

    // Add a context menu item
    api.ui.addContextMenuItem({
      id: 'hello-world-context',
      label: 'Say Hello',
      icon: '👋',
      onClick: (context) => {
        this.showGreeting(api, context)
      }
    })

    // Register a custom exporter
    api.exporters.register({
      id: 'hello-world-txt',
      name: 'Hello World Text',
      extension: 'txt',
      mimeType: 'text/plain',
      export: (notes) => {
        return notes.map(note => 
          `${this.config.greeting}! Here's your note: ${note.title}\n\n${note.content}`
        ).join('\n\n---\n\n')
      }
    })

    // Store plugin data
    api.utils.storage.set('installDate', new Date().toISOString())
    api.utils.storage.set('greetingCount', 0)

    // Show activation notification
    if (this.config.enableNotifications) {
      api.ui.showToast('Hello World plugin activated! 👋', 'success')
    }
  },

  // Called when the plugin is deactivated
  deactivate() {
    console.log('Hello World plugin deactivated!')
  },

  // Plugin methods
  showGreeting(api, context = null) {
    const count = api.utils.storage.get('greetingCount') || 0
    const newCount = count + 1
    api.utils.storage.set('greetingCount', newCount)

    const message = `${this.config.greeting}! This is greeting #${newCount} from the Hello World plugin.`
    
    if (context && context.note) {
      api.ui.showToast(`${message} Current note: "${context.note.title}"`, 'info')
    } else {
      api.ui.showToast(message, 'info')
    }
  },

  insertGreeting(api) {
    const currentNote = api.notes.getById(api.notes.getAll()[0]?.id) // Get first note as example
    if (currentNote) {
      const greeting = `\n\n---\n**${this.config.greeting} from the Hello World plugin!** 👋\n\nThis text was inserted by a plugin.\n\n`
      
      // In a real implementation, this would insert at cursor position
      const updatedContent = currentNote.content + greeting
      
      api.notes.update(currentNote.id, {
        ...currentNote,
        content: updatedContent,
        updatedAt: new Date().toISOString()
      })
      
      api.ui.showToast('Greeting inserted!', 'success')
    } else {
      api.ui.showToast('No note selected', 'warning')
    }
  },

  // Demo function for testing HTTP requests
  async fetchQuote(api) {
    try {
      const response = await api.utils.http.get('https://api.quotable.io/random')
      const data = await response.json()
      
      api.ui.showToast(`Quote: "${data.content}" - ${data.author}`, 'info')
      return data
    } catch (error) {
      api.ui.showToast('Failed to fetch quote', 'error')
      console.error('Quote fetch error:', error)
    }
  }
}

/*
Plugin Documentation:
====================

This example plugin demonstrates all the major features of the Viny Plugin API:

1. Basic plugin structure with metadata
2. Configuration options
3. Lifecycle methods (activate/deactivate) 
4. UI extensions:
   - Sidebar sections
   - Editor toolbar buttons
   - Context menu items
   - Commands with keybindings
5. Custom exporters
6. Plugin storage
7. Toast notifications
8. HTTP requests

To install this plugin:
1. Open Viny
2. Go to Settings > Plugins
3. Click "Open Plugin Manager"
4. Upload this file or install from URL

The plugin will add:
- A "Hello World" section in the sidebar
- A toolbar button in the editor
- A "Say Hello" context menu item
- A keyboard shortcut (Ctrl+Shift+H)
- A custom "Hello World Text" export format

The plugin stores data locally and tracks usage statistics.
*/