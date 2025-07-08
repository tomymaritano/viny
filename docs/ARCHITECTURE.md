# Architecture Overview

> Understanding Nototo's technical architecture and design decisions

## 🏗 System Architecture

Nototo follows a modern, containerized architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                       │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │   React App     │  │      Monaco Editor              │ │
│  │  (Frontend)     │  │    (Code Editor)                │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                        │
│                                                         │
│  ┌─────────────────┐              ┌─────────────────┐   │
│  │    Frontend     │              │     Backend     │   │
│  │   Container     │              │   Container     │   │
│  │   (Nginx)       │              │ (Node.js/Express)│   │
│  └─────────────────┘              └─────────────────┘   │
│                                             │            │
│                                             │            │
│                                             ▼            │
│                                   ┌─────────────────┐   │
│                                   │   SQLite DB     │   │
│                                   │  (Persistent    │   │
│                                   │   Volume)       │   │
│                                   └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

### Frontend Architecture (`/src`)

```
src/
├── components/          # React components
│   ├── MarkdownEditor.jsx      # Main editor component
│   ├── Settings.jsx            # Application settings
│   ├── sections/               # UI sections
│   ├── PluginManager.jsx       # Plugin management
│   └── ApiStatus.jsx           # Storage mode toggle
├── hooks/               # Custom React hooks
│   ├── useNotes.js             # Notes management logic
│   ├── useNotesApi.js          # API integration hook
│   └── usePlugins.js           # Plugin system hook
├── services/            # External service interfaces
│   └── api.js                  # Backend API client
├── stores/              # State management
│   └── settingsStore.js        # Application settings
├── plugins/             # Plugin system
│   ├── core/                   # Core plugin functionality
│   └── examples/               # Example plugins
└── App.jsx              # Main application component
```

### Backend Architecture (`/server`)

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── notesController.ts  # Notes CRUD operations
│   │   ├── tagsController.ts   # Tags management
│   │   └── healthController.ts # Health checks
│   ├── routes/          # Express route definitions
│   │   ├── notes.ts            # Notes API routes
│   │   ├── tags.ts             # Tags API routes
│   │   └── health.ts           # Health check routes
│   ├── middleware/      # Custom middleware
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── validation.ts       # Request validation
│   │   └── cors.ts             # CORS configuration
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts            # Shared types and schemas
│   ├── utils/           # Utility functions
│   │   ├── database.ts         # Database utilities
│   │   └── logger.ts           # Logging utilities
│   └── index.ts         # Application entry point
├── prisma/              # Database schema and migrations
│   ├── schema.prisma           # Database schema definition
│   └── migrations/             # Database migration files
└── package.json         # Backend dependencies
```

## 🔧 Technology Stack

### Frontend Technologies

| Technology        | Purpose                 | Version |
| ----------------- | ----------------------- | ------- |
| **React**         | UI Framework            | 18+     |
| **Vite**          | Build Tool & Dev Server | Latest  |
| **Monaco Editor** | Code Editor Component   | Latest  |
| **Tailwind CSS**  | Styling Framework       | Latest  |
| **Marked**        | Markdown Parser         | Latest  |
| **DOMPurify**     | XSS Protection          | Latest  |

### Backend Technologies

| Technology     | Purpose             | Version |
| -------------- | ------------------- | ------- |
| **Node.js**    | Runtime Environment | 18+     |
| **Express.js** | Web Framework       | Latest  |
| **TypeScript** | Type Safety         | 5+      |
| **Prisma**     | Database ORM        | Latest  |
| **SQLite**     | Database            | Latest  |
| **Zod**        | Schema Validation   | Latest  |

### DevOps & Infrastructure

| Technology         | Purpose                     | Version |
| ------------------ | --------------------------- | ------- |
| **Docker**         | Containerization            | Latest  |
| **Docker Compose** | Multi-service Orchestration | Latest  |
| **Nginx**          | Production Web Server       | Latest  |
| **Make**           | Build Automation            | System  |

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Notes    │    │    Tags     │    │  Notebooks  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ title       │    │ name        │    │ name        │
│ content     │    │ color       │    │ description │
│ status      │    │ createdAt   │    │ color       │
│ isPinned    │    │ updatedAt   │    │ createdAt   │
│ notebookId  │────┤             │    │ updatedAt   │
│ createdAt   │    └─────────────┘    └─────────────┘
│ updatedAt   │           │
└─────────────┘           │
       │                  │
       │            ┌─────────────┐
       │            │  NoteTags   │
       │            ├─────────────┤
       └────────────│ noteId (FK) │
                    │ tagId (FK)  │
                    └─────────────┘
```

### Schema Details

```prisma
// Notes table - Core content storage
model Note {
  id         String   @id @default(cuid())
  title      String
  content    String
  status     String   @default("draft")
  isPinned   Boolean  @default(false)
  notebookId String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  notebook   Notebook? @relation(fields: [notebookId], references: [id])
  tags       NoteTag[]
}

// Tags for categorization
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String   @default("#3b82f6")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  notes     NoteTag[]
}

// Notebooks for organization
model Notebook {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String   @default("#6b7280")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  notes       Note[]
}

// Many-to-many relationship table
model NoteTag {
  noteId String
  tagId  String

  // Relations
  note   Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([noteId, tagId])
}
```

## 🔄 Data Flow

