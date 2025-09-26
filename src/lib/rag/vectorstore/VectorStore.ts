/**
 * Vector Store for Similarity Search
 * Efficient storage and retrieval of embeddings
 */

import Dexie, { type Table } from 'dexie'
import type { Embedding } from '../embeddings/EmbeddingEngine'
import { logger } from '@/utils/logger'

interface VectorDocument {
  id: string
  noteId: string
  chunkId: string
  vector: number[]
  magnitude: number // Pre-computed for faster cosine similarity
  metadata: any
  timestamp: string
}

interface SearchResult {
  noteId: string
  chunkId: string
  score: number
  metadata: any
  text?: string
}

export class VectorStore extends Dexie {
  vectors!: Table<VectorDocument>

  constructor() {
    super('VinyVectorStore')

    this.version(1).stores({
      vectors: 'id, noteId, chunkId, magnitude',
    })
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    try {
      await this.open()
      logger.info('Vector store initialized')
    } catch (error) {
      logger.error('Failed to initialize vector store:', error)
      throw error
    }
  }

  /**
   * Add embeddings to the store
   */
  async addEmbeddings(embeddings: Embedding[]): Promise<void> {
    try {
      const documents = embeddings.map(emb => ({
        id: emb.id,
        noteId: emb.noteId,
        chunkId: emb.chunkId,
        vector: Array.from(emb.vector),
        magnitude: this.computeMagnitude(emb.vector),
        metadata: emb.metadata,
        timestamp: emb.timestamp,
      }))

      await this.vectors.bulkPut(documents)
      logger.debug(`Added ${embeddings.length} embeddings to vector store`)
    } catch (error) {
      logger.error('Failed to add embeddings:', error)
      throw error
    }
  }

  /**
   * Update embeddings for a note
   */
  async updateNoteEmbeddings(
    noteId: string,
    embeddings: Embedding[]
  ): Promise<void> {
    try {
      // Delete existing embeddings for this note
      await this.vectors.where('noteId').equals(noteId).delete()

      // Add new embeddings
      await this.addEmbeddings(embeddings)
    } catch (error) {
      logger.error(`Failed to update embeddings for note ${noteId}:`, error)
      throw error
    }
  }

  /**
   * Search for similar embeddings
   */
  async search(
    queryVector: Float32Array,
    options: {
      limit?: number
      threshold?: number
      noteIds?: string[]
      metadata?: any
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, threshold = 0.7, noteIds, metadata } = options

    try {
      // Get candidate vectors
      let query = this.vectors.toCollection()

      if (noteIds && noteIds.length > 0) {
        query = query.filter(doc => noteIds.includes(doc.noteId))
      }

      const candidates = await query.toArray()

      // Compute similarities
      const queryMagnitude = this.computeMagnitude(queryVector)
      const results: SearchResult[] = []

      for (const candidate of candidates) {
        // Filter by metadata if provided
        if (metadata) {
          const matches = Object.entries(metadata).every(
            ([key, value]) => candidate.metadata?.[key] === value
          )
          if (!matches) continue
        }

        // Compute cosine similarity
        const score = this.cosineSimilarity(
          queryVector,
          new Float32Array(candidate.vector),
          queryMagnitude,
          candidate.magnitude
        )

        if (score >= threshold) {
          results.push({
            noteId: candidate.noteId,
            chunkId: candidate.chunkId,
            score,
            metadata: candidate.metadata,
          })
        }
      }

      // Sort by score and limit
      results.sort((a, b) => b.score - a.score)
      return results.slice(0, limit)
    } catch (error) {
      logger.error('Failed to search vectors:', error)
      throw error
    }
  }

