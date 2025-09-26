/**
 * RAG System Hook
 * Manages RAG system lifecycle and state
 */

import { useState, useEffect, useRef } from 'react'
import { RAGSystem, type RAGSystemConfig } from '@/lib/rag'
import { useAppStore } from '@/stores/newSimpleStore'
import { logger } from '@/utils/logger'

interface UseRAGOptions extends RAGSystemConfig {
  autoIndex?: boolean
  indexOnInit?: boolean
}

interface UseRAGReturn {
  ragSystem: RAGSystem | null
  isInitialized: boolean
  isIndexing: boolean
  indexProgress: number
  error: string | null
  stats: any | null
  initialize: () => Promise<void>
  indexNotes: () => Promise<void>
  clearIndex: () => Promise<void>
}

export const useRAG = (options: UseRAGOptions = {}): UseRAGReturn => {
  const { autoIndex = true, indexOnInit = true, ...ragConfig } = options

  const [ragSystem, setRagSystem] = useState<RAGSystem | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexProgress, setIndexProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any | null>(null)

  const initRef = useRef(false)
  const { notes } = useAppStore()

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      initialize()
    }

    return () => {
      if (ragSystem) {
        ragSystem
          .destroy()
          .catch(err => logger.error('Failed to destroy RAG system:', err))
      }
    }
  }, [])

  useEffect(() => {
    if (autoIndex && isInitialized && notes.length > 0) {
      // Debounce indexing to avoid too many updates
      const timer = setTimeout(() => {
        indexNotes()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [notes, isInitialized, autoIndex])

  const initialize = async () => {
    try {
      setError(null)
      logger.info('Initializing RAG system...')

      const system = await RAGSystem.initialize(ragConfig)
      setRagSystem(system)
      setIsInitialized(true)

      // Get initial stats
      const initialStats = await system.getStats()
      setStats(initialStats)

      logger.info('RAG system initialized successfully')

      // Initial indexing if requested
      if (indexOnInit && notes.length > 0) {
        await indexNotesInternal(system)
      }
    } catch (err) {
      logger.error('Failed to initialize RAG system:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize')
      setIsInitialized(false)
    }
  }

  const indexNotes = async () => {
    if (!ragSystem || isIndexing) return

    await indexNotesInternal(ragSystem)
  }

  const indexNotesInternal = async (system: RAGSystem) => {
    try {
      setIsIndexing(true)
      setIndexProgress(0)
      setError(null)

      logger.info(`Starting to index ${notes.length} notes...`)

      // Process in batches for progress updates
      const batchSize = 10
      const batches = Math.ceil(notes.length / batchSize)

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, notes.length)
        const batch = notes.slice(start, end)

        await system.processNotes(batch)

        const progress = Math.round(((i + 1) / batches) * 100)
        setIndexProgress(progress)
      }

      // Update stats
      const updatedStats = await system.getStats()
      setStats(updatedStats)

      logger.info('Indexing completed successfully')
    } catch (err) {
      logger.error('Failed to index notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to index notes')
    } finally {
      setIsIndexing(false)
      setIndexProgress(0)
    }
  }

  const clearIndex = async () => {
    if (!ragSystem) return

    try {
      setError(null)
      await ragSystem.clearData()

      // Update stats
      const updatedStats = await ragSystem.getStats()
      setStats(updatedStats)

      logger.info('Index cleared successfully')
    } catch (err) {
      logger.error('Failed to clear index:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear index')
    }
  }

  return {
    ragSystem,
    isInitialized,
    isIndexing,
    indexProgress,
    error,
    stats,
    initialize,
    indexNotes,
    clearIndex,
  }
}
