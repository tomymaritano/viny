// Neovim Mode Plugin for Viny using monaco-vim
export default {
  name: 'Neovim Mode',
  version: '1.0.0', 
  description: 'Full Neovim keybindings using monaco-vim library',
  author: 'Viny',
  
  async activate(api) {
    console.log('🚀 Neovim Mode plugin activated!')
    this.api = api
    this.vimMode = null
    this.enabled = false
    this.statusBarElement = null
    
    // Bind methods
    this.setupNeovim = this.setupNeovim.bind(this)
    this.toggleNeovimMode = this.toggleNeovimMode.bind(this)
    this.createStatusBar = this.createStatusBar.bind(this)
    
    // Import monaco-vim dynamically
    try {
      const monacoVim = await import('monaco-vim')
      this.initVimMode = monacoVim.initVimMode
      console.log('✅ monaco-vim library loaded')
    } catch (error) {
      console.error('❌ Failed to load monaco-vim:', error)
      api.ui.showToast('Failed to load Neovim library', 'error')
      return
    }
    
    // Setup when editor is available
    api.editor.onEditorCreated(() => {
      console.log('Editor created, setting up Neovim mode')
      this.setupNeovim()
    })
    
    // If editor already exists, set it up now
    if (api.editor.getActiveEditor()) {
      this.setupNeovim()
    }
    
    // Add toggle button (if supported)
    try {
      api.editor.addToolbarButton({
        id: 'neovim-toggle',
        title: 'Toggle Neovim Mode',
        icon: '⚡',
        onClick: this.toggleNeovimMode
      })
    } catch (error) {
      console.log('Toolbar button not supported, skipping')
    }
    
    api.ui.showToast('Neovim Mode ready! Press Ctrl+Alt+V to toggle', 'success')
  },
  
  setupNeovim() {
    const editor = this.api.editor.getActiveEditor()
    if (!editor || !this.initVimMode) {
      console.log('Editor or vim library not available')
      return
    }
    
    console.log('🔧 Setting up Neovim mode...')
    
    // Create status bar for vim mode
    this.createStatusBar()
    
    try {
      // Initialize vim mode with monaco-vim
      this.vimMode = this.initVimMode(editor, this.statusBarElement)
      this.enabled = true
      
      console.log('✅ Neovim mode initialized successfully')
      this.api.ui.showToast('Neovim mode activated!', 'success')
      
      // Add custom key bindings for toggling
      this.setupCustomKeybindings(editor)
      
    } catch (error) {
      console.error('❌ Failed to initialize vim mode:', error)
      this.api.ui.showToast('Failed to initialize Neovim mode', 'error')
    }
  },
  
  createStatusBar() {
    // Create status bar element for vim mode info
    this.statusBarElement = document.createElement('div')
    this.statusBarElement.id = 'vim-statusbar'
    this.statusBarElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 24px;
      background: #002b36;
      color: #839496;
      font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      padding: 4px 8px;
      border-top: 1px solid #073642;
      z-index: 1000;
      display: flex;
      align-items: center;
    `
    document.body.appendChild(this.statusBarElement)
  },
  
  setupCustomKeybindings(editor) {
    // Add Ctrl+Alt+V to toggle vim mode
    if (window.monaco) {
      editor.addCommand(
        window.monaco.KeyMod.CtrlCmd | window.monaco.KeyMod.Alt | window.monaco.KeyCode.KeyV,
        () => {
          this.toggleNeovimMode()
        }
      )
    }
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
          this.statusBarElement.textContent = 'Vim mode disabled'
        }
        this.api.ui.showToast('Neovim mode disabled', 'info')
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
    console.log('🔥 Neovim Mode plugin deactivated!')
    
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
    this.api.ui.showToast('Neovim mode deactivated', 'info')
  }
}