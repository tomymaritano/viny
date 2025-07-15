import { storageService } from '../lib/storage'
import { resetToDefaultData } from './defaultDataInitializer'

/**
 * Development helper functions
 * These are only available in development mode
 */

declare global {
  interface Window {
    devHelpers?: {
      resetToDefaults: () => void
      clearAllData: () => void
      exportData: () => string
      importData: (data: string) => void
    }
  }
}

export function setupDevHelpers(): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Add dev helpers to window for easy access from console
  window.devHelpers = {
    resetToDefaults: () => {
      console.log('🔄 Resetting to default data...')
      resetToDefaultData()
      console.log('✅ Reset complete! Refresh the page to see changes.')
    },
    
    clearAllData: () => {
      console.log('🧹 Clearing all data...')
      storageService.clearAll()
      localStorage.removeItem('viny-initialized')
      console.log('✅ All data cleared! Refresh the page.')
    },
    
    exportData: () => {
      const data = storageService.export()
      console.log('📤 Current data:', data)
      return data
    },
    
    importData: (data: string) => {
      console.log('📥 Importing data...')
      storageService.import(data)
      console.log('✅ Data imported! Refresh the page.')
    }
  }

  console.log(`
🛠️  Development helpers available:

• devHelpers.resetToDefaults() - Reset to default notes and notebooks
• devHelpers.clearAllData() - Clear all data completely
• devHelpers.exportData() - Export current data
• devHelpers.importData(data) - Import data

These are only available in development mode.
  `)
}