### 1. Note Creation Flow

```
User → Frontend → API → Database
  │       │        │        │
  │       │        │        └─ Prisma.note.create()
  │       │        └─ POST /api/notes + Zod validation
  │       └─ React state update
  └─ Creates new note
```

### 2. Search Flow

```
User → Frontend → API → Database
  │       │        │        │
  │       │        │        └─ Prisma full-text search
  │       │        └─ GET /api/notes?search=query
  │       └─ Display filtered results
  └─ Types search query
```

## 🏪 Storage Architecture

### Dual Storage Mode

Nototo supports two storage modes for maximum flexibility:

#### 1. API Mode (Production)

- **Backend**: Express.js + SQLite + Prisma
- **Features**: Full CRUD, search, filtering, real-time sync
- **Use Case**: Production deployment, multi-device sync

#### 2. LocalStorage Mode (Fallback)

- **Storage**: Browser localStorage
- **Features**: Basic CRUD, offline functionality
- **Use Case**: Development, offline use, quick setup

### Storage Migration

```javascript
// Automatic migration when switching modes
const migrateData = async (from, to) => {
  if (from === 'localStorage' && to === 'api') {
    const localNotes = JSON.parse(localStorage.getItem('notes') || '[]')
    for (const note of localNotes) {
      await api.createNote(note)
    }
    localStorage.clear()
  }
}
```

## 🔌 Plugin Architecture

### Plugin System Design

```javascript
// Plugin Interface
interface Plugin {
  name: string
  version: string
  description?: string

  // Lifecycle hooks
  initialize?(api: PluginAPI): void
  destroy?(): void

  // Feature hooks
  onNoteCreate?(note: Note): void
  onNoteUpdate?(note: Note): void
  onNoteDelete?(noteId: string): void
}

// Plugin API
interface PluginAPI {
  notes: NotesAPI
  editor: EditorAPI
  ui: UIAPI
  storage: StorageAPI
}
```

### Plugin Loading

```javascript
// Dynamic plugin loading
const loadPlugin = async pluginPath => {
  const module = await import(pluginPath)
  const plugin = module.default || module

  // Validate plugin structure
  if (!plugin.name || !plugin.version) {
    throw new Error('Invalid plugin structure')
  }

  // Initialize plugin with API access
  if (plugin.initialize) {
    plugin.initialize(createPluginAPI())
  }

  return plugin
}
```

## 🛡 Security Considerations

### Input Validation

- **Zod schemas** for all API endpoints
- **DOMPurify** for markdown content sanitization
- **Input length limits** to prevent abuse

### CORS Configuration

```javascript
// Secure CORS setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourapp.com']
        : ['http://localhost:5173'],
    credentials: true,
  })
)
```

### Content Security Policy

```nginx
# Nginx CSP headers
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
```

## 📈 Performance Optimizations

### Frontend Optimizations

- **Code splitting** with React.lazy()
- **Memo optimization** for expensive components
- **Virtual scrolling** for large note lists
- **Debounced search** to reduce API calls

### Backend Optimizations

- **Database indexing** on frequently queried fields
- **Connection pooling** for database connections
- **Response compression** with gzip
- **Request rate limiting** to prevent abuse

### Docker Optimizations

- **Multi-stage builds** for smaller images
- **Layer caching** for faster rebuilds
- **Health checks** for reliability
- **Resource limits** for stability

## 🔧 Configuration Management

### Environment Variables

#### Backend Configuration

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=file:./nototo.db

# Security
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
```

#### Frontend Configuration

```env
# API
VITE_API_BASE_URL=http://localhost:3001/api

# Features
VITE_ENABLE_PLUGINS=true
VITE_ENABLE_ANALYTICS=false
```

## 🚀 Deployment Architecture

### Development Environment

```yaml
# docker-compose.dev.yml
services:
  backend:
    build:
      target: development
    volumes:
      - ./server:/app # Hot reload
    ports:
      - '3001:3001'

  frontend:
    build:
      target: development
    volumes:
      - ./src:/app/src # Hot reload
    ports:
      - '5173:5173'
```

### Production Environment

```yaml
# docker-compose.yml
services:
  backend:
    build:
      target: production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', 'http://localhost:3001/health']

  frontend:
    build:
      target: production
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
```

## 🔄 Future Architecture Considerations

### Potential Enhancements

1. **Multi-user Support**
   - User authentication (JWT)
   - Role-based access control
   - Shared notebooks and collaboration

2. **Real-time Features**
   - WebSocket connections
   - Live collaborative editing
   - Real-time notifications

3. **Cloud Storage Integration**
   - S3-compatible storage for attachments
   - Backup and sync services
   - CDN for asset delivery

4. **Microservices Architecture**
   - Separate auth service
   - Dedicated search service (Elasticsearch)
   - File storage service

5. **Advanced Features**
   - Full-text search with Elasticsearch
   - Version control for notes (Git-like)
   - Advanced plugin marketplace
   - Mobile app with React Native

## 📚 Related Documentation

- [Development Guide](DEVELOPMENT.md) - Setup and development workflow
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Plugin API](PLUGIN-API.md) - Plugin development documentation
- [API Reference](../server/README.md) - Backend API documentation

---

This architecture document provides a comprehensive overview of Nototo's technical design. For specific implementation details, refer to the related documentation files.
