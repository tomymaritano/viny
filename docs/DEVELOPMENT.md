# Development Guide

> Everything you need to know to develop and contribute to Viny

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Required)
- **Docker & Docker Compose** (Optional, for some modes)
- **Git** for version control

### Choose Your Development Mode

**🏃‍♂️ FASTEST - Hybrid Mode (Recommended)**

```bash
git clone https://github.com/your-username/viny.git
cd viny
npm install
make dev-fast
```

**⚡ INSTANT - Local Mode**

```bash
make setup-local
make dev-local        # Frontend only (localStorage)
# OR
make dev-local-full   # Full local (frontend + backend)
```

**🐳 TRADITIONAL - Docker Mode**

```bash
make dev             # Full Docker setup
# OR
make dev-optimized   # Optimized Docker with better caching
```

**🤖 SMART - Auto-detect Mode**

```bash
npm run dev:smart    # Automatically chooses best mode
```

## 📊 Development Mode Comparison

| Mode           | Startup Time | Features                 | Use Case                        |
| -------------- | ------------ | ------------------------ | ------------------------------- |
| **Hybrid**     | ~5 seconds   | Backend API + Hot reload | Daily development (recommended) |
| **Local**      | ~2 seconds   | localStorage only        | Quick changes, offline work     |
| **Local Full** | ~3 seconds   | Full API + Hot reload    | Fastest with all features       |
| **Docker**     | ~30 seconds  | Full isolation           | Production-like testing         |
| **Smart**      | Variable     | Auto-detects best        | New contributors                |

## 📁 Development Environment Details

### 🏃‍♂️ Hybrid Mode (Recommended for Daily Development)

**What it is**: Backend runs in Docker, frontend runs locally with npm
**Why it's fast**: Frontend changes are instant, backend provides full API functionality

```bash
# Start hybrid development
make dev-fast
# OR
npm run dev:fast

# Backend-only operations
make backend-only     # Start just the backend container
make backend-stop     # Stop backend container
make backend-logs     # View backend logs

# Check backend health
npm run check:backend
```

**Hybrid mode gives you:**

- ⚡ Instant frontend hot reload (no Docker overhead)
- 🗄️ Full database and API functionality
- 🔄 Backend hot reload in container
- 🚀 ~5 second startup time

### ⚡ Local Mode (Fastest Startup)

**What it is**: Everything runs locally with npm, no Docker required
**Why it's fastest**: No containerization overhead

```bash
# Setup local environment (one-time)
make setup-local

# Frontend only (localStorage mode)
make dev-local
npm run dev:local

# Full local (frontend + backend locally)
make dev-local-full
npm run dev:local-full

# Local backend management
npm run backend:local
```

**Local mode gives you:**

- 🚀 ~2-3 second startup time
- 💾 localStorage-only mode for quick iterations
- 🖥️ Optional full local backend
- 📱 Perfect for UI/UX development

### 🐳 Docker Development (Full Isolation)

**What it is**: Both frontend and backend in containers
**Why use it**: Production-like environment, dependency isolation

```bash
# Traditional Docker development
make dev

# Optimized Docker (better caching and performance)
make dev-optimized

# Background mode
make dev-detached

# Container management
make dev-logs         # View all logs
make backend-logs     # Backend logs only
make dev-stop         # Stop all containers

# Database operations
make db-push          # Apply schema changes
make db-studio        # Open Prisma Studio
```

**Docker mode gives you:**

- 🏗️ Production-like environment
- 🔒 Complete dependency isolation
- 🗄️ Consistent database state
- 🧪 Perfect for testing deployments

### 🤖 Smart Mode (Auto-Detection)

**What it is**: Automatically detects the best development mode for your system
**Why use it**: Perfect for new contributors or switching between machines

```bash
# Auto-detect and start best mode
npm run dev:smart

# With specific preferences
npm run dev:smart --hybrid   # Force hybrid mode
npm run dev:smart --local    # Force local mode
npm run dev:smart --docker   # Force Docker mode
```

### Manual Development Setup

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Setup database
cd server
npm run db:push
cd ..

# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

## 🔧 Development Workflow

### 1. Project Structure

