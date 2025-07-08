// Simple Vim Mode Plugin for Nototo
export default {
  name: 'Simple Vim Mode',
  version: '1.0.0',
  description: 'Basic Vim keybindings for Nototo editor',
  author: 'Nototo',
  
  activate(api) {
    console.log('Simple Vim Mode plugin activated!')
    this.api = api
    this.mode = 'normal'
    this.enabled = true
    
    // Bind methods to preserve context
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.toggleVimMode = this.toggleVimMode.bind(this)
    this.enterInsertMode = this.enterInsertMode.bind(this)
    this.enterNormalMode = this.enterNormalMode.bind(this)
    
    // Wait for editor to be created
    api.editor.onEditorCreated(() => {
      console.log('Editor created, setting up Vim mode')
      this.setupVimMode()
    })
    
    // If editor already exists, set it up now
    if (api.editor.getActiveEditor()) {
      this.setupVimMode()
    }
  },
  
  setupVimMode() {
    const editor = this.api.editor.getActiveEditor()
    if (!editor) return
    
    console.log('Setting up Vim mode on editor')
    
    // Add key press handler
    this.api.editor.onKeyPress(this.handleKeyPress)
    
    // Start in normal mode
    this.enterNormalMode()
  },
  
  toggleVimMode() {
    this.enabled = !this.enabled
    this.api.ui.showToast(`Vim mode ${this.enabled ? 'enabled' : 'disabled'}`, 'info')
    
    if (this.enabled) {
      this.enterNormalMode()
    } else {
      this.enterInsertMode()
    }
  },
  
  enterInsertMode() {
    this.mode = 'insert'
    console.log('Vim: Insert mode')
    this.api.ui.showToast('-- INSERT --', 'info')
  },
  
  enterNormalMode() {
    this.mode = 'normal'
    console.log('Vim: Normal mode')
    this.api.ui.showToast('-- NORMAL --', 'info')
  },
  
  handleKeyPress(e) {
    if (!this.enabled) return
    
    const editor = this.api.editor.getActiveEditor()
    if (!editor) return
    
    console.log(`Key pressed: ${e.code}, Mode: ${this.mode}`)
    
    if (this.mode === 'normal') {
      // Handle normal mode keys
      switch (e.code) {
        case 'KeyI':
          e.preventDefault()
          this.enterInsertMode()
          break
        case 'KeyH':
          e.preventDefault()
          this.moveCursor(-1, 0)
          break
        case 'KeyL':
          e.preventDefault()
          this.moveCursor(1, 0)
          break
        case 'KeyJ':
          e.preventDefault()
          this.moveCursor(0, 1)
          break
        case 'KeyK':
          e.preventDefault()
          this.moveCursor(0, -1)
          break
        case 'KeyA':
          e.preventDefault()
          this.moveCursor(1, 0)
          this.enterInsertMode()
          break
        case 'KeyO':
          e.preventDefault()
          this.insertNewLine()
          this.enterInsertMode()
          break
      }
    } else if (this.mode === 'insert') {
      // Handle insert mode keys
      if (e.code === 'Escape') {
        e.preventDefault()
        this.enterNormalMode()
      }
    }
  },
  
  moveCursor(deltaColumn, deltaLine) {
    const editor = this.api.editor.getActiveEditor()
    if (!editor) return
    
    const position = editor.getPosition()
    const newPosition = {
      lineNumber: Math.max(1, position.lineNumber + deltaLine),
      column: Math.max(1, position.column + deltaColumn)
    }
    
    editor.setPosition(newPosition)
  },
  
  insertNewLine() {
    const editor = this.api.editor.getActiveEditor()
    if (!editor) return
    
    const position = editor.getPosition()
    const model = editor.getModel()
    
    // Insert new line after current line
    const newLine = position.lineNumber + 1
    model.applyEdits([{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: model.getLineMaxColumn(position.lineNumber),
        endLineNumber: position.lineNumber,
        endColumn: model.getLineMaxColumn(position.lineNumber)
      },
      text: '\n'
    }])
    
    // Move cursor to new line
    editor.setPosition({
      lineNumber: newLine,
      column: 1
    })
  },
  
  deactivate() {
    console.log('Simple Vim Mode plugin deactivated!')
    this.enabled = false
  }
}