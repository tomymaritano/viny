# Nototo 📝

> A modern, professional markdown note editor built for productivity and focus.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![MVP Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen.svg)](./CURRENT_STATUS_2025.md)

Nototo is a professional-grade markdown editor featuring an Inkdrop-inspired dark theme, real-time preview, and advanced editing capabilities powered by CodeMirror 6. Built with modern React and optimized for performance and reliability.

![Nototo Screenshot](docs/screenshot.png)

## ✨ Features

### 🎯 Core Features

- **CodeMirror 6 Editor** - Next-generation editor with superior performance
- **Split View Preview** - Real-time markdown rendering with scroll synchronization
- **Inkdrop-inspired Theme** - Professional dark theme optimized for long sessions
- **Intelligent Auto-Save** - Per-note debouncing with concurrency control
- **Template System** - Pre-built templates for daily notes, meetings, projects

### 📋 Organization & Management

- **Smart Notebooks** - Organize notes with dynamic counters and filtering
- **Colorful Tags** - Customizable tag colors with intelligent auto-assignment
- **Full-Text Search** - Instant search across titles, content, tags, and notebooks
- **Pinned Notes** - Keep important notes accessible at the top
- **Status Workflow** - Track progress: none → active → on-hold → completed/dropped

### 💾 Robust Data Handling

- **Offline-First** - LocalStorage with robust error handling and recovery
- **Concurrency Control** - Prevents data loss from simultaneous operations
- **Auto-Backup** - Intelligent data persistence with queue management
- **Export Ready** - Multiple export formats (coming soon)

### 🔧 Technical Excellence

- **React 18 + Vite** - Modern, fast development and production builds
- **Zustand State** - Lightweight, efficient state management
- **Lazy Loading** - Performance-optimized component loading
- **Error Boundaries** - Graceful error handling throughout the app

## 🚀 Quick Start

### Choose Your Speed ⚡

**🏃‍♂️ FASTEST - Hybrid Development (Recommended)**

```bash
git clone https://github.com/your-username/nototo.git
cd nototo
npm install
make dev-fast    # Backend in Docker + Frontend local (~5s startup)
```

**⚡ INSTANT - Local Development**

```bash
make dev-local   # Frontend only with localStorage (~2s startup)
```

**🐳 TRADITIONAL - Full Docker**

```bash
make install     # Full Docker setup (~30s startup)
```

**🤖 SMART - Auto-detect Best Mode**

```bash
npm run dev:smart    # Automatically chooses fastest option
```

**Access Points:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

> 💡 **New to the project?** Try `npm run dev:smart` - it automatically detects the best development mode for your system!

### Manual Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Setup database
npm run db:push

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd ..
npm run dev
```

## 📁 Project Structure

```
nototo/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── stores/            # State management
│   └── plugins/           # Plugin system
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── prisma/           # Database schema and migrations
├── docs/                  # Documentation
├── docker-compose*.yml    # Docker configurations
└── Makefile              # Development commands
```

## 🛠 Development

### Fast Development Commands ⚡

```bash
# Recommended Development Modes
make dev-fast             # Hybrid: Backend Docker + Frontend local (5s)
make dev-local            # Local: Frontend only with localStorage (2s)
make dev-local-full       # Local: Full stack locally (3s)
npm run dev:smart         # Smart: Auto-detect best mode

# Traditional Docker Development
make dev                  # Full Docker development environment
make dev-optimized        # Optimized Docker with better caching
make dev-logs             # View development logs
make dev-stop             # Stop development environment

# Backend Management
make backend-only         # Start only backend container
make backend-stop         # Stop backend container
make backend-logs         # View backend logs only

# Local Setup
make setup-local          # Setup local development environment

# Database
make db-push              # Apply database schema
make db-studio            # Open Prisma Studio

# Production
make build                # Build production images
make start                # Start production environment
make stop                 # Stop production environment