```
viny/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── MarkdownEditor.jsx
│   │   ├── Settings.jsx
│   │   ├── sections/
│   │   ├── PluginManager.jsx
│   │   └── ApiStatus.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useNotes.js
│   │   ├── useNotesApi.js
│   │   └── usePlugins.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── stores/            # State management
│   └── plugins/           # Plugin system
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── prisma/           # Database schema
├── docs/                  # Documentation
├── examples/              # Example plugins and content
└── public/               # Static assets
```

### 2. Making Changes

#### Frontend Development

```bash
# Edit files in src/
# Changes auto-reload at http://localhost:5173

# Key files to know:
src/App.jsx                    # Main application
src/hooks/useNotes.js          # Core notes logic
src/components/MarkdownEditor.jsx  # Editor component
src/services/api.js            # Backend API client
```

#### Backend Development

```bash
# Edit files in server/src/
# Changes auto-reload at http://localhost:3001

# Key files to know:
server/src/index.ts               # Server entry point
server/src/controllers/notesController.ts  # Notes API
server/src/types/index.ts         # Shared types
server/prisma/schema.prisma       # Database schema
```

### 3. Database Development

```bash
# Make schema changes
# Edit server/prisma/schema.prisma

# Apply changes to development database
make db-push

# View data with Prisma Studio
make db-studio

# Reset database (careful!)
cd server && npm run db:reset
```

### 4. Plugin Development

```bash
# Create a new plugin
mkdir src/plugins/my-plugin
cd src/plugins/my-plugin

# Create plugin file
cat > index.js << 'EOF'
export default {
  name: 'My Plugin',
  version: '1.0.0',
  description: 'My awesome plugin',

  initialize(api) {
    console.log('Plugin initialized!', api)

    // Access notes API
    api.notes.onNoteCreate((note) => {
      console.log('Note created:', note.title)
    })

    // Access editor API
    api.editor.onKeyPress((e) => {
      if (e.key === 'Tab') {
        console.log('Tab pressed in editor')
      }
    })
  }
}
EOF
```

See [Plugin API Documentation](PLUGIN-API.md) for complete plugin development guide.

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test

# Integration tests with Docker
make test

# Run specific test
npm test -- --grep "should create note"
```

### Writing Tests

#### Frontend Tests (Jest + React Testing Library)

```javascript
// src/components/__tests__/MarkdownEditor.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import MarkdownEditor from '../MarkdownEditor'

test('should render editor with placeholder', () => {
  render(<MarkdownEditor />)
  expect(screen.getByPlaceholderText(/start writing/i)).toBeInTheDocument()
})

test('should update content on change', () => {
  const handleChange = jest.fn()
  render(<MarkdownEditor onChange={handleChange} />)

  const editor = screen.getByRole('textbox')
  fireEvent.change(editor, { target: { value: '# Hello World' } })

  expect(handleChange).toHaveBeenCalledWith('# Hello World')
})
```

#### Backend Tests (Jest + Supertest)

```typescript
// server/src/__tests__/notes.test.ts
import request from 'supertest'
import app from '../index'
import { prisma } from '../utils/database'

describe('Notes API', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany()
  })

  test('POST /api/notes should create a note', async () => {
    const noteData = {
      title: 'Test Note',
      content: '# Hello World',
      notebook: 'Personal',
    }

    const response = await request(app)
      .post('/api/notes')
      .send(noteData)
      .expect(201)

    expect(response.body).toMatchObject(noteData)
    expect(response.body.id).toBeDefined()
  })

  test('GET /api/notes should return all notes', async () => {
    // Create test data
    await prisma.note.create({
      data: { title: 'Test', content: 'Content' },
    })

    const response = await request(app).get('/api/notes').expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0].title).toBe('Test')
  })
})
```

## 🔍 Debugging

### Frontend Debugging

```bash
# Chrome DevTools
# Open http://localhost:5173 and press F12

# React Developer Tools
# Install browser extension for component debugging

# Verbose logging
# Edit src/services/api.js and enable debug mode
const DEBUG = true
```

### Backend Debugging

```bash
# Enable debug logging
cd server
NODE_ENV=development npm run dev

# Debug with Node Inspector
node --inspect-brk src/index.ts

# Database debugging
make db-studio  # Visual database browser
```

### Docker Debugging

```bash
# View logs
make dev-logs

# Enter container shell
make shell-backend
make shell-frontend

