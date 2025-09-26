import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// Initialize Prisma client
const prisma = new PrismaClient()

// JWT secret for authentication
const JWT_SECRET = process.env.MCP_JWT_SECRET || crypto.randomBytes(32).toString('hex')

// Validation schemas
const SearchOptionsSchema = z.object({
  query: z.string(),
  notebook: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
})

const NoteCreateSchema = z.object({
  title: z.string(),
  content: z.string(),
  notebook: z.string().default('Personal'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'in-progress', 'review', 'completed', 'archived']).default('draft'),
})

const NoteUpdateSchema = NoteCreateSchema.partial()

// Authentication middleware
async function authenticateUser(authToken?: string): Promise<number | null> {
  if (!authToken) return null
  
  try {
    const decoded = jwt.verify(authToken, JWT_SECRET) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: 'viny-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
)

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'viny://notes',
        name: 'Notes',
        description: 'Access all notes in your Viny knowledge base',
        mimeType: 'application/json',
      },
      {
        uri: 'viny://notebooks',
        name: 'Notebooks',
        description: 'Access all notebooks/categories',
        mimeType: 'application/json',
      },
      {
        uri: 'viny://tags',
        name: 'Tags',
        description: 'Access all tags in your system',
        mimeType: 'application/json',
      },
      {
        uri: 'viny://search',
        name: 'Search',
        description: 'Search across your notes with advanced filters',
        mimeType: 'application/json',
      },
      {
        uri: 'viny://analytics',
        name: 'Analytics',
        description: 'Get insights and analytics about your notes',
        mimeType: 'application/json',
      },
    ],
  }
})