# Utilities
make logs                 # View logs
make health               # Check service health
make clean                # Clean up containers and images
```

See [`Makefile`](Makefile) for all available commands.

**📚 Need help choosing a development mode?** Check the [Development Quick Start Guide](DEVELOPMENT-QUICK-START.md) for a simple comparison and troubleshooting tips.

### Development Workflow

1. **Setup**: `make install`
2. **Develop**: Edit files in `src/` or `server/src/`
3. **Test**: Changes auto-reload in development
4. **Database**: Use `make db-studio` to view data
5. **Deploy**: `make build && make start`

## 🐳 Docker Configuration

### Development

- **Hot reload** for both frontend and backend
- **Volume mounts** for source code
- **Persistent database** across restarts
- **Network isolation** between services

### Production

- **Multi-stage builds** for optimized images
- **Nginx** serving frontend with caching
- **Health checks** for all services
- **Restart policies** for reliability
- **Log rotation** and management

## 🔧 Configuration

### Environment Variables

**Backend** (`server/.env`):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=file:./nototo.db
```

**Frontend** (`.env`):

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Storage Modes

Nototo supports two storage modes:

1. **API Mode** (Default)
   - Full backend with SQLite database
   - REST API for all operations
   - Real-time synchronization
   - Advanced features (search, filtering, etc.)

2. **LocalStorage Mode** (Fallback)
   - Browser localStorage only
   - No backend required
   - Automatic migration when switching modes
   - Perfect for quick setup or offline use

Switch between modes using the toggle in the bottom-left corner.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Plugin Development](docs/PLUGIN-API.md)
- [API Reference](server/README.md)

## 🔌 Plugin System

Nototo features an extensible plugin system:

```javascript
// Example plugin
const myPlugin = {
  name: 'My Plugin',
  version: '1.0.0',
  initialize(api) {
    // Access to notes API, editor, and UI
    api.editor.onKeyPress(e => {
      // Handle key events
    })
  },
}
```

See [Plugin Development Guide](docs/PLUGIN-API.md) for details.

## 🗺️ Roadmap

### 🔍 Search Enhancements ![Low Priority](https://img.shields.io/badge/Priority-Low-lightgrey)

- **Advanced Search Filters UI** - Visual filter panel in search modal with date pickers and multi-select options
- **Search Analytics & Insights** - Popular searches statistics and intelligent suggestions based on usage patterns
- **Enhanced Search Experience** - Additional shortcuts (Cmd+Shift+F), expanded previews, and result navigation
- **Search Context Features** - Context highlighting in snippets and bookmark frequent searches

### 🎨 UX/UI Improvements ![Low Priority](https://img.shields.io/badge/Priority-Low-lightgrey)

- **Performance Optimizations** - Virtual scrolling for large result sets and search result caching
- **Advanced Navigation** - Navigate between search matches within notes and improved keyboard shortcuts
- **Smart Suggestions** - AI-powered search suggestions and related notes recommendations

### 🚀 Advanced Features ![Low Priority](https://img.shields.io/badge/Priority-Low-lightgrey)

- **RAG-powered Search** - Semantic search capabilities using embeddings and LLM integration
- **Cross-note Linking** - Automatic detection and suggestion of related notes
- **Search Workspaces** - Save and organize complex search queries and filters

For detailed timeline and implementation details, see our [Complete Roadmap](docs/ROADMAP.md).

## 🏗 Technology Stack

### Frontend

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety (backend only)
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - VS Code editor component
- **Marked** - Markdown parsing
- **DOMPurify** - XSS protection

### Backend

- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Full type safety
- **Prisma ORM** - Database toolkit
- **SQLite** - Embedded database
- **Zod** - Schema validation
- **JWT** - Authentication (future)

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Production web server
- **Makefile** - Development automation

## 🚢 Deployment

### Production Deployment

```bash
# Clone and build
git clone https://github.com/your-username/nototo.git
cd nototo

# Start production environment
make build
make start

# Check status
make health
```

### Cloud Deployment

- **Railway**: One-click deployment
- **Heroku**: Container deployment
- **DigitalOcean**: Docker droplet
- **AWS/GCP**: Container services

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run integration tests with Docker
make test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's excellent web editor
- **Solarized** - Ethan Schoonover's beautiful color scheme
- **Obsidian** & **Inkdrop** - Inspiration for note-taking UX
- **React** & **Node.js** communities - Amazing ecosystems

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/your-username/nototo/issues)
- 💬 [Discussions](https://github.com/your-username/nototo/discussions)

---

Made with ❤️ for writers, developers, and anyone who loves clean, focused note-taking.

**Nototo** - _Where thoughts become organized._
