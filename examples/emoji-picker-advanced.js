// Emoji Picker Plugin for Nototo
export default {
  name: 'Emoji Picker',
  version: '1.0.0',
  description: 'Add emojis to your notes with a convenient picker and search',
  author: 'Nototo Team',
  
  activate(api) {
    console.log('😀 Emoji Picker plugin activated!')
    this.api = api
    this.isPickerVisible = false
    this.pickerElement = null
    
    // Bind methods
    this.showEmojiPicker = this.showEmojiPicker.bind(this)
    this.hideEmojiPicker = this.hideEmojiPicker.bind(this)
    this.insertEmoji = this.insertEmoji.bind(this)
    this.createEmojiPicker = this.createEmojiPicker.bind(this)
    
    // Add emoji button to editor toolbar
    try {
      api.editor.addToolbarButton({
        id: 'emoji-picker',
        title: 'Insert Emoji',
        icon: '😀',
        onClick: this.showEmojiPicker
      })
    } catch (error) {
      console.log('Toolbar button not supported, using keyboard shortcut only')
    }
    
    // Setup keyboard shortcut
    this.setupKeyboardShortcut()
    
    api.ui.showToast('Emoji Picker ready! Use Ctrl+E or click 😀 button', 'success')
  },
  
  setupKeyboardShortcut() {
    // Add Ctrl+E keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !e.shiftKey && !e.altKey) {
        const editor = this.api.editor.getActiveEditor()
        if (editor && editor.hasTextFocus && editor.hasTextFocus()) {
          e.preventDefault()
          this.showEmojiPicker()
        }
      }
    })
  },
  
  showEmojiPicker() {
    if (this.isPickerVisible) {
      this.hideEmojiPicker()
      return
    }
    
    if (!this.pickerElement) {
      this.createEmojiPicker()
    }
    
    this.isPickerVisible = true
    this.pickerElement.style.display = 'block'
    
    // Focus search input
    const searchInput = this.pickerElement.querySelector('#emoji-search')
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100)
    }
  },
  
  hideEmojiPicker() {
    if (this.pickerElement) {
      this.pickerElement.style.display = 'none'
    }
    this.isPickerVisible = false
  },
  
  createEmojiPicker() {
    // Remove existing picker
    if (this.pickerElement) {
      document.body.removeChild(this.pickerElement)
    }
    
    // Create picker container
    this.pickerElement = document.createElement('div')
    this.pickerElement.id = 'emoji-picker'
    this.pickerElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      height: 400px;
      background: #002b36;
      border: 2px solid #268bd2;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
      z-index: 10000;
      display: none;
      font-family: 'SF Mono', 'Monaco', monospace;
    `
    
    // Emoji categories and data
    const emojiCategories = {
      'Smileys': {
        emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
        icon: '😀'
      },
      'Gestures': {
        emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
        icon: '👍'
      },
      'Objects': {
        emojis: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '📱', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏰', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🗑️'],
        icon: '💻'
      },
      'Nature': {
        emojis: ['🌱', '🌿', '☘️', '🍀', '🎋', '🍃', '🌾', '🌵', '🌲', '🌳', '🌴', '🌊', '🔥', '❄️', '⛄', '☀️', '🌙', '⭐', '✨', '☁️', '⛅', '🌈', '🦋', '🐝', '🐞', '🌸', '🌺', '🌻', '🌷'],
        icon: '🌱'
      },
      'Symbols': {
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '⚫'],
        icon: '❤️'
      }
    }
    
    // Create picker HTML
    this.pickerElement.innerHTML = `
      <div style="padding: 16px; height: 100%; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
          <h3 style="color: #839496; margin: 0; font-size: 16px;">Emoji Picker</h3>
          <button id="emoji-close" style="background: none; border: none; color: #586e75; cursor: pointer; font-size: 18px; padding: 4px;">×</button>
        </div>
        
        <!-- Search -->
        <input 
          id="emoji-search" 
          type="text" 
          placeholder="Search emojis..." 
          style="
            width: 100%; 
            padding: 8px 12px; 
            background: #073642; 
            border: 1px solid #586e75; 
            border-radius: 6px; 
            color: #839496; 
            font-size: 14px;
            margin-bottom: 12px;
          "
        />
        
        <!-- Categories -->
        <div id="emoji-categories" style="display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto;">
          ${Object.entries(emojiCategories).map(([name, data]) => `
            <button 
              class="emoji-category-btn" 
              data-category="${name}"
              style="
                background: #073642; 
                border: 1px solid #586e75; 
                border-radius: 6px; 
                padding: 6px; 
                color: #839496; 
                cursor: pointer; 
                font-size: 16px;
                min-width: 40px;
                transition: all 0.2s;
              "
              title="${name}"
            >${data.icon}</button>
          `).join('')}
        </div>
        
        <!-- Emoji Grid -->
        <div id="emoji-grid" style="
          flex: 1; 
          overflow-y: auto; 
          display: grid; 
          grid-template-columns: repeat(8, 1fr); 
          gap: 4px; 
          padding: 4px;
        ">
          ${emojiCategories['Smileys'].emojis.map(emoji => `
            <button 
              class="emoji-btn" 
              data-emoji="${emoji}"
              style="
                background: none; 
                border: 1px solid transparent; 
                border-radius: 4px; 
                padding: 8px; 
                font-size: 20px; 
                cursor: pointer; 
                transition: all 0.2s;
                aspect-ratio: 1;
              "
              title="${emoji}"
            >${emoji}</button>
          `).join('')}
        </div>
      </div>
    `
    
    document.body.appendChild(this.pickerElement)
    
    // Setup event listeners
    this.setupPickerEvents(emojiCategories)
  },
  
  setupPickerEvents(emojiCategories) {
    const picker = this.pickerElement
    
    // Close button
    picker.querySelector('#emoji-close').addEventListener('click', this.hideEmojiPicker)
    
    // Click outside to close
    picker.addEventListener('click', (e) => e.stopPropagation())
    document.addEventListener('click', this.hideEmojiPicker)
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPickerVisible) {
        this.hideEmojiPicker()
      }
    })
    
    // Category buttons
    picker.querySelectorAll('.emoji-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category
        this.showCategory(category, emojiCategories)
        
        // Update active state
        picker.querySelectorAll('.emoji-category-btn').forEach(b => {
          b.style.background = '#073642'
          b.style.borderColor = '#586e75'
        })
        e.target.style.background = '#268bd2'
        e.target.style.borderColor = '#268bd2'
      })
      
      // Hover effects
      btn.addEventListener('mouseenter', (e) => {
        if (e.target.style.background !== 'rgb(38, 139, 210)') {
          e.target.style.background = '#0f2936'
        }
      })
      btn.addEventListener('mouseleave', (e) => {
        if (e.target.style.background !== 'rgb(38, 139, 210)') {
          e.target.style.background = '#073642'
        }
      })
    })
    
    // Search functionality
    const searchInput = picker.querySelector('#emoji-search')
    searchInput.addEventListener('input', (e) => {
      this.searchEmojis(e.target.value, emojiCategories)
    })
    
    // Initial emoji button events
    this.setupEmojiButtons()
  },
  
  setupEmojiButtons() {
    this.pickerElement.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.target.dataset.emoji
        this.insertEmoji(emoji)
      })
      
      // Hover effects
      btn.addEventListener('mouseenter', (e) => {
        e.target.style.background = '#268bd2'
        e.target.style.borderColor = '#268bd2'
      })
      btn.addEventListener('mouseleave', (e) => {
        e.target.style.background = 'none'
        e.target.style.borderColor = 'transparent'
      })
    })
  },
  
  showCategory(categoryName, emojiCategories) {
    const grid = this.pickerElement.querySelector('#emoji-grid')
    const category = emojiCategories[categoryName]
    
    if (!category) return
    
    grid.innerHTML = category.emojis.map(emoji => `
      <button 
        class="emoji-btn" 
        data-emoji="${emoji}"
        style="
          background: none; 
          border: 1px solid transparent; 
          border-radius: 4px; 
          padding: 8px; 
          font-size: 20px; 
          cursor: pointer; 
          transition: all 0.2s;
          aspect-ratio: 1;
        "
        title="${emoji}"
      >${emoji}</button>
    `).join('')
    
    this.setupEmojiButtons()
  },
  
  searchEmojis(query, emojiCategories) {
    if (!query.trim()) {
      this.showCategory('Smileys', emojiCategories)
      return
    }
    
    // Simple search - could be enhanced with emoji names/keywords
    const allEmojis = Object.values(emojiCategories).flatMap(cat => cat.emojis)
    const grid = this.pickerElement.querySelector('#emoji-grid')
    
    // For now, just show all emojis when searching
    // In a real implementation, you'd search by emoji names/keywords
    grid.innerHTML = allEmojis.map(emoji => `
      <button 
        class="emoji-btn" 
        data-emoji="${emoji}"
        style="
          background: none; 
          border: 1px solid transparent; 
          border-radius: 4px; 
          padding: 8px; 
          font-size: 20px; 
          cursor: pointer; 
          transition: all 0.2s;
          aspect-ratio: 1;
        "
        title="${emoji}"
      >${emoji}</button>
    `).join('')
    
    this.setupEmojiButtons()
  },
  
  insertEmoji(emoji) {
    const editor = this.api.editor.getActiveEditor()
    if (!editor) {
      this.api.ui.showToast('No editor active', 'warning')
      return
    }
    
    // Insert emoji at cursor position
    const position = editor.getPosition()
    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    }
    
    editor.executeEdits('emoji-insert', [{
      range: range,
      text: emoji
    }])
    
    // Move cursor after emoji
    editor.setPosition({
      lineNumber: position.lineNumber,
      column: position.column + emoji.length
    })
    
    // Focus back to editor
    editor.focus()
    
    // Hide picker
    this.hideEmojiPicker()
    
    this.api.ui.showToast(`Inserted ${emoji}`, 'success')
  },
  
  deactivate() {
    console.log('😀 Emoji Picker plugin deactivated!')
    
    if (this.pickerElement) {
      document.body.removeChild(this.pickerElement)
    }
    
    // Remove event listeners would go here in a more complete implementation
    this.api.ui.showToast('Emoji Picker deactivated', 'info')
  }
}