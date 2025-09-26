/**
 * LocalEmbeddingService - Local embeddings generation using Transformers.js
 *
 * Runs completely in the browser with no external API calls
 * Uses Web Workers for non-blocking computation
 */

import { pipeline, env } from '@xenova/transformers'
import { notebookLogger as logger } from '../../utils/logger'

// Configure transformers.js to use local models
env.allowLocalModels = true
env.localURL = '/models/' // Models will be cached in public/models/

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

// Note: Web Worker implementation is temporarily disabled due to module loading issues
// Will use main thread for now

/*
// Web Worker for background processing
const WORKER_SCRIPT = `
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = true;
env.localURL = '/models/';

let embedder = null;

self.addEventListener('message', async (event) => {
  const { id, action, data } = event.data;
  
  try {
    if (action === 'init') {
      const model = data.model || 'Xenova/all-MiniLM-L6-v2';
      embedder = await pipeline('feature-extraction', model);
      self.postMessage({ id, success: true });
    } 
    else if (action === 'embed') {
      if (!embedder) {
        throw new Error('Embedder not initialized');
      }
      
      const start = performance.now();
      const output = await embedder(data.text, { pooling: 'mean', normalize: true });
      const embedding = output.data;
      const processingTime = performance.now() - start;
      
      self.postMessage({
        id,
        success: true,
        result: {
          embedding: new Float32Array(embedding),
          dimensions: embedding.length,
          processingTime
        }
      });
    }
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    });
  }
});
`;
*/

class LocalEmbeddingService {
  private worker: Worker | null = null
  private model: string
  private initialized = false
  private initPromise: Promise<void> | null = null
  private requestId = 0
  private pendingRequests: Map<
    number,
    { resolve: Function; reject: Function }
  > = new Map()

  constructor(model = 'Xenova/all-MiniLM-L6-v2') {
    this.model = model
  }

  /**
   * Initialize the embedding service and Web Worker
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._initialize()
    await this.initPromise
  }

  private async _initialize(): Promise<void> {
    try {
      // Create Web Worker from blob
      const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      this.worker = new Worker(workerUrl, { type: 'module' })

      // Handle worker messages
      this.worker.onmessage = event => {
        const { id, success, result, error } = event.data
        const pending = this.pendingRequests.get(id)

        if (pending) {
          if (success) {
            pending.resolve(result)
          } else {
            pending.reject(new Error(error))
          }
          this.pendingRequests.delete(id)
        }
      }

      // Initialize the model in worker
      await this.sendToWorker('init', { model: this.model })

      this.initialized = true
      logger.info(`LocalEmbeddingService initialized with model: ${this.model}`)
    } catch (error) {
      logger.error('Failed to initialize LocalEmbeddingService', error)
      throw error
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    await this.initialize()

    const start = performance.now()

    try {
      const result = await this.sendToWorker('embed', { text })
      const totalTime = performance.now() - start

      return {
        embedding: result.embedding,
        model: this.model,
        dimensions: result.dimensions,
        processingTime: totalTime,
      }
    } catch (error) {
      logger.error('Failed to generate embedding', error)
      throw error
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    await this.initialize()

    // Process in parallel but limit concurrency
    const batchSize = 5
    const results: EmbeddingResult[] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      )
      results.push(...batchResults)
    }

    return results
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
    threshold = 0.7
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
   * Send message to worker
   */
  private sendToWorker(action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.requestId++
      this.pendingRequests.set(id, { resolve, reject })
      this.worker?.postMessage({ id, action, data })
    })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.initialized = false
    this.initPromise = null
    this.pendingRequests.clear()
  }

  /**
   * Get model info
   */
  getModelInfo(): { name: string; dimensions: number } {
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
