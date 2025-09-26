/**
 * FallbackEmbeddingService - Simple embedding service for development/offline use
 *
 * Uses basic text hashing and TF-IDF-like approach when ML models are unavailable
 */

import { notebookLogger as logger } from '../../utils/logger'

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

class FallbackEmbeddingService {
  private readonly DIMENSIONS = 384 // Match MiniLM dimensions
  private readonly model = 'fallback-tfidf'
  private vocabulary: Map<string, number> = new Map()
  private idf: Map<string, number> = new Map()
  private documentCount = 0

  /**
   * Simple tokenizer
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
  }

  /**
   * Create a simple hash-based embedding
   */
  private hashToVector(text: string): Float32Array {
    const tokens = this.tokenize(text)
    const vector = new Float32Array(this.DIMENSIONS)

    // Simple hashing approach
    tokens.forEach((token, idx) => {
      // Hash token to multiple positions
      for (let i = 0; i < 3; i++) {
        const hash = this.simpleHash(token + i)
        const position = Math.abs(hash) % this.DIMENSIONS
        const value = 1.0 / Math.sqrt(tokens.length)
        vector[position] += value
      }
    })

    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm
      }
    }

    return vector
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return true // Always ready
  }

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<void> {
    logger.info(
      'FallbackEmbeddingService initialized (no model download required)'
    )
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const start = performance.now()

    try {
      const embedding = this.hashToVector(text)
      const processingTime = performance.now() - start

      return {
        embedding,
        model: this.model,
        dimensions: this.DIMENSIONS,
        processingTime,
      }
    } catch (error) {
      logger.error('Failed to generate fallback embedding', error)
      throw error
    }
  }

  /**
   * Chunk text for embedding generation
   */
  chunkText(text: string, maxChunkSize = 512, overlap = 50): string[] {
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
    content: string
  ): Promise<ChunkEmbedding[]> {
    const chunks = this.chunkText(content)
    const embeddings: ChunkEmbedding[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const result = await this.generateEmbedding(chunk)

      embeddings.push({
        id: `${noteId}_chunk_${i}`,
        noteId,
        chunk,
        embedding: result.embedding,
        position: i,
        model: this.model,
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
    topK = 5,
    threshold = 0.3 // Lower threshold for fallback
  ): { id: string; similarity: number }[] {
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
   * Get model info
   */
  getModelInfo(): { name: string; dimensions: number } {
    return {
      name: this.model,
      dimensions: this.DIMENSIONS,
    }
  }
}

// Export singleton instance
export const fallbackEmbeddingService = new FallbackEmbeddingService()

// Export class for testing
export { FallbackEmbeddingService }
