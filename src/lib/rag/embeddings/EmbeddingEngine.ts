/**
 * Embedding Engine for Local Text Processing
 * Uses Transformers.js for privacy-focused local embeddings
 */

import { pipeline, env } from '@xenova/transformers'
import type { Note } from '@/types'
import { logger } from '@/utils/logger'
import { ChunkingStrategy } from './ChunkingStrategy'
import { EmbeddingCache } from './EmbeddingCache'

// Configure Transformers.js for browser usage
env.allowLocalModels = false
env.backends.onnx.wasm.numThreads = 4

export interface EmbeddingConfig {
  modelName: string
  maxLength: number
  overlap: number
  batchSize: number
  useCache: boolean
}

export interface TextChunk {
  id: string
  noteId: string
  text: string
  startOffset: number
  endOffset: number
  metadata: {
    title?: string
    tags?: string[]
    notebook?: string
  }
}

export interface Embedding {
  id: string
  noteId: string
  chunkId: string
  vector: Float32Array
  metadata: TextChunk['metadata']
  timestamp: string
}

export class EmbeddingEngine {
  private pipeline: any = null
  private config: EmbeddingConfig
  private chunker: ChunkingStrategy
  private cache: EmbeddingCache
  private isInitialized = false
  private worker: Worker | null = null

  constructor(config: Partial<EmbeddingConfig> = {}) {
    this.config = {
      modelName: 'Xenova/all-MiniLM-L6-v2',
      maxLength: 512,
      overlap: 128,
      batchSize: 8,
      useCache: true,
      ...config,
    }

    this.chunker = new ChunkingStrategy({
      maxLength: this.config.maxLength,
      overlap: this.config.overlap,
    })

    this.cache = new EmbeddingCache()
  }

