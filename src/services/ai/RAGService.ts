/**
 * RAGService - Retrieval-Augmented Generation for Viny
 *
 * Integrates Ollama, local embeddings, and Dexie for intelligent note interactions
 */

import { ollamaService } from './OllamaService'
import { localEmbeddingService } from './LocalEmbeddingServiceSimple'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import { DexieDocumentRepository } from '../../lib/repositories/DexieDocumentRepository'
import { StorageService } from '../StorageService'
import type { Note } from '../../types'
import { notebookLogger as logger } from '../../utils/logger'

const storageService = new StorageService()

export interface RAGContext {
  noteId: string
  content: string
  similarity: number
  chunk?: string
}

export interface RAGOptions {
  maxContextNotes?: number
  similarityThreshold?: number
  includeMetadata?: boolean
  model?: string
}

export interface RAGResponse {
  response: string
  context: RAGContext[]
  processingTime: number
  model: string
}

export interface AutoTagResult {
  tags: string[]
  confidence: number
  reasoning?: string
}

export interface SummaryOptions {
  style?: 'brief' | 'detailed' | 'bullet-points' | 'academic'
  maxLength?: number
  focusAreas?: string[]
}

class RAGService {
  private repository: DexieDocumentRepository | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Initialize services
      await ollamaService.checkAvailability()
      await localEmbeddingService.initialize()

      // Get repository (must be Dexie for embeddings)
      const repo = createDocumentRepository()
      if (!(repo instanceof DexieDocumentRepository)) {
        throw new Error(
          'RAG features require Dexie repository. Please enable Dexie in settings.'
        )
      }

      this.repository = repo
      await this.repository.initialize()

