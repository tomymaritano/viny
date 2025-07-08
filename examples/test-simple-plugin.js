// Plugin de prueba muy simple para verificar la instalación
export default {
  name: 'test-simple',
  version: '1.0.0',
  description: 'Plugin de prueba simple para verificar que la instalación funciona',
  author: 'Test',
  
  config: {
    enabled: true,
    testSetting: 'hello'
  },

  activate(api) {
    console.log('🎯 Test Simple Plugin activated!')
    
    // Mostrar notificación de éxito
    api.ui.showToast('Test plugin loaded successfully! 🎉', 'success')
    
    // Agregar botón de prueba
    api.ui.addToolbarButton({
      id: 'test-simple-button',
      title: 'Test Button',
      icon: '🧪',
      onClick: () => {
        api.ui.showToast('Test button clicked! 🧪', 'info')
        console.log('Test button was clicked!')
      }
    })
    
    // Agregar comando de teclado
    api.editor.addCommand({
      id: 'test-simple.hello',
      name: 'Test: Say Hello',
      keybinding: 'Ctrl+Shift+H',
      callback: () => {
        api.ui.showToast('Hello from keyboard shortcut! ⌨️', 'success')
      }
    })
    
    console.log('Test plugin setup complete!')
  },

  deactivate() {
    console.log('Test Simple Plugin deactivated')
    api.ui.showToast('Test plugin deactivated', 'info')
  }
}