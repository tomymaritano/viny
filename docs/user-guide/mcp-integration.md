# Using Viny with Claude Desktop

## What is MCP?

The Model Context Protocol (MCP) allows Claude Desktop to connect directly to your Viny notes, enabling powerful AI-assisted workflows. Think of it as giving Claude a window into your knowledge base.

## What Can You Do?

With MCP integration, you can:

- **Search Your Notes**: Ask Claude to find specific information
- **Generate Summaries**: Create daily, weekly, or topic-based summaries
- **Analyze Patterns**: Discover themes and connections in your notes
- **Create Content**: Generate new notes based on conversations
- **Get Insights**: Understand your note-taking habits and knowledge gaps

## Getting Started

### 1. Enable MCP in Viny

1. Open Viny Settings (⚙️)
2. Navigate to the "MCP" tab
3. Toggle "Enable MCP" to ON
4. Generate an authentication token:
   - Enter your Viny email and password
   - Click "Generate Token"
   - Copy the generated token

### 2. Configure Claude Desktop

1. Find your Claude Desktop config file:
   - **Mac**: `~/.claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.claude/claude_desktop_config.json`

2. Add the Viny MCP server configuration:

```json
{
  "mcpServers": {
    "viny": {
      "command": "node",
      "args": ["/path/to/viny/server/src/mcp/dist/server.js"],
      "env": {
        "MCP_JWT_SECRET": "your-jwt-secret",
        "DATABASE_URL": "file:/path/to/viny/nototo.db"
      }
    }
  }
}
```

3. Restart Claude Desktop

### 3. Verify Connection

Ask Claude: "Can you access my Viny notes?"

If configured correctly, Claude will confirm access to your knowledge base.

## Example Conversations

### Finding Information

```
You: "What notes do I have about React hooks?"
Claude: I'll search your notes for React hooks...
[Claude searches and presents relevant notes]
```

### Creating Summaries

```
You: "Summarize my notes from this week"
Claude: I'll generate a summary of your recent notes...
[Claude creates a formatted weekly summary]
```

### Analyzing Content

```
You: "What are the main themes in my project notes?"
Claude: Let me analyze your project notes for common themes...
[Claude identifies patterns and key topics]
```

### Generating Reports

```
You: "Create a knowledge base report for my machine learning notes"
Claude: I'll analyze your ML notes and create a comprehensive report...
[Claude generates detailed analysis with statistics]
```

## Privacy & Security

### What Claude Can Access

- ✅ Your notes (not in trash)
- ✅ Notebooks and tags
- ✅ Note metadata (dates, status)
- ✅ Basic analytics

### What Claude Cannot Access

- ❌ Your password
- ❌ Deleted notes
- ❌ Other users' data
- ❌ System settings

### Security Features

- **Token-based auth**: Secure authentication
- **30-day expiry**: Tokens auto-expire
- **Audit logging**: All requests are logged
- **Local only**: Data never leaves your machine

## Tips for Best Results

### 1. Be Specific

Instead of: "Find my notes"
Try: "Find my notes about TypeScript interfaces from last month"

### 2. Use Natural Language

Claude understands context, so speak naturally:

- "I have a meeting about the API redesign tomorrow. What do my notes say?"
- "Help me understand what I've learned about Docker"

### 3. Combine Operations

You can ask for complex workflows:

- "Search for all my React notes, identify gaps in my knowledge, and suggest what to study next"

### 4. Save Useful Prompts

Keep a note with prompts that work well:

```markdown
# Useful Claude Prompts

- Weekly summary: "Summarize my notes from the past week, grouped by notebook"
- Project status: "Based on my project notes, create a status update"
- Learning review: "Analyze my study notes and create flashcards"
```

## Troubleshooting

### "Cannot connect to Viny"

1. Check if MCP is enabled in Viny settings
2. Verify the server path in your config
3. Ensure your token hasn't expired
4. Check Claude Desktop logs

### "Authentication failed"

1. Generate a new token in Viny
2. Update the token in your Claude config
3. Restart Claude Desktop

### "No notes found"

1. Verify you have notes in Viny
2. Check if notes are in trash
3. Try a broader search query

## Advanced Usage

### Custom Workflows

Create templates for common tasks:

**Daily Review**

```
"Review my notes from today, identify key accomplishments and open tasks, then create a summary for tomorrow's standup"
```

**Research Assistant**

```
"I'm researching [topic]. Check my existing notes, summarize what I know, identify gaps, and suggest resources"
```

**Content Creation**

```
"Based on my notes about [topic], create a blog post outline with references to specific notes"
```

### Keyboard Shortcuts

Configure global shortcuts in Claude Desktop:

- `Cmd+Shift+N`: Quick note to Viny
- `Cmd+Shift+F`: Search Viny notes

## FAQ

**Q: Is my data sent to Claude's servers?**
A: No, MCP runs locally. Your notes never leave your machine.

**Q: Can I use MCP with multiple Viny accounts?**
A: Yes, but you'll need separate Claude Desktop profiles.

**Q: How often should I regenerate tokens?**
A: Tokens expire after 30 days. Regenerate monthly for security.

**Q: Can Claude edit my notes?**
A: Yes, with the appropriate permissions. Always review changes.

## Getting Help

- Check the [MCP Integration Guide](/docs/MCP_INTEGRATION.md)
- View [example prompts](/.claude/example-prompts.md)
- Report issues on GitHub
- Contact support

---

Happy note-taking with Claude! 🤖📝