      this.initialized = true
      logger.info('RAGService initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize RAGService', error)
      throw error
    }
  }

  /**
   * Process a note to generate and store embeddings
   */
  async processNote(noteId: string): Promise<void> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    try {
      const note = await this.repository.getNote(noteId)
      if (!note) throw new Error('Note not found')

      // Generate embeddings for the note
      const embeddings = await localEmbeddingService.generateNoteEmbeddings(
        noteId,
        `${note.title}\n\n${note.content}`
      )

      // Save embeddings to repository
      const embeddingRecords = embeddings.map(e => ({
        ...e,
        createdAt: new Date().toISOString(),
      }))

      await this.repository.saveEmbeddings(embeddingRecords)
      logger.info(`Processed embeddings for note ${noteId}`)
    } catch (error) {
      logger.error(`Failed to process note ${noteId}`, error)
      throw error
    }
  }

  /**
   * Process all notes to generate embeddings
   */
  async processAllNotes(
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    try {
      const notes = await this.repository.getNotes()
      const total = notes.length

      for (let i = 0; i < notes.length; i++) {
        await this.processNote(notes[i].id)
        onProgress?.(i + 1, total)
      }

      logger.info(`Processed embeddings for ${total} notes`)
    } catch (error) {
      logger.error('Failed to process all notes', error)
      throw error
    }
  }

  /**
   * Query notes using RAG
   */
  async query(query: string, options: RAGOptions = {}): Promise<RAGResponse> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    const startTime = performance.now()
    const {
      maxContextNotes = 5,
      similarityThreshold = 0.7,
      includeMetadata = true,
      model = 'llama3.2',
    } = options

    try {
      // Generate embedding for the query
      const queryResult = await localEmbeddingService.generateEmbedding(query)

      // Search for similar notes
      const similarNotes = await this.repository.searchBySimilarity(
        queryResult.embedding,
        maxContextNotes,
        similarityThreshold
      )

      // Build context from similar notes
      const context: RAGContext[] = []
      for (const note of similarNotes) {
        // Get the specific chunks that matched
        const embeddings = await this.repository.getEmbeddingsByNoteId(note.id)

        // Find the most similar chunk
        let bestChunk = note.content
        let bestSimilarity = 0

        for (const embedding of embeddings) {
          const similarity = localEmbeddingService.cosineSimilarity(
            queryResult.embedding,
            embedding.embedding
          )
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity
            bestChunk = embedding.chunk
          }
        }

        context.push({
          noteId: note.id,
          content: note.content,
          similarity: bestSimilarity,
          chunk: bestChunk,
        })
      }

      // Build prompt with context
      const systemPrompt = this.buildSystemPrompt(context, includeMetadata)

      // Query Ollama
      const response = await ollamaService.chat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      })

      const processingTime = performance.now() - startTime

      return {
        response: response.response,
        context,
        processingTime,
        model,
      }
    } catch (error) {
      logger.error('RAG query failed', error)
      throw error
    }
  }

  /**
   * Stream a RAG response
   */
  async *streamQuery(
    query: string,
    options: RAGOptions = {}
  ): AsyncGenerator<string> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    const {
      maxContextNotes = 5,
      similarityThreshold = 0.7,
      includeMetadata = true,
      model = 'llama3.2',
    } = options

    try {
      // Generate embedding for the query
      const queryResult = await localEmbeddingService.generateEmbedding(query)

      // Search for similar notes
      const similarNotes = await this.repository.searchBySimilarity(
        queryResult.embedding,
        maxContextNotes,
        similarityThreshold
      )

      // Build context
      const context: RAGContext[] = []
      for (const note of similarNotes) {
        context.push({
          noteId: note.id,
          content: note.content,
          similarity: 0.8, // Placeholder, would calculate actual similarity
        })
      }

      // Build prompt with context
      const systemPrompt = this.buildSystemPrompt(context, includeMetadata)

      // Stream from Ollama
      const stream = ollamaService.streamChat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      })

      for await (const chunk of stream) {
        yield chunk
      }
    } catch (error) {
      logger.error('RAG stream failed', error)
      throw error
    }
  }

  /**
   * Auto-generate tags for a note
   */
  async autoTag(noteId: string): Promise<AutoTagResult> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    try {
      const note = await this.repository.getNote(noteId)
      if (!note) throw new Error('Note not found')

      const prompt = `Analyze this note and suggest relevant tags. Return only a JSON object with format: {"tags": ["tag1", "tag2", ...], "confidence": 0.0-1.0, "reasoning": "brief explanation"}

Note Title: ${note.title}
Note Content: ${note.content}

Guidelines:
- Suggest 3-7 relevant tags
- Tags should be lowercase, single or compound words
- Focus on main topics, technologies, concepts
- Consider both content and context`

      const response = await ollamaService.generate({
        model: 'llama3.2',
        prompt,
        format: 'json',
      })

      const result = JSON.parse(response.response)
      return result as AutoTagResult
    } catch (error) {
      logger.error('Auto-tagging failed', error)
      // Fallback response
      return {
        tags: [],
        confidence: 0,
        reasoning: 'Failed to generate tags',
      }
    }
  }

  /**
   * Generate a summary of a note
   */
  async summarize(
    noteId: string,
    options: SummaryOptions = {}
  ): Promise<string> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    const { style = 'brief', maxLength = 200, focusAreas = [] } = options

    try {
      const note = await this.repository.getNote(noteId)
      if (!note) throw new Error('Note not found')

      const styleInstructions = {
        brief: 'Write a concise summary in 1-2 sentences.',
        detailed: 'Write a comprehensive summary covering all main points.',
        'bullet-points': 'Create a bullet-point list of key takeaways.',
        academic:
          'Write an academic abstract with context, methods, findings, and implications.',
      }

      let prompt = `Summarize this note in ${style} style. ${styleInstructions[style]}
Maximum length: ${maxLength} words.`

      if (focusAreas.length > 0) {
        prompt += `\nFocus especially on: ${focusAreas.join(', ')}`
      }

      prompt += `\n\nNote Title: ${note.title}\nNote Content: ${note.content}`

      const response = await ollamaService.generate({
        model: 'llama3.2',
        prompt,
      })

      return response.response
    } catch (error) {
      logger.error('Summarization failed', error)
      throw error
    }
  }

  /**
   * Find related notes
   */
  async findRelated(
    noteId: string,
    limit = 5
  ): Promise<Array<{ note: Note; similarity: number }>> {
    await this.initialize()
    if (!this.repository) throw new Error('Repository not initialized')

    try {
      // Get embeddings for the current note
      const embeddings = await this.repository.getEmbeddingsByNoteId(noteId)
      if (embeddings.length === 0) {
        // Process the note first
        await this.processNote(noteId)
        const newEmbeddings =
          await this.repository.getEmbeddingsByNoteId(noteId)
        if (newEmbeddings.length === 0) {
          return []
        }
      }

      // Use the first chunk's embedding as representative
      const queryEmbedding = embeddings[0].embedding

      // Find similar notes
      const similarNotes = await this.repository.searchBySimilarity(
        queryEmbedding,
        limit + 1, // Get one extra to exclude self
        0.5 // Lower threshold for related notes
      )

      // Filter out the current note and return with similarities
      const results: Array<{ note: Note; similarity: number }> = []

      for (const note of similarNotes) {
        if (note.id !== noteId) {
          // Calculate actual similarity
          const noteEmbeddings = await this.repository.getEmbeddingsByNoteId(
            note.id
          )
          if (noteEmbeddings.length > 0) {
            const similarity = localEmbeddingService.cosineSimilarity(
              queryEmbedding,
              noteEmbeddings[0].embedding
            )
            results.push({ note, similarity })
          }
        }
      }

      return results.slice(0, limit)
    } catch (error) {
      logger.error('Finding related notes failed', error)
      return []
    }
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(
    context: RAGContext[],
    includeMetadata: boolean
  ): string {
    let prompt = `You are an AI assistant helping with a personal knowledge base. 
You have access to the following relevant notes from the user's collection:\n\n`

    context.forEach((ctx, index) => {
      prompt += `--- Note ${index + 1} (Relevance: ${(ctx.similarity * 100).toFixed(1)}%) ---\n`
      if (ctx.chunk) {
        prompt += `${ctx.chunk}\n`
      } else {
        prompt += `${ctx.content.substring(0, 500)}...\n`
      }
      prompt += '\n'
    })

    prompt += `\nUse the above context to answer questions. Be helpful and accurate. 
If the context doesn't contain enough information, say so rather than making things up.`

    return prompt
  }

  /**
   * Check if services are available
   */
  async checkAvailability(): Promise<{
    ollama: boolean
    embeddings: boolean
    repository: boolean
  }> {
    const ollamaAvailable = await ollamaService.checkAvailability()
    const embeddingsAvailable = true // Local embeddings are always available
    const repositoryAvailable =
      storageService.getItem(StorageService.KEYS.USE_DEXIE) === 'true'

    return {
      ollama: ollamaAvailable,
      embeddings: embeddingsAvailable,
      repository: repositoryAvailable,
    }
  }
}

// Export singleton instance
export const ragService = new RAGService()

// Export class for testing
export { RAGService }
