/**
 * Intelligent Chunking Strategy for Notes
 * Handles markdown structure, code blocks, and semantic boundaries
 */

import type { Note } from '@/types'
import type { TextChunk } from './EmbeddingEngine'
import { logger } from '@/utils/logger'

export interface ChunkingConfig {
  maxLength: number
  overlap: number
  preserveMarkdown: boolean
  preserveCodeBlocks: boolean
  minChunkSize: number
}

export class ChunkingStrategy {
  private config: ChunkingConfig

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = {
      maxLength: 512,
      overlap: 128,
      preserveMarkdown: true,
      preserveCodeBlocks: true,
      minChunkSize: 100,
      ...config,
    }
  }

  /**
   * Chunk a note into semantic segments
   */
  chunkNote(note: Note): TextChunk[] {
    const chunks: TextChunk[] = []
    const fullText = `${note.title}\n\n${note.content}`

    // First, try to chunk by semantic boundaries
    const semanticChunks = this.config.preserveMarkdown
      ? this.chunkByMarkdown(fullText)
      : this.chunkByParagraphs(fullText)

    // Then, ensure chunks are within size limits
    for (const semanticChunk of semanticChunks) {
      if (semanticChunk.text.length <= this.config.maxLength) {
        chunks.push(this.createChunk(note.id, semanticChunk, chunks.length))
      } else {
        // Split large chunks with overlap
        const subChunks = this.splitLargeChunk(semanticChunk)
        for (const subChunk of subChunks) {
          chunks.push(this.createChunk(note.id, subChunk, chunks.length))
        }
      }
    }

    // Add metadata to all chunks
    return chunks.map(chunk => ({
      ...chunk,
      metadata: {
        title: note.title,
        tags: note.tags,
        notebook: note.notebook,
      },
    }))
  }

  /**
   * Chunk by markdown structure
   */
  private chunkByMarkdown(
    text: string
  ): Array<{ text: string; offset: number }> {
    const chunks: Array<{ text: string; offset: number }> = []
    const lines = text.split('\n')

    let currentChunk = ''
    let currentOffset = 0
    let chunkStartOffset = 0
    let inCodeBlock = false
    let codeBlockContent = ''
    let codeBlockStartOffset = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineWithNewline = i < lines.length - 1 ? line + '\n' : line

      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Start of code block
          if (currentChunk.trim() && this.config.preserveCodeBlocks) {
            chunks.push({ text: currentChunk.trim(), offset: chunkStartOffset })
            currentChunk = ''
            chunkStartOffset = currentOffset
          }
          inCodeBlock = true
          codeBlockContent = lineWithNewline
          codeBlockStartOffset = currentOffset
        } else {
          // End of code block
          codeBlockContent += lineWithNewline
          if (this.config.preserveCodeBlocks) {
            chunks.push({
              text: codeBlockContent,
              offset: codeBlockStartOffset,
            })
            currentChunk = ''
            chunkStartOffset = currentOffset + lineWithNewline.length
          } else {
            currentChunk += codeBlockContent
          }
          inCodeBlock = false
          codeBlockContent = ''
        }
      } else if (inCodeBlock) {
        codeBlockContent += lineWithNewline
      } else {
        // Check for markdown headers (semantic boundaries)
        if (line.match(/^#{1,6}\s/)) {
          if (currentChunk.trim()) {
            chunks.push({ text: currentChunk.trim(), offset: chunkStartOffset })
            currentChunk = lineWithNewline
            chunkStartOffset = currentOffset
          } else {
            currentChunk += lineWithNewline
          }
        } else if (
          line.trim() === '' &&
          currentChunk.length > this.config.minChunkSize
        ) {
          // Empty line - potential paragraph boundary
          currentChunk += lineWithNewline
          if (currentChunk.length > this.config.maxLength * 0.8) {
            chunks.push({ text: currentChunk.trim(), offset: chunkStartOffset })
            currentChunk = ''
            chunkStartOffset = currentOffset + lineWithNewline.length
          }
        } else {
          currentChunk += lineWithNewline
        }
      }

      currentOffset += lineWithNewline.length
    }

    // Add remaining content
    if (currentChunk.trim()) {
      chunks.push({ text: currentChunk.trim(), offset: chunkStartOffset })
    }
    if (inCodeBlock && codeBlockContent.trim()) {
      chunks.push({
        text: codeBlockContent.trim(),
        offset: codeBlockStartOffset,
      })
    }

    return chunks
  }

  /**
   * Simple paragraph-based chunking
   */
  private chunkByParagraphs(
    text: string
  ): Array<{ text: string; offset: number }> {
    const chunks: Array<{ text: string; offset: number }> = []
    const paragraphs = text.split(/\n\s*\n/)
    let currentOffset = 0

    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        chunks.push({
          text: paragraph.trim(),
          offset: currentOffset,
        })
      }
      currentOffset += paragraph.length + 2 // Account for double newline
    }

    return chunks
  }

  /**
   * Split large chunks with overlap
   */
  private splitLargeChunk(chunk: {
    text: string
    offset: number
  }): Array<{ text: string; offset: number }> {
    const subChunks: Array<{ text: string; offset: number }> = []
    const text = chunk.text
    const sentences = this.splitIntoSentences(text)

    let currentChunk = ''
    let currentOffset = chunk.offset
    let chunkStartOffset = chunk.offset

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= this.config.maxLength) {
        currentChunk += sentence
      } else {
        if (currentChunk.trim()) {
          subChunks.push({
            text: currentChunk.trim(),
            offset: chunkStartOffset,
          })
        }

        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk)
        currentChunk = overlapText + sentence
        chunkStartOffset = currentOffset - overlapText.length
      }
      currentOffset += sentence.length
    }

    // Add remaining content
    if (currentChunk.trim()) {
      subChunks.push({
        text: currentChunk.trim(),
        offset: chunkStartOffset,
      })
    }

    return subChunks
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be improved with better NLP
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
    return sentences.map(s => s.trim() + ' ').filter(s => s.trim())
  }

  /**
   * Get overlap text from the end of current chunk
   */
  private getOverlapText(text: string): string {
    const words = text.split(/\s+/)
    const overlapWords = Math.ceil(this.config.overlap / 10) // Rough estimate
    const startIndex = Math.max(0, words.length - overlapWords)
    return words.slice(startIndex).join(' ') + ' '
  }

  /**
   * Create a TextChunk object
   */
  private createChunk(
    noteId: string,
    content: { text: string; offset: number },
    index: number
  ): TextChunk {
    return {
      id: `${noteId}_chunk_${index}`,
      noteId,
      text: content.text,
      startOffset: content.offset,
      endOffset: content.offset + content.text.length,
      metadata: {}, // Will be filled by chunkNote
    }
  }

  /**
   * Estimate number of chunks for a note
   */
  estimateChunkCount(note: Note): number {
    const fullText = `${note.title}\n\n${note.content}`
    const avgChunkSize = this.config.maxLength * 0.75
    return Math.ceil(fullText.length / avgChunkSize)
  }

  /**
   * Validate chunk quality
   */
  validateChunks(chunks: TextChunk[]): {
    valid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    for (const chunk of chunks) {
      if (chunk.text.length < this.config.minChunkSize) {
        issues.push(
          `Chunk ${chunk.id} is too small (${chunk.text.length} chars)`
        )
      }
      if (chunk.text.length > this.config.maxLength) {
        issues.push(
          `Chunk ${chunk.id} exceeds max length (${chunk.text.length} chars)`
        )
      }
    }

    // Check for coverage
    const totalLength = chunks.reduce(
      (sum, chunk) => sum + chunk.text.length,
      0
    )
    const expectedMinLength = chunks.length * this.config.minChunkSize

    if (totalLength < expectedMinLength * 0.8) {
      issues.push('Total chunk coverage seems too low')
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }
}
