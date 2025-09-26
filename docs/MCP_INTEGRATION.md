# Viny MCP Integration Guide

## Overview

Viny now supports the Model Context Protocol (MCP), allowing Claude Desktop to directly interact with your notes, notebooks, and tags. This integration enables powerful AI-assisted workflows for knowledge management, analysis, and content generation.

## Architecture

### MCP Server Components

```
server/src/mcp/
├── server.ts      # Main MCP server implementation
├── auth.ts        # Authentication service for MCP tokens
├── package.json   # MCP server dependencies
└── tsconfig.json  # TypeScript configuration
```

### Exposed Resources

1. **`viny://notes`** - Access all notes in your knowledge base
2. **`viny://notebooks`** - List all notebooks/categories
3. **`viny://tags`** - View all tags with usage counts
4. **`viny://search`** - Advanced search interface
5. **`viny://analytics`** - Get insights about your notes

### Available Tools

1. **`search_notes`** - Advanced search with filters
2. **`create_note`** - Create new notes
3. **`update_note`** - Update existing notes
4. **`analyze_content`** - Analyze notes for patterns and insights
5. **`generate_summary`** - Generate summaries of your notes

## Installation & Setup

### 1. Build the MCP Server

```bash
# Navigate to the MCP directory
cd server/src/mcp

# Install dependencies
npm install

# Build the server
npm run build
```

### 2. Generate MCP Token

First, create a dedicated MCP token for Claude Desktop:

```bash
# Use the Viny CLI or API to generate a token
curl -X POST http://localhost:3000/api/auth/mcp-token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the returned token securely.

### 3. Configure Claude Desktop

Add the following to your Claude Desktop configuration file:

#### macOS/Linux: `~/.claude/claude_desktop_config.json`

#### Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "viny": {
      "command": "node",
      "args": ["/path/to/viny/server/src/mcp/dist/server.js"],
      "env": {
        "MCP_JWT_SECRET": "your-jwt-secret-from-env",
        "DATABASE_URL": "file:/path/to/viny/server/prisma/nototo.db"
      }
    }
  }
}
```

### 4. Verify Connection

Restart Claude Desktop and verify the connection by asking:

- "What MCP servers are available?"
- "Can you access my Viny notes?"

## Security Configuration

### Authentication

Every MCP request requires authentication via JWT token. Include the token in your tool calls:

```typescript
{
  "authToken": "your-mcp-token-here"
}
```

### Scope Management

MCP tokens have granular scopes:

- `notes.read` - Read notes
- `notes.write` - Create/update notes
- `notes.delete` - Delete notes
- `notebooks.read` - Read notebooks
- `notebooks.write` - Manage notebooks
- `tags.read` - Read tags
- `tags.write` - Manage tags
- `analytics.read` - Access analytics

### Privacy Controls

Configure privacy settings in `server/.env`:

```env
# MCP Configuration
MCP_ENABLED=true
MCP_JWT_SECRET=your-secret-key
MCP_ALLOWED_ORIGINS=claude://desktop
MCP_RATE_LIMIT=100
MCP_LOG_REQUESTS=true
```

## Usage Examples

### 1. Analyzing Your Knowledge Base

**Prompt:** "Analyze my notes about machine learning and identify key themes"

Claude will:

1. Use `search_notes` to find ML-related notes
2. Use `analyze_content` to extract themes
3. Present organized insights

### 2. Weekly Summary Generation

**Prompt:** "Generate a summary of all my notes from this week"

Claude will:

1. Use `generate_summary` with `timeframe: 'week'`
2. Format the summary based on your preference
3. Highlight important items

### 3. Smart Note Creation

**Prompt:** "Create a note summarizing our discussion about project architecture"

Claude will:

1. Use context from the conversation
2. Call `create_note` with formatted content
3. Apply appropriate tags and notebook

### 4. Knowledge Patterns

**Prompt:** "Find patterns in my meeting notes and suggest improvements"

Claude will:

1. Search for meeting notes
2. Analyze content for patterns
3. Provide actionable suggestions

### 5. Cross-Reference Analysis

**Prompt:** "Show me connections between my notes on React and TypeScript"

Claude will:

1. Search both topics
2. Identify overlapping concepts
3. Suggest related notes

## Advanced Workflows

### Research Assistant

```
"Help me research [topic]. Check if I have existing notes,
summarize what I already know, and suggest areas to explore."
```

### Content Generation

```
"Based on my notes about [topic], create a blog post draft
with proper structure and citations to my original notes."
```

### Knowledge Gaps

```
"Analyze my notes on [subject] and identify knowledge gaps
or areas where I need more information."
```

### Meeting Preparation

```
"I have a meeting about [topic] tomorrow. Summarize relevant
notes and create a prep document."
```

## Audit Logs

All MCP interactions are logged for security and debugging:

```typescript
{
  "timestamp": "2024-01-19T10:30:00Z",
  "userId": 1,
  "tool": "search_notes",
  "parameters": { "query": "react hooks" },
  "duration": 125,
  "status": "success"
}
```

View logs at: `server/logs/mcp-audit.log`

## Troubleshooting

### Connection Issues

1. Check Claude Desktop logs: `~/.claude/logs/`
2. Verify MCP server is running
3. Ensure correct path in config
4. Check JWT token validity

### Permission Errors

1. Verify token has required scopes
2. Check database file permissions
3. Ensure user exists in database

### Performance

1. Index frequently searched fields
2. Limit result sizes with pagination
3. Use caching for repeated queries

## Best Practices

### 1. Token Management

- Rotate MCP tokens monthly
- Use environment variables
- Never commit tokens to git

### 2. Query Optimization

- Be specific with search queries
- Use filters to narrow results
- Leverage notebooks for organization

### 3. Content Security

- Review generated content
- Set up backup before bulk operations
- Use read-only tokens when possible

### 4. Workflow Design

- Create template prompts
- Document common workflows
- Share useful prompts with team

## API Reference

### Search Options

```typescript
interface SearchOptions {
  query: string
  notebook?: string
  tags?: string[]
  status?: NoteStatus
  limit?: number
  offset?: number
}
```

### Note Creation

```typescript
interface CreateNoteParams {
  title: string
  content: string
  notebook?: string
  tags?: string[]
  status?: NoteStatus
}
```

### Analysis Types

- `summary` - Basic statistics
- `themes` - Extract common themes
- `entities` - Identify entities
- `sentiment` - Sentiment analysis
- `connections` - Find related notes

## Future Enhancements

1. **Semantic Search** - Vector embeddings for better search
2. **Smart Tagging** - AI-suggested tags
3. **Collaboration** - Share insights with team
4. **Automation** - Scheduled summaries and reports
5. **Integrations** - Connect with other tools

## Support

For issues or questions:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review server logs
3. Open an issue on GitHub
4. Contact support

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Compatible with:** Claude Desktop 1.0+
