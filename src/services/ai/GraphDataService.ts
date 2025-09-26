/**
 * GraphDataService - Generates graph data from note relationships
 */

import { localEmbeddingService } from './LocalEmbeddingServiceSimple'
import type { Note, Tag } from '../../types'
import { logger } from '../../utils/logger'

export interface GraphNode {
  id: string
  label: string
  type: 'note' | 'tag' | 'notebook'
  group: string
  size: number
  metadata?: {
    noteId?: string
    content?: string
    updatedAt?: string
    notesCount?: number
  }
}

export interface GraphLink {
  source: string
  target: string
  value: number
  type: 'semantic' | 'tag' | 'notebook'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export class GraphDataService {
  private similarityThreshold = 0.6 // Only show connections above 60% similarity

  /**
   * Generate graph data from notes
   */
  async generateGraphData(notes: Note[]): Promise<GraphData> {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const processedPairs = new Set<string>()

    // Create note nodes
    for (const note of notes) {
      if (note.isTrashed) continue

      nodes.push({
        id: `note_${note.id}`,
        label: note.title || 'Untitled',
        type: 'note',
        group: note.notebook || 'default',
        size: Math.min(20, 5 + (note.content?.length || 0) / 1000),
        metadata: {
          noteId: note.id,
          content: note.content?.substring(0, 200),
          updatedAt: note.updatedAt,
        },
      })
    }

    // Create tag nodes and connections
    const tagMap = new Map<string, number>()
    for (const note of notes) {
      if (note.isTrashed) continue

      for (const tag of note.tags || []) {
        const tagId = `tag_${tag}`

        // Count notes per tag
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)

        // Create tag-note link
        links.push({
          source: `note_${note.id}`,
          target: tagId,
          value: 1,
          type: 'tag',
        })
      }
    }

    // Add tag nodes
    for (const [tag, count] of tagMap.entries()) {
      nodes.push({
        id: `tag_${tag}`,
        label: tag,
        type: 'tag',
        group: 'tags',
        size: Math.min(15, 5 + count * 2),
        metadata: {
          notesCount: count,
        },
      })
    }

    // Create notebook nodes and connections
    const notebookMap = new Map<string, number>()
    for (const note of notes) {
      if (note.isTrashed || !note.notebook) continue

      notebookMap.set(note.notebook, (notebookMap.get(note.notebook) || 0) + 1)

      // Create notebook-note link
      links.push({
        source: `note_${note.id}`,
        target: `notebook_${note.notebook}`,
        value: 0.5,
        type: 'notebook',
      })
    }

    // Add notebook nodes
    for (const [notebook, count] of notebookMap.entries()) {
      nodes.push({
        id: `notebook_${notebook}`,
        label: notebook,
        type: 'notebook',
        group: 'notebooks',
        size: Math.min(20, 8 + count * 3),
        metadata: {
          notesCount: count,
        },
      })
    }

    // Calculate semantic connections between notes
    await this.addSemanticConnections(notes, links, processedPairs)

    return { nodes, links }
  }

  /**
   * Add semantic connections based on content similarity
   */
  private async addSemanticConnections(
    notes: Note[],
    links: GraphLink[],
    processedPairs: Set<string>
  ): Promise<void> {
    const validNotes = notes.filter(n => !n.isTrashed && n.content)

    for (let i = 0; i < validNotes.length; i++) {
      for (let j = i + 1; j < validNotes.length; j++) {
        const note1 = validNotes[i]
        const note2 = validNotes[j]

        // Skip if already processed
        const pairKey = [note1.id, note2.id].sort().join('_')
        if (processedPairs.has(pairKey)) continue
        processedPairs.add(pairKey)

        try {
          // Get embeddings
          const [embedding1, embedding2] = await Promise.all([
            this.getOrGenerateEmbedding(note1.content!),
            this.getOrGenerateEmbedding(note2.content!),
          ])

          if (!embedding1 || !embedding2) continue

          // Calculate similarity
          const similarity = await localEmbeddingService.calculateSimilarity(
            embedding1,
            embedding2
          )

          // Add link if similarity is above threshold
          if (similarity >= this.similarityThreshold) {
            links.push({
              source: `note_${note1.id}`,
              target: `note_${note2.id}`,
              value: similarity,
              type: 'semantic',
            })
          }
        } catch (error) {
          logger.debug(
            `Failed to calculate similarity for notes ${note1.id} and ${note2.id}`,
            error
          )
        }
      }
    }
  }

  /**
   * Get cached embedding or generate new one
   */
  private async getOrGenerateEmbedding(
    content: string
  ): Promise<Float32Array | null> {
    try {
      // Try to get cached embedding first
      let embedding = await localEmbeddingService.getCachedEmbedding(content)

      if (!embedding) {
        // Generate new embedding
        const result = await localEmbeddingService.generateEmbedding(content)
        embedding = result.embedding
      }

      return embedding
    } catch (error) {
      logger.error('Failed to get embedding', error)
      return null
    }
  }

  /**
   * Filter graph data based on criteria
   */
  filterGraphData(
    graphData: GraphData,
    options: {
      showTags?: boolean
      showNotebooks?: boolean
      showSemanticLinks?: boolean
      minSimilarity?: number
    }
  ): GraphData {
    const {
      showTags = true,
      showNotebooks = true,
      showSemanticLinks = true,
      minSimilarity = this.similarityThreshold,
    } = options

    // Filter nodes
    const filteredNodes = graphData.nodes.filter(node => {
      if (node.type === 'tag' && !showTags) return false
      if (node.type === 'notebook' && !showNotebooks) return false
      return true
    })

    // Get valid node IDs
    const validNodeIds = new Set(filteredNodes.map(n => n.id))

    // Filter links
    const filteredLinks = graphData.links.filter(link => {
      // Check if both nodes exist
      if (!validNodeIds.has(link.source) || !validNodeIds.has(link.target)) {
        return false
      }

      // Filter by type
      if (link.type === 'tag' && !showTags) return false
      if (link.type === 'notebook' && !showNotebooks) return false
      if (link.type === 'semantic' && !showSemanticLinks) return false

      // Filter by similarity threshold
      if (link.type === 'semantic' && link.value < minSimilarity) return false

      return true
    })

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    }
  }
}

export const graphDataService = new GraphDataService()
