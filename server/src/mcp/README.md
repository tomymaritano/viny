# Viny MCP Server

This directory contains the Model Context Protocol (MCP) server implementation for Viny, enabling integration with Claude Desktop.

## Structure

```
mcp/
├── server.ts        # Main MCP server implementation
├── auth.ts          # Authentication service
├── package.json     # Dependencies
├── tsconfig.json    # TypeScript config
└── README.md        # This file
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Set environment variables:**
   ```bash
   export MCP_JWT_SECRET="your-secret-key"
   export DATABASE_URL="file:../../../prisma/nototo.db"
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

## Development

For development with auto-reload:
```bash
npm run dev
```

## Authentication

The MCP server uses JWT tokens for authentication. Generate a token using the API:

```bash
curl -X POST http://localhost:3000/api/auth/mcp-token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

## Resources

The server exposes the following MCP resources:

- `viny://notes` - All notes
- `viny://notebooks` - All notebooks
- `viny://tags` - All tags
- `viny://search` - Search interface
- `viny://analytics` - Usage analytics

## Tools

Available MCP tools:

- `search_notes` - Advanced search with filters
- `create_note` - Create new notes
- `update_note` - Update existing notes
- `analyze_content` - Content analysis
- `generate_summary` - Generate summaries

## Security

- All requests require authentication
- Tokens expire after 30 days
- Granular permission scopes
- Request logging for audit trail

## Testing

Test the MCP server locally:

```bash
# Start the server
npm start

# In another terminal, send a test request
echo '{"jsonrpc": "2.0", "method": "resources/list", "id": 1}' | node dist/server.js
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL path
   - Ensure database file exists
   - Verify file permissions

2. **Authentication failures**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure user exists in database

3. **Missing dependencies**
   - Run `npm install`
   - Check Node.js version (>=18)

### Debug Mode

Enable debug logging:
```bash
export DEBUG=viny:mcp:*
npm start
```

## Integration with Claude Desktop

See the main [MCP Integration Guide](../../docs/MCP_INTEGRATION.md) for Claude Desktop setup instructions.