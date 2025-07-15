// Debug utilities for notebook issues
export const debugNotebookPersistence = () => {
  console.log('=== Debugging Notebook Persistence ===')
  
  // Check localStorage
  const stored = localStorage.getItem('viny_notebooks')
  console.log('localStorage data:', stored)
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      console.log('Parsed notebooks:', parsed.length)
      parsed.forEach((nb: any, index: number) => {
        console.log(`${index + 1}. ${nb.name} (${nb.id})`)
      })
    } catch (error) {
      console.error('Error parsing localStorage:', error)
    }
  } else {
    console.log('No data in localStorage')
  }
}

export const testNotebookCreation = () => {
  console.log('=== Testing Notebook Creation ===')
  
  // Get current notebooks
  let notebooks = []
  const stored = localStorage.getItem('viny_notebooks')
  
  if (stored) {
    try {
      notebooks = JSON.parse(stored)
      console.log('Current notebooks:', notebooks.length)
    } catch (error) {
      console.error('Error loading notebooks:', error)
      return
    }
  }
  
  // Create test notebook
  const testNotebook = {
    id: 'debug_' + Date.now(),
    name: 'Debug Test ' + Date.now(),
    color: 'red',
    description: 'Debug test notebook',
    parentId: null,
    children: [],
    level: 0,
    path: 'Debug Test ' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  console.log('Creating test notebook:', testNotebook)
  
  // Add to notebooks
  notebooks.push(testNotebook)
  
  // Save to localStorage
  try {
    localStorage.setItem('viny_notebooks', JSON.stringify(notebooks))
    console.log('Test notebook saved successfully')
  } catch (error) {
    console.error('Error saving test notebook:', error)
  }
  
  // Verify
  const newStored = localStorage.getItem('viny_notebooks')
  if (newStored) {
    const parsed = JSON.parse(newStored)
    const found = parsed.find((nb: any) => nb.id === testNotebook.id)
    console.log('Test notebook found after save:', found ? 'YES' : 'NO')
  }
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugNotebooks = debugNotebookPersistence;
  (window as any).testNotebookCreation = testNotebookCreation;
}