import {
  createSettingsRepository,
  createDocumentRepository,
} from '../lib/repositories/RepositoryFactory'
import { loggingService } from './LoggingService'
import { storageService, StorageService } from './StorageService'

interface UsageData {
  sessionStart: string
  sessionEnd?: string
  actionsPerformed: number
  featuresUsed: string[]
  errors: Array<{
    message: string
    timestamp: string
    context?: any
  }>
  analytics: Record<string, any>
}

interface PrivacyExportData {
  userData: {
    notes: any[]
    notebooks: any[]
    settings: any
    tagColors: Record<string, string>
  }
  usageData: UsageData[]
  metadata: {
    exportedAt: string
    version: string
    totalNotes: number
    totalNotebooks: number
  }
}

class PrivacyService {
  private readonly USAGE_DATA_KEY = 'viny_usage_data'
  private readonly CURRENT_SESSION_KEY = 'viny_current_session'

  /**
   * Clear all usage and analytics data
   */
  async clearUsageData(): Promise<void> {
    try {
      // Clear usage tracking data
      storageService.removeItem(this.USAGE_DATA_KEY)
      storageService.removeItem(this.CURRENT_SESSION_KEY)

      // Clear any analytics data
      storageService.removeItem(StorageService.KEYS.ANALYTICS)
      storageService.removeItem(StorageService.KEYS.TELEMETRY)
      storageService.removeItem(StorageService.KEYS.CRASH_REPORTS)

      // Clear browser data if available
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
      }

      // Usage data cleared successfully
    } catch (error) {
      loggingService.logError(error as Error, { context: 'clearUsageData' })
      throw new Error('Failed to clear usage data')
    }
  }

  /**
   * Download user's data as JSON file
   */
  async downloadUserData(
    includeMetadata = true,
    includeHistory = false
  ): Promise<void> {
    try {
      const settingsRepo = createSettingsRepository()
      const docRepo = createDocumentRepository()
      await docRepo.initialize()

      const [notes, notebooks, settings, tagColors] = await Promise.all([
        docRepo.getNotes(),
        docRepo.getNotebooks(),
        settingsRepo.getSettings(),
        settingsRepo.getTagColors(),
      ])

      const exportData: PrivacyExportData = {
        userData: {
          notes,
          notebooks,
          settings,
          tagColors,
        },
        usageData: this.getUsageData(),
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0', // App version
          totalNotes: notes.length,
          totalNotebooks: notebooks.length,
        },
      }

      // Filter out metadata if not requested
      if (!includeMetadata) {
        exportData.userData.notes = exportData.userData.notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
        }))
      }

      // Remove history if not requested
      if (!includeHistory) {
        exportData.userData.notes = exportData.userData.notes.map(note => ({
          ...note,
          history: undefined,
          versions: undefined,
        }))
      }

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `viny-user-data-${new Date().toISOString().split('T')[0]}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      // User data downloaded successfully
    } catch (error) {
      loggingService.logError(error as Error, { context: 'downloadUserData' })
      throw new Error('Failed to download user data')
    }
  }

  /**
   * Get current usage data
   */
  private getUsageData(): UsageData[] {
    try {
      const stored = storageService.getItem(this.USAGE_DATA_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      loggingService.logError(error as Error, { context: 'getUsageData' })
      return []
    }
  }

  /**
   * Clear specific types of data
   */
  async clearSpecificData(dataTypes: string[]): Promise<void> {
    try {
      const settingsRepo = createSettingsRepository()
      const docRepo = createDocumentRepository()
      await docRepo.initialize()

      for (const dataType of dataTypes) {
        switch (dataType) {
          case 'notes':
            // Clear all notes by destroying and reinitializing database
            await docRepo.destroy()
            break
          case 'notebooks':
            const notebooks = await docRepo.getNotebooks()
            for (const notebook of notebooks) {
              await docRepo.deleteNotebook(notebook.id)
            }
            break
          case 'settings':
            // Keep essential settings, clear personal preferences
            await settingsRepo.resetSettings()
            await settingsRepo.saveSettings({
              theme: 'dark',
              language: 'en',
            })
            break
          case 'tagColors':
            await settingsRepo.saveTagColors({})
            break
          case 'usage':
            await this.clearUsageData()
            break
          default:
            loggingService.log('warn', 'Unknown data type', {
              dataType,
              context: 'clearSpecificData',
            })
        }
      }
      // Specific data cleared successfully
    } catch (error) {
      loggingService.logError(error as Error, {
        context: 'clearSpecificData',
        dataTypes,
      })
      throw new Error('Failed to clear specific data types')
    }
  }

  /**
   * Get data size information
   */
  getDataSizeInfo(): Record<string, number> {
    try {
      const sizeInfo: Record<string, number> = {}

      // Calculate localStorage sizes
      const notes = storageService.getItem(StorageService.KEYS.NOTES)
      const notebooks = storageService.getItem(StorageService.KEYS.NOTEBOOKS)
      const settings = storageService.getItem(StorageService.KEYS.SETTINGS)
      const tagColors = storageService.getItem(StorageService.KEYS.TAG_COLORS)
      const usage = storageService.getItem(this.USAGE_DATA_KEY)

      sizeInfo.notes = notes ? new Blob([notes]).size : 0
      sizeInfo.notebooks = notebooks ? new Blob([notebooks]).size : 0
      sizeInfo.settings = settings ? new Blob([settings]).size : 0
      sizeInfo.tagColors = tagColors ? new Blob([tagColors]).size : 0
      sizeInfo.usage = usage ? new Blob([usage]).size : 0
      sizeInfo.total = Object.values(sizeInfo).reduce(
        (sum, size) => sum + size,
        0
      )

      return sizeInfo
    } catch (error) {
      loggingService.logError(error as Error, { context: 'getDataSizeInfo' })
      return { total: 0 }
    }
  }
}

export const privacyService = new PrivacyService()
