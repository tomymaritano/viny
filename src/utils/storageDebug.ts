/**
 * Storage debugging utilities
 */

export const debugStorage = () => {
  console.group('🔍 Storage Debug Info')
  
  // 1. Check localStorage availability
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    console.log('✅ localStorage is available')
  } catch (e) {
    console.error('❌ localStorage is not available:', e)
  }
  
  // 2. Check storage size
  let totalSize = 0
  const items: Record<string, number> = {}
  
  for (let key in localStorage) {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        const size = new Blob([value]).size
        totalSize += size
        items[key] = size
      }
    } catch (e) {
      console.error(`Error reading key ${key}:`, e)
    }
  }
  
  console.log(`📊 Total localStorage size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log('📋 Items by size:', Object.entries(items)
    .sort(([,a], [,b]) => b - a)
    .map(([key, size]) => `${key}: ${(size / 1024).toFixed(2)} KB`))
  
  // 3. Check for corrupted data
  const corruptedKeys: string[] = []
  for (let key in localStorage) {
    try {
      const value = localStorage.getItem(key)
      if (value && key.includes('inkrun')) {
        JSON.parse(value)
      }
    } catch (e) {
      corruptedKeys.push(key)
      console.error(`❌ Corrupted data in key ${key}`)
    }
  }
  
  if (corruptedKeys.length > 0) {
    console.error('🚨 Corrupted keys found:', corruptedKeys)
  }
  
  // 4. Check quota
  try {
    // Try to estimate available space
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        console.log(`💾 Storage quota: ${((estimate.quota || 0) / 1024 / 1024).toFixed(2)} MB`)
        console.log(`💾 Storage usage: ${((estimate.usage || 0) / 1024 / 1024).toFixed(2)} MB`)
      })
    }
  } catch (e) {
    console.error('Could not estimate storage:', e)
  }
  
  console.groupEnd()
}

export const clearCorruptedData = () => {
  const keysToRemove: string[] = []
  
  for (let key in localStorage) {
    if (key.includes('inkrun') || key.includes('viny')) {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          JSON.parse(value)
        }
      } catch (e) {
        keysToRemove.push(key)
      }
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing corrupted key: ${key}`)
    localStorage.removeItem(key)
  })
  
  return keysToRemove.length
}

export const backupAndClearStorage = () => {
  // Create backup
  const backup: Record<string, any> = {}
  
  for (let key in localStorage) {
    if (key.includes('inkrun') || key.includes('viny')) {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          backup[key] = JSON.parse(value)
        }
      } catch (e) {
        console.error(`Skipping corrupted key ${key}`)
      }
    }
  }
  
  // Save backup to file
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `viny-backup-${new Date().toISOString()}.json`
  a.click()
  
  // Clear storage
  const keysToRemove = Object.keys(backup)
  keysToRemove.forEach(key => localStorage.removeItem(key))
  
  console.log(`Backed up and cleared ${keysToRemove.length} items`)
}