// Testing utilities for notebook persistence issues

export const clearNotebookStorage = () => {
  console.log('🗑️ Clearing notebook storage...')
  localStorage.removeItem('viny_notebooks')
  console.log('🗑️ Storage cleared. Reload page to reinitialize.')
}

export const inspectNotebookStorage = async () => {
  console.log('🔍 === Notebook Storage Inspection ===')
  
  // Check if we're in Electron
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI
  console.log('Environment:', isElectron ? 'Electron' : 'Browser')
  
  if (isElectron) {
    console.log('🔍 Checking Electron storage...')
    try {
      const electronStorage = await import('../lib/electronStorage')
      const notebooks = await electronStorage.electronStorageService.getNotebooks()
      console.log('Electron notebooks:', notebooks.length)
      
      console.log('Notebooks from Electron:')
      notebooks.forEach((notebook: any, index: number) => {
        console.log(`  ${index + 1}. ${notebook.name} (${notebook.id})`)
        console.log(`     Color: ${notebook.color}, Level: ${notebook.level}`)
        console.log(`     Created: ${new Date(notebook.createdAt).toLocaleString()}`)
      })
    } catch (error) {
      console.error('Error loading from Electron storage:', error)
    }
  }
  
  // Also check localStorage for comparison
  console.log('🔍 Checking localStorage...')
  const stored = localStorage.getItem('viny_notebooks')
  console.log('localStorage data:', stored ? 'Found' : 'None')
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      console.log('Parsed data:', parsed)
      console.log('Notebook count:', parsed.length)
      
      console.log('Notebooks from localStorage:')
      parsed.forEach((notebook: any, index: number) => {
        console.log(`  ${index + 1}. ${notebook.name} (${notebook.id})`)
        console.log(`     Color: ${notebook.color}, Level: ${notebook.level}`)
        console.log(`     Created: ${new Date(notebook.createdAt).toLocaleString()}`)
      })
    } catch (error) {
      console.error('Error parsing stored data:', error)
    }
  }
}

export const testNotebookPersistence = () => {
  console.log('🧪 === Testing Notebook Persistence ===')
  
  // Step 1: Clear storage
  clearNotebookStorage()
  
  // Step 2: Reload to initialize defaults
  console.log('🧪 Please reload the page and then run testNotebookPersistence2()')
}

export const testNotebookPersistence2 = () => {
  console.log('🧪 === Testing Notebook Persistence - Step 2 ===')
  
  // Step 1: Check initial state
  inspectNotebookStorage()
  
  // Step 2: Add a test notebook
  const testNotebook = {
    id: 'test_persistence_' + Date.now(),
    name: 'Test Persistence',
    color: 'red',
    description: 'Test notebook for persistence',
    parentId: null,
    children: [],
    level: 0,
    path: 'Test Persistence',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Get current data
  const stored = localStorage.getItem('viny_notebooks')
  let notebooks = []
  
  if (stored) {
    try {
      notebooks = JSON.parse(stored)
    } catch (error) {
      console.error('Error parsing stored data:', error)
      return
    }
  }
  
  // Add test notebook
  notebooks.push(testNotebook)
  
  // Save back
  localStorage.setItem('viny_notebooks', JSON.stringify(notebooks))
  
  console.log('🧪 Test notebook added. Data now:')
  inspectNotebookStorage()
  
  console.log('🧪 Now reload the page and run inspectNotebookStorage() to see if it persists')
}

export const forceReloadNotebooks = () => {
  console.log('🔄 Forcing notebook reload...')
  // This would need to be connected to the actual hook
  window.location.reload()
}

export const testNotebookCreationFromConsole = async () => {
  console.log('🧪 === Testing Notebook Creation from Console ===')
  
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI
  
  const testNotebook = {
    id: 'console_test_' + Date.now(),
    name: 'Console Test ' + Date.now(),
    color: 'purple',
    description: 'Test notebook created from console',
    parentId: null,
    children: [],
    level: 0,
    path: 'Console Test ' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  try {
    if (isElectron) {
      console.log('🧪 Saving to Electron storage...')
      const { electronStorageService } = await import('../lib/electronStorage')
      
      // Get current notebooks
      const currentNotebooks = await electronStorageService.getNotebooks()
      console.log('🧪 Current notebooks:', currentNotebooks.length)
      
      // Add new notebook
      const updatedNotebooks = [...currentNotebooks, testNotebook]
      
      // Save back
      await electronStorageService.saveNotebooks(updatedNotebooks)
      console.log('🧪 Saved to Electron storage')
      
      // Verify
      const verifyNotebooks = await electronStorageService.getNotebooks()
      const found = verifyNotebooks.find((nb: any) => nb.id === testNotebook.id)
      console.log('🧪 Verification:', found ? 'SUCCESS - Notebook found' : 'FAILED - Notebook not found')
      
    } else {
      console.log('🧪 Saving to localStorage...')
      
      // Get current notebooks
      const stored = localStorage.getItem('viny_notebooks')
      let currentNotebooks = []
      
      if (stored) {
        currentNotebooks = JSON.parse(stored)
      }
      
      console.log('🧪 Current notebooks:', currentNotebooks.length)
      
      // Add new notebook
      currentNotebooks.push(testNotebook)
      
      // Save back
      localStorage.setItem('viny_notebooks', JSON.stringify(currentNotebooks))
      console.log('🧪 Saved to localStorage')
      
      // Verify
      const verifyStored = localStorage.getItem('viny_notebooks')
      if (verifyStored) {
        const verifyNotebooks = JSON.parse(verifyStored)
        const found = verifyNotebooks.find((nb: any) => nb.id === testNotebook.id)
        console.log('🧪 Verification:', found ? 'SUCCESS - Notebook found' : 'FAILED - Notebook not found')
      }
    }
    
    console.log('🧪 Now reload the page and run inspectNotebookStorage() to see if it persists')
    
  } catch (error) {
    console.error('🧪 Error during test:', error)
  }
}

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).clearNotebookStorage = clearNotebookStorage;
  (window as any).inspectNotebookStorage = inspectNotebookStorage;
  (window as any).testNotebookPersistence = testNotebookPersistence;
  (window as any).testNotebookPersistence2 = testNotebookPersistence2;
  (window as any).forceReloadNotebooks = forceReloadNotebooks;
  (window as any).testNotebookCreationFromConsole = testNotebookCreationFromConsole;
}