/**
 * RAG Pipeline - Orchestrates the retrieval and generation process
 */

import type { Note } from '@/types'
import { EmbeddingEngine } from '../embeddings/EmbeddingEngine'
import { VectorStore } from '../vectorstore/VectorStore'
import { LLMProvider } from '../llm/LLMProvider'
import { PromptTemplate } from './PromptTemplate'
import { logger } from '@/utils/logger'

export interface RAGConfig {
  embeddingModel: string
  llmProvider: 'ollama' | 'openai' | 'claude' | 'groq'
  llmModel: string
  contextWindow: number
  maxTokens: number
  temperature: number
  topK: number
  minScore: number
}

export interface RAGQuery {
  query: string
  noteIds?: string[]
  tags?: string[]
  notebook?: string
  limit?: number
  includeMetadata?: boolean
}

export interface RAGResponse {
  answer: string
  sources: Array<{
    noteId: string
    noteTitle: string
    chunkId: string
    score: number
    snippet: string
  }>
  metadata: {
    model: string
    tokensUsed: number
    latency: number
  }
}

export class RAGPipeline {
  private embeddingEngine: EmbeddingEngine
  private vectorStore: VectorStore
  private llmProvider: LLMProvider
  private promptTemplate: PromptTemplate
  private config: RAGConfig
  private isInitialized = false

  constructor(config: Partial<RAGConfig> = {}) {
    this.config = {
      embeddingModel: 'Xenova/all-MiniLM-L6-v2',
      llmProvider: 'ollama',
      llmModel: 'llama2',
      contextWindow: 4096,
      maxTokens: 1024,
      temperature: 0.7,
      topK: 5,
      minScore: 0.7,
      ...config,
    }

    this.embeddingEngine = new EmbeddingEngine({
      modelName: this.config.embeddingModel,
    })

    this.vectorStore = new VectorStore()
    this.llmProvider = new LLMProvider(this.config.llmProvider)
    this.promptTemplate = new PromptTemplate()
  }

  /**
   * Initialize the RAG pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      logger.info('Initializing RAG pipeline...')

      await Promise.all([
        this.embeddingEngine.initialize(),
        this.vectorStore.initialize(),
        this.llmProvider.initialize({
          model: this.config.llmModel,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        }),
      ])

      this.isInitialized = true
      logger.info('RAG pipeline initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize RAG pipeline:', error)
      throw error
    }
  }

  /**
   * Process and index notes
   */
  async indexNotes(notes: Note[]): Promise<void> {
    await this.ensureInitialized()

    logger.info(`Indexing ${notes.length} notes...`)
    const startTime = Date.now()

    try {
      // Generate embeddings for all notes
      const embeddingsMap = await this.embeddingEngine.embedNotes(notes)

      // Store in vector store
      for (const [noteId, embeddings] of embeddingsMap) {
        await this.vectorStore.updateNoteEmbeddings(noteId, embeddings)
      }

      const elapsed = Date.now() - startTime
      logger.info(`Indexed ${notes.length} notes in ${elapsed}ms`)
    } catch (error) {
      logger.error('Failed to index notes:', error)
      throw error
    }
  }

  /**
   * Update index for modified notes
   */
  async updateIndex(notes: Note[]): Promise<void> {
    await this.ensureInitialized()

    // Update embeddings for modified notes
    await this.embeddingEngine.updateEmbeddings(notes)
  }

  /**
   * Query the RAG system
   */
  async query(request: RAGQuery): Promise<RAGResponse> {
    await this.ensureInitialized()

    const startTime = Date.now()

    try {
      // 1. Embed the query
      const queryEmbedding = await this.embeddingEngine.embedQuery(
        request.query
      )

      // 2. Search for relevant chunks
      const searchResults = await this.vectorStore.search(queryEmbedding, {
        limit: request.limit || this.config.topK,
        threshold: this.config.minScore,
        noteIds: request.noteIds,
        metadata: {
          ...(request.tags && { tags: request.tags }),
          ...(request.notebook && { notebook: request.notebook }),
        },
      })

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find any relevant information in your notes.",
          sources: [],
          metadata: {
            model: this.config.llmModel,
            tokensUsed: 0,
            latency: Date.now() - startTime,
          },
        }
      }

      // 3. Retrieve full context for chunks
      const context = await this.buildContext(searchResults)

      // 4. Generate prompt
      const prompt = this.promptTemplate.generateRAGPrompt({
        query: request.query,
        context,
        includeMetadata: request.includeMetadata,
      })

      // 5. Generate response
      const llmResponse = await this.llmProvider.generate(prompt)

      // 6. Build response
      const response: RAGResponse = {
        answer: llmResponse.text,
        sources: context.sources,
        metadata: {
          model: this.config.llmModel,
          tokensUsed: llmResponse.tokensUsed || 0,
          latency: Date.now() - startTime,
        },
      }

