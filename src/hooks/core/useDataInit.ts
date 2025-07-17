import { useEffect, useRef } from 'react'
import { initializeDefaultData } from '../../utils/defaultDataInitializer'
import { initLogger as logger } from '../../utils/logger'

/**
 * Hook responsible for initializing default data
 * - Creates welcome notes if needed
 * - Ensures initial data is present
 */
export const useDataInit = () => {
  const hasInitialized = useRef(false)

  useEffect(() => {
    const initData = async () => {
      if (hasInitialized.current) return
      
      try {
        logger.debug('Initializing default data if needed...')
        await initializeDefaultData()
        hasInitialized.current = true
        logger.debug('Default data initialization completed')
      } catch (error) {
        logger.error('Failed to initialize default data:', error)
      }
    }
    
    initData()
  }, [])

  return {
    isDataInitialized: hasInitialized.current
  }
}