# Check container status
docker-compose -f docker-compose.dev.yml ps

# Reset everything
make clean
```

## 📦 Dependencies

### Adding Dependencies

#### Frontend Dependencies

```bash
# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Update all dependencies
npm update
```

#### Backend Dependencies

```bash
cd server

# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Add type definitions
npm install --save-dev @types/package-name
```

### Key Dependencies Overview

#### Frontend

```json
{
  "react": "^18.0.0", // UI framework
  "vite": "^5.0.0", // Build tool
  "@monaco-editor/react": "^4.0.0", // Code editor
  "marked": "^9.0.0", // Markdown parser
  "dompurify": "^3.0.0", // XSS protection
  "tailwindcss": "^3.0.0" // CSS framework
}
```

#### Backend

```json
{
  "express": "^4.18.0", // Web framework
  "prisma": "^5.0.0", // Database ORM
  "@prisma/client": "^5.0.0", // Database client
  "zod": "^3.22.0", // Schema validation
  "cors": "^2.8.5", // CORS middleware
  "typescript": "^5.0.0" // Type safety
}
```

## 🔧 Configuration

### Environment Variables

#### Development (.env.local)

```env
# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_PLUGINS=true
VITE_DEBUG_MODE=true

# Backend (server/.env)
NODE_ENV=development
PORT=3001
DATABASE_URL=file:./viny.db
CORS_ORIGIN=http://localhost:5173
```

#### Production

```env
# Frontend
VITE_API_BASE_URL=https://api.yourapp.com
VITE_ENABLE_PLUGINS=true
VITE_DEBUG_MODE=false

# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./viny.db
CORS_ORIGIN=https://yourapp.com
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Solarized color scheme
        base03: '#002b36',
        base02: '#073642',
        // ... rest of solarized colors
      },
    },
  },
  plugins: [],
}
```

### TypeScript Configuration

```json
// server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🚀 Build & Deploy

### Development Build

```bash
# Build frontend only
npm run build

# Build backend only
cd server && npm run build

# Build everything with Docker
make build
```

### Production Build

```bash
# Build optimized production images
make build

# Start production environment
make start

# Check health
make health
```

### Build Troubleshooting

```bash
# Clear all caches
npm run clean
cd server && npm run clean

# Remove node_modules and reinstall
rm -rf node_modules server/node_modules
npm install
cd server && npm install

# Reset Docker environment
make clean
make build
```

## 📋 Code Style

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Code Formatting

```bash
# Format all code
npm run format

# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔄 Git Workflow

### Branching Strategy

```bash
# Feature development
git checkout -b feature/my-new-feature
git commit -m "Add amazing feature"
git push origin feature/my-new-feature
# Create pull request

# Bug fixes
git checkout -b fix/issue-123
git commit -m "Fix issue with note saving"
git push origin fix/issue-123

# Hotfixes
git checkout -b hotfix/critical-bug
git commit -m "Fix critical security issue"
git push origin hotfix/critical-bug
```

### Commit Message Convention

```bash
# Format: type(scope): description

# Examples:
git commit -m "feat(editor): add auto-save functionality"
git commit -m "fix(api): resolve note creation bug"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(hooks): simplify useNotes implementation"
git commit -m "test(notes): add unit tests for note controller"
```

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## 🐛 Common Issues

### Port Already in Use

```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Database Connection Issues

```bash
# Reset database
cd server
rm -f prisma/viny.db
npm run db:push
```

### Docker Issues

```bash
# Reset Docker environment
make clean
docker system prune -a

# Rebuild from scratch
make build
```

### Node Version Issues

```bash
# Use nvm to manage Node versions
nvm install 18
nvm use 18

# Or check current version
node --version  # Should be 18+
```

## 📚 Additional Resources

### Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Plugin API](PLUGIN-API.md)
- [API Reference](../server/README.md)

### External Resources

- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Community

- [GitHub Issues](https://github.com/your-username/viny/issues)
- [GitHub Discussions](https://github.com/your-username/viny/discussions)
- [Contributing Guidelines](../CONTRIBUTING.md)

---

Happy coding! 🎉

For questions or issues, please check our [GitHub Issues](https://github.com/your-username/viny/issues) or start a [Discussion](https://github.com/your-username/viny/discussions).
