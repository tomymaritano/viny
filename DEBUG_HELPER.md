# Debug Helper Commands

## Run these in the browser console to debug your V2 issues:

### 1. Check Current Feature Flags

```javascript
// See all feature flags
console.log('Feature Flags:', window.featureFlags)

// Check if using V2 (Clean Architecture)
console.log('Using V2:', localStorage.getItem('feature_useCleanArchitecture'))
```

### 2. Check Notebooks Data

```javascript
// Use dev helpers to debug notebooks
window.devHelpers?.debugNotebooks()

// Export all data to see what's stored
const data = await window.devHelpers?.exportData()
console.log(JSON.parse(data))

// Check Dexie database directly
const db = await window.Dexie.open('notesDB')
const notebooks = await db.table('notebooks').toArray()
console.log('Notebooks in DB:', notebooks)

// Check notes
const notes = await db.table('notes').toArray()
console.log('Notes in DB:', notes)
```

### 3. Check Current App State

```javascript
// Check selected note
const store = window.__cleanUIStore?.getState()
console.log('Selected Note ID:', store?.selectedNoteId)
console.log('Is Editor Open:', store?.isEditorOpen)
console.log('Active Section:', store?.activeSection)

// Check V2 services
console.log('Services:', window.__services)
```

### 4. Force Refresh Data

```javascript
// Invalidate and refetch all queries
window.__queryClient?.invalidateQueries()

// Refetch notebooks specifically
window.__queryClient?.invalidateQueries(['notebooks'])

// Refetch notes
window.__queryClient?.invalidateQueries(['notes'])
```

### 5. Switch Between V1 and V2

```javascript
// Switch to V1 (original)
localStorage.setItem('feature_useCleanArchitecture', 'false')
window.location.reload()

// Switch to V2 (clean architecture)
localStorage.setItem('feature_useCleanArchitecture', 'true')
window.location.reload()
```

### 6. Fix Menu Issue

```javascript
// Check if dropdown menu is rendering
document.querySelectorAll('[role="menu"]')

// Check menu trigger buttons
document.querySelectorAll('button[title="More options"]')
```

### 7. Create Test Data

```javascript
// Create a test notebook
const db = await window.Dexie.open('notesDB')
await db.table('notebooks').add({
  id: 'test-notebook',
  name: 'Test Notebook',
  parentId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Create a test note
await db.table('notes').add({
  id: 'test-note',
  title: 'Test Note',
  content: '# Test Content',
  notebookId: 'test-notebook',
  tags: ['test'],
  status: 'draft',
  isPinned: false,
  isTrashed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Refresh queries
window.__queryClient?.invalidateQueries()
```

### 8. Check for Errors

```javascript
// Check console for errors
console.log('Any React errors?', window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__)

// Check query errors
const queryCache = window.__queryClient?.getQueryCache()
queryCache?.getAll().forEach(query => {
  if (query.state.error) {
    console.error('Query Error:', query.queryKey, query.state.error)
  }
})
```

## Quick Fix for Current Issues

Run this to potentially fix your immediate issues:

```javascript
// 1. Create default data if missing
const db = await window.Dexie.open('notesDB')
const notebookCount = await db.table('notebooks').count()
if (notebookCount === 0) {
  // Add default notebook
  await db.table('notebooks').add({
    id: 'default',
    name: 'My Notes',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// 2. Force refresh
window.__queryClient?.invalidateQueries()

// 3. Select first note if none selected
setTimeout(() => {
  const store = window.__cleanUIStore?.getState()
  if (!store?.selectedNoteId) {
    const notes = window.__queryClient?.getQueryData(['notes', 'all'])
    if (notes?.[0]) {
      store.setSelectedNoteId(notes[0].id)
    }
  }
}, 1000)
```
