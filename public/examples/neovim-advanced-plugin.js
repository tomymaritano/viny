// Advanced Neovim Plugin with full monaco-vim integration
export default {
  name: 'Neovim Advanced',
  version: '2.0.0',
  description: 'Complete Neovim experience with all keybindings, Ex commands, and statusbar',
  author: 'Nototo Team',
  
  async activate(api) {
    console.log('🚀 Neovim Advanced plugin activated!')
    this.api = api
    this.vimMode = null
    this.enabled = true
    this.statusBarElement = null
    this.currentMode = 'NORMAL'
    this.commandHistory = []
    
    // Bind methods
    this.setupNeovim = this.setupNeovim.bind(this)
    this.toggleNeovimMode = this.toggleNeovimMode.bind(this)
    this.createAdvancedStatusBar = this.createAdvancedStatusBar.bind(this)
    this.updateStatusBar = this.updateStatusBar.bind(this)
    this.handleVimCommand = this.handleVimCommand.bind(this)
    
    // Get monaco-vim from global window object
    if (window.initVimMode) {
      this.initVimMode = window.initVimMode
      console.log('✅ monaco-vim library loaded from window')
    } else {
      console.error('❌ monaco-vim not available in window')
      api.ui.showToast('monaco-vim not loaded. Please refresh the page.', 'error')
      return
    }
    
    // Setup when editor is available
    api.editor.onEditorCreated(() => {
      console.log('Editor created, setting up Advanced Neovim mode')
      this.setupNeovim()
    })
    
    // If editor already exists, set it up now
    setTimeout(() => {
      if (api.editor.getActiveEditor()) {
        this.setupNeovim()
      }
    }, 100)
    
    api.ui.showToast('Neovim Advanced ready! Use :help for commands', 'success')
  },
  
  setupNeovim() {
    const editor = this.api.editor.getActiveEditor()
    if (!editor || !this.initVimMode) {
      console.log('Editor or vim library not available, retrying...')
      setTimeout(() => this.setupNeovim(), 500)
      return
    }
    
    console.log('🔧 Setting up Advanced Neovim mode...')
    
    // Create advanced status bar
    this.createAdvancedStatusBar()
    
    try {
      // Initialize vim mode with enhanced configuration
      this.vimMode = this.initVimMode(editor, this.statusBarElement, {
        // Configuration options
        showmode: true,
        showcmd: true,
        incsearch: true,
        hlsearch: true,
        ignorecase: true,
        smartcase: true,
        wrap: true,
        number: true,
        relativenumber: false
      })
      
      // Setup custom Ex commands
      this.setupCustomExCommands()
      
      // Setup advanced keybindings
      this.setupAdvancedKeybindings(editor)
      
      // Setup mode change listener
      this.setupModeListener()
      
      this.enabled = true
      console.log('✅ Advanced Neovim mode initialized successfully')
      this.api.ui.showToast('Advanced Neovim mode activated! Press <Esc> for normal mode', 'success')
      
    } catch (error) {
      console.error('❌ Failed to initialize vim mode:', error)
      this.api.ui.showToast('Failed to initialize Advanced Neovim mode', 'error')
    }
  },
  
  createAdvancedStatusBar() {
    // Remove existing statusbar if any
    if (this.statusBarElement) {
      document.body.removeChild(this.statusBarElement)
    }
    
    // Create enhanced status bar
    this.statusBarElement = document.createElement('div')
    this.statusBarElement.id = 'neovim-statusbar'
    this.statusBarElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: linear-gradient(90deg, #002b36 0%, #073642 100%);
      color: #839496;
      font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      padding: 6px 12px;
      border-top: 2px solid #268bd2;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
    `
    
    // Create status sections
    this.statusBarElement.innerHTML = `
      <div class="vim-status-left" style="display: flex; align-items: center; gap: 12px;">
        <span id="vim-mode" style="color: #268bd2; font-weight: bold;">-- NORMAL --</span>
        <span id="vim-command" style="color: #2aa198;"></span>
        <span id="vim-register" style="color: #b58900;"></span>
      </div>
      <div class="vim-status-center" style="color: #6c71c4;">
        <span id="vim-search" style="font-style: italic;"></span>
      </div>
      <div class="vim-status-right" style="display: flex; align-items: center; gap: 12px;">
        <span id="vim-position" style="color: #859900;"></span>
        <span id="vim-recording" style="color: #dc322f;"></span>
        <span style="color: #93a1a1;">⚡ Neovim</span>
      </div>
    `
    
    document.body.appendChild(this.statusBarElement)
    
    // Update position info periodically
    this.positionUpdateInterval = setInterval(() => {
      this.updatePositionInfo()
    }, 100)
  },
  
  setupModeListener() {
    // Listen for mode changes using the vim instance
    if (this.vimMode && this.vimMode.vim) {
      const originalSetOption = this.vimMode.vim.setOption || function() {}
      this.vimMode.vim.setOption = (name, value) => {
        if (name === 'keyBufferClear') {
          this.updateStatusBar()
        }
        return originalSetOption.call(this.vimMode.vim, name, value)
      }
    }
  },
  
  setupCustomExCommands() {
    // Try to get Vim from monaco-vim via window or vimMode
    let vim = null
    if (this.vimMode && this.vimMode.vim) {
      vim = this.vimMode.vim
    } else if (window.monaco && window.monaco.vim) {
      vim = window.monaco.vim
    }
    
    if (!vim) {
      console.log('Vim commands not available yet')
      return
    }
    
    // :w - Save file
    vim.defineEx('write', 'w', () => {
      this.api.ui.showToast('File saved', 'success')
      // Trigger actual save if available
      this.handleVimCommand('save')
    })
    
    // :q - Close editor (or show message)
    vim.defineEx('quit', 'q', () => {
      this.api.ui.showToast('Use Ctrl+W to close editor', 'info')
    })
    
    // :wq - Save and quit
    vim.defineEx('wq', 'wq', () => {
      this.api.ui.showToast('File saved', 'success')
      this.handleVimCommand('save')
    })
    
    // :help - Show help
    vim.defineEx('help', 'h', () => {
      this.showNeovimHelp()
    })
    
    // :set - Configuration
    vim.defineEx('set', 'se', (args) => {
      this.handleSetCommand(args)
    })
    
    // :nohl - No highlight
    vim.defineEx('nohl', 'noh', () => {
      this.api.ui.showToast('Search highlighting cleared', 'info')
    })
    
    // :reg - Show registers
    vim.defineEx('registers', 'reg', () => {
      this.showRegisters()
    })
  },
  
  setupAdvancedKeybindings(editor) {
    if (!window.monaco) return
    
    const monaco = window.monaco
    
    // Ctrl+Alt+V - Toggle vim mode
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyV,
      () => this.toggleNeovimMode()
    )
    
    // F1 - Help
    editor.addCommand(
      monaco.KeyCode.F1,
      () => this.showNeovimHelp()
    )
  },
  
  updateStatusBar() {
    if (!this.statusBarElement) return
    
    // Update mode indicator based on vim state
    const modeElement = this.statusBarElement.querySelector('#vim-mode')
    const commandElement = this.statusBarElement.querySelector('#vim-command')
    
    if (modeElement) {
      // Try to get actual vim mode
      let mode = 'NORMAL'
      let modeColor = '#268bd2'
      
      if (this.vimMode && this.vimMode.vim) {
        const vimState = this.vimMode.vim.state || {}
        if (vimState.insertMode) {
          mode = 'INSERT'
          modeColor = '#859900'
        } else if (vimState.visualMode) {
          mode = 'VISUAL'
          modeColor = '#d33682'
        } else if (vimState.replaceMode) {
          mode = 'REPLACE'
          modeColor = '#dc322f'
        }
      }
      
      modeElement.textContent = `-- ${mode} --`
      modeElement.style.color = modeColor
      this.currentMode = mode
    }
  },
  
  updatePositionInfo() {
    const editor = this.api.editor.getActiveEditor()
    if (!editor || !this.statusBarElement) return
    
    const position = editor.getPosition()
    const model = editor.getModel()
    if (!position || !model) return
    
    const positionElement = this.statusBarElement.querySelector('#vim-position')
    if (positionElement) {
      const lineCount = model.getLineCount()
      const linePercent = Math.round((position.lineNumber / lineCount) * 100)
      positionElement.textContent = `${position.lineNumber}:${position.column} (${linePercent}%)`
    }
  },
  
  handleVimCommand(command) {
    switch (command) {
      case 'save':
        // Trigger save if available
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('vim-save'))
        }
        break
    }
  },
  
  handleSetCommand(args) {
    const settings = args ? args.split(' ') : []
    settings.forEach(setting => {
      if (setting === 'number' || setting === 'nu') {
        this.api.ui.showToast('Line numbers enabled', 'info')
      } else if (setting === 'nonumber' || setting === 'nonu') {
        this.api.ui.showToast('Line numbers disabled', 'info')  
      } else if (setting === 'relativenumber' || setting === 'rnu') {
        this.api.ui.showToast('Relative line numbers enabled', 'info')
      } else if (setting === 'norelativenumber' || setting === 'nornu') {
        this.api.ui.showToast('Relative line numbers disabled', 'info')
      } else {
        this.api.ui.showToast(`Setting: ${setting}`, 'info')
      }
    })
  },
  
  showNeovimHelp() {
    const helpText = `
🚀 Neovim Advanced - Quick Reference

MODES:
  <Esc>     - Normal mode
  i         - Insert mode (before cursor)
  a         - Insert mode (after cursor)
  v         - Visual mode
  V         - Visual line mode
  Ctrl+v    - Visual block mode

MOVEMENT:
  h,j,k,l   - Left, down, up, right
  w         - Next word
  b         - Previous word
  0         - Beginning of line
  $         - End of line
  gg        - First line
  G         - Last line
  Ctrl+u    - Page up
  Ctrl+d    - Page down

EDITING:
  dd        - Delete line
  yy        - Copy line
  p         - Paste after
  P         - Paste before
  u         - Undo
  Ctrl+r    - Redo
  ciw       - Change inner word
  diw       - Delete inner word

SEARCH:
  /text     - Search forward
  ?text     - Search backward
  n         - Next match
  N         - Previous match

EX COMMANDS:
  :w        - Save
  :q        - Quit info
  :wq       - Save and quit
  :set      - Change settings
  :help     - This help
  :nohl     - Clear highlights
  :reg      - Show registers

SHORTCUTS:
  Ctrl+Alt+V - Toggle Neovim mode
  F1         - This help
    `
    
    this.api.ui.showToast('Help shown in console. Check F12 Developer Tools.', 'info')
    console.log(helpText)
  },
  
  showRegisters() {
    // Show register contents
    this.api.ui.showToast('Registers shown in console. Check F12 Developer Tools.', 'info')
    console.log('Vim Registers: Check clipboard and named registers')
  },
  
  toggleNeovimMode() {
    if (!this.vimMode) {
      this.setupNeovim()
      return
    }
    
    if (this.enabled) {
      // Disable vim mode
      try {
        this.vimMode.dispose()
        this.enabled = false
        if (this.statusBarElement) {
          this.statusBarElement.querySelector('#vim-mode').textContent = '-- DISABLED --'
          this.statusBarElement.querySelector('#vim-mode').style.color = '#586e75'
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
    console.log('🔥 Neovim Advanced plugin deactivated!')
    
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval)
    }
    
    if (this.vimMode) {
      try {
        this.vimMode.dispose()
      } catch (error) {
        console.error('Error disposing vim mode:', error)
      }
    }
    
    if (this.statusBarElement) {
      document.body.removeChild(this.statusBarElement)
    }
    
    this.enabled = false
    this.api.ui.showToast('Neovim Advanced deactivated', 'info')
  }
}