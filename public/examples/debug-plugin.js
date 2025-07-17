// Debug Plugin for Viny
export default {
  name: 'Debug Plugin',
  version: '1.0.0',
  description: 'Debug plugin to test API functions',
  author: 'Debug',
  
  activate(api) {
    console.log('🔧 Debug Plugin activated!')
    console.log('API object:', api)
    console.log('Editor API:', api.editor)
    
    // Test each API method
    const editor = api.editor.getActiveEditor()
    console.log('Active editor:', editor)
    
    // Test onKeyPress
    try {
      console.log('Testing onKeyPress...')
      api.editor.onKeyPress((e) => {
        console.log('🔧 Key pressed:', e.code, e.key)
      })
      console.log('✅ onKeyPress works')
    } catch (error) {
      console.error('❌ onKeyPress failed:', error)
    }
    
    // Test onEditorCreated
    try {
      console.log('Testing onEditorCreated...')
      api.editor.onEditorCreated((event) => {
        console.log('🔧 Editor created:', event)
      })
      console.log('✅ onEditorCreated works')
    } catch (error) {
      console.error('❌ onEditorCreated failed:', error)
    }
    
    // Test getCurrentPosition
    try {
      const position = api.editor.getCurrentPosition()
      console.log('🔧 Current position:', position)
      console.log('✅ getCurrentPosition works')
    } catch (error) {
      console.error('❌ getCurrentPosition failed:', error)
    }
    
    // Show toast
    api.ui.showToast('Debug plugin activated! Check console for details.', 'info')
  },
  
  deactivate() {
    console.log('🔧 Debug Plugin deactivated!')
  }
}