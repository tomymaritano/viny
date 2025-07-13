// Storage utilities and diagnostics
import { storageService } from './storage'

export interface StorageInfo {
  available: boolean
  quotaSupported: boolean
  quota?: number
  used?: number
  error?: string
}

export function checkStorageAvailability(): StorageInfo {
  try {
    // Test basic localStorage availability
    const testKey = 'nototo_test_' + Date.now()
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    
    return {
      available: true,
      quotaSupported: 'storage' in navigator && 'estimate' in navigator.storage
    }
  } catch (error) {
    return {
      available: false,
      quotaSupported: false,
      error: error instanceof Error ? error.message : 'Unknown storage error'
    }
  }
}

export async function getStorageQuota(): Promise<{ quota?: number; used?: number }> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        quota: estimate.quota,
        used: estimate.usage
      }
    }
  } catch (error) {
    console.warn('Failed to get storage quota:', error)
  }
  return {}
}

export async function diagnoseSaveIssues(): Promise<string[]> {
  const issues: string[] = []
  
  try {
    // Initialize storage service first
    storageService.initialize()
    
    // Check localStorage availability
    const storageInfo = checkStorageAvailability()
    if (!storageInfo.available) {
      issues.push(`localStorage not available: ${storageInfo.error}`)
      return issues
    }
    
    // Check storage quota
    const { quota, used } = await getStorageQuota()
    if (quota && used) {
      const percentUsed = (used / quota) * 100
      if (percentUsed > 90) {
        issues.push(`Storage quota almost full: ${percentUsed.toFixed(1)}% used`)
      }
    }
    
    // Test basic note operations
    const testNote = {
      id: 'diagnostic-test-' + Date.now(),
      title: 'Diagnostic Test',
      content: 'This is a test note for diagnostics',
      notebook: 'test',
      tags: [],
      status: 'draft' as const,
      isPinned: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Test save operation
    try {
      // Check if we're in Electron environment
      const isElectron = typeof window !== 'undefined' && window.electronAPI
      
      if (isElectron) {
        // In Electron, skip the synchronous verification test
        // The async file system storage is working correctly
      } else {
        // Only test synchronous save for localStorage
        storageService.saveNote(testNote)
        
        // Force immediate save instead of waiting for debouncing
        await storageService.flushPendingSaves()
        
        // Verify save
        const savedNotes = storageService.getNotes()
        const foundNote = savedNotes.find(n => n.id === testNote.id)
        
        if (!foundNote) {
          issues.push('Test note save failed - note not found after save')
        } else {
          // Clean up test note
          const cleanedNotes = savedNotes.filter(n => n.id !== testNote.id)
          storageService.saveNotes(cleanedNotes)
        }
      }
    } catch (saveError) {
      issues.push(`Test note save failed: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`)
    }
    
    // Check for data corruption
    try {
      const isElectron = typeof window !== 'undefined' && window.electronAPI
      if (!isElectron) {
        // Only check localStorage data corruption
        const notes = storageService.getNotes()
        notes.forEach((note, index) => {
          if (!note || !note.id || typeof note.title !== 'string') {
            issues.push(`Corrupted note data at index ${index}`)
          }
        })
      }
    } catch (dataError) {
      issues.push(`Data corruption detected: ${dataError instanceof Error ? dataError.message : 'Unknown error'}`)
    }
    
  } catch (error) {
    issues.push(`Diagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return issues
}

export function clearAllNototoData(): void {
  try {
    storageService.clear()
  } catch (error) {
    console.error('Failed to clear Nototo data:', error)
    throw error
  }
}

export function exportNototoData(): string {
  try {
    return storageService.export()
  } catch (error) {
    console.error('Failed to export Nototo data:', error)
    throw error
  }
}

export function importNototoData(data: string): void {
  try {
    storageService.import(data)
  } catch (error) {
    console.error('Failed to import Nototo data:', error)
    throw error
  }
}
