import { searchNotes, getNotesByIds } from '../services/notesService'
import {
  generateSummary,
  generateTopicGraph,
  generateTimeline,
} from '../services/aiService'

export interface SlashCommand {
  command: string
  description: string
  shortcut?: string
  handler: (args: string) => Promise<string>
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/search',
    description: 'Search through all notes',
    shortcut: '⌘K',
    handler: async (query: string) => {
      if (!query.trim()) {
        return 'Please provide a search query. Example: /search machine learning'
      }

      const results = await searchNotes(query)

      if (results.length === 0) {
        return `No notes found matching "${query}"`
      }

      const resultText = results
        .slice(0, 5)
        .map(
          (note, index) =>
            `${index + 1}. **${note.title}**\n   ${note.content.substring(0, 150)}...`
        )
        .join('\n\n')

      return `Found ${results.length} notes matching "${query}":\n\n${resultText}`
    },
  },

  {
    command: '/summarize',
    description: 'Summarize selected notes or by IDs',
    handler: async (args: string) => {
      if (!args.trim()) {
        return 'Please provide note IDs to summarize. Example: /summarize note1,note2,note3'
      }

      const noteIds = args.split(',').map(id => id.trim())
      const notes = await getNotesByIds(noteIds)

      if (notes.length === 0) {
        return 'No valid notes found with the provided IDs'
      }

      const summary = await generateSummary(notes)

      return `## Summary of ${notes.length} notes\n\n${summary}`
    },
  },

  {
    command: '/graph',
    description: 'Show knowledge graph for a topic',
    handler: async (topic: string) => {
      if (!topic.trim()) {
        return 'Please provide a topic. Example: /graph machine learning'
      }

      const graphData = await generateTopicGraph(topic)

      return (
        `## Knowledge Graph: ${topic}\n\n` +
        `**Nodes:** ${graphData.nodes.length}\n` +
        `**Connections:** ${graphData.edges.length}\n\n` +
        `The graph visualization has been updated in the graph panel.`
      )
    },
  },

  {
    command: '/timeline',
    description: 'Show timeline of notes for date range',
    handler: async (dateRange: string) => {
      if (!dateRange.trim()) {
        return 'Please provide a date range. Example: /timeline last week'
      }

      const timeline = await generateTimeline(dateRange)

      return `## Timeline: ${dateRange}\n\n${timeline}`
    },
  },

  {
    command: '/connect',
    description: 'Find connections between notes',
    handler: async (noteIds: string) => {
      if (!noteIds.trim()) {
        return 'Please provide note IDs. Example: /connect note1,note2'
      }

      const ids = noteIds.split(',').map(id => id.trim())
      if (ids.length < 2) {
        return 'Please provide at least 2 note IDs to find connections'
      }

      const notes = await getNotesByIds(ids)
      const connections = await findConnections(notes)

      return `## Connections between ${notes.length} notes\n\n${connections}`
    },
  },

  {
    command: '/tags',
    description: 'List all tags or notes with specific tag',
    handler: async (tag: string) => {
      if (!tag.trim()) {
        const allTags = await getAllTags()
        return (
          `## All Tags (${allTags.length})\n\n` +
          allTags.map(t => `- #${t.name} (${t.count} notes)`).join('\n')
        )
      }

      const notes = await getNotesWithTag(tag)
      return (
        `## Notes tagged with #${tag} (${notes.length})\n\n` +
        notes.map((n, i) => `${i + 1}. ${n.title}`).join('\n')
      )
    },
  },

  {
    command: '/table',
    description: 'Insert a markdown table',
    handler: async (args: string) => {
      // Parse dimensions from args (e.g., "3x4" for 3 columns, 4 rows)
      const match = args.match(/(\d+)x(\d+)/)
      const cols = match ? parseInt(match[1]) : 3
      const rows = match ? parseInt(match[2]) : 3
      
      // Create header row
      const header = '| ' + Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' | ') + ' |'
      const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |'
      
      // Create data rows
      const dataRows = Array(rows - 1).fill(null).map((_, rowIndex) => 
        '| ' + Array(cols).fill('').map((_, colIndex) => `Cell ${rowIndex + 1}-${colIndex + 1}`).join(' | ') + ' |'
      )
      
      return [header, separator, ...dataRows].join('\n')
    },
  },

  {
    command: '/help',
    description: 'Show all available commands',
    handler: async () => {
      return (
        `## Available Commands\n\n` +
        SLASH_COMMANDS.map(
          cmd =>
            `**${cmd.command}** - ${cmd.description}${cmd.shortcut ? ` (${cmd.shortcut})` : ''}`
        ).join('\n\n') +
        '\n\n*Tip: Start typing / to see command suggestions*'
      )
    },
  },
]

// Helper functions (these would be implemented in your services)
async function findConnections(notes: any[]): Promise<string> {
  // Implementation would analyze notes and find connections
  return 'Connection analysis would appear here'
}

async function getAllTags(): Promise<{ name: string; count: number }[]> {
  // Implementation would fetch all tags with counts
  return []
}

async function getNotesWithTag(tag: string): Promise<any[]> {
  // Implementation would fetch notes with specific tag
  return []
}
