/**
 * LocalEmbeddingServiceSimple - Simplified version without Web Workers
 *
 * Runs in the main thread for now to avoid module loading issues
 */

import type { Pipeline } from '@xenova/transformers'
import { pipeline, env } from '@xenova/transformers'
import { notebookLogger as logger } from '../../utils/logger'
import { fallbackEmbeddingService } from './FallbackEmbeddingService'

// Configure transformers.js to use local models
env.allowLocalModels = false // Disable local models for now, download from Hugging Face
// env.localURL = '/models/' // Models will be cached in public/models/

export interface EmbeddingResult {
  embedding: Float32Array
  model: string
  dimensions: number
  processingTime: number
}

export interface ChunkEmbedding {
  id: string
  noteId: string
  chunk: string
  embedding: Float32Array
  position: number
  model: string
}

export interface EmbeddingOptions {
  pooling?: 'mean' | 'max' | 'cls'
  normalize?: boolean
}

export interface ChunkOptions {
  maxChunkSize?: number
  overlap?: number
}

export interface SimilarityOptions {
  topK?: number
  threshold?: number
}

class LocalEmbeddingService {
  private model: string
  private embedder: Pipeline | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null
  private useFallback = false

  constructor(model = 'Xenova/all-MiniLM-L6-v2') {
    this.model = model
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._initialize()
    await this.initPromise
  }

  private async _initialize(): Promise<void> {
    // For now, skip directly to fallback to avoid download issues
    logger.info('Using fallback embedding service to avoid download issues')
    this.useFallback = true
    await fallbackEmbeddingService.initialize()
    this.initialized = true
    logger.info('Fallback embedding service initialized successfully')
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(
    text: string,
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult> {
    await this.initialize()

    // Use fallback if needed
    if (this.useFallback) {
      return fallbackEmbeddingService.generateEmbedding(text)
    }

    if (!this.embedder) {
      throw new Error('Embedder not initialized')
    }

    const start = performance.now()

    try {
      // Generate embeddings
      const output = await this.embedder(text, {
        pooling: options.pooling || 'mean',
        normalize: options.normalize !== false,
      })

      // Convert to Float32Array
      const embedding = new Float32Array(output.data)
      const processingTime = performance.now() - start

      return {
        embedding,
        model: this.model,
        dimensions: embedding.length,
        processingTime,
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unexpected token')
      ) {
        const enhancedError = new Error(
          `Embedding generation failed. The model may not be properly loaded.\n` +
            `Please check your internet connection and try again.\n` +
            `Original error: ${error.message}`
        )
        logger.error('Embedding generation failed', enhancedError)
        throw enhancedError
      }
      logger.error('Failed to generate embedding', error)
      throw error
    }
  }

  /**
   * Get cached embedding if available
   */
  async getCachedEmbedding(text: string): Promise<Float32Array | null> {
    // For now, return null - caching will be implemented with the embedding manager
    return null
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async generateEmbeddings(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult[]> {
    await this.initialize()

    const results: EmbeddingResult[] = []

    // Process texts one by one (batch processing in transformers.js is not always faster)
    for (const text of texts) {
      const result = await this.generateEmbedding(text, options)
      results.push(result)
    }

    return results
  }

  /**
   * Chunk text for embedding generation
   */
  chunkText(text: string, options: ChunkOptions = {}): string[] {
    const maxChunkSize = options.maxChunkSize || 512
    const overlap = options.overlap || 50

    const chunks: string[] = []
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

    let currentChunk = ''
    let currentLength = 0

    for (const sentence of sentences) {
      if (currentLength + sentence.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim())

        // Add overlap from the end of the previous chunk
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(overlap / 5)).join(' ')
        currentChunk = overlapWords + ' ' + sentence
        currentLength = currentChunk.length
      } else {
        currentChunk += ' ' + sentence
        currentLength += sentence.length
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  /**
   * Generate embeddings for a note with chunking
   */
  async generateNoteEmbeddings(
    noteId: string,
    content: string,
    chunkOptions?: ChunkOptions,
    embeddingOptions?: EmbeddingOptions
  ): Promise<ChunkEmbedding[]> {
    const chunks = this.chunkText(content, chunkOptions)
    const embeddings: ChunkEmbedding[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const result = await this.generateEmbedding(chunk, embeddingOptions)

      embeddings.push({
        id: `${noteId}_chunk_${i}`,
        noteId,
        chunk,
        embedding: result.embedding,
        position: i,
        model: this.useFallback ? 'fallback-tfidf' : this.model,
      })
    }

    return embeddings
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimensions')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Find most similar embeddings
   */
  findSimilar(
    queryEmbedding: Float32Array,
    embeddings: { id: string; embedding: Float32Array }[],
    options: SimilarityOptions = {}
  ): { id: string; similarity: number }[] {
    const topK = options.topK || 5
    const threshold = options.threshold || 0.7

    const similarities = embeddings.map(item => ({
      id: item.id,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
    }))

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.embedder = null
    this.initialized = false
    this.initPromise = null
  }

  /**
   * Get model info
   */
  getModelInfo(): { name: string; dimensions: number } {
    if (this.useFallback) {
      return fallbackEmbeddingService.getModelInfo()
    }

    // Common model dimensions
    const modelDimensions: Record<string, number> = {
      'Xenova/all-MiniLM-L6-v2': 384,
      'Xenova/all-mpnet-base-v2': 768,
      'Xenova/all-distilroberta-v1': 768,
      'Xenova/multi-qa-MiniLM-L6-cos-v1': 384,
    }

    return {
      name: this.model,
      dimensions: modelDimensions[this.model] || 384,
    }
  }
}

// Export singleton instance
export const localEmbeddingService = new LocalEmbeddingService()

// Export class for testing
export { LocalEmbeddingService }
