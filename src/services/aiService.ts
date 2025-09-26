// AI Service for Knowledge Graph and Chat features
// This is a mock implementation - replace with actual AI service integration

import type { Note } from '../types'
import type { GraphData, GraphNode, GraphEdge } from '../types/knowledge'

export async function generateSummary(notes: Note[]): Promise<string> {
  // Mock implementation - replace with actual AI service
  const totalWords = notes.reduce((sum, note) => sum + (note.wordCount || 0), 0)
  const avgWords = Math.round(totalWords / notes.length)

  return (
    `These ${notes.length} notes contain approximately ${totalWords} words total ` +
    `(average: ${avgWords} words per note). The notes cover topics including: ` +
    `${[...new Set(notes.flatMap(n => n.tags))].join(', ')}. ` +
    `The most recent note was updated ${new Date(
      Math.max(...notes.map(n => new Date(n.updatedAt).getTime()))
    ).toLocaleDateString()}.`
  )
}

export async function generateTopicGraph(topic: string): Promise<GraphData> {
  // Mock implementation - would use AI to analyze notes and build graph
  const mockNodes: GraphNode[] = [
    {
      id: 'topic-center',
      type: 'concept',
      label: topic,
      data: {
        title: topic,
        tags: [],
        backlinks: [],
        forwardLinks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      style: {
        color: '#3b82f6',
        size: 40,
        shape: 'circle',
      },
    },
  ]

  const mockEdges: GraphEdge[] = []

  // Add some related nodes
  const relatedConcepts = ['Related 1', 'Related 2', 'Related 3']
  relatedConcepts.forEach((concept, index) => {
    mockNodes.push({
      id: `concept-${index}`,
      type: 'concept',
      label: concept,
      data: {
        title: concept,
        tags: [],
        backlinks: ['topic-center'],
        forwardLinks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      style: {
        color: '#8b5cf6',
        size: 30,
        shape: 'circle',
      },
    })

    mockEdges.push({
      id: `edge-${index}`,
      source: 'topic-center',
      target: `concept-${index}`,
      type: 'similarity',
      weight: 0.8 - index * 0.1,
    })
  })

  return { nodes: mockNodes, edges: mockEdges }
}

export async function generateTimeline(dateRange: string): Promise<string> {
  // Mock implementation
  const ranges: { [key: string]: number } = {
    today: 1,
    yesterday: 1,
    'last week': 7,
    'last month': 30,
    'last year': 365,
  }

  const days = ranges[dateRange.toLowerCase()] || 7
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return (
    `Showing activity from ${startDate.toLocaleDateString()} to today:\n\n` +
    `- Total notes created: ${Math.floor(Math.random() * 20) + 1}\n` +
    `- Total notes modified: ${Math.floor(Math.random() * 30) + 5}\n` +
    `- Most active day: ${new Date(
      startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
    ).toLocaleDateString()}\n` +
    `- Average notes per day: ${(Math.random() * 5 + 1).toFixed(1)}`
  )
}

export async function analyzeNoteConnections(
  noteId: string,
  allNotes: Note[]
): Promise<string[]> {
  // Mock implementation - would use AI embeddings to find similar notes
  const note = allNotes.find(n => n.id === noteId)
  if (!note) return []

  // Simple tag-based similarity for demo
  return allNotes
    .filter(n => n.id !== noteId)
    .filter(n => n.tags.some(tag => note.tags.includes(tag)))
    .map(n => n.id)
    .slice(0, 5)
}

export async function extractKeywords(content: string): Promise<string[]> {
  // Mock implementation - would use NLP to extract keywords
  const words = content.toLowerCase().split(/\s+/)
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
  ])

  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }
  })

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

export async function generateNoteClusters(notes: Note[]): Promise<{
  clusters: { id: string; name: string; noteIds: string[] }[]
}> {
  // Mock implementation - would use ML clustering algorithms
  const tagClusters = new Map<string, string[]>()

  notes.forEach(note => {
    note.tags.forEach(tag => {
      if (!tagClusters.has(tag)) {
        tagClusters.set(tag, [])
      }
      tagClusters.get(tag)!.push(note.id)
    })
  })

  const clusters = Array.from(tagClusters.entries())
    .filter(([_, noteIds]) => noteIds.length > 1)
    .map(([tag, noteIds], index) => ({
      id: `cluster-${index}`,
      name: tag,
      noteIds,
    }))

  return { clusters }
}

// Embedding functions for similarity calculations
export async function getEmbedding(text: string): Promise<number[]> {
  // Mock implementation - would call embedding API
  // Return a random vector for demo
  return Array.from({ length: 384 }, () => Math.random() - 0.5)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
