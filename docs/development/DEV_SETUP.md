# Viny Development Setup Guide

## Overview

Viny is a multi-user note-taking application with authentication. This guide covers the different development modes available.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Development Modes

### 1. Complete Development with Authentication

**Recommended for full-stack development with user authentication**

```bash
npm run dev:electron:auth
```

This command starts:

- **AUTH-SERVER** (port 3001): Authentication server with JWT tokens
- **FRONTEND** (port 5173): React + Vite development server
- **ELECTRON**: Desktop application wrapper

**Test User:**

- Email: `test@viny.app`
- Password: `password123`

### 2. Local Development (No Authentication)

**For frontend-only development or when working on features that don't require auth**

```bash
npm run dev:electron:local
```

This command starts:

- **FRONTEND** (port 5173): React + Vite with API disabled
- **ELECTRON**: Desktop application wrapper

### 3. Web Development Only

**For web-only development without Electron**

```bash
npm run dev
```

This starts only the frontend development server.

## Database Setup

The authentication server uses SQLite for simplicity:

```bash
# Generate Prisma client
cd server && npm run db:generate

# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed
```

## Authentication System

### Database Schema

- **Users**: Authentication and profile data
- **Notes**: User-specific notes with `userId` foreign key
- **Tags**: User-specific tags
- **Notebooks**: User-specific notebooks

### Security Features

- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days)
- bcrypt password hashing
- Content Security Policy (CSP)
- Input validation and sanitization

## Available Scripts

| Command                      | Description                          |
| ---------------------------- | ------------------------------------ |
| `npm run dev:electron:auth`  | Full development with authentication |
| `npm run dev:electron:local` | Local development without auth       |
| `npm run dev:electron:fast`  | Development with Docker backend      |
| `npm run dev`                | Web development only                 |
| `npm run build`              | Production build                     |
| `npm run test`               | Run tests                            |
| `npm run lint`               | Run linter                           |
| `npm run type-check`         | TypeScript type checking             |

## Project Structure

```
viny/
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── services/         # API services
│   ├── stores/           # Zustand state management
│   └── types/            # TypeScript types
├── server/               # Backend authentication server
│   ├── src/             # Express.js server
│   ├── prisma/          # Database schema and migrations
│   └── dist/            # Built server files
├── electron/            # Electron main process
└── public/              # Static assets
```

## Next Steps

1. **Phase 3**: Website & Landing Page (1.5 weeks)
2. **Phase 4**: Mobile Sync Architecture (2 weeks)
3. **Phase 5**: GitHub Issues Cleanup (1 week)

## Support

For issues or questions:

- Check the GitHub issues
- Review the development logs
- Test with the provided test user credentials