      return response
    } catch (error) {
      logger.error('Failed to process RAG query:', error)
      throw error
    }
  }

  /**
   * Stream response for a query
   */
  async *streamQuery(request: RAGQuery): AsyncGenerator<string> {
    await this.ensureInitialized()

    try {
      // Get context (same as query method)
      const queryEmbedding = await this.embeddingEngine.embedQuery(
        request.query
      )
      const searchResults = await this.vectorStore.search(queryEmbedding, {
        limit: request.limit || this.config.topK,
        threshold: this.config.minScore,
        noteIds: request.noteIds,
      })

      if (searchResults.length === 0) {
        yield "I couldn't find any relevant information in your notes."
        return
      }

      const context = await this.buildContext(searchResults)
      const prompt = this.promptTemplate.generateRAGPrompt({
        query: request.query,
        context,
        includeMetadata: request.includeMetadata,
      })

      // Stream LLM response
      for await (const chunk of this.llmProvider.stream(prompt)) {
        yield chunk
      }
    } catch (error) {
      logger.error('Failed to stream RAG response:', error)
      throw error
    }
  }

  /**
   * Build context from search results
   */
  private async buildContext(searchResults: any[]): Promise<{
    text: string
    sources: any[]
  }> {
    // Get note repository
    const noteRepo = (await import('@/lib/repositories/DocumentRepository'))
      .DocumentRepository
    const repo = new noteRepo()
    await repo.initialize()

    const sources = []
    const contextParts = []

    for (const result of searchResults) {
      const note = await repo.getNote(result.noteId)
      if (!note) continue

      // Get chunk text from note content
      const chunkText = await this.getChunkText(note, result.chunkId)

      sources.push({
        noteId: result.noteId,
        noteTitle: note.title,
        chunkId: result.chunkId,
        score: result.score,
        snippet: chunkText.substring(0, 200) + '...',
      })

      contextParts.push(`
Note: ${note.title}
Tags: ${note.tags.join(', ')}
---
${chunkText}
---
`)
    }

    return {
      text: contextParts.join('\n'),
      sources,
    }
  }

  /**
   * Get chunk text from note
   */
  private async getChunkText(note: Note, chunkId: string): Promise<string> {
    // For now, return a portion of the note
    // TODO: Store chunk boundaries for precise retrieval
    const fullText = `${note.title}\n\n${note.content}`

    // Extract chunk index from ID
    const match = chunkId.match(/_chunk_(\d+)$/)
    if (!match) return fullText.substring(0, 500)

    const chunkIndex = parseInt(match[1])
    const chunkSize = this.config.contextWindow / this.config.topK
    const start = chunkIndex * chunkSize
    const end = start + chunkSize

    return fullText.substring(start, end)
  }

  /**
   * Get similar notes
   */
  async getSimilarNotes(
    noteId: string,
    limit = 5
  ): Promise<
    Array<{
      noteId: string
      score: number
      title: string
    }>
  > {
    await this.ensureInitialized()

    try {
      // Get embeddings for the source note
      const sourceEmbeddings = await this.vectorStore.vectors
        .where('noteId')
        .equals(noteId)
        .toArray()

      if (sourceEmbeddings.length === 0) {
        return []
      }

      // Use the first embedding as representative
      const queryVector = new Float32Array(sourceEmbeddings[0].vector)

      // Search for similar notes
      const results = await this.vectorStore.knnSearch(queryVector, limit + 1, {
        excludeNoteIds: [noteId],
      })

      // Get note titles
      const noteRepo = (await import('@/lib/repositories/DocumentRepository'))
        .DocumentRepository
      const repo = new noteRepo()
      await repo.initialize()

      const similarNotes = []
      const seen = new Set<string>()

      for (const result of results) {
        if (seen.has(result.noteId)) continue
        seen.add(result.noteId)

        const note = await repo.getNote(result.noteId)
        if (note) {
          similarNotes.push({
            noteId: result.noteId,
            score: result.score,
            title: note.title,
          })
        }

        if (similarNotes.length >= limit) break
      }

      return similarNotes
    } catch (error) {
      logger.error('Failed to get similar notes:', error)
      return []
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    embeddingStats: any
    vectorStats: any
    llmStats: any
  }> {
    return {
      embeddingStats: await this.embeddingEngine.getStats(),
      vectorStats: await this.vectorStore.getStats(),
      llmStats: this.llmProvider.getStats(),
    }
  }

  /**
   * Ensure pipeline is initialized
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
    await this.embeddingEngine.destroy()
    await this.vectorStore.close()
    await this.llmProvider.destroy()
    this.isInitialized = false
  }
}
