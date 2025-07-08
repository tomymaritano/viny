# Inkrun Setup Guide

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control and cloning
- **Operating System**: Windows 10+, macOS 10.14+, or Linux

### Development Tools (Recommended)

- **VS Code**: With React and JavaScript extensions
- **Chrome DevTools**: For debugging
- **React Developer Tools**: Browser extension for React debugging

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd slidesapp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

- React 18 and React DOM
- Vite build tool
- Tailwind CSS for styling
- Monaco Editor for code editing
- Markdown processing libraries
- Electron for desktop app

### 3. Verify Installation

```bash
npm run dev
```

If successful, you should see:

```
VITE v6.3.5  ready in 241 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

- Opens development server on `http://localhost:5173`
- Hot module replacement for instant updates
- Automatic browser refresh on file changes

### Building for Production

```bash
npm run build
```

- Creates optimized production build in `dist/` folder
- Minifies code and assets
- Generates source maps for debugging

### Preview Production Build

```bash
npm run preview
```

- Serves the production build locally
- Test production performance and behavior

### Linting (if configured)

```bash
npm run lint
```

- Checks code quality and style
- Identifies potential issues

## Configuration Files

### package.json

**Purpose**: Dependencies, scripts, and project metadata

**Key Scripts**:

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build
- `electron:dev`: Start Electron development (if configured)

**Dependencies Overview**:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.45.0",
    "marked": "^11.1.1",
    "dompurify": "^3.0.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### vite.config.js

**Purpose**: Vite build tool configuration

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### tailwind.config.js

**Purpose**: Tailwind CSS configuration with Solarized colors

**Key Configuration**:

- Custom Solarized color palette
- Typography extensions
- Monospace font family setup

### postcss.config.js

**Purpose**: PostCSS configuration for CSS processing

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Project Structure Setup

### Recommended Folder Structure

```
inkrun/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx
│   │   ├── NotesList.jsx
│   │   ├── NotePreview.jsx
│   │   └── MarkdownEditor.jsx
│   ├── hooks/               # Custom React hooks
│   │   └── useNotes.js
│   ├── styles/              # Additional CSS files
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── docs/                    # Documentation
├── dist/                    # Built files (generated)
└── node_modules/            # Dependencies (generated)
```

## Environment Setup

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  }
}
```

### Git Configuration

Create `.gitignore`:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Troubleshooting

### Common Issues

#### Port Already in Use

**Problem**: `Port 5173 is in use`
**Solution**:

```bash
# Use different port
npm run dev -- --port 3000

# Or kill process using the port
npx kill-port 5173
```

#### Module Not Found Errors

**Problem**: Import errors or missing modules
**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Tailwind Styles Not Loading

**Problem**: Tailwind classes not applying
**Solution**:

1. Check `tailwind.config.js` content paths
2. Ensure CSS imports in `main.jsx`
3. Verify PostCSS configuration

#### Monaco Editor Not Loading

**Problem**: Editor component not rendering
**Solution**:

1. Check browser console for errors
2. Verify Monaco dependencies installed
3. Check component import paths

### Performance Issues

#### Slow Development Server

**Solutions**:

- Close unnecessary browser tabs
- Reduce file watching scope in Vite config
- Use faster storage (SSD vs HDD)

#### Large Bundle Size

**Solutions**:

- Use dynamic imports for large components
- Configure tree shaking in Vite
- Analyze bundle with `npm run build -- --analyze`

## Development Best Practices

### Code Organization

1. **Component Files**: One component per file
2. **Hook Files**: Custom hooks in separate files
3. **Utility Functions**: Shared utilities in utils folder
4. **Constants**: Configuration in separate constants file

### State Management

1. **Local State**: Use `useState` for component-specific state
2. **Shared State**: Use custom hooks like `useNotes`
3. **Side Effects**: Use `useEffect` with proper dependencies
4. **Performance**: Use `useMemo` and `useCallback` when needed

### Styling Guidelines

1. **Tailwind First**: Use Tailwind utilities over custom CSS
2. **Solarized Colors**: Stick to defined color palette
3. **Responsive Design**: Mobile-first approach
4. **Consistent Spacing**: Use Tailwind spacing scale

### Error Handling

1. **Try-Catch Blocks**: Wrap async operations
2. **User Feedback**: Show loading and error states
3. **Graceful Degradation**: Fallback for failed features
4. **Console Logging**: Informative error messages

## Deployment Preparation

### Building for Different Environments

#### Web Deployment

```bash
npm run build
# Deploy contents of dist/ folder
```

#### Electron Desktop App

```bash
# Install Electron
npm install --save-dev electron

# Add Electron scripts to package.json
npm run electron:build
```

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
VITE_APP_ENV=development
VITE_DEBUG=true

# .env.production
VITE_APP_ENV=production
VITE_DEBUG=false
```

---

_Setup Guide Version: 1.0.0_
_Last Updated: January 2024_
