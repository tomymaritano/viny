// Test Plugin for Installation
export default {
  name: 'Test Install Plugin',
  version: '1.0.0',
  description: 'Simple test plugin to verify installation works',
  author: 'Test',
  
  activate(api) {
    console.log('🧪 Test Install Plugin activated!')
    api.ui.showToast('Test plugin installed and activated successfully!', 'success')
  },
  
  deactivate() {
    console.log('🧪 Test Install Plugin deactivated!')
  }
}