  /**
   * Get k-nearest neighbors using HNSW-like approach
   */
  async knnSearch(
    queryVector: Float32Array,
    k: number,
    options: {
      noteIds?: string[]
      excludeNoteIds?: string[]
    } = {}
  ): Promise<SearchResult[]> {
    try {
      // For now, use brute force search
      // TODO: Implement proper HNSW index for large-scale search
      const results = await this.search(queryVector, {
        limit: k,
        threshold: 0,
        noteIds: options.noteIds,
      })

      // Filter out excluded notes
      if (options.excludeNoteIds && options.excludeNoteIds.length > 0) {
        return results.filter(r => !options.excludeNoteIds!.includes(r.noteId))
      }

      return results
    } catch (error) {
      logger.error('Failed to perform kNN search:', error)
      throw error
    }
  }

  /**
   * Delete embeddings for a note
   */
  async deleteNoteEmbeddings(noteId: string): Promise<void> {
    try {
      await this.vectors.where('noteId').equals(noteId).delete()
      logger.debug(`Deleted embeddings for note ${noteId}`)
    } catch (error) {
      logger.error(`Failed to delete embeddings for note ${noteId}:`, error)
      throw error
    }
  }

  /**
   * Get all unique note IDs in the store
   */
  async getIndexedNoteIds(): Promise<string[]> {
    try {
      const vectors = await this.vectors.toArray()
      const noteIds = new Set(vectors.map(v => v.noteId))
      return Array.from(noteIds)
    } catch (error) {
      logger.error('Failed to get indexed note IDs:', error)
      return []
    }
  }

  /**
   * Get statistics about the vector store
   */
  async getStats(): Promise<{
    totalVectors: number
    uniqueNotes: number
    averageVectorsPerNote: number
    storageSize: number
  }> {
    try {
      const totalVectors = await this.vectors.count()
      const noteIds = await this.getIndexedNoteIds()
      const uniqueNotes = noteIds.length

      // Estimate storage size
      const avgVectorSize = 384 * 4 // 384 dimensions * 4 bytes
      const metadataSize = 200 // Rough estimate
      const storageSize = totalVectors * (avgVectorSize + metadataSize)

      return {
        totalVectors,
        uniqueNotes,
        averageVectorsPerNote: uniqueNotes > 0 ? totalVectors / uniqueNotes : 0,
        storageSize,
      }
    } catch (error) {
      logger.error('Failed to get vector store stats:', error)
      return {
        totalVectors: 0,
        uniqueNotes: 0,
        averageVectorsPerNote: 0,
        storageSize: 0,
      }
    }
  }

  /**
   * Compute magnitude of a vector (for cosine similarity)
   */
  private computeMagnitude(vector: Float32Array | number[]): number {
    const arr = Array.isArray(vector) ? vector : Array.from(vector)
    return Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0))
  }

  /**
   * Compute cosine similarity between two vectors
   */
  private cosineSimilarity(
    a: Float32Array,
    b: Float32Array,
    magnitudeA?: number,
    magnitudeB?: number
  ): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
    }

    const magA = magnitudeA || this.computeMagnitude(a)
    const magB = magnitudeB || this.computeMagnitude(b)

    if (magA === 0 || magB === 0) {
      return 0
    }

    return dotProduct / (magA * magB)
  }

  /**
   * Clear all vectors
   */
  async clear(): Promise<void> {
    try {
      await this.vectors.clear()
      logger.info('Cleared all vectors')
    } catch (error) {
      logger.error('Failed to clear vectors:', error)
      throw error
    }
  }

  /**
   * Optimize the vector store (e.g., rebuild indices)
   */
  async optimize(): Promise<void> {
    try {
      // For now, just log
      // TODO: Implement index optimization
      logger.info('Vector store optimization requested')
    } catch (error) {
      logger.error('Failed to optimize vector store:', error)
    }
  }

  /**
   * Export vectors for backup
   */
  async export(): Promise<VectorDocument[]> {
    try {
      return await this.vectors.toArray()
    } catch (error) {
      logger.error('Failed to export vectors:', error)
      throw error
    }
  }

  /**
   * Import vectors from backup
   */
  async import(vectors: VectorDocument[]): Promise<void> {
    try {
      await this.vectors.bulkPut(vectors)
      logger.info(`Imported ${vectors.length} vectors`)
    } catch (error) {
      logger.error('Failed to import vectors:', error)
      throw error
    }
  }
}
