import { PrismaClient } from '@prisma/client'
import type { Note } from '@prisma/client'

export interface NoteAnalytics {
  totalNotes: number
  totalWords: number
  avgWordsPerNote: number
  notesPerNotebook: Record<string, number>
  notesPerStatus: Record<string, number>
  topTags: Array<{ name: string; count: number }>
  activityByDay: number[]
  activityByMonth: Record<string, number>
  readingTimeMinutes: number
}

export interface ContentAnalysis {
  themes: Array<{ word: string; count: number; weight: number }>
  entities: Array<{ type: string; value: string; count: number }>
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
  connections: Array<{
    noteId1: number
    noteId2: number
    similarity: number
    sharedTerms: string[]
  }>
}

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get comprehensive analytics for a user's notes
   */
  async getNoteAnalytics(userId: number): Promise<NoteAnalytics> {
    const notes = await this.prisma.note.findMany({
      where: { userId, isTrashed: false },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    })

    // Calculate word statistics
    const wordCounts = notes.map(note => this.countWords(note.content))
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0)
    const avgWordsPerNote = notes.length > 0 ? Math.round(totalWords / notes.length) : 0

    // Notes per notebook
    const notesPerNotebook = notes.reduce((acc, note) => {
      acc[note.notebook] = (acc[note.notebook] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Notes per status
    const notesPerStatus = notes.reduce((acc, note) => {
      acc[note.status] = (acc[note.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top tags
    const tagCounts = new Map<string, number>()
    notes.forEach(note => {
      note.tags.forEach(({ tag }) => {
        tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1)
      })
    })
    const topTags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Activity by day of week (0 = Sunday)
    const activityByDay = new Array(7).fill(0)
    notes.forEach(note => {
      const day = new Date(note.createdAt).getDay()
      activityByDay[day]++
    })

    // Activity by month
    const activityByMonth = notes.reduce((acc, note) => {
      const month = new Date(note.createdAt).toISOString().substring(0, 7)
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Estimated reading time (200 words per minute)
    const readingTimeMinutes = Math.round(totalWords / 200)

    return {
      totalNotes: notes.length,
      totalWords,
      avgWordsPerNote,
      notesPerNotebook,
      notesPerStatus,
      topTags,
      activityByDay,
      activityByMonth,
      readingTimeMinutes
    }
  }

  /**
   * Analyze content for themes, entities, and patterns
   */
  async analyzeContent(
    userId: number,
    noteIds?: number[],
    analysisType: 'themes' | 'entities' | 'sentiment' | 'connections' = 'themes'
  ): Promise<Partial<ContentAnalysis>> {
    const whereClause: any = { userId, isTrashed: false }
    if (noteIds && noteIds.length > 0) {
      whereClause.id = { in: noteIds }
    }

    const notes = await this.prisma.note.findMany({ where: whereClause })

    switch (analysisType) {
      case 'themes':
        return { themes: this.extractThemes(notes) }
      
      case 'entities':
        return { entities: this.extractEntities(notes) }
      
      case 'sentiment':
        return { sentiment: this.analyzeSentiment(notes) }
      
      case 'connections':
        return { connections: this.findConnections(notes) }
      
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`)
    }
  }

  /**
   * Generate a smart summary based on timeframe and filters
   */
  async generateSmartSummary(
    userId: number,
    timeframe: 'today' | 'week' | 'month' | 'year',
    notebook?: string
  ): Promise<string> {
    const startDate = this.getStartDate(timeframe)
    
    const whereClause: any = {
      userId,
      isTrashed: false,
      updatedAt: { gte: startDate }
    }
    
    if (notebook) {
      whereClause.notebook = notebook
    }

    const notes = await this.prisma.note.findMany({
      where: whereClause,
      include: {
        tags: {
          include: { tag: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Group by notebook
    const byNotebook = new Map<string, typeof notes>()
    notes.forEach(note => {
      const nb = note.notebook
      if (!byNotebook.has(nb)) {
        byNotebook.set(nb, [])
      }
      byNotebook.get(nb)!.push(note)
    })

    // Build summary
    let summary = `# Knowledge Base Summary - ${this.formatTimeframe(timeframe)}\n\n`
    summary += `**Generated:** ${new Date().toLocaleDateString()}\n`
    summary += `**Total Notes:** ${notes.length}\n\n`

    if (notes.length === 0) {
      summary += '*No notes found for this period.*'
      return summary
    }

    // Key insights
    summary += `## Key Insights\n\n`
    
    const totalWords = notes.reduce((sum, note) => sum + this.countWords(note.content), 0)
    summary += `- **Total Words Written:** ${totalWords.toLocaleString()}\n`
    summary += `- **Average Note Length:** ${Math.round(totalWords / notes.length)} words\n`
    summary += `- **Most Active Notebook:** ${this.getMostActive(byNotebook)}\n\n`

    // Recent highlights
    summary += `## Recent Highlights\n\n`
    const highlights = notes.slice(0, 5)
    highlights.forEach(note => {
      const tags = note.tags.map(t => `#${t.tag.name}`).join(' ')
      summary += `### ${note.title}\n`
      summary += `*${new Date(note.updatedAt).toLocaleDateString()} - ${note.notebook}*\n`
      if (tags) summary += `*${tags}*\n`
      summary += `${this.getPreview(note.content, 100)}...\n\n`
    })

    // Notebook breakdown
    if (byNotebook.size > 1) {
      summary += `## Notebook Activity\n\n`
      Array.from(byNotebook.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .forEach(([nb, nbNotes]) => {
          const nbWords = nbNotes.reduce((sum, n) => sum + this.countWords(n.content), 0)
          summary += `- **${nb}**: ${nbNotes.length} notes, ${nbWords.toLocaleString()} words\n`
        })
    }

    return summary
  }

  // Helper methods

  private countWords(content: string): number {
    return content.split(/\s+/).filter(Boolean).length
  }

  private extractThemes(notes: Note[]): ContentAnalysis['themes'] {
    const wordFreq = new Map<string, number>()
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])

    notes.forEach(note => {
      const words = note.content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 4 && !stopWords.has(word))

      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
      })
    })

    const maxCount = Math.max(...wordFreq.values())
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        weight: count / maxCount
      }))
  }

  private extractEntities(notes: Note[]): ContentAnalysis['entities'] {
    const entities: ContentAnalysis['entities'] = []
    
    // Simple regex patterns for common entities
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      mention: /@\w+/g,
      hashtag: /#\w+/g,
    }

    const entityMap = new Map<string, { type: string; count: number }>()

    notes.forEach(note => {
      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = note.content.match(pattern) || []
        matches.forEach(match => {
          const key = `${type}:${match}`
          const existing = entityMap.get(key)
          if (existing) {
            existing.count++
          } else {
            entityMap.set(key, { type, count: 1 })
          }
        })
      })
    })

    entityMap.forEach((data, key) => {
      const [type, value] = key.split(':', 2)
      entities.push({ type, value, count: data.count })
    })

    return entities.sort((a, b) => b.count - a.count)
  }

  private analyzeSentiment(notes: Note[]): ContentAnalysis['sentiment'] {
    // Simple sentiment analysis based on word lists
    const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'happy', 'success']
    const negative = ['bad', 'terrible', 'awful', 'hate', 'worst', 'fail', 'problem', 'issue', 'error', 'difficult']

    let positiveCount = 0
    let negativeCount = 0
    let totalWords = 0

    notes.forEach(note => {
      const words = note.content.toLowerCase().split(/\s+/)
      totalWords += words.length

      words.forEach(word => {
        if (positive.includes(word)) positiveCount++
        if (negative.includes(word)) negativeCount++
      })
    })

    const sentimentTotal = positiveCount + negativeCount
    const neutralCount = totalWords - sentimentTotal

    return {
      positive: sentimentTotal > 0 ? positiveCount / sentimentTotal : 0,
      negative: sentimentTotal > 0 ? negativeCount / sentimentTotal : 0,
      neutral: totalWords > 0 ? neutralCount / totalWords : 1
    }
  }

  private findConnections(notes: Note[]): ContentAnalysis['connections'] {
    const connections: ContentAnalysis['connections'] = []
    
    // Simple term-based similarity
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const terms1 = new Set(notes[i].content.toLowerCase().split(/\s+/).filter(w => w.length > 5))
        const terms2 = new Set(notes[j].content.toLowerCase().split(/\s+/).filter(w => w.length > 5))
        
        const shared = Array.from(terms1).filter(term => terms2.has(term))
        const similarity = shared.length / Math.min(terms1.size, terms2.size)
        
        if (similarity > 0.2) {
          connections.push({
            noteId1: notes[i].id,
            noteId2: notes[j].id,
            similarity,
            sharedTerms: shared.slice(0, 5)
          })
        }
      }
    }

    return connections.sort((a, b) => b.similarity - a.similarity).slice(0, 20)
  }

  private getStartDate(timeframe: string): Date {
    const now = new Date()
    const start = new Date(now)
    
    switch (timeframe) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        break
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return start
  }

  private formatTimeframe(timeframe: string): string {
    const now = new Date()
    switch (timeframe) {
      case 'today':
        return now.toLocaleDateString()
      case 'week':
        return 'Past 7 Days'
      case 'month':
        return 'Past Month'
      case 'year':
        return 'Past Year'
      default:
        return timeframe
    }
  }

  private getMostActive(byNotebook: Map<string, any[]>): string {
    let maxNotebook = ''
    let maxCount = 0
    
    byNotebook.forEach((notes, notebook) => {
      if (notes.length > maxCount) {
        maxCount = notes.length
        maxNotebook = notebook
      }
    })
    
    return `${maxNotebook} (${maxCount} notes)`
  }

  private getPreview(content: string, maxLength: number): string {
    const cleaned = content.replace(/[#*`]/g, '').trim()
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength).trim() 
      : cleaned
  }
}