/**
 * Safe storage wrapper with robust error handling
 */

export class SafeStorage {
  private readonly NOTES_KEY = 'viny_notes'
  private readonly NOTEBOOKS_KEY = 'viny_notebooks'
  private readonly SETTINGS_KEY = 'viny-settings'
  private readonly TAG_COLORS_KEY = 'viny_tag_colors'

  /**
   * Safely get data from localStorage with fallback
   */
  private safeGetItem(key: string, fallback: any = null): any {
    try {
      const item = localStorage.getItem(key)
      if (!item) return fallback
      
      try {
        return JSON.parse(item)
      } catch (parseError) {
        console.error(`Failed to parse ${key}:`, parseError)
        console.log('Raw data:', item?.substring(0, 100) + '...')
        
        // Try to fix common JSON errors
        const fixed = this.tryFixJSON(item)
        if (fixed) {
          console.log('Fixed JSON successfully')
          return fixed
        }
        
        // If we can't fix it, return fallback
        return fallback
      }
    } catch (error) {
      console.error(`Failed to access localStorage for ${key}:`, error)
      return fallback
    }
  }

  /**
   * Try to fix common JSON errors
   */
  private tryFixJSON(str: string): any | null {
    try {
      // Remove trailing commas
      let fixed = str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
      
      // Try to parse
      return JSON.parse(fixed)
    } catch (e) {
      // If it's still not valid, try wrapping in array
      try {
        return JSON.parse('[' + str + ']')
      } catch (e2) {
        return null
      }
    }
  }

  /**
   * Safely set data to localStorage
   */
  private safeSetItem(key: string, value: any): boolean {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error(`Failed to save ${key}:`, error)
      
      // Check if it's quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded(key)
      }
      
      return false
    }
  }

  /**
   * Handle quota exceeded error
   */
  private handleQuotaExceeded(failedKey: string) {
    console.warn('Storage quota exceeded, attempting cleanup...')
    
    // Get all keys and their sizes
    const sizes: Array<{key: string, size: number}> = []
    
    for (let key in localStorage) {
      if (key.includes('viny') || key.includes('inkrun')) {
        const value = localStorage.getItem(key)
        if (value) {
          sizes.push({
            key,
            size: new Blob([value]).size
          })
        }
      }
    }
    
    // Sort by size (largest first)
    sizes.sort((a, b) => b.size - a.size)
    
    // Remove largest items until we have space
    for (const item of sizes) {
      if (item.key !== failedKey) {
        console.log(`Removing ${item.key} (${(item.size / 1024).toFixed(2)} KB)`)
        localStorage.removeItem(item.key)
        break // Try removing just one large item first
      }
    }
  }

  /**
   * Get all notes safely
   */
  getNotes(): any[] {
    const notes = this.safeGetItem(this.NOTES_KEY, [])
    return Array.isArray(notes) ? notes : []
  }

  /**
   * Save notes safely
   */
  saveNotes(notes: any[]): boolean {
    return this.safeSetItem(this.NOTES_KEY, notes)
  }

  /**
   * Get all notebooks safely
   */
  getNotebooks(): any[] {
    const notebooks = this.safeGetItem(this.NOTEBOOKS_KEY, [])
    return Array.isArray(notebooks) ? notebooks : []
  }

  /**
   * Save notebooks safely
   */
  saveNotebooks(notebooks: any[]): boolean {
    return this.safeSetItem(this.NOTEBOOKS_KEY, notebooks)
  }

  /**
   * Get settings safely
   */
  getSettings(): any {
    return this.safeGetItem(this.SETTINGS_KEY, {})
  }

  /**
   * Save settings safely
   */
  saveSettings(settings: any): boolean {
    return this.safeSetItem(this.SETTINGS_KEY, settings)
  }

  /**
   * Get tag colors safely
   */
  getTagColors(): any {
    return this.safeGetItem(this.TAG_COLORS_KEY, {})
  }

  /**
   * Save tag colors safely
   */
  saveTagColors(colors: any): boolean {
    return this.safeSetItem(this.TAG_COLORS_KEY, colors)
  }

  /**
   * Clear all storage safely
   */
  clearAll(): void {
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('viny') || key.includes('inkrun'))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.error(`Failed to remove ${key}:`, e)
        }
      })
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * Export all data for backup
   */
  exportData(): any {
    return {
      notes: this.getNotes(),
      notebooks: this.getNotebooks(),
      settings: this.getSettings(),
      tagColors: this.getTagColors(),
      exportDate: new Date().toISOString()
    }
  }

  /**
   * Import data from backup
   */
  importData(data: any): boolean {
    try {
      if (data.notes) this.saveNotes(data.notes)
      if (data.notebooks) this.saveNotebooks(data.notebooks)
      if (data.settings) this.saveSettings(data.settings)
      if (data.tagColors) this.saveTagColors(data.tagColors)
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
}

export const safeStorage = new SafeStorage()