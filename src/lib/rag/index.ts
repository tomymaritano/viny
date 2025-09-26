/**
 * RAG System Entry Point
 * Provides unified interface for all RAG features
 */

import type { Note } from '@/types'
import {
  RAGPipeline,
  type RAGConfig,
  type RAGQuery,
  type RAGResponse,
} from './pipeline/RAGPipeline'
import { AutoTagger, type TagSuggestion } from './features/AutoTagger'
import {
  NoteSummarizer,
  type SummaryOptions,
  type NoteSummary,
} from './features/NoteSummarizer'
import { logger } from '@/utils/logger'

export interface RAGSystemConfig extends Partial<RAGConfig> {
  enableAutoTagging?: boolean
  enableSummarization?: boolean
  enableSimilarNotes?: boolean
  enableQA?: boolean
}

export class RAGSystem {
  private pipeline: RAGPipeline
  private autoTagger: AutoTagger | null = null
  private summarizer: NoteSummarizer | null = null
  private config: RAGSystemConfig
  private isInitialized = false

  constructor(config: RAGSystemConfig = {}) {
    this.config = {
      enableAutoTagging: true,
      enableSummarization: true,
      enableSimilarNotes: true,
      enableQA: true,
      ...config,
    }

    this.pipeline = new RAGPipeline(config)
  }

  /**
   * Initialize the RAG system
   */
  static async initialize(config: RAGSystemConfig = {}): Promise<RAGSystem> {
    const system = new RAGSystem(config)
    await system.init()
    return system
  }

  /**
   * Initialize all components
   */
  private async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      logger.info('Initializing RAG system...')

      // Initialize pipeline
      await this.pipeline.initialize()

      // Initialize features
      if (this.config.enableAutoTagging) {
        this.autoTagger = new AutoTagger(
          this.pipeline['embeddingEngine'],
          this.pipeline['vectorStore'],
          this.config.llmProvider ? this.pipeline['llmProvider'] : undefined
        )
      }

      if (this.config.enableSummarization) {
        this.summarizer = new NoteSummarizer(
          this.config.llmProvider ? this.pipeline['llmProvider'] : undefined
        )
      }

      this.isInitialized = true
      logger.info('RAG system initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize RAG system:', error)
      throw error
    }
  }

  /**
   * Process and index notes
   */
  async processNotes(notes: Note[]): Promise<void> {
    await this.ensureInitialized()
    await this.pipeline.indexNotes(notes)
  }

  /**
   * Update index for modified notes
   */
  async updateNotes(notes: Note[]): Promise<void> {
    await this.ensureInitialized()
    await this.pipeline.updateIndex(notes)
  }

  /**
   * Query the knowledge base
   */
  async query(query: string | RAGQuery): Promise<RAGResponse> {
    await this.ensureInitialized()

    if (!this.config.enableQA) {
      throw new Error('Q&A feature is disabled')
    }

    const request: RAGQuery = typeof query === 'string' ? { query } : query

    return this.pipeline.query(request)
  }

  /**
   * Stream query response
   */
  async *streamQuery(query: string | RAGQuery): AsyncGenerator<string> {
    await this.ensureInitialized()

    if (!this.config.enableQA) {
      throw new Error('Q&A feature is disabled')
    }

    const request: RAGQuery = typeof query === 'string' ? { query } : query

    yield* this.pipeline.streamQuery(request)
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

    if (!this.config.enableSimilarNotes) {
      throw new Error('Similar notes feature is disabled')
    }

    return this.pipeline.getSimilarNotes(noteId, limit)
  }

  /**
   * Suggest tags for a note
   */
  async suggestTags(
    note: Note,
    options?: {
      maxTags?: number
      minConfidence?: number
      useLLM?: boolean
    }
  ): Promise<TagSuggestion[]> {
    await this.ensureInitialized()

    if (!this.config.enableAutoTagging || !this.autoTagger) {
      throw new Error('Auto-tagging feature is disabled')
    }

    return this.autoTagger.suggestTags(note, options)
  }

  /**
   * Update existing tags list for better suggestions
   */
  updateTagsList(tags: string[]): void {
    if (this.autoTagger) {
      this.autoTagger.updateExistingTags(tags)
    }
  }

  /**
   * Summarize a note
   */
  async summarizeNote(
    note: Note,
    options?: SummaryOptions
  ): Promise<NoteSummary> {
    await this.ensureInitialized()

    if (!this.config.enableSummarization || !this.summarizer) {
      throw new Error('Summarization feature is disabled')
    }

    return this.summarizer.summarize(note, options)
  }

  /**
   * Summarize multiple related notes
   */
  async summarizeCollection(
    notes: Note[],
    title: string,
    options?: SummaryOptions
  ): Promise<string> {
    await this.ensureInitialized()

    if (!this.config.enableSummarization || !this.summarizer) {
      throw new Error('Summarization feature is disabled')
    }

    return this.summarizer.summarizeCollection(notes, title, options)
  }

  /**
   * Get system statistics
   */
  async getStats(): Promise<{
    initialized: boolean
    features: {
      autoTagging: boolean
      summarization: boolean
      similarNotes: boolean
      qa: boolean
    }
    pipeline: any
  }> {
    const pipelineStats = this.isInitialized
      ? await this.pipeline.getStats()
      : null

    return {
      initialized: this.isInitialized,
      features: {
        autoTagging: this.config.enableAutoTagging || false,
        summarization: this.config.enableSummarization || false,
        similarNotes: this.config.enableSimilarNotes || false,
        qa: this.config.enableQA || false,
      },
      pipeline: pipelineStats,
    }
  }

  /**
   * Clear all embeddings and cached data
   */
  async clearData(): Promise<void> {
    await this.ensureInitialized()
    await this.pipeline['embeddingEngine'].clearEmbeddings()
    await this.pipeline['vectorStore'].clear()
    logger.info('RAG system data cleared')
  }

  /**
   * Ensure system is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.pipeline) {
      await this.pipeline.destroy()
    }
    this.isInitialized = false
    logger.info('RAG system destroyed')
  }
}

// Export types and classes
export type {
  RAGConfig,
  RAGQuery,
  RAGResponse,
  TagSuggestion,
  SummaryOptions,
  NoteSummary,
}

export { RAGPipeline, AutoTagger, NoteSummarizer }
