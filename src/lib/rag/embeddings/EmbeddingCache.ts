/**
 * Embedding Cache using Dexie.js
 * Stores and manages embeddings locally
 */

import Dexie, { type Table } from 'dexie'
import type { Embedding } from './EmbeddingEngine'
import { logger } from '@/utils/logger'

interface CachedEmbedding {
  id: string
  noteId: string
  chunkId: string
  vector: number[] // Stored as array for Dexie
  metadata: any
  timestamp: string
  noteUpdatedAt: string
}

interface QueryCache {
  id: string
  query: string
  vector: number[]
  timestamp: string
  expiresAt: string
}

export class EmbeddingCache extends Dexie {
  embeddings!: Table<CachedEmbedding>
  queries!: Table<QueryCache>

  constructor() {
    super('VinyEmbeddingCache')

    this.version(1).stores({
      embeddings: 'id, noteId, noteUpdatedAt, timestamp',
      queries: 'id, query, expiresAt',
    })
  }

  /**
   * Initialize the cache
   */
  async initialize(): Promise<void> {
    try {
      await this.open()
      logger.info('Embedding cache initialized')

      // Clean up expired query cache
      await this.cleanupExpiredQueries()
    } catch (error) {
      logger.error('Failed to initialize embedding cache:', error)
      throw error
    }
  }

  /**
   * Get embeddings for a note
   */
  async getEmbeddings(
    noteId: string,
    noteUpdatedAt: string
  ): Promise<Embedding[]> {
    try {
      const cached = await this.embeddings
        .where('noteId')
        .equals(noteId)
        .and(item => item.noteUpdatedAt === noteUpdatedAt)
        .toArray()

      return cached.map(this.convertToEmbedding)
    } catch (error) {
      logger.error(`Failed to get cached embeddings for note ${noteId}:`, error)
      return []
    }
  }

  /**
   * Store embeddings for a note
   */
  async storeEmbeddings(
    noteId: string,
    embeddings: Embedding[],
    noteUpdatedAt: string
  ): Promise<void> {
    try {
      // Delete old embeddings for this note
      await this.embeddings.where('noteId').equals(noteId).delete()

      // Store new embeddings
      const cached = embeddings.map(emb => ({
        ...emb,
        vector: Array.from(emb.vector),
        noteUpdatedAt,
      }))

      await this.embeddings.bulkAdd(cached)
      logger.debug(`Stored ${embeddings.length} embeddings for note ${noteId}`)
    } catch (error) {
      logger.error(`Failed to store embeddings for note ${noteId}:`, error)
      throw error
    }
  }

  /**
   * Get cached query embedding
   */
  async getQueryEmbedding(queryKey: string): Promise<Float32Array | null> {
    try {
      const cached = await this.queries
        .where('id')
        .equals(queryKey)
        .and(item => new Date(item.expiresAt) > new Date())
        .first()

      if (cached) {
        return new Float32Array(cached.vector)
      }
      return null
    } catch (error) {
      logger.error(`Failed to get cached query embedding:`, error)
      return null
    }
  }

  /**
   * Store query embedding
   */
  async storeQueryEmbedding(
    queryKey: string,
    vector: Float32Array
  ): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour cache

      await this.queries.put({
        id: queryKey,
        query: queryKey.replace('query_', ''),
        vector: Array.from(vector),
        timestamp: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      })
    } catch (error) {
      logger.error(`Failed to store query embedding:`, error)
    }
  }

  /**
   * Get modified notes that need re-embedding
   */
  async getModifiedNotes(notes: any[]): Promise<any[]> {
    const modifiedNotes: any[] = []

    for (const note of notes) {
      const cached = await this.embeddings
        .where('noteId')
        .equals(note.id)
        .first()

      if (!cached || cached.noteUpdatedAt !== note.updatedAt) {
        modifiedNotes.push(note)
      }
    }

    return modifiedNotes
  }

  /**
   * Get all embeddings (for vector search)
   */
  async getAllEmbeddings(): Promise<Embedding[]> {
    try {
      const all = await this.embeddings.toArray()
      return all.map(this.convertToEmbedding)
    } catch (error) {
      logger.error('Failed to get all embeddings:', error)
      return []
    }
  }

  /**
   * Get embeddings by note IDs
   */
  async getEmbeddingsByNoteIds(
    noteIds: string[]
  ): Promise<Map<string, Embedding[]>> {
    try {
      const result = new Map<string, Embedding[]>()

      const embeddings = await this.embeddings
        .where('noteId')
        .anyOf(noteIds)
        .toArray()

      for (const emb of embeddings) {
        const noteEmbeddings = result.get(emb.noteId) || []
        noteEmbeddings.push(this.convertToEmbedding(emb))
        result.set(emb.noteId, noteEmbeddings)
      }

      return result
    } catch (error) {
      logger.error('Failed to get embeddings by note IDs:', error)
      return new Map()
    }
  }

  /**
   * Clear all embeddings
   */
  async clear(): Promise<void> {
    try {
      await this.embeddings.clear()
      await this.queries.clear()
      logger.info('Cleared all embeddings')
    } catch (error) {
      logger.error('Failed to clear embeddings:', error)
      throw error
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEmbeddings: number
    totalQueries: number
    size: number
    oldestEmbedding: string | null
  }> {
    try {
      const embeddingCount = await this.embeddings.count()
      const queryCount = await this.queries.count()

      // Estimate size (rough calculation)
      const avgEmbeddingSize = 384 * 4 + 200 // 384 dimensions * 4 bytes + metadata
      const avgQuerySize = 384 * 4 + 100
      const estimatedSize =
        embeddingCount * avgEmbeddingSize + queryCount * avgQuerySize

      const oldestEmbedding = await this.embeddings.orderBy('timestamp').first()

      return {
        totalEmbeddings: embeddingCount,
        totalQueries: queryCount,
        size: estimatedSize,
        oldestEmbedding: oldestEmbedding?.timestamp || null,
      }
    } catch (error) {
      logger.error('Failed to get cache stats:', error)
      return {
        totalEmbeddings: 0,
        totalQueries: 0,
        size: 0,
        oldestEmbedding: null,
      }
    }
  }

  /**
   * Clean up expired query cache
   */
  private async cleanupExpiredQueries(): Promise<void> {
    try {
      const now = new Date().toISOString()
      await this.queries.where('expiresAt').below(now).delete()
    } catch (error) {
      logger.error('Failed to cleanup expired queries:', error)
    }
  }

  /**
   * Convert cached embedding to Embedding type
   */
  private convertToEmbedding(cached: CachedEmbedding): Embedding {
    return {
      id: cached.id,
      noteId: cached.noteId,
      chunkId: cached.chunkId,
      vector: new Float32Array(cached.vector),
      metadata: cached.metadata,
      timestamp: cached.timestamp,
    }
  }

  /**
   * Destroy the cache
   */
  async destroy(): Promise<void> {
    await this.close()
  }
}
