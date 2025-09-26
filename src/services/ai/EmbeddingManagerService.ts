/**
 * EmbeddingManagerService - Manages automatic embedding generation for notes
 *
 * Features:
 * - Automatic embedding generation on note create/update
 * - Batch processing for efficiency
 * - Persistent storage of embeddings
 * - Background processing with progress tracking
 */

import {
  localEmbeddingService,
  type ChunkEmbedding,
} from './LocalEmbeddingServiceSimple'
import { createEnhancedDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import type { Note } from '../../types'
import { notebookLogger as logger } from '../../utils/logger'
import { useAppStore } from '../../stores/newSimpleStore'

export interface EmbeddingMetadata {
  noteId: string
  version: number
  generatedAt: string
  model: string
  chunks: number
  processingTime: number
}

export interface StoredEmbedding extends ChunkEmbedding {
  metadata: EmbeddingMetadata
}

export interface EmbeddingProgress {
  total: number
  processed: number
  current: string
  isProcessing: boolean
}

class EmbeddingManagerService {
  private isProcessing = false
  private queue: string[] = []
  private embeddings: Map<string, StoredEmbedding[]> = new Map()
  private metadata: Map<string, EmbeddingMetadata> = new Map()
  private initialized = false
  private progressCallback?: (progress: EmbeddingProgress) => void

  /**
   * Initialize the service and load existing embeddings
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.loadEmbeddings()
      await localEmbeddingService.initialize()
      this.initialized = true
      logger.info('EmbeddingManagerService initialized')

      // Start processing queue if there are pending items
      if (this.queue.length > 0) {
        this.processQueue()
      }
    } catch (error) {
      logger.error('Failed to initialize EmbeddingManagerService', error)
      throw error
    }
  }

  /**
   * Generate embeddings for a note
   */
  async generateEmbeddingsForNote(note: Note, force = false): Promise<void> {
    if (!note.id || !note.content || note.content.trim().length === 0) {
      logger.debug(`Skipping note ${note.id} - no content`)
      return
    }

    // Check if embeddings already exist and are up to date
    const existingMetadata = this.metadata.get(note.id)
    if (
      !force &&
      existingMetadata &&
      existingMetadata.version === this.getNoteVersion(note)
    ) {
      logger.debug(`Embeddings already exist for note ${note.id}`)
      return
    }

    // Add to queue
    if (!this.queue.includes(note.id)) {
      this.queue.push(note.id)
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  /**
   * Process the embedding queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const noteId = this.queue.shift()!
      let note: any = null

      try {
        note = await this.getNote(noteId)
        if (!note) continue

        this.updateProgress({
          total: this.queue.length + 1,
          processed: 0,
          current: note.title || 'Untitled',
          isProcessing: true,
        })

        const start = performance.now()

        // Generate embeddings for the note
        const embeddings = await localEmbeddingService.generateNoteEmbeddings(
          note.id,
          this.getNoteTextForEmbedding(note)
        )

        const processingTime = performance.now() - start

        // Create metadata
        const metadata: EmbeddingMetadata = {
          noteId: note.id,
          version: this.getNoteVersion(note),
          generatedAt: new Date().toISOString(),
          model: localEmbeddingService.getModelInfo().name,
          chunks: embeddings.length,
          processingTime,
        }

        // Store embeddings
        const storedEmbeddings = embeddings.map(emb => ({
          ...emb,
          metadata,
        }))

        this.embeddings.set(note.id, storedEmbeddings)
        this.metadata.set(note.id, metadata)

        // Persist to storage
        await this.saveEmbeddings(note.id, storedEmbeddings, metadata)

        logger.info(
          `Generated ${embeddings.length} embeddings for note ${note.id} in ${processingTime}ms`
        )
      } catch (error) {
        logger.error(`Failed to generate embeddings for note ${noteId}`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          noteId,
          noteTitle: note?.title,
        })
      }
    }

    this.isProcessing = false
    this.updateProgress({
      total: 0,
      processed: 0,
      current: '',
      isProcessing: false,
    })
  }

  /**
   * Get embeddings for a note
   */
  getEmbeddings(noteId: string): StoredEmbedding[] | null {
    return this.embeddings.get(noteId) || null
  }

  /**
   * Find similar notes based on content
   */
  async findSimilarNotes(
    noteId: string,
    topK = 5
  ): Promise<{ noteId: string; similarity: number }[]> {
    const noteEmbeddings = this.embeddings.get(noteId)
    if (!noteEmbeddings || noteEmbeddings.length === 0) {
      return []
    }

    // Use the first chunk's embedding as the query
    const queryEmbedding = noteEmbeddings[0].embedding

    const similarities: { noteId: string; similarity: number }[] = []

    // Compare with all other notes
    for (const [otherNoteId, otherEmbeddings] of this.embeddings) {
      if (otherNoteId === noteId) continue

      // Calculate average similarity across all chunks
      let totalSimilarity = 0
      let count = 0

      for (const embedding of otherEmbeddings) {
        const similarity = localEmbeddingService.cosineSimilarity(
          queryEmbedding,
          embedding.embedding
        )
        totalSimilarity += similarity
        count++
      }

      if (count > 0) {
        similarities.push({
          noteId: otherNoteId,
          similarity: totalSimilarity / count,
        })
      }
    }

    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  /**
   * Search notes by semantic similarity
   */
  async searchByEmbedding(
    query: string,
    topK = 10,
    threshold = 0.5
  ): Promise<
    { noteId: string; chunkId: string; similarity: number; chunk: string }[]
  > {
    try {
      // Initialize service if needed
      if (!localEmbeddingService.isInitialized()) {
        await localEmbeddingService.initialize()
      }

      // Generate embedding for query
      const queryResult = await localEmbeddingService.generateEmbedding(query)
      const queryEmbedding = queryResult.embedding

      const results: {
        noteId: string
        chunkId: string
        similarity: number
        chunk: string
      }[] = []

      // Check if we have any embeddings
      if (this.embeddings.size === 0) {
        logger.debug('No embeddings available for search')
        return []
      }

      // Search through all embeddings
      for (const [noteId, embeddings] of this.embeddings) {
        for (const embedding of embeddings) {
          const similarity = localEmbeddingService.cosineSimilarity(
            queryEmbedding,
            embedding.embedding
          )

          if (similarity >= threshold) {
            results.push({
              noteId,
              chunkId: embedding.id,
              similarity,
              chunk: embedding.chunk,
            })
          }
        }
      }

      // Sort by similarity and return top K
      return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
    } catch (error) {
      logger.error('Search by embedding failed', error)
      throw error
    }
  }

  /**
   * Generate embeddings for all notes (batch processing)
   */
  async generateEmbeddingsForAllNotes(force = false): Promise<void> {
    const notes = useAppStore.getState().notes
    const notesToProcess = force
      ? notes
      : notes.filter(note => !this.metadata.has(note.id))

    logger.info(`Processing embeddings for ${notesToProcess.length} notes`)

    for (const note of notesToProcess) {
      await this.generateEmbeddingsForNote(note, force)
    }
  }

  /**
   * Set progress callback
   */
  onProgress(callback: (progress: EmbeddingProgress) => void): void {
    this.progressCallback = callback
  }

  /**
   * Update progress
   */
  private updateProgress(progress: EmbeddingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress)
    }
  }

  /**
   * Get note version (based on content and updated timestamp)
   */
  private getNoteVersion(note: Note): number {
    const content = note.content || ''
    const updated = note.updatedAt || ''
    return this.hashString(`${content}${updated}`)
  }

  /**
   * Get text content for embedding
   */
  private getNoteTextForEmbedding(note: Note): string {
    // Combine title and content for better context
    const title = note.title || 'Untitled'
    const content = note.content || ''
    const tags = note.tags?.join(' ') || ''

    return `${title}\n\n${content}\n\nTags: ${tags}`.trim()
  }

  /**
   * Simple hash function for versioning
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get note from store
   */
  private async getNote(noteId: string): Promise<Note | null> {
    const notes = useAppStore.getState().notes
    return notes.find(n => n.id === noteId) || null
  }

  /**
   * Load embeddings from storage
   */
  private async loadEmbeddings(): Promise<void> {
    try {
      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      // Load embeddings from storage (using a special key in settings)
      const storedData = await repository.getSetting('embeddings_data')

      if (storedData) {
        const { embeddings, metadata } = storedData as {
          embeddings: Record<string, StoredEmbedding[]>
          metadata: Record<string, EmbeddingMetadata>
        }

        // Restore embeddings with Float32Array
        for (const [noteId, noteEmbeddings] of Object.entries(embeddings)) {
          const restoredEmbeddings = noteEmbeddings.map(emb => ({
            ...emb,
            embedding: new Float32Array(emb.embedding),
          }))
          this.embeddings.set(noteId, restoredEmbeddings)
        }

        // Restore metadata
        for (const [noteId, meta] of Object.entries(metadata)) {
          this.metadata.set(noteId, meta)
        }

        logger.info(`Loaded embeddings for ${this.embeddings.size} notes`)
      }
    } catch (error) {
      logger.error('Failed to load embeddings', error)
    }
  }

  /**
   * Save embeddings to storage
   */
  private async saveEmbeddings(
    noteId: string,
    embeddings: StoredEmbedding[],
    metadata: EmbeddingMetadata
  ): Promise<void> {
    try {
      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      // Get current stored data
      const storedData = (await repository.getSetting('embeddings_data')) || {
        embeddings: {},
        metadata: {},
      }

      // Update with new embeddings
      storedData.embeddings[noteId] = embeddings.map(emb => ({
        ...emb,
        embedding: Array.from(emb.embedding), // Convert Float32Array to regular array for storage
      }))
      storedData.metadata[noteId] = metadata

      // Save back to storage
      await repository.updateSetting('embeddings_data', storedData)
    } catch (error) {
      logger.error(`Failed to save embeddings for note ${noteId}`, error)
    }
  }

  /**
   * Delete embeddings for a note
   */
  async deleteEmbeddings(noteId: string): Promise<void> {
    this.embeddings.delete(noteId)
    this.metadata.delete(noteId)

    try {
      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const storedData = (await repository.getSetting('embeddings_data')) || {
        embeddings: {},
        metadata: {},
      }

      delete storedData.embeddings[noteId]
      delete storedData.metadata[noteId]

      await repository.updateSetting('embeddings_data', storedData)
    } catch (error) {
      logger.error(`Failed to delete embeddings for note ${noteId}`, error)
    }
  }

  /**
   * Get statistics about embeddings
   */
  getStatistics(): {
    totalNotes: number
    notesWithEmbeddings: number
    totalChunks: number
    queueLength: number
    isProcessing: boolean
  } {
    let totalChunks = 0
    for (const embeddings of this.embeddings.values()) {
      totalChunks += embeddings.length
    }

    return {
      totalNotes: useAppStore.getState().notes.length,
      notesWithEmbeddings: this.embeddings.size,
      totalChunks,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    }
  }
}

// Export singleton instance
export const embeddingManager = new EmbeddingManagerService()

// Export class for testing
export { EmbeddingManagerService }
