/**
 * Storage recovery utilities to handle corrupted data before app initialization
 */

export function performStorageRecovery() {
  console.log('🔧 Running storage recovery check...')
  
  const keysToCheck = [
    'viny_notes',
    'viny_notebooks', 
    'viny-settings',
    'viny_tag_colors'
  ]
  
  const corrupted: string[] = []
  
  keysToCheck.forEach(key => {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        JSON.parse(value)
      }
    } catch (error) {
      console.error(`❌ Corrupted data in ${key}`)
      corrupted.push(key)
    }
  })
  
  if (corrupted.length > 0) {
    console.warn(`Found ${corrupted.length} corrupted items`)
    
    // Create backup before clearing
    const backup: Record<string, string | null> = {}
    corrupted.forEach(key => {
      backup[key] = localStorage.getItem(key)
    })
    
    // Log backup for recovery
    console.log('Backup of corrupted data:', backup)
    
    // Clear corrupted items
    corrupted.forEach(key => {
      localStorage.removeItem(key)
      console.log(`✅ Cleared corrupted ${key}`)
    })
    
    console.log('Storage recovery completed. The app will start with fresh data.')
  } else {
    console.log('✅ No corrupted storage data found')
  }
}

// Run recovery immediately when this module is imported
performStorageRecovery()