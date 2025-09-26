/**
 * Auto-tagging Feature using RAG
 * Automatically suggests tags based on note content
 */

import type { Note } from '@/types'
import type { EmbeddingEngine } from '../embeddings/EmbeddingEngine'
import type { VectorStore } from '../vectorstore/VectorStore'
import type { LLMProvider } from '../llm/LLMProvider'
import { PromptTemplate } from '../pipeline/PromptTemplate'
import { logger } from '@/utils/logger'

export interface TagSuggestion {
  tag: string
  confidence: number
  reason?: string
}

export class AutoTagger {
  private embeddingEngine: EmbeddingEngine
  private vectorStore: VectorStore
  private llmProvider: LLMProvider | null = null
  private promptTemplate: PromptTemplate
  private existingTags: Set<string> = new Set()

  constructor(
    embeddingEngine: EmbeddingEngine,
    vectorStore: VectorStore,
    llmProvider?: LLMProvider
  ) {
    this.embeddingEngine = embeddingEngine
    this.vectorStore = vectorStore
    this.llmProvider = llmProvider || null
    this.promptTemplate = new PromptTemplate()
  }

  /**
   * Update the set of existing tags
   */
  updateExistingTags(tags: string[]): void {
    this.existingTags = new Set(tags)
  }

  /**
   * Suggest tags for a note
   */
  async suggestTags(
    note: Note,
    options: {
      maxTags?: number
      minConfidence?: number
      useLLM?: boolean
    } = {}
  ): Promise<TagSuggestion[]> {
    const { maxTags = 5, minConfidence = 0.7, useLLM = true } = options

    try {
      const suggestions: TagSuggestion[] = []

      // 1. Similarity-based suggestions
      const similarityTags = await this.getSimilarityBasedTags(
        note,
        maxTags * 2
      )
      suggestions.push(...similarityTags)

      // 2. Keyword-based suggestions
      const keywordTags = this.getKeywordBasedTags(note)
      suggestions.push(...keywordTags)

      // 3. LLM-based suggestions (if available)
      if (useLLM && this.llmProvider) {
        const llmTags = await this.getLLMBasedTags(note)
        suggestions.push(...llmTags)
      }

      // Merge and rank suggestions
      const mergedSuggestions = this.mergeSuggestions(suggestions)

      // Filter by confidence and limit
      return mergedSuggestions
        .filter(s => s.confidence >= minConfidence)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxTags)
    } catch (error) {
      logger.error('Failed to suggest tags:', error)
      return []
    }
  }

  /**
   * Get tags based on similarity to other notes
   */
  private async getSimilarityBasedTags(
    note: Note,
    limit: number
  ): Promise<TagSuggestion[]> {
    // Embed the note
    const embeddings = await this.embeddingEngine.embedNote(note)
    if (embeddings.length === 0) return []

    // Search for similar notes
    const queryVector = embeddings[0].vector // Use first chunk as representative
    const similar = await this.vectorStore.search(queryVector, {
      limit,
      threshold: 0.8,
      noteIds: undefined, // Search all notes
    })

    // Extract tags from similar notes
    const tagCounts = new Map<string, number>()
    const tagScores = new Map<string, number>()

    for (const result of similar) {
      if (result.noteId === note.id) continue // Skip self

      const tags = result.metadata?.tags || []
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        const currentScore = tagScores.get(tag) || 0
        tagScores.set(tag, Math.max(currentScore, result.score))
      }
    }

    // Convert to suggestions
    const suggestions: TagSuggestion[] = []
    for (const [tag, count] of tagCounts) {
      const score = tagScores.get(tag) || 0
      const confidence = score * 0.7 + (count / similar.length) * 0.3

      suggestions.push({
        tag,
        confidence,
        reason: `Found in ${count} similar notes`,
      })
    }

    return suggestions
  }

  /**
   * Get tags based on keywords in content
   */
  private getKeywordBasedTags(note: Note): TagSuggestion[] {
    const content = `${note.title} ${note.content}`.toLowerCase()
    const suggestions: TagSuggestion[] = []

    // Common programming languages
    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'rust',
      'go',
      'cpp',
      'csharp',
    ]
    for (const lang of languages) {
      if (content.includes(lang)) {
        suggestions.push({
          tag: lang,
          confidence: 0.9,
          reason: 'Programming language detected',
        })
      }
    }

    // Common frameworks
    const frameworks = [
      'react',
      'vue',
      'angular',
      'django',
      'flask',
      'express',
      'nextjs',
      'svelte',
    ]
    for (const framework of frameworks) {
      if (content.includes(framework)) {
        suggestions.push({
          tag: framework,
          confidence: 0.85,
          reason: 'Framework detected',
        })
      }
    }

    // Topics based on keywords
    const topicKeywords = {
      api: ['api', 'endpoint', 'rest', 'graphql', 'swagger'],
      database: ['database', 'sql', 'mongodb', 'postgres', 'mysql'],
      frontend: ['frontend', 'ui', 'ux', 'css', 'html'],
      backend: ['backend', 'server', 'api', 'database'],
      devops: ['docker', 'kubernetes', 'ci/cd', 'deployment'],
      testing: ['test', 'jest', 'mocha', 'cypress', 'playwright'],
      security: ['security', 'auth', 'encryption', 'oauth', 'jwt'],
      performance: ['performance', 'optimization', 'cache', 'speed'],
      architecture: ['architecture', 'design', 'pattern', 'microservice'],
      documentation: ['documentation', 'readme', 'guide', 'tutorial'],
    }

    for (const [tag, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(kw => content.includes(kw)).length
      if (matches > 0) {
        suggestions.push({
          tag,
          confidence: Math.min(0.95, 0.7 + matches * 0.1),
          reason: `Topic keywords detected (${matches} matches)`,
        })
      }
    }

    // Check existing tags for variations
    for (const existingTag of this.existingTags) {
      if (content.includes(existingTag.toLowerCase())) {
        suggestions.push({
          tag: existingTag,
          confidence: 0.95,
          reason: 'Existing tag mentioned in content',
        })
      }
    }

    return suggestions
  }

  /**
   * Get tags using LLM
   */
  private async getLLMBasedTags(note: Note): Promise<TagSuggestion[]> {
    if (!this.llmProvider) return []

    try {
      const prompt = this.promptTemplate.generateTaggingPrompt(
        `${note.title}\n\n${note.content}`,
        Array.from(this.existingTags)
      )

      const response = await this.llmProvider.generate(prompt)

      // Parse LLM response (expecting comma-separated tags)
      const suggestedTags = response.text
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      return suggestedTags.map(tag => ({
        tag,
        confidence: 0.8, // Default confidence for LLM suggestions
        reason: 'AI suggested',
      }))
    } catch (error) {
      logger.error('Failed to get LLM-based tags:', error)
      return []
    }
  }

  /**
   * Merge and deduplicate suggestions
   */
  private mergeSuggestions(suggestions: TagSuggestion[]): TagSuggestion[] {
    const merged = new Map<string, TagSuggestion>()

    for (const suggestion of suggestions) {
      const key = suggestion.tag.toLowerCase()
      const existing = merged.get(key)

      if (!existing || suggestion.confidence > existing.confidence) {
        merged.set(key, suggestion)
      } else if (
        existing &&
        suggestion.reason &&
        !existing.reason?.includes(suggestion.reason)
      ) {
        // Combine reasons
        existing.reason = `${existing.reason}; ${suggestion.reason}`
        // Boost confidence slightly for multiple sources
        existing.confidence = Math.min(1, existing.confidence * 1.1)
      }
    }

    return Array.from(merged.values())
  }

  /**
   * Apply tags to a note
   */
  async applyTags(note: Note, tags: string[]): Promise<Note> {
    // Merge with existing tags
    const allTags = new Set([...note.tags, ...tags])

    return {
      ...note,
      tags: Array.from(allTags),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Batch process notes for auto-tagging
   */
  async batchSuggestTags(
    notes: Note[],
    options: Parameters<typeof this.suggestTags>[1] = {}
  ): Promise<Map<string, TagSuggestion[]>> {
    const results = new Map<string, TagSuggestion[]>()

    for (const note of notes) {
      try {
        const suggestions = await this.suggestTags(note, options)
        results.set(note.id, suggestions)
      } catch (error) {
        logger.error(`Failed to suggest tags for note ${note.id}:`, error)
        results.set(note.id, [])
      }
    }

    return results
  }
}
