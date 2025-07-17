// Emergency Storage Fix Script
// Copy and paste this in the browser console if the buttons don't work

console.log('🚨 Emergency Storage Fix')

// 1. Show storage info
function debugStorage() {
  console.group('📊 Storage Analysis')

  let totalSize = 0
  const items = {}
  const corrupted = []

  for (let key in localStorage) {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        const size = new Blob([value]).size
        totalSize += size
        items[key] = size

        // Check if it's JSON and valid
        if (key.includes('inkrun') || key.includes('viny')) {
          try {
            JSON.parse(value)
          } catch (e) {
            corrupted.push(key)
          }
        }
      }
    } catch (e) {
      console.error(`Error with key ${key}:`, e)
      corrupted.push(key)
    }
  }

  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(
    'Largest items:',
    Object.entries(items)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([k, s]) => `${k}: ${(s / 1024).toFixed(2)} KB`)
  )
  console.log('Corrupted keys:', corrupted)

  console.groupEnd()

  return { totalSize, corrupted }
}

// 2. Clear only corrupted data
function clearCorrupted() {
  const { corrupted } = debugStorage()

  if (corrupted.length === 0) {
    console.log('✅ No corrupted data found')
    return
  }

  if (confirm(`Found ${corrupted.length} corrupted items. Clear them?`)) {
    corrupted.forEach(key => {
      console.log(`Removing corrupted key: ${key}`)
      localStorage.removeItem(key)
    })
    console.log('✅ Corrupted data cleared. Reloading...')
    location.reload()
  }
}

// 3. Backup and clear
function backupAndClear() {
  const backup = {}

  for (let key in localStorage) {
    if (key.includes('inkrun') || key.includes('viny')) {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          backup[key] = JSON.parse(value)
        }
      } catch (e) {
        console.warn(`Skipping corrupted key: ${key}`)
      }
    }
  }

  // Download backup
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `viny-backup-${new Date().toISOString()}.json`
  a.click()

  if (confirm('Backup downloaded. Clear storage now?')) {
    Object.keys(backup).forEach(key => localStorage.removeItem(key))
    location.reload()
  }
}

// 4. Nuclear option
function clearAll() {
  if (confirm('⚠️ This will delete ALL data. Are you sure?')) {
    localStorage.clear()
    location.reload()
  }
}

console.log(`
Available commands:
- debugStorage()    - Show storage analysis
- clearCorrupted()  - Clear only corrupted data
- backupAndClear()  - Backup then clear
- clearAll()        - Delete everything

Run any command to fix storage issues.
`)
