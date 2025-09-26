/**
 * Hook for handling image paste in the editor
 * Integrates with the storage system to save images properly
 */

import { useCallback } from 'react'
import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { editorLogger } from '../utils/logger'
import { useAppStore } from '../stores/newSimpleStore'

export function useEditorImagePaste() {
  const { showSuccess, showError } = useAppStore()
  
  const saveImageToStorage = useCallback(async (file: File): Promise<string> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image')
      }
      
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('Image size exceeds 10MB limit')
      }
      
      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `image_${timestamp}_${sanitizedName}`
      
      // Convert to base64 for storage
      const reader = new FileReader()
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Extract base64 data (remove data:image/xxx;base64, prefix)
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      
      // Save to repository
      const repository = createDocumentRepository()
      await repository.initialize()
      
      // Store image metadata and data
      const imageData = {
        filename,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        createdAt: new Date().toISOString()
      }
      
      // For now, we'll use a data URL. In production, you'd save to file system or cloud storage
      const imageUrl = `data:${file.type};base64,${base64Data}`
      
      // Store image reference (in production, this would be saved to a dedicated images collection)
      await repository.setUIState('images', filename, imageData)
      
      editorLogger.info('Image saved successfully:', { filename, size: file.size })
      showSuccess(`Image "${file.name}" uploaded successfully`)
      
      return imageUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save image'
      editorLogger.error('Failed to save image:', error)
      showError(message)
      throw error
    }
  }, [showSuccess, showError])
  
  const loadImage = useCallback(async (filename: string): Promise<string | null> => {
    try {
      const repository = createDocumentRepository()
      await repository.initialize()
      
      const imageData = await repository.getUIState<{
        filename: string
        mimeType: string
        data: string
      }>('images', filename)
      
      if (!imageData) {
        return null
      }
      
      return `data:${imageData.mimeType};base64,${imageData.data}`
    } catch (error) {
      editorLogger.error('Failed to load image:', error)
      return null
    }
  }, [])
  
  const deleteImage = useCallback(async (filename: string): Promise<void> => {
    try {
      const repository = createDocumentRepository()
      await repository.initialize()
      
      await repository.setUIState('images', filename, null)
      
      editorLogger.info('Image deleted:', filename)
    } catch (error) {
      editorLogger.error('Failed to delete image:', error)
      throw error
    }
  }, [])
  
  const getAllImages = useCallback(async (): Promise<string[]> => {
    try {
      const repository = createDocumentRepository()
      await repository.initialize()
      
      // Get all image keys (this is a simplified approach)
      // In production, you'd have a proper image management system
      const allUIState = await repository.getUIState<Record<string, any>>('images', '')
      
      if (!allUIState || typeof allUIState !== 'object') {
        return []
      }
      
      return Object.keys(allUIState)
    } catch (error) {
      editorLogger.error('Failed to get images:', error)
      return []
    }
  }, [])
  
  return {
    saveImageToStorage,
    loadImage,
    deleteImage,
    getAllImages
  }
}