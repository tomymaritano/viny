# Nototo Backend

Backend server for Nototo - A single-user markdown note editor.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **SQLite** + **Prisma ORM** - Database
- **Zod** - Schema validation
- **CORS**, **Helmet** - Security middleware

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database and apply schema
npm run db:push

# Start development server
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Notes
- `GET /api/notes` - Get all notes (with filtering)
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Notebooks
- `GET /api/notebooks` - Get all notebooks
- `POST /api/notebooks` - Create new notebook
- `PUT /api/notebooks/:id` - Update notebook
- `DELETE /api/notebooks/:id` - Delete notebook

### Migration & Backup
- `POST /api/migration/import` - Import from localStorage
- `GET /api/migration/export` - Export all data
- `GET /api/migration/stats` - Database statistics
- `POST /api/migration/reset` - Reset database (dev only)

## Query Parameters

### Notes Filtering
```
GET /api/notes?notebook=Work&status=draft&isPinned=true&search=project
```

Available filters:
- `notebook` - Filter by notebook name
- `status` - Filter by status (draft, in-progress, review, completed, archived)
- `isPinned` - Filter pinned notes (true/false)
- `isTrashed` - Filter trashed notes (true/false)
- `tags` - Filter by tags (comma-separated)
- `search` - Search in title and content
- `limit` - Limit results (default: 50, max: 100)
- `offset` - Skip results (default: 0)

## Database Schema

### Notes
```sql
- id: INTEGER PRIMARY KEY
- title: TEXT NOT NULL
- content: TEXT NOT NULL
- preview: TEXT
- notebook: TEXT (default: 'Personal')
- status: TEXT (default: 'draft')
- is_pinned: BOOLEAN (default: false)
- is_trashed: BOOLEAN (default: false)
- created_at: DATETIME
- updated_at: DATETIME
- trashed_at: DATETIME
```

### Tags
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT UNIQUE
- color: TEXT (default: '#268bd2')
```

### Notebooks
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT UNIQUE
- color: TEXT (default: '#268bd2')
- created_at: DATETIME
```

## Development

```bash
# Watch mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:studio     # Open Prisma Studio
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
```

## Data Migration

To migrate from localStorage to database:

```bash
# Export your current localStorage data from frontend
# Then POST to /api/migration/import with the data

curl -X POST http://localhost:3001/api/migration/import \
  -H "Content-Type: application/json" \
  -d '{"notes": [...]}'
```

## Environment Variables

```bash
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment
DATABASE_URL="file:./nototo.db"  # SQLite database path
```

## Production Deployment

1. Build the project: `npm run build`
2. Set environment variables
3. Run: `npm start`

The SQLite database file will be created automatically on first run.

## File Structure

```
server/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── nototo.db          # SQLite database (auto-generated)
├── src/
│   ├── controllers/       # Route handlers
│   ├── routes/           # Express routes
│   ├── middleware/       # Custom middleware
│   ├── types/           # TypeScript types & schemas
│   ├── utils/           # Utility functions
│   └── index.ts         # Main server file
├── dist/                # Compiled JavaScript (after build)
└── package.json
```