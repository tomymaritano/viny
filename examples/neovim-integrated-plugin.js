// Integrated Neovim Plugin for Nototo using built-in monaco-vim
export default {
  name: 'Neovim Integrated',
  version: '1.0.0',
  description: 'Neovim experience using integrated monaco-vim library',
  author: 'Nototo Team',
  
  activate(api) {
    console.log('🚀 Neovim Integrated plugin activated!')
    this.api = api
    this.vimMode = null
    this.enabled = true
    this.statusBarElement = null
    this.currentMode = 'NORMAL'
    
    // Bind methods
    this.setupNeovim = this.setupNeovim.bind(this)
    this.toggleNeovimMode = this.toggleNeovimMode.bind(this)
    this.createStatusBar = this.createStatusBar.bind(this)
    this.updateStatusBar = this.updateStatusBar.bind(this)
    
    // Setup when editor is available
    api.editor.onEditorCreated(() => {
      console.log('Editor created, setting up Integrated Neovim mode')
      setTimeout(() => this.setupNeovim(), 200)
    })
    
    // If editor already exists, set it up now
    setTimeout(() => {
      if (api.editor.getActiveEditor()) {
        this.setupNeovim()
      }
    }, 300)
    
    api.ui.showToast('Neovim Integrated ready! Check if vim mode is working.', 'success')
  },
  
  setupNeovim() {
    const editor = this.api.editor.getActiveEditor()
    
    // Check if monaco-vim is available
    if (!window.initVimMode) {
      console.log('monaco-vim not available, retrying...')
      setTimeout(() => this.setupNeovim(), 500)
      return
    }
    
    if (!editor) {
      console.log('Editor not available, retrying...')
      setTimeout(() => this.setupNeovim(), 500)
      return
    }
    
    console.log('🔧 Setting up Integrated Neovim mode...')
    
    try {
      // Create status bar
      this.createStatusBar()
      
      // Initialize vim mode using window.initVimMode
      this.vimMode = window.initVimMode(editor, this.statusBarElement)
      
      // Setup custom keybindings
      this.setupKeybindings(editor)
      
      this.enabled = true
      console.log('✅ Integrated Neovim mode initialized successfully')
      this.api.ui.showToast('Neovim mode activated! Press <Esc> for normal mode', 'success')
      
      // Update status periodically
      this.statusInterval = setInterval(() => {
        this.updateStatusBar()
      }, 200)
      
    } catch (error) {
      console.error('❌ Failed to initialize vim mode:', error)
      this.api.ui.showToast(`Failed to initialize vim mode: ${error.message}`, 'error')
    }
  },
  
  createStatusBar() {
    // Remove existing statusbar if any
    if (this.statusBarElement) {
      document.body.removeChild(this.statusBarElement)
    }
    
    // Create status bar
    this.statusBarElement = document.createElement('div')
    this.statusBarElement.id = 'vim-integrated-statusbar'
    this.statusBarElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: linear-gradient(90deg, #002b36 0%, #073642 100%);
      color: #839496;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 14px;
      padding: 6px 16px;
      border-top: 2px solid #268bd2;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.3);
    `
    
    // Initial content
    this.statusBarElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <span id="vim-mode-indicator" style="color: #268bd2; font-weight: bold;">-- NORMAL --</span>
        <span id="vim-command-indicator" style="color: #2aa198;"></span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span id="vim-position-indicator" style="color: #859900;"></span>
        <span style="color: #93a1a1;">⚡ Neovim</span>
      </div>
    `
    
    document.body.appendChild(this.statusBarElement)
  },
  
  setupKeybindings(editor) {
    if (!window.monaco) return
    
    const monaco = window.monaco
    
    // Ctrl+Alt+V - Toggle vim mode
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyV,
      () => this.toggleNeovimMode()
    )
    
    // F1 - Help (override default)
    editor.addCommand(
      monaco.KeyCode.F1,
      () => this.showHelp()
    )
    
    // Add save handler for :w command
    window.addEventListener('vim-save', () => {
      this.api.ui.showToast('File saved via :w command', 'success')
    })
  },
  
  updateStatusBar() {
    if (!this.statusBarElement) return
    
    const editor = this.api.editor.getActiveEditor()
    if (!editor) return
    
    // Update position
    const position = editor.getPosition()
    if (position) {
      const positionElement = this.statusBarElement.querySelector('#vim-position-indicator')
      if (positionElement) {
        const model = editor.getModel()
        const lineCount = model ? model.getLineCount() : 1
        const linePercent = Math.round((position.lineNumber / lineCount) * 100)
        positionElement.textContent = `${position.lineNumber}:${position.column} (${linePercent}%)`
      }
    }
    
    // Try to detect vim mode changes
    this.detectModeChanges()
  },
  
  detectModeChanges() {
    // Try to detect vim mode from DOM or vim instance
    const modeElement = this.statusBarElement.querySelector('#vim-mode-indicator')
    if (!modeElement) return
    
    // Check if there's vim state available
    if (this.vimMode && this.vimMode.state) {
      const state = this.vimMode.state
      let mode = 'NORMAL'
      let modeColor = '#268bd2'
      
      if (state.insertMode) {
        mode = 'INSERT'
        modeColor = '#859900'
      } else if (state.visualMode) {
        mode = 'VISUAL'
        modeColor = '#d33682'
      }
      
      if (mode !== this.currentMode) {
        modeElement.textContent = `-- ${mode} --`
        modeElement.style.color = modeColor
        this.currentMode = mode
      }
    }
  },
  
  showHelp() {
    const helpText = `
🚀 Neovim Integrated - Quick Help

BASIC USAGE:
• <Esc>      - Normal mode  
• i          - Insert before cursor
• a          - Insert after cursor
• o          - New line and insert
• v          - Visual mode

MOVEMENT:
• h,j,k,l    - Left, down, up, right
• w          - Next word
• b          - Previous word  
• 0          - Start of line
• $          - End of line
• gg         - First line
• G          - Last line

EDITING:
• dd         - Delete line
• yy         - Copy line
• p          - Paste
• u          - Undo
• Ctrl+r     - Redo

SEARCH:
• /text      - Search forward
• n          - Next match
• N          - Previous match

COMMANDS:
• :w         - Save (shows toast)
• Ctrl+Alt+V - Toggle vim mode
• F1         - This help

For full vim functionality, all standard vim commands should work!
    `
    
    console.log(helpText)
    this.api.ui.showToast('Help displayed in console (F12)', 'info')
  },
  
  toggleNeovimMode() {
    if (!this.vimMode) {
      this.setupNeovim()
      return
    }
    
    if (this.enabled) {
      // Disable vim mode
      try {
        if (this.vimMode.dispose) {
          this.vimMode.dispose()
        }
        this.enabled = false
        
        const modeElement = this.statusBarElement?.querySelector('#vim-mode-indicator')
        if (modeElement) {
          modeElement.textContent = '-- DISABLED --'
          modeElement.style.color = '#586e75'
        }
        
        this.api.ui.showToast('Neovim mode disabled', 'warning')
        console.log('Neovim mode disabled')
      } catch (error) {
        console.error('Error disabling vim mode:', error)
      }
    } else {
      // Re-enable vim mode
      this.setupNeovim()
    }
  },
  
  deactivate() {
    console.log('🔥 Neovim Integrated plugin deactivated!')
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval)
    }
    
    if (this.vimMode) {
      try {
        if (this.vimMode.dispose) {
          this.vimMode.dispose()
        }
      } catch (error) {
        console.error('Error disposing vim mode:', error)
      }
    }
    
    if (this.statusBarElement) {
      document.body.removeChild(this.statusBarElement)
    }
    
    this.enabled = false
    this.api.ui.showToast('Neovim Integrated deactivated', 'info')
  }
}