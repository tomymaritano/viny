import { useEffect } from 'react'
import { initLogger as logger } from '../../utils/logger'

/**
 * Hook responsible for development diagnostics
 * - Runs storage diagnostics in development
 * - Checks storage availability
 * - Reports storage issues
 */
export const useAppDiagnostics = () => {
  useEffect(() => {
    const runDiagnostics = async () => {
      if (process.env.NODE_ENV !== 'development') return

      try {
        logger.debug('Running storage diagnostics...')
        const { diagnoseSaveIssues, checkStorageAvailability } = await import(
          '../../lib/storageUtils'
        )

        const storageInfo = checkStorageAvailability()
        logger.debug('Storage availability:', storageInfo)

        const issues = await diagnoseSaveIssues()
        if (issues.length > 0) {
          logger.warn('Storage issues detected:', issues)
          issues.forEach(issue => logger.warn('Issue:', issue))
        } else {
          logger.debug('No storage issues detected')
        }
      } catch (error) {
        logger.error('Failed to run diagnostics:', error)
      }
    }

    runDiagnostics()
  }, [])

  return null // This hook doesn't expose any values
}
