import { useState, useEffect } from 'react'

// Storage key for notes
const NOTES_STORAGE_KEY = 'nototo_notes'
const APP_VERSION = '1.0.0'

// Storage utilities
const storage = {
  load: () => {
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY)
      if (!stored) return null

      const data = JSON.parse(stored)

      // Check version compatibility
      if (data.version !== APP_VERSION) {
        console.warn('Data version mismatch, using defaults')
        return null
      }

      return data.notes
    } catch (error) {
      console.error('Failed to load notes from storage:', error)
      return null
    }
  },

  save: notes => {
    try {
      const data = {
        version: APP_VERSION,
        notes,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save notes to storage:', error)
      return false
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(NOTES_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  },
}

// Default notes data
const defaultNotes = [
  {
    id: 1,
    title: 'Project Planning Notes',
    content: `# Project Planning Notes

## Overview
This is the outline for our new markdown editor project - **Nototo**.

## Key Features
- [ ] Monaco Editor integration
- [ ] Live markdown preview  
- [ ] Solarized Dark theme
- [ ] Vim keybindings
- [x] Note organization
- [x] Sidebar navigation

## Architecture
\`\`\`javascript
// Component structure
App
├── Sidebar
├── MainContent
└── MarkdownEditor
\`\`\`

## Next Steps
1. Implement search functionality
2. Add export capabilities
3. Set up sync system

> **Note**: Remember to keep the UI minimal and focused, like Inkdrop.

---
*Last updated: January 15, 2024*`,
    preview: 'Outline for the new markdown editor project...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: true,
    tags: ['project', 'planning'],
  },
  {
    id: 2,
    title: 'Learning Neovim',
    content: `# Learning Neovim

## Essential Commands

### Navigation
- \`h j k l\` - Basic movement
- \`w b\` - Word movement
- \`0 $\` - Line start/end
- \`gg G\` - File start/end

### Editing
- \`i a o\` - Insert modes
- \`x dd\` - Delete
- \`y p\` - Copy/paste
- \`u <C-r>\` - Undo/redo

### Search
- \`/pattern\` - Search forward
- \`?pattern\` - Search backward
- \`n N\` - Next/previous match

## Config Tips
\`\`\`lua
-- Essential settings
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
\`\`\`

## Plugins to Try
- **Telescope** - Fuzzy finder
- **Treesitter** - Syntax highlighting  
- **LSP** - Language server support
- **Which-key** - Key mapping help`,
    preview: 'Key bindings and configuration tips...',
    date: '2024-01-14',
    notebook: 'Personal',
    isPinned: false,
    tags: ['learning', 'vim'],
  },
  {
    id: 3,
    title: 'Nototo - Project Overview',
    content: `# Nototo - Project Overview

## 🎯 What is Nototo?

Nototo is a minimalist markdown editor built with React, Vite, and Monaco Editor, providing a professional IDE-style markdown editing experience.

## ✨ Key Features

### Core Functionality
- **Monaco Editor Integration**: Professional code editor with Solarized Dark theme
- **Live Preview**: Real-time markdown rendering with enhanced typography
- **3-Column Layout**: Sidebar navigation, notes list, and preview/editor area
- **Auto-save**: Automatic saving with visual feedback (2-second debounce)

### Data Management
- **localStorage Persistence**: All notes saved locally
- **Export/Import**: JSON-based backup and restore
- **Version Control**: Data migration support
- **Error Handling**: Graceful degradation on storage issues

### User Experience
- **Minimalist Design**: Clean interface without decorations
- **Solarized Theme**: Authentic color scheme throughout
- **Keyboard Shortcuts**: Vim-inspired formatting shortcuts
- **Visual Feedback**: Clear save status and change indicators

## 🛠 Technology Stack

### Frontend
- **React 18**: Component-based UI with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS 3**: Utility-first styling with custom Solarized colors
- **Monaco Editor**: VS Code's editor component

### Libraries
- **marked**: Markdown parsing and rendering
- **DOMPurify**: XSS protection for HTML sanitization

## 🎨 Design Philosophy

### Minimalism
- No unnecessary UI elements or decorations
- Focus on content and functionality
- Professional appearance suitable for serious work

### Performance
- Efficient state management with React hooks
- Debounced operations to prevent lag
- Optimized Monaco Editor configuration

### Reliability
- Comprehensive error handling
- Data integrity through version control
- Graceful degradation when features unavailable

## 📁 Project Structure

\`\`\`
inkrun/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── NotesList.jsx    # Notes collection view
│   │   ├── NotePreview.jsx  # Read-only note display
│   │   └── MarkdownEditor.jsx # Monaco editor wrapper
│   ├── hooks/
│   │   └── useNotes.js      # Notes state management
│   ├── App.jsx              # Main application
│   └── App.css              # Solarized theme styles
├── docs/                    # External documentation
└── package.json             # Dependencies and scripts
\`\`\`

## 🚀 Getting Started

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Building
\`\`\`bash
npm run build
\`\`\`

## 🎯 Next Steps

### Version 1.1 (Planned)
- [ ] Full-text search implementation
- [ ] Additional export formats (PDF, HTML)
- [ ] Note templates system
- [ ] Enhanced keyboard shortcuts

### Version 1.2 (Planned)
- [ ] Plugin system architecture
- [ ] Cloud sync options
- [ ] Collaborative features

---
*This is the main project overview. See other documentation notes for detailed technical information.*`,
    preview:
      'Complete overview of the Nototo markdown editor project, including features, technology stack, and roadmap...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: true,
    tags: ['documentation', 'overview', 'project'],
  },
  {
    id: 4,
    title: 'Nototo - Architecture Documentation',
    content: `# Nototo Architecture Documentation

## 🏗 System Architecture

Nototo follows a component-based architecture built on React with centralized state management using custom hooks.

## 📊 Component Hierarchy

\`\`\`
App
├── Sidebar
│   ├── Navigation sections
│   └── Quick actions
├── NotesList
│   ├── Search functionality
│   ├── Note items
│   └── Metadata display
├── NotePreview
│   ├── Markdown rendering
│   ├── Edit controls
│   └── Note statistics
└── MarkdownEditor
    ├── Monaco Editor
    ├── Formatting toolbar
    ├── Live preview
    └── Status bar
\`\`\`

## 🔄 Data Flow

### State Management
Centralized through the \`useNotes\` hook:

\`\`\`javascript
const {
  notes,           // Array of all notes
  currentNote,     // Currently edited note
  isEditorOpen,    // Editor visibility state
  isLoading,       // Initial loading state
  // ... actions
} = useNotes()
\`\`\`

### Persistence Flow
1. **Loading**: App starts → useNotes loads from localStorage → Sets initial state
2. **Editing**: User types → State updates → Debounced auto-save triggers
3. **Saving**: Auto-save/manual save → Updates localStorage → State sync

## 🧩 Core Components

### App.jsx
**Purpose**: Main application container and routing logic

**Responsibilities**:
- Route between editor and preview modes
- Manage global application state
- Handle loading states
- Coordinate component interactions

### MarkdownEditor.jsx
**Purpose**: Professional markdown editing experience

**Key Features**:
- Monaco Editor with Solarized Dark theme
- Formatting toolbar with shortcuts
- Auto-save with visual feedback
- Live preview mode
- Status bar with statistics

### useNotes Hook
**Purpose**: Centralized notes state management

**State Variables**:
- \`notes\`: Array of all notes
- \`currentNote\`: Currently edited note
- \`isEditorOpen\`: Editor visibility
- \`isLoading\`: Initial loading state

**Actions**:
- \`openNote(id)\`: Open note for editing
- \`createNewNote()\`: Create and open new note
- \`saveNote(data)\`: Save note changes
- \`exportNotes()\`: Download as JSON
- \`importNotes(file)\`: Import from file

## 🎨 Theme System

### Solarized Integration
Built around the Solarized color palette with Tailwind CSS:

**Base Colors**:
- \`#00141A\` - Background (base03)
- \`#002B36\` - Content background (base02)
- \`#073642\` - Borders (base01)
- \`#839496\` - Primary text (base2)

**Accent Colors**:
- \`#268bd2\` - Links and actions (blue)
- \`#2aa198\` - Code elements (cyan)
- \`#cb4b16\` - Warnings (orange)
- \`#dc322f\` - Errors (red)

## 📝 Data Models

### Note Structure
\`\`\`javascript
{
  id: number,           // Unique identifier
  title: string,        // Note title
  content: string,      // Markdown content
  preview: string,      // Truncated preview
  date: string,         // Creation date (YYYY-MM-DD)
  updatedAt: string,    // Last modification (ISO)
  notebook: string,     // Category/folder
  isPinned: boolean,    // Pin status
  tags: string[]        // Array of tags
}
\`\`\`

### Storage Structure
\`\`\`javascript
{
  version: string,      // App version for migration
  notes: Note[],        // Array of notes
  savedAt: string       // Last save timestamp
}
\`\`\`

## ⚡ Performance Considerations

### Auto-save Optimization
- **Debouncing**: 2-second delay prevents excessive saves
- **Change Detection**: Only saves when content changes
- **Cleanup**: Proper timeout cleanup on unmount

### Memory Management
- **State Optimization**: Minimal state duplication
- **Event Cleanup**: Proper event listener removal
- **Storage Efficiency**: Compressed JSON storage

## 🔒 Security

### XSS Prevention
- **DOMPurify**: Sanitizes all HTML output
- **Input Validation**: Proper data validation throughout

### Data Protection
- **Local Storage**: All data remains on user's machine
- **No Network Calls**: Completely offline application

## 🔌 Extension Points (Future)

### Plugin System Architecture
\`\`\`javascript
interface Plugin {
  name: string;
  version: string;
  initialize(api: PluginAPI): void;
  cleanup(): void;
}
\`\`\`

---
*Technical architecture documentation for developers working on Nototo.*`,
    preview:
      'Detailed technical architecture documentation covering component hierarchy, data flow, theme system, and performance considerations...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: false,
    tags: ['documentation', 'architecture', 'technical'],
  },
  {
    id: 5,
    title: 'Nototo - API Reference',
    content: `# Nototo API Reference

## 🎣 useNotes Hook API

The \`useNotes\` hook is the central state management solution for all note operations.

### Import
\`\`\`javascript
import { useNotes } from './hooks/useNotes'
\`\`\`

### Usage
\`\`\`javascript
const {
  notes, currentNote, isEditorOpen, isLoading,
  openNote, createNewNote, saveNote, deleteNote,
  duplicateNote, exportNotes, importNotes, 
  closeEditor, storage
} = useNotes()
\`\`\`

## 📊 State Properties

### \`notes: Note[]\`
Array of all notes in the application.

**Default**: \`[]\` (loads from localStorage on mount)

### \`currentNote: Note | null\`
The note currently being edited in the MarkdownEditor.

### \`isEditorOpen: boolean\`
Whether the MarkdownEditor is currently visible.

### \`isLoading: boolean\`
Loading state during initial data fetch from localStorage.

## 🔧 Action Methods

### \`openNote(noteId: number): void\`
Opens a note for editing in the MarkdownEditor.

**Example**:
\`\`\`javascript
const handleEditNote = (note) => {
  openNote(note.id)
}
\`\`\`

### \`createNewNote(): void\`
Creates a new note and opens it for editing.

**Generated Note Structure**:
\`\`\`javascript
{
  id: Date.now(),
  title: 'Untitled Note',
  content: '',
  preview: '',
  date: new Date().toISOString().split('T')[0],
  notebook: 'Personal',
  isPinned: false,
  tags: []
}
\`\`\`

### \`saveNote(noteData: Partial<Note>): void\`
Saves or updates a note with the provided data.

**Behavior**:
- Updates existing note if ID matches
- Adds new note if ID doesn't exist
- Auto-generates preview from content
- Sets \`updatedAt\` timestamp
- Triggers auto-save to localStorage

### \`deleteNote(noteId: number): void\`
Removes a note from the collection.

**Behavior**:
- Removes note from notes array
- Closes editor if deleted note was currently open
- Triggers auto-save to localStorage

### \`duplicateNote(noteId: number): Note | undefined\`
Creates a copy of an existing note.

**Returns**: The duplicated note object or \`undefined\`

### \`exportNotes(): boolean\`
Exports all notes to a downloadable JSON file.

**Behavior**:
- Creates JSON file with version info and all notes
- Triggers browser download
- Filename format: \`inkrun-notes-YYYY-MM-DD.json\`

**Export Structure**:
\`\`\`javascript
{
  version: "1.0.0",
  exportedAt: "2024-01-15T10:30:00.000Z",
  notes: [...],
  totalNotes: 42
}
\`\`\`

### \`importNotes(file: File): Promise<ImportResult>\`
Imports notes from a JSON file.

**Returns**: \`Promise<ImportResult>\`

**ImportResult Type**:
\`\`\`javascript
{
  imported: number,  // Notes actually imported
  total: number      // Total notes in file
}
\`\`\`

**Example**:
\`\`\`javascript
const handleImport = async (file) => {
  try {
    const result = await importNotes(file)
  } catch (error) {
    console.error('Import failed:', error.message)
  }
}
\`\`\`

### \`closeEditor(): void\`
Closes the MarkdownEditor and returns to preview mode.

## 💾 Storage Utilities

### \`storage\` Object
Direct access to localStorage utilities.

#### \`storage.load(): Note[] | null\`
Loads notes from localStorage.

#### \`storage.save(notes: Note[]): boolean\`
Saves notes to localStorage.

#### \`storage.clear(): boolean\`
Clears all notes from localStorage.

## 🔄 Auto-save Behavior

### Trigger Conditions
- Notes array changes (add, update, delete)
- After initial loading completes
- Not during initial loading phase

### Storage Format
\`\`\`javascript
{
  version: "1.0.0",
  notes: [...],
  savedAt: "2024-01-15T10:30:00.000Z"
}
\`\`\`

## 🔢 Version Control

### Data Migration
The storage system includes version checking:

\`\`\`javascript
if (data.version !== APP_VERSION) {
  console.warn('Data version mismatch, using defaults')
  return null
}
\`\`\`

## ⚠️ Error Types

### Storage Errors
- **Parse Error**: Invalid JSON in localStorage
- **Version Mismatch**: Incompatible data version
- **Quota Exceeded**: localStorage size limit reached

### Import Errors
- **Invalid Format**: File is not valid JSON
- **Missing Data**: Required properties not present
- **Read Error**: File system read failure

---
*Complete API reference for the useNotes hook and storage system.*`,
    preview:
      'Complete API reference for the useNotes hook, including all methods, parameters, return types, and usage examples...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: false,
    tags: ['documentation', 'api', 'reference'],
  },
  {
    id: 6,
    title: 'Nototo - User Guide',
    content: `# Nototo User Guide

## 🚀 Getting Started

Nototo is a minimalist markdown editor designed for professional note-taking. When you first open Nototo, you'll see a clean 3-column layout:

1. **Sidebar** (left): Navigation and quick actions
2. **Notes List** (middle): All your notes with previews
3. **Preview/Editor** (right): View or edit note content

## 📝 Working with Notes

### Creating Notes
- Click **"New"** button in notes list header
- Or click **"+"** in sidebar
- Editor opens with a blank note titled "Untitled Note"

### Editing Notes
1. Select a note from the list (preview appears)
2. Click **"Edit"** button in preview header
3. Monaco Editor opens with professional editing features

### Organizing Notes

#### Notebooks
Organize notes into categories:
- **Personal**: Private notes and thoughts
- **Work**: Professional documents and tasks
- **Projects**: Project-specific documentation

#### Tags
- Add multiple tags to each note
- Use for flexible organization and grouping
- Displayed as colored badges in the UI

#### Pinning
- Pin important notes with the star (*) indicator
- Pinned notes appear in dedicated sidebar section
- Quick access to frequently used content

## ✏️ Editor Features

### Monaco Editor
Professional code editor with:
- **Syntax Highlighting**: Markdown-specific coloring
- **Line Numbers**: Track your position
- **Auto-indent**: Proper formatting assistance
- **Find & Replace**: Built-in search functionality

### Formatting Toolbar
Quick access buttons for markdown formatting:
- **B**: Bold text (\`**bold**\`)
- **I**: Italic text (\`*italic*\`)
- **Code**: Inline code (\`\\\`code\\\`\`)
- **Link**: Links (\`[text](url)\`)
- **List**: Bullet lists (\`- item\`)
- **Quote**: Blockquotes (\`> quote\`)
- **H**: Headers (\`# heading\`)

### Keyboard Shortcuts
- **Ctrl+S**: Save note
- **Ctrl+B**: Bold formatting
- **Ctrl+I**: Italic formatting
- **Ctrl+K**: Link formatting
- **Ctrl+E**: Code formatting

### Live Preview
- Toggle preview alongside editor
- Real-time markdown rendering
- Enhanced typography with Solarized colors
- Synchronized scrolling

## 💾 Auto-Save & Data Management

### Auto-Save System
- **Automatic**: Saves 2 seconds after you stop typing
- **Visual Feedback**: Save button shows "Save*" for unsaved changes
- **Status Bar**: Shows "Unsaved" or "Saved" status
- **Manual Save**: Click save button or use Ctrl+S

### Data Persistence
- **Local Storage**: All notes saved to browser's localStorage
- **Automatic**: No setup required, works completely offline
- **Reliable**: Data persists between sessions

### Export & Backup
- **Export**: Download all notes as JSON file
- **Import**: Restore notes from exported file
- **Merge**: Import combines with existing notes (no duplicates)
- **Timestamped**: Export files include date in filename

## 🎨 Interface Features

### Solarized Dark Theme
- **Easy on Eyes**: Carefully designed color scheme
- **Professional**: Suitable for extended use
- **Consistent**: Same colors throughout the application

### 3-Column Layout
- **Efficient**: See navigation, list, and content simultaneously
- **Responsive**: Adapts to different screen sizes
- **Focus Mode**: Editor can go fullscreen for distraction-free writing

### Visual Indicators
- **Save Status**: Clear indication of save state
- **Pinned Notes**: Yellow star (*) for important notes
- **Selection**: Highlighted current note in list
- **Metadata**: Tags, dates, and word counts

## 📊 Note Statistics

### Real-time Counts
- **Lines**: Number of lines in current note
- **Words**: Word count for content planning
- **Characters**: Character count including spaces

### Metadata Display
- **Creation Date**: When the note was first created
- **Last Modified**: Timestamp of most recent edit
- **Notebook**: Category assignment
- **Tags**: All associated keywords

## 💡 Tips & Best Practices

### Effective Organization
1. **Use Notebooks Wisely**: Keep categories broad and consistent
2. **Tag Strategically**: Use 3-5 descriptive tags per note
3. **Pin Sparingly**: Only pin truly important notes
4. **Regular Review**: Clean up old or outdated content

### Writing Workflow
1. **Start Simple**: Begin with title and basic content
2. **Add Structure**: Use headers and lists for organization
3. **Format Last**: Add markdown formatting after content is complete
4. **Use Preview**: Check formatting with live preview

### Data Safety
1. **Export Regularly**: Create backup files for important work
2. **Use Multiple Notebooks**: Don't put everything in one category
3. **Descriptive Titles**: Make notes easy to find later
4. **Consistent Tagging**: Develop and stick to a tagging system

## 🔧 Troubleshooting

### Notes Not Saving
1. Check status bar for save status
2. Use Ctrl+S for manual save
3. Ensure browser localStorage is enabled
4. Check available storage space

### Editor Not Loading
1. Refresh the page
2. Clear browser cache
3. Check browser console for errors
4. Ensure modern browser version

### Formatting Issues
1. Check markdown syntax in preview mode
2. Escape special characters if needed
3. Ensure proper spacing for list items
4. Use preview to verify appearance

---
*Complete user guide for getting the most out of Nototo.*`,
    preview:
      'Comprehensive user guide covering all features of Nototo, from basic note creation to advanced organization and troubleshooting...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: false,
    tags: ['documentation', 'user-guide', 'help'],
  },
  {
    id: 7,
    title: 'Nototo - Setup & Development Guide',
    content: `# Nototo Setup & Development Guide

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control and cloning

### Development Tools (Recommended)
- **VS Code**: With React and JavaScript extensions
- **Chrome DevTools**: For debugging
- **React Developer Tools**: Browser extension

## 📦 Installation

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd slidesapp
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Start Development
\`\`\`bash
npm run dev
\`\`\`

## 🏗 Project Structure

\`\`\`
inkrun/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx      # Navigation panel
│   │   ├── NotesList.jsx    # Notes collection view
│   │   ├── NotePreview.jsx  # Read-only display
│   │   └── MarkdownEditor.jsx # Monaco editor wrapper
│   ├── hooks/
│   │   └── useNotes.js      # State management
│   ├── App.jsx              # Main application
│   ├── App.css              # Solarized theme styles
│   └── main.jsx             # Entry point
├── docs/                    # Documentation files
├── public/                  # Static assets
└── package.json             # Dependencies and scripts
\`\`\`

## ⚙️ Configuration Files

### package.json
**Key Scripts**:
- \`dev\`: Start development server
- \`build\`: Create production build
- \`preview\`: Preview production build

**Main Dependencies**:
\`\`\`json
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
    "tailwindcss": "^3.4.0"
  }
}
\`\`\`

### tailwind.config.js
**Solarized Color Configuration**:
\`\`\`javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'solarized': {
          'base03': '#00141A',
          'base02': '#002B36',
          'base01': '#073642',
          // ... complete Solarized palette
        }
      }
    }
  }
}
\`\`\`

### vite.config.js
\`\`\`javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
\`\`\`

## 🔄 Development Workflow

### Starting Development
\`\`\`bash
npm run dev
# Opens on http://localhost:5173
\`\`\`

### Building for Production
\`\`\`bash
npm run build
# Creates optimized build in dist/
\`\`\`

### Preview Production Build
\`\`\`bash
npm run preview
# Test production build locally
\`\`\`

## 🎨 Code Style Guidelines

### Component Structure
1. **Functional Components**: Use hooks instead of classes
2. **Single Responsibility**: One component per file
3. **Clear Naming**: Descriptive component and function names
4. **Props Destructuring**: Destructure props in function signature

### State Management
1. **Local State**: Use \`useState\` for component-specific state
2. **Shared State**: Use custom hooks like \`useNotes\`
3. **Side Effects**: Use \`useEffect\` with proper dependencies
4. **Performance**: Use \`useMemo\` and \`useCallback\` when needed

### Styling
1. **Tailwind First**: Use Tailwind utilities over custom CSS
2. **Solarized Colors**: Stick to defined color palette
3. **Responsive Design**: Mobile-first approach
4. **Consistent Spacing**: Use Tailwind spacing scale

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
\`\`\`bash
# Use different port
npm run dev -- --port 3000

# Or kill process
npx kill-port 5173
\`\`\`

#### Module Not Found
\`\`\`bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

#### Tailwind Not Working
1. Check \`tailwind.config.js\` content paths
2. Verify CSS imports in \`main.jsx\`
3. Check PostCSS configuration

### Performance Issues
- Close unnecessary browser tabs
- Use faster storage (SSD vs HDD)
- Reduce file watching scope

## 🚀 Building & Deployment

### Web Deployment
\`\`\`bash
npm run build
# Deploy contents of dist/ folder
\`\`\`

### Environment Variables
\`\`\`bash
# .env.development
VITE_APP_ENV=development

# .env.production
VITE_APP_ENV=production
\`\`\`

## 🧪 Testing (Future)

### Planned Testing Setup
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **Playwright**: Cross-browser testing

## 📈 Performance Optimization

### Current Optimizations
- Debounced auto-save (2-second delay)
- Efficient React state updates
- Proper cleanup in useEffect
- Minimal re-renders with proper dependencies

### Future Improvements
- Code splitting for larger features
- Virtual scrolling for large note lists
- Background sync for better UX
- Service worker for offline support

## 🔧 VS Code Setup

### Recommended Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

### Settings
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
\`\`\`

---
*Development setup guide for contributors and maintainers.*`,
    preview:
      'Complete setup and development guide covering installation, configuration, workflow, troubleshooting, and best practices...',
    date: '2024-01-15',
    notebook: 'Work',
    isPinned: false,
    tags: ['documentation', 'setup', 'development'],
  },
]

export const useNotes = () => {
  // Data states
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // UI states (migrated from App.jsx)
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [viewMode, setViewMode] = useState('preview') // 'preview' | 'edit'
  const [activeSection, setActiveSection] = useState('all-notes')
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)

  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showNotebookManager, setShowNotebookManager] = useState(false)

  // Load notes from storage on mount
  useEffect(() => {
    const loadNotes = () => {
      const storedNotes = storage.load()
      if (storedNotes && storedNotes.length > 0) {
        // Check if documentation notes exist, if not add them
        const docNoteIds = [3, 4, 5, 6, 7] // IDs of documentation notes
        const existingIds = new Set(storedNotes.map(note => note.id))
        const missingDocNotes = defaultNotes.filter(
          note => docNoteIds.includes(note.id) && !existingIds.has(note.id)
        )

        if (missingDocNotes.length > 0) {
          const updatedNotes = [...storedNotes, ...missingDocNotes]
          setNotes(updatedNotes)
          storage.save(updatedNotes)
        } else {
          setNotes(storedNotes)
        }
      } else {
        // Use default notes if no stored data
        setNotes(defaultNotes)
        storage.save(defaultNotes)
      }
      setIsLoading(false)
    }

    loadNotes()
  }, [])

  // Auto-save notes whenever they change
  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      storage.save(notes)
    }
  }, [notes, isLoading])

  // Centralized UI actions
  const openNoteForEdit = noteId => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      // Use a single state update to prevent race conditions
      setSelectedNoteId(noteId)
      setCurrentNote(note)
      setViewMode('edit')
      setIsEditorOpen(true)

      // Debug logging removed
    } else {
      console.warn('Note not found:', noteId)
    }
  }

  const openNoteForPreview = noteId => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setSelectedNoteId(noteId)
      setViewMode('preview')
      if (isEditorOpen) {
        setIsEditorOpen(false)
        setCurrentNote(null)
      }
      setShowPreviewPanel(false)
    }
  }

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      preview: '',
      date: new Date().toISOString().split('T')[0],
      notebook: 'Personal',
      isPinned: false,
      tags: [],
      status: 'draft',
    }
    setCurrentNote(newNote)
    setSelectedNoteId(newNote.id)
    setViewMode('edit')
    setIsEditorOpen(true)
    setShowPreviewPanel(false)
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setCurrentNote(null)
    setViewMode('preview')
    setShowPreviewPanel(false)
  }

  const navigateToSection = section => {
    setActiveSection(section)
    // Close editor when navigating from sidebar
    if (isEditorOpen) {
      closeEditor()
    }
  }

  // Legacy function for backward compatibility
  const openNote = openNoteForEdit

  const saveNote = noteData => {
    const updatedNote = {
      ...noteData,
      preview:
        noteData.content.substring(0, 100) +
        (noteData.content.length > 100 ? '...' : ''),
      updatedAt: new Date().toISOString(),
    }

    setNotes(prevNotes => {
      const existingIndex = prevNotes.findIndex(n => n.id === noteData.id)

      if (existingIndex >= 0) {
        // Update existing note
        const newNotes = [...prevNotes]
        newNotes[existingIndex] = updatedNote
        return newNotes
      } else {
        // Add new note
        return [...prevNotes, updatedNote]
      }
    })
    setCurrentNote(updatedNote)
  }

  const deleteNote = noteId => {
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId))
    if (currentNote?.id === noteId) {
      setCurrentNote(null)
      setIsEditorOpen(false)
    }
  }

  const togglePin = noteId => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? {
              ...note,
              isPinned: !note.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    )
    // Update current note if it's the one being pinned/unpinned
    if (currentNote?.id === noteId) {
      setCurrentNote(prevNote => ({
        ...prevNote,
        isPinned: !prevNote.isPinned,
        updatedAt: new Date().toISOString(),
      }))
    }
  }

  const duplicateNote = noteId => {
    const originalNote = notes.find(n => n.id === noteId)
    if (originalNote) {
      const duplicatedNote = {
        ...originalNote,
        id: Date.now(),
        title: `${originalNote.title} (Copy)`,
        date: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }
      setNotes(prevNotes => [...prevNotes, duplicatedNote])
      return duplicatedNote
    }
    return null // If note not found
  }

  const exportNotes = () => {
    try {
      const exportData = {
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        notes: notes,
        totalNotes: notes.length,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `nototo-notes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Failed to export notes:', error)
      return false
    }
  }

  const importNotes = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = e => {
        try {
          const importedData = JSON.parse(e.target.result)

          // Validate import data
          if (!importedData.notes || !Array.isArray(importedData.notes)) {
            reject(new Error('Invalid notes data format'))
            return
          }

          // Merge with existing notes (avoid duplicates by ID)
          const existingIds = new Set(notes.map(n => n.id))
          const newNotes = importedData.notes.filter(
            note => !existingIds.has(note.id)
          )

          if (newNotes.length > 0) {
            setNotes(prevNotes => [...prevNotes, ...newNotes])
            resolve({
              imported: newNotes.length,
              total: importedData.notes.length,
            })
          } else {
            resolve({ imported: 0, total: importedData.notes.length })
          }
        } catch (error) {
          reject(new Error('Failed to parse notes file: ' + error.message))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Modal actions
  const toggleSettings = () => {
    setShowSettings(prev => !prev)
  }

  const toggleNotebookManager = () => {
    setShowNotebookManager(prev => !prev)
  }

  const togglePreviewPanel = () => {
    setShowPreviewPanel(prev => !prev)
  }

  const closePreviewPanel = () => {
    if (isEditorOpen) {
      setShowPreviewPanel(false)
    } else {
      setSelectedNoteId(null)
      setViewMode('preview')
    }
  }

  // Sync currentNote with selectedNoteId when in edit mode
  useEffect(() => {
    if (selectedNoteId && viewMode === 'edit' && isEditorOpen) {
      const note = notes.find(n => n.id === selectedNoteId)
      if (note && (!currentNote || currentNote.id !== selectedNoteId)) {
        setCurrentNote(note)
        // Sync logging removed
      }
    }
  }, [selectedNoteId, notes, viewMode, isEditorOpen, currentNote])

  return {
    // Data states
    notes,
    currentNote,
    isEditorOpen,
    isLoading,
    storageMode: 'localStorage', // Always localStorage for this hook

    // UI states
    selectedNoteId,
    setSelectedNoteId,
    viewMode,
    activeSection,
    showPreviewPanel,
    showSettings,
    showNotebookManager,

    // Core note actions
    openNote, // Legacy - points to openNoteForEdit
    openNoteForEdit,
    openNoteForPreview,
    createNewNote,
    saveNote,
    deleteNote,
    togglePin,
    duplicateNote,
    exportNotes,
    importNotes,
    closeEditor,

    // UI actions
    navigateToSection,
    toggleSettings,
    toggleNotebookManager,
    togglePreviewPanel,
    closePreviewPanel,

    // Note editing
    setCurrentNote,

    // Utilities
    storage,
  }
}