// Read resource handler
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params
  const authToken = request.params.authToken as string | undefined
  const userId = await authenticateUser(authToken)
  
  if (!userId) {
    throw new McpError(ErrorCode.Unauthorized, 'Authentication required')
  }

  try {
    switch (uri) {
      case 'viny://notes': {
        const notes = await prisma.note.findMany({
          where: { userId, isTrashed: false },
          include: {
            tags: {
              include: { tag: true }
            }
          },
          orderBy: { updatedAt: 'desc' },
        })
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                total: notes.length,
                notes: notes.map(note => ({
                  id: note.id,
                  title: note.title,
                  content: note.content,
                  preview: note.preview,
                  notebook: note.notebook,
                  status: note.status,
                  tags: note.tags.map(t => t.tag.name),
                  isPinned: note.isPinned,
                  createdAt: note.createdAt,
                  updatedAt: note.updatedAt,
                }))
              }, null, 2),
            },
          ],
        }
      }
      
      case 'viny://notebooks': {
        const notebooks = await prisma.notebook.findMany({
          where: { userId },
          orderBy: { name: 'asc' },
        })
        
        // Count notes per notebook
        const noteCounts = await prisma.note.groupBy({
          by: ['notebook'],
          where: { userId, isTrashed: false },
          _count: { id: true },
        })
        
        const countsMap = Object.fromEntries(
          noteCounts.map(nc => [nc.notebook, nc._count.id])
        )
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                total: notebooks.length,
                notebooks: notebooks.map(nb => ({
                  id: nb.id,
                  name: nb.name,
                  color: nb.color,
                  noteCount: countsMap[nb.name] || 0,
                  createdAt: nb.createdAt,
                }))
              }, null, 2),
            },
          ],
        }
      }
      
      case 'viny://tags': {
        const tags = await prisma.tag.findMany({
          where: { userId },
          include: {
            _count: {
              select: { notes: true }
            }
          },
          orderBy: { name: 'asc' },
        })
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                total: tags.length,
                tags: tags.map(tag => ({
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                  noteCount: tag._count.notes,
                }))
              }, null, 2),
            },
          ],
        }
      }
      
      case 'viny://analytics': {
        const [totalNotes, notebooks, tags, recentNotes] = await Promise.all([
          prisma.note.count({ where: { userId, isTrashed: false } }),
          prisma.notebook.count({ where: { userId } }),
          prisma.tag.count({ where: { userId } }),
          prisma.note.findMany({
            where: { userId, isTrashed: false },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            select: {
              id: true,
              title: true,
              updatedAt: true,
              notebook: true,
            }
          })
        ])
        
        // Calculate word count statistics
        const notes = await prisma.note.findMany({
          where: { userId, isTrashed: false },
          select: { content: true, createdAt: true }
        })
        
        const wordCounts = notes.map(n => 
          n.content.split(/\s+/).filter(Boolean).length
        )
        const totalWords = wordCounts.reduce((a, b) => a + b, 0)
        const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
        
        // Activity by day of week
        const dayActivity = new Array(7).fill(0)
        notes.forEach(note => {
          const day = new Date(note.createdAt).getDay()
          dayActivity[day]++
        })
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                summary: {
                  totalNotes,
                  totalNotebooks: notebooks,
                  totalTags: tags,
                  totalWords,
                  avgWordsPerNote,
                },
                recentActivity: recentNotes,
                activityByDayOfWeek: dayActivity,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        }
      }
      
      default:
        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`)
    }
  } catch (error) {
    console.error('Resource read error:', error)
    throw new McpError(ErrorCode.InternalError, 'Failed to read resource')
  }
})

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_notes',
        description: 'Search notes with advanced filters and semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (supports fuzzy matching)',
            },
            notebook: {
              type: 'string',
              description: 'Filter by notebook name',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags (AND operation)',
            },
            status: {
              type: 'string',
              enum: ['draft', 'in-progress', 'review', 'completed', 'archived'],
              description: 'Filter by note status',
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return',
              default: 50,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'create_note',
        description: 'Create a new note in Viny',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Note title',
            },
            content: {
              type: 'string',
              description: 'Note content in markdown',
            },
            notebook: {
              type: 'string',
              description: 'Notebook to place the note in',
              default: 'Personal',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags to assign to the note',
            },
            status: {
              type: 'string',
              enum: ['draft', 'in-progress', 'review', 'completed', 'archived'],
              default: 'draft',
            },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'update_note',
        description: 'Update an existing note',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Note ID to update',
            },
            title: { type: 'string' },
            content: { type: 'string' },
            notebook: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            status: {
              type: 'string',
              enum: ['draft', 'in-progress', 'review', 'completed', 'archived'],
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'analyze_content',
        description: 'Analyze note content for patterns, themes, and insights',
        inputSchema: {
          type: 'object',
          properties: {
            noteIds: {
              type: 'array',
              items: { type: 'number' },
              description: 'Note IDs to analyze (empty for all notes)',
            },
            analysisType: {
              type: 'string',
              enum: ['summary', 'themes', 'entities', 'sentiment', 'connections'],
              description: 'Type of analysis to perform',
            },
          },
          required: ['analysisType'],
        },
      },
      {
        name: 'generate_summary',
        description: 'Generate a summary of notes based on criteria',
        inputSchema: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['today', 'week', 'month', 'year', 'all'],
              description: 'Time period for summary',
            },
            notebook: {
              type: 'string',
              description: 'Filter by specific notebook',
            },
            format: {
              type: 'string',
              enum: ['brief', 'detailed', 'bullet-points', 'report'],
              default: 'brief',
            },
          },
          required: ['timeframe'],
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const authToken = args.authToken as string | undefined
  const userId = await authenticateUser(authToken)
  
  if (!userId) {
    throw new McpError(ErrorCode.Unauthorized, 'Authentication required')
  }

  try {
    switch (name) {
      case 'search_notes': {
        const params = SearchOptionsSchema.parse(args)
        
        let whereClause: any = {
          userId,
          isTrashed: false,
        }
        
        // Add filters
        if (params.notebook) {
          whereClause.notebook = params.notebook
        }
        if (params.status) {
          whereClause.status = params.status
        }
        
        // Search in title and content
        if (params.query) {
          whereClause.OR = [
            { title: { contains: params.query, mode: 'insensitive' } },
            { content: { contains: params.query, mode: 'insensitive' } },
          ]
        }
        
        const notes = await prisma.note.findMany({
          where: whereClause,
          include: {
            tags: {
              include: { tag: true }
            }
          },
          take: params.limit,
          skip: params.offset,
          orderBy: { updatedAt: 'desc' },
        })
        
        // Filter by tags if specified
        let filteredNotes = notes
        if (params.tags && params.tags.length > 0) {
          filteredNotes = notes.filter(note => {
            const noteTags = note.tags.map(t => t.tag.name)
            return params.tags!.every(tag => noteTags.includes(tag))
          })
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: params.query,
                total: filteredNotes.length,
                results: filteredNotes.map(note => ({
                  id: note.id,
                  title: note.title,
                  preview: note.preview || note.content.substring(0, 200),
                  notebook: note.notebook,
                  status: note.status,
                  tags: note.tags.map(t => t.tag.name),
                  updatedAt: note.updatedAt,
                }))
              }, null, 2),
            },
          ],
        }
      }
      
      case 'create_note': {
        const params = NoteCreateSchema.parse(args)
        
        // Create note
        const note = await prisma.note.create({
          data: {
            title: params.title,
            content: params.content,
            preview: params.content.substring(0, 200),
            notebook: params.notebook,
            status: params.status,
            userId,
          },
        })
        
        // Add tags
        if (params.tags && params.tags.length > 0) {
          for (const tagName of params.tags) {
            // Find or create tag
            let tag = await prisma.tag.findFirst({
              where: { name: tagName, userId }
            })
            
            if (!tag) {
              tag = await prisma.tag.create({
                data: { name: tagName, userId }
              })
            }
            
            // Link tag to note
            await prisma.noteTags.create({
              data: {
                noteId: note.id,
                tagId: tag.id,
              }
            })
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Created note "${note.title}" with ID ${note.id}`,
            },
          ],
        }
      }
      
      case 'update_note': {
        const { id, ...updates } = NoteUpdateSchema.parse(args)
        
        const note = await prisma.note.update({
          where: { id: Number(id), userId },
          data: {
            ...updates,
            preview: updates.content ? updates.content.substring(0, 200) : undefined,
          },
        })
        
        return {
          content: [
            {
              type: 'text',
              text: `Updated note "${note.title}"`,
            },
          ],
        }
      }
      
      case 'analyze_content': {
        const { noteIds, analysisType } = args as any
        
        let notes
        if (noteIds && noteIds.length > 0) {
          notes = await prisma.note.findMany({
            where: {
              id: { in: noteIds },
              userId,
              isTrashed: false,
            },
          })
        } else {
          notes = await prisma.note.findMany({
            where: { userId, isTrashed: false },
          })
        }
        
        // Simple analysis implementation (in production, this would use AI)
        let analysis = {}
        
        switch (analysisType) {
          case 'summary':
            analysis = {
              totalNotes: notes.length,
              totalWords: notes.reduce((acc, n) => 
                acc + n.content.split(/\s+/).length, 0
              ),
              avgWordsPerNote: Math.round(
                notes.reduce((acc, n) => 
                  acc + n.content.split(/\s+/).length, 0
                ) / notes.length
              ),
              notebooks: [...new Set(notes.map(n => n.notebook))],
            }
            break
            
          case 'themes':
            // Extract common words (simplified)
            const allWords = notes
              .map(n => n.content.toLowerCase())
              .join(' ')
              .split(/\s+/)
              .filter(w => w.length > 5)
            
            const wordFreq = allWords.reduce((acc: any, word) => {
              acc[word] = (acc[word] || 0) + 1
              return acc
            }, {})
            
            analysis = {
              topThemes: Object.entries(wordFreq)
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 10)
                .map(([word, count]) => ({ word, count })),
            }
            break
            
          default:
            analysis = { message: 'Analysis type not implemented' }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                analysisType,
                notesAnalyzed: notes.length,
                results: analysis,
              }, null, 2),
            },
          ],
        }
      }
      
      case 'generate_summary': {
        const { timeframe, notebook, format } = args as any
        
        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        
        switch (timeframe) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
          case 'all':
            startDate = new Date(0)
            break
        }
        
        const whereClause: any = {
          userId,
          isTrashed: false,
          updatedAt: { gte: startDate },
        }
        
        if (notebook) {
          whereClause.notebook = notebook
        }
        
        const notes = await prisma.note.findMany({
          where: whereClause,
          orderBy: { updatedAt: 'desc' },
          include: {
            tags: {
              include: { tag: true }
            }
          },
        })
        
        let summary = ''
        
        switch (format) {
          case 'brief':
            summary = `Found ${notes.length} notes in the ${timeframe} timeframe.`
            if (notes.length > 0) {
              summary += `\n\nMost recent notes:\n${notes.slice(0, 5)
                .map(n => `- ${n.title}`)
                .join('\n')}`
            }
            break
            
          case 'detailed':
            summary = `# Summary Report - ${timeframe}\n\n`
            summary += `Total notes: ${notes.length}\n\n`
            
            // Group by notebook
            const byNotebook = notes.reduce((acc: any, note) => {
              acc[note.notebook] = acc[note.notebook] || []
              acc[note.notebook].push(note)
              return acc
            }, {})
            
            for (const [nb, nbNotes] of Object.entries(byNotebook) as any) {
              summary += `## ${nb} (${nbNotes.length} notes)\n`
              summary += nbNotes.slice(0, 3)
                .map((n: any) => `- **${n.title}** - ${n.updatedAt.toLocaleDateString()}`)
                .join('\n')
              summary += '\n\n'
            }
            break
            
          case 'bullet-points':
            summary = notes
              .map(n => `- ${n.title} [${n.notebook}] ${n.tags.map((t: any) => `#${t.tag.name}`).join(' ')}`)
              .join('\n')
            break
            
          case 'report':
            const wordCount = notes.reduce((acc, n) => 
              acc + n.content.split(/\s+/).length, 0
            )
            
            summary = `# Knowledge Base Report\n\n`
            summary += `**Period:** ${timeframe}\n`
            summary += `**Generated:** ${new Date().toISOString()}\n\n`
            summary += `## Statistics\n`
            summary += `- Total Notes: ${notes.length}\n`
            summary += `- Total Words: ${wordCount.toLocaleString()}\n`
            summary += `- Average Words per Note: ${Math.round(wordCount / notes.length)}\n\n`
            summary += `## Notebooks\n`
            
            const notebookStats = Object.entries(byNotebook)
              .map(([nb, nbNotes]: any) => ({
                name: nb,
                count: nbNotes.length,
                words: nbNotes.reduce((acc: number, n: any) => 
                  acc + n.content.split(/\s+/).length, 0
                ),
              }))
              .sort((a, b) => b.count - a.count)
            
            summary += notebookStats
              .map(ns => `- **${ns.name}**: ${ns.count} notes, ${ns.words.toLocaleString()} words`)
              .join('\n')
            break
        }
        
        return {
          content: [
            {
              type: 'text',
              text: summary,
            },
          ],
        }
      }
      
      default:
        throw new McpError(ErrorCode.InvalidRequest, `Unknown tool: ${name}`)
    }
  } catch (error) {
    console.error('Tool execution error:', error)
    throw new McpError(ErrorCode.InternalError, 'Tool execution failed')
  }
})

// Start the server
async function main() {
  console.log('Starting Viny MCP Server...')
  
  try {
    await prisma.$connect()
    console.log('Connected to database')
    
    const transport = new StdioServerTransport()
    await server.connect(transport)
    
    console.log('Viny MCP Server is running')
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})

main().catch(console.error)