import { useState, useCallback, useRef } from 'react'
import { logger } from '../utils/logger'

interface ImageStoreEntry {
  blob: Blob
  url: string
  timestamp: number
}

/**
 * Hook for managing image storage with automatic cleanup
 * Replaces the global window.nototoImageStore pattern
 */
export function useImageStore() {
  const imageStore = useRef<Map<string, ImageStoreEntry>>(new Map())
  const [, forceUpdate] = useState({})

  // Cleanup old entries periodically (older than 1 hour)
  const cleanup = useCallback(() => {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour
    
    let cleanedCount = 0
    imageStore.current.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        URL.revokeObjectURL(entry.url)
        imageStore.current.delete(key)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} old image entries`)
      forceUpdate({})
    }
  }, [])

  const storeImage = useCallback((file: File): string => {
    try {
      // Generate unique key
      const key = `${file.name}-${file.size}-${file.lastModified}`
      
      // Check if already stored
      const existing = imageStore.current.get(key)
      if (existing) {
        logger.debug(`Image already in store: ${key}`)
        return existing.url
      }

      // Create blob URL
      const url = URL.createObjectURL(file)
      
      // Store with metadata
      imageStore.current.set(key, {
        blob: file,
        url,
        timestamp: Date.now()
      })

      logger.debug(`Image stored: ${key}`)
      
      // Cleanup old entries
      cleanup()
      
      return url
    } catch (error) {
      logger.error('Failed to store image:', error)
      throw new Error('Failed to store image')
    }
  }, [cleanup])

  const getImage = useCallback((key: string): string | null => {
    const entry = imageStore.current.get(key)
    return entry ? entry.url : null
  }, [])

  const removeImage = useCallback((key: string): boolean => {
    const entry = imageStore.current.get(key)
    if (entry) {
      URL.revokeObjectURL(entry.url)
      imageStore.current.delete(key)
      logger.debug(`Image removed: ${key}`)
      forceUpdate({})
      return true
    }
    return false
  }, [])

  const clearAll = useCallback(() => {
    imageStore.current.forEach(entry => {
      URL.revokeObjectURL(entry.url)
    })
    imageStore.current.clear()
    logger.debug('All images cleared from store')
    forceUpdate({})
  }, [])

  const getStats = useCallback(() => {
    return {
      count: imageStore.current.size,
      entries: Array.from(imageStore.current.entries()).map(([key, entry]) => ({
        key,
        size: entry.blob.size,
        timestamp: entry.timestamp,
        age: Date.now() - entry.timestamp
      }))
    }
  }, [])

  return {
    storeImage,
    getImage,
    removeImage,
    clearAll,
    cleanup,
    getStats
  }
}