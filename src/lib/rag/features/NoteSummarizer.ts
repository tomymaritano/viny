/**
 * Note Summarization Feature
 * Generates intelligent summaries of notes
 */

import type { Note } from '@/types'
import type { LLMProvider } from '../llm/LLMProvider'
import { PromptTemplate } from '../pipeline/PromptTemplate'
import { logger } from '@/utils/logger'

export interface SummaryOptions {
  style: 'brief' | 'detailed' | 'bullet-points' | 'key-insights'
  maxLength?: number
  includeMetadata?: boolean
  language?: string
}

export interface NoteSummary {
  noteId: string
  summary: string
  keyPoints?: string[]
  wordCount: number
  readingTime: number
  generatedAt: string
}

export class NoteSummarizer {
  private llmProvider: LLMProvider | null = null
  private promptTemplate: PromptTemplate
  private fallbackSummarizer: FallbackSummarizer

  constructor(llmProvider?: LLMProvider) {
    this.llmProvider = llmProvider || null
    this.promptTemplate = new PromptTemplate()
    this.fallbackSummarizer = new FallbackSummarizer()
  }

  /**
   * Generate summary for a note
   */
  async summarize(
    note: Note,
    options: SummaryOptions = { style: 'brief' }
  ): Promise<NoteSummary> {
    try {
      let summary: string
      let keyPoints: string[] | undefined

      if (this.llmProvider) {
        // Use LLM for intelligent summarization
        const result = await this.llmSummarize(note, options)
        summary = result.summary
        keyPoints = result.keyPoints
      } else {
        // Fallback to rule-based summarization
        summary = this.fallbackSummarizer.summarize(note, options)
        keyPoints = this.fallbackSummarizer.extractKeyPoints(note)
      }

      const wordCount = summary.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

      return {
        noteId: note.id,
        summary,
        keyPoints,
        wordCount,
        readingTime,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      logger.error('Failed to generate summary:', error)
      throw error
    }
  }

  /**
   * Generate summary using LLM
   */
  private async llmSummarize(
    note: Note,
    options: SummaryOptions
  ): Promise<{ summary: string; keyPoints?: string[] }> {
    if (!this.llmProvider) {
      throw new Error('LLM provider not available')
    }

    const prompt = this.generateSummaryPrompt(note, options)
    const response = await this.llmProvider.generate(prompt)

    // Parse response based on style
    if (options.style === 'bullet-points' || options.style === 'key-insights') {
      const lines = response.text.split('\n').filter(line => line.trim())
      const keyPoints = lines
        .filter(line => line.match(/^[-•*]\s/))
        .map(line => line.replace(/^[-•*]\s/, '').trim())

      return {
        summary: response.text,
        keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
      }
    }

    return { summary: response.text }
  }

  /**
   * Generate appropriate prompt based on options
   */
  private generateSummaryPrompt(note: Note, options: SummaryOptions): string {
    const content = `${note.title}\n\n${note.content}`

    switch (options.style) {
      case 'brief':
        return this.promptTemplate.generateSummaryPrompt(content, 'brief')

      case 'detailed':
        return this.promptTemplate.generateSummaryPrompt(content, 'detailed')

      case 'bullet-points':
        return `Summarize this note as a bullet-point list of the main points:\n\n${content}\n\nFormat each point starting with "- "`

      case 'key-insights':
        return `Extract the key insights and learnings from this note:\n\n${content}\n\nFormat as bullet points starting with "- " and focus on actionable insights.`

      default:
        return this.promptTemplate.generateSummaryPrompt(content, 'brief')
    }
  }

  /**
   * Batch summarize multiple notes
   */
  async batchSummarize(
    notes: Note[],
    options: SummaryOptions = { style: 'brief' }
  ): Promise<Map<string, NoteSummary>> {
    const summaries = new Map<string, NoteSummary>()

    for (const note of notes) {
      try {
        const summary = await this.summarize(note, options)
        summaries.set(note.id, summary)
      } catch (error) {
        logger.error(`Failed to summarize note ${note.id}:`, error)
      }
    }

    return summaries
  }

  /**
   * Generate a combined summary for multiple related notes
   */
  async summarizeCollection(
    notes: Note[],
    title: string,
    options: SummaryOptions = { style: 'detailed' }
  ): Promise<string> {
    if (notes.length === 0) {
      return 'No notes to summarize.'
    }

    if (this.llmProvider) {
      const combinedContent = notes
        .map(note => `## ${note.title}\n${note.content}`)
        .join('\n\n---\n\n')

      const prompt = `Create a comprehensive summary of these ${notes.length} related notes about "${title}":\n\n${combinedContent}\n\nProvide a cohesive summary that synthesizes the information across all notes.`

      const response = await this.llmProvider.generate(prompt)
      return response.text
    } else {
      // Fallback: concatenate individual summaries
      const summaries = await this.batchSummarize(notes, options)
      return Array.from(summaries.values())
        .map(s => s.summary)
        .join('\n\n')
    }
  }
}

/**
 * Fallback summarizer for when LLM is not available
 */
class FallbackSummarizer {
  /**
   * Rule-based summarization
   */
  summarize(note: Note, options: SummaryOptions): string {
    const sentences = this.extractSentences(note.content)

    if (sentences.length === 0) {
      return note.title
    }

    switch (options.style) {
      case 'brief':
        return this.extractFirstParagraph(note.content) || sentences[0]

      case 'detailed':
        return this.extractKeyParagraphs(note.content, 3)

      case 'bullet-points':
        const points = this.extractKeyPoints(note)
        return points.map(p => `- ${p}`).join('\n')

      case 'key-insights':
        const insights = this.extractInsights(note)
        return insights.map(i => `- ${i}`).join('\n')

      default:
        return sentences.slice(0, 3).join(' ')
    }
  }

  /**
   * Extract key points from note
   */
  extractKeyPoints(note: Note): string[] {
    const points: string[] = []
    const lines = note.content.split('\n')

    // Extract headers
    const headers = lines
      .filter(line => line.match(/^#{1,3}\s/))
      .map(line => line.replace(/^#+\s/, '').trim())
      .slice(0, 5)

    points.push(...headers)

    // Extract list items
    const listItems = lines
      .filter(line => line.match(/^[-*]\s/))
      .map(line => line.replace(/^[-*]\s/, '').trim())
      .slice(0, 5)

    points.push(...listItems)

    // If not enough points, extract first sentences
    if (points.length < 3) {
      const sentences = this.extractSentences(note.content)
      points.push(...sentences.slice(0, 3))
    }

    return [...new Set(points)].slice(0, 5) // Remove duplicates and limit
  }

  /**
   * Extract potential insights
   */
  private extractInsights(note: Note): string[] {
    const insights: string[] = []
    const lines = note.content.split('\n')

    // Look for conclusion patterns
    const conclusionPatterns = [
      /^(in conclusion|therefore|thus|hence|as a result)/i,
      /^(key takeaway|important|note that|remember)/i,
      /^(insight|learning|discovered|found that)/i,
    ]

    for (const line of lines) {
      for (const pattern of conclusionPatterns) {
        if (line.match(pattern)) {
          insights.push(line.trim())
          break
        }
      }
    }

    // Extract emphasized text (bold, italic)
    const emphasized = note.content.match(/\*\*([^*]+)\*\*|\*([^*]+)\*/g)
    if (emphasized) {
      insights.push(...emphasized.map(e => e.replace(/\*/g, '').trim()))
    }

    return [...new Set(insights)].slice(0, 5)
  }

  /**
   * Extract sentences from text
   */
  private extractSentences(text: string): string[] {
    return text
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20)
  }

  /**
   * Extract first paragraph
   */
  private extractFirstParagraph(text: string): string | null {
    const paragraphs = text.split(/\n\s*\n/)
    return paragraphs.find(p => p.trim().length > 50) || null
  }

  /**
   * Extract key paragraphs
   */
  private extractKeyParagraphs(text: string, count: number): string {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)

    if (paragraphs.length <= count) {
      return paragraphs.join('\n\n')
    }

    // Take first, middle, and last paragraphs
    const result = []
    result.push(paragraphs[0])

    if (count > 2) {
      const middle = Math.floor(paragraphs.length / 2)
      result.push(paragraphs[middle])
    }

    result.push(paragraphs[paragraphs.length - 1])

    return result.join('\n\n')
  }
}