  /**
   * Initialize the embedding pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      logger.info('Initializing embedding engine...')

      // Initialize in Web Worker if available
      if (typeof Worker !== 'undefined') {
        await this.initializeWorker()
      } else {
        // Fallback to main thread
        this.pipeline = await pipeline(
          'feature-extraction',
          this.config.modelName
        )
      }

      if (this.config.useCache) {
        await this.cache.initialize()
      }

      this.isInitialized = true
      logger.info('Embedding engine initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize embedding engine:', error)
      throw error
    }
  }

  /**
   * Initialize Web Worker for embeddings
   */
  private async initializeWorker(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.worker = new Worker(
        new URL('./embedding.worker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = event => {
        if (event.data.type === 'initialized') {
          resolve()
        } else if (event.data.type === 'error') {
          reject(new Error(event.data.error))
        }
      }

      this.worker.postMessage({
        type: 'initialize',
        config: this.config,
      })
    })
  }

  /**
   * Generate embeddings for a single note
   */
  async embedNote(note: Note): Promise<Embedding[]> {
    await this.ensureInitialized()

    // Check cache first
    if (this.config.useCache) {
      const cached = await this.cache.getEmbeddings(note.id, note.updatedAt)
      if (cached.length > 0) {
        logger.debug(`Using cached embeddings for note ${note.id}`)
        return cached
      }
    }

    // Generate chunks
    const chunks = this.chunker.chunkNote(note)
    logger.debug(`Generated ${chunks.length} chunks for note ${note.id}`)

    // Generate embeddings
    const embeddings = await this.generateEmbeddings(chunks)

    // Cache results
    if (this.config.useCache) {
      await this.cache.storeEmbeddings(note.id, embeddings, note.updatedAt)
    }

    return embeddings
  }

  /**
   * Generate embeddings for multiple notes
   */
  async embedNotes(notes: Note[]): Promise<Map<string, Embedding[]>> {
    await this.ensureInitialized()

    const results = new Map<string, Embedding[]>()
    const batchSize = this.config.batchSize

    // Process in batches
    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize)
      const batchPromises = batch.map(note => this.embedNote(note))

      const batchResults = await Promise.all(batchPromises)

      batch.forEach((note, index) => {
        results.set(note.id, batchResults[index])
      })

      logger.debug(
        `Processed batch ${i / batchSize + 1} of ${Math.ceil(notes.length / batchSize)}`
      )
    }

    return results
  }

  /**
   * Generate embeddings for text chunks
   */
  private async generateEmbeddings(chunks: TextChunk[]): Promise<Embedding[]> {
    if (this.worker) {
      return this.generateEmbeddingsWithWorker(chunks)
    } else {
      return this.generateEmbeddingsMainThread(chunks)
    }
  }

  /**
   * Generate embeddings in Web Worker
   */
  private async generateEmbeddingsWithWorker(
    chunks: TextChunk[]
  ): Promise<Embedding[]> {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'embeddings') {
          this.worker!.removeEventListener('message', messageHandler)
          resolve(event.data.embeddings)
        } else if (event.data.type === 'error') {
          this.worker!.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      this.worker!.addEventListener('message', messageHandler)
      this.worker!.postMessage({
        type: 'embed',
        chunks,
      })
    })
  }

  /**
   * Generate embeddings in main thread
   */
  private async generateEmbeddingsMainThread(
    chunks: TextChunk[]
  ): Promise<Embedding[]> {
    const embeddings: Embedding[] = []

    for (const chunk of chunks) {
      try {
        const output = await this.pipeline(chunk.text, {
          pooling: 'mean',
          normalize: true,
        })

        const embedding: Embedding = {
          id: `emb_${chunk.id}`,
          noteId: chunk.noteId,
          chunkId: chunk.id,
          vector: new Float32Array(output.data),
          metadata: chunk.metadata,
          timestamp: new Date().toISOString(),
        }

        embeddings.push(embedding)
      } catch (error) {
        logger.error(
          `Failed to generate embedding for chunk ${chunk.id}:`,
          error
        )
      }
    }

    return embeddings
  }

  /**
   * Generate embedding for a query
   */
  async embedQuery(query: string): Promise<Float32Array> {
    await this.ensureInitialized()

    // Check cache
    const cacheKey = `query_${query}`
    if (this.config.useCache) {
      const cached = await this.cache.getQueryEmbedding(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Generate embedding
    let embedding: Float32Array

    if (this.worker) {
      embedding = await this.embedQueryWithWorker(query)
    } else {
      const output = await this.pipeline(query, {
        pooling: 'mean',
        normalize: true,
      })
      embedding = new Float32Array(output.data)
    }

    // Cache result
    if (this.config.useCache) {
      await this.cache.storeQueryEmbedding(cacheKey, embedding)
    }

    return embedding
  }

  /**
   * Embed query using Web Worker
   */
  private async embedQueryWithWorker(query: string): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'queryEmbedding') {
          this.worker!.removeEventListener('message', messageHandler)
          resolve(new Float32Array(event.data.embedding))
        } else if (event.data.type === 'error') {
          this.worker!.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error))
        }
      }

      this.worker!.addEventListener('message', messageHandler)
      this.worker!.postMessage({
        type: 'embedQuery',
        query,
      })
    })
  }

  /**
   * Update embeddings for modified notes
   */
  async updateEmbeddings(notes: Note[]): Promise<void> {
    const modifiedNotes = await this.cache.getModifiedNotes(notes)

    if (modifiedNotes.length > 0) {
      logger.info(
        `Updating embeddings for ${modifiedNotes.length} modified notes`
      )
      await this.embedNotes(modifiedNotes)
    }
  }

  /**
   * Clear all embeddings
   */
  async clearEmbeddings(): Promise<void> {
    await this.cache.clear()
    logger.info('Cleared all embeddings')
  }

  /**
   * Get embedding statistics
   */
  async getStats(): Promise<{
    totalEmbeddings: number
    cacheSize: number
    modelInfo: any
  }> {
    const cacheStats = await this.cache.getStats()

    return {
      totalEmbeddings: cacheStats.totalEmbeddings,
      cacheSize: cacheStats.size,
      modelInfo: {
        name: this.config.modelName,
        maxLength: this.config.maxLength,
        isInitialized: this.isInitialized,
      },
    }
  }

  /**
   * Ensure engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    if (this.cache) {
      await this.cache.destroy()
    }

    this.pipeline = null
    this.isInitialized = false
    logger.info('Embedding engine destroyed')
  }
}
