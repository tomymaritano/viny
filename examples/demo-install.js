// Demo: Instalación rápida de plugin para testing
// Ejecuta esto en la consola del navegador cuando Nototo esté abierto

// Simulación de API básica para testing
const mockAPI = {
  notes: {
    getAll: () => [],
    getById: (id) => null,
    create: (data) => console.log('Create note:', data),
    update: (id, data) => console.log('Update note:', id, data),
    delete: (id) => console.log('Delete note:', id),
    search: (query) => console.log('Search:', query)
  },
  ui: {
    showToast: (message, type) => {
      console.log(`Toast [${type}]: ${message}`);
      // Crear toast visual básico
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2aa198' : '#dc322f'};
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        z-index: 10000;
        font-family: monospace;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },
    addSidebarSection: (config) => console.log('Add sidebar:', config),
    addToolbarButton: (config) => {
      console.log('Add toolbar button:', config);
      // Crear botón visual básico
      const button = document.createElement('button');
      button.textContent = config.icon + ' ' + config.title;
      button.onclick = config.onClick;
      button.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: #268bd2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10000;
        font-family: monospace;
      `;
      document.body.appendChild(button);
      
      // Auto-remove después de 30 segundos
      setTimeout(() => button.remove(), 30000);
    }
  },
  editor: {
    addCommand: (config) => console.log('Add command:', config),
    addKeyBinding: (config) => console.log('Add keybinding:', config),
    insertText: (text) => console.log('Insert text:', text)
  },
  utils: {
    storage: {
      get: (key) => localStorage.getItem(`plugin-demo-${key}`),
      set: (key, value) => localStorage.setItem(`plugin-demo-${key}`, JSON.stringify(value)),
      remove: (key) => localStorage.removeItem(`plugin-demo-${key}`)
    },
    http: {
      get: (url) => fetch(url),
      post: (url, data) => fetch(url, { method: 'POST', body: JSON.stringify(data) })
    }
  }
};

// Plugin de demo simple
const demoPlugin = {
  name: 'demo-plugin',
  version: '1.0.0',
  description: 'Plugin de demostración',
  author: 'Demo',
  
  activate(api) {
    console.log('🚀 Demo plugin activated!');
    
    // Mostrar toast de bienvenida
    api.ui.showToast('Demo plugin activated! 🎉', 'success');
    
    // Agregar botón de prueba
    api.ui.addToolbarButton({
      id: 'demo-button',
      title: 'Demo Action',
      icon: '🎯',
      onClick: () => {
        api.ui.showToast('Demo button clicked! 🎯', 'success');
        
        // Simular crear nota
        api.notes.create({
          title: 'Demo Note',
          content: '# Hello from Demo Plugin!\n\nThis note was created by the demo plugin.',
          tags: ['demo', 'plugin']
        });
      }
    });
    
    console.log('Demo plugin setup complete!');
  },
  
  deactivate() {
    console.log('Demo plugin deactivated');
  }
};

// Activar plugin
console.log('Installing demo plugin...');
demoPlugin.activate(mockAPI);

console.log(`
🎉 Demo Plugin Installed!

You should see:
1. A success toast notification
2. A demo button in the top-right corner

Click the demo button to test functionality!

To deactivate: demoPlugin.deactivate()
`);

// Hacer disponible globalmente para testing
window.demoPlugin = demoPlugin;
window.mockAPI = mockAPI;