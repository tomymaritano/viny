// Test localStorage functionality
console.log('🧪 Testing localStorage functionality...')

// Test 1: Basic localStorage availability
try {
  localStorage.setItem('test', 'value')
  const retrieved = localStorage.getItem('test')
  localStorage.removeItem('test')
  console.log(
    '✅ localStorage basic test:',
    retrieved === 'value' ? 'PASSED' : 'FAILED'
  )
} catch (error) {
  console.error('❌ localStorage basic test FAILED:', error)
}

// Test 2: Check current Nototo data
const notesKey = 'nototo_notes'
const currentNotes = localStorage.getItem(notesKey)
console.log(
  '📝 Current nototo_notes in localStorage:',
  currentNotes ? JSON.parse(currentNotes) : 'EMPTY'
)

// Test 3: Storage quota
function getStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      console.log('💾 Storage quota estimate:', {
        quota: Math.round(estimate.quota / (1024 * 1024)) + ' MB',
        used: Math.round(estimate.usage / (1024 * 1024)) + ' MB',
        available:
          Math.round((estimate.quota - estimate.usage) / (1024 * 1024)) + ' MB',
      })
    })
  } else {
    console.log('💾 Storage quota API not available')
  }
}
getStorageQuota()

// Test 4: Test saving a simple note structure
const testNote = {
  id: 'test-note-' + Date.now(),
  title: 'Test Note',
  content: 'This is a test note content',
  notebook: 'test',
  tags: ['test'],
  status: 'draft',
  isPinned: false,
  isTrashed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

try {
  const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '[]')
  const updatedNotes = [...existingNotes, testNote]
  localStorage.setItem(notesKey, JSON.stringify(updatedNotes))

  // Verify it was saved
  const verifyNotes = JSON.parse(localStorage.getItem(notesKey) || '[]')
  const foundNote = verifyNotes.find(n => n.id === testNote.id)

  if (foundNote) {
    console.log('✅ Test note save PASSED')
    // Clean up
    const cleanedNotes = verifyNotes.filter(n => n.id !== testNote.id)
    localStorage.setItem(notesKey, JSON.stringify(cleanedNotes))
  } else {
    console.error('❌ Test note save FAILED - note not found after save')
  }
} catch (error) {
  console.error('❌ Test note save FAILED with error:', error)
}

// Test 5: Check for any existing localStorage errors
window.addEventListener('storage', e => {
  console.log('📡 Storage event detected:', e)
})

console.log('🔬 Storage tests completed. Check the results above.')
