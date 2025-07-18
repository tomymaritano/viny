import { createSettingsRepository, createDocumentRepository } from '../lib/repositories/RepositoryFactory'
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
    
    clearAllData: async () => {
      console.log('🧹 Clearing all data...')
      try {
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()
        
        await settingsRepo.resetSettings()
        await docRepo.destroy()
        
        localStorage.removeItem('viny-initialized')
        console.log('✅ All data cleared! Refresh the page.')
      } catch (error) {
        console.error('❌ Failed to clear data:', error)
      }
    },
    
    exportData: async () => {
      try {
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()
        
        const [settings, documents] = await Promise.all([
          settingsRepo.export(),
          docRepo.exportAll()
        ])
        
        const data = JSON.stringify({ settings: JSON.parse(settings), documents: JSON.parse(documents) }, null, 2)
        console.log('📤 Current data:', data)
        return data
      } catch (error) {
        console.error('❌ Failed to export data:', error)
        return '{}'
      }
    },
    
    importData: async (data: string) => {
      console.log('📥 Importing data...')
      try {
        const parsedData = JSON.parse(data)
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()
        
        if (parsedData.settings) {
          await settingsRepo.import(JSON.stringify(parsedData.settings))
        }
        
        if (parsedData.documents) {
          await docRepo.importAll(JSON.stringify(parsedData.documents))
        }
        
        console.log('✅ Data imported! Refresh the page.')
      } catch (error) {
        console.error('❌ Failed to import data:', error)
      }
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