# Inkrun - Markdown Editor Project

## Project Overview

Inkrun is a minimalist markdown editor built with Electron, React, and Vite, inspired by craftzdog's Inkdrop. It provides a professional IDE-style markdown editing experience with live preview capabilities.

## Key Features

### Core Functionality

- **Monaco Editor Integration**: Professional code editor experience for markdown
- **Live Preview**: Real-time markdown rendering with enhanced typography
- **Solarized Dark Theme**: Authentic color scheme throughout the application
- **3-Column Layout**: Sidebar navigation, notes list, and preview/editor area

### Data Management

- **Local Storage Persistence**: Automatic saving to localStorage
- **Auto-save**: Debounced saving (2 seconds after typing stops)
- **Export/Import**: JSON-based backup and restore functionality
- **Version Control**: Data migration support for future updates

### User Experience

- **Minimalist Design**: Clean interface without unnecessary decorations
- **Keyboard Shortcuts**: Vim-inspired keybindings for formatting
- **Visual Feedback**: Clear indicators for save status and changes
- **Responsive Layout**: Adaptive UI for different screen sizes

## Technology Stack

### Frontend

- **React 18**: Component-based UI framework
- **Vite**: Fast build tool and development server
- **Tailwind CSS 3**: Utility-first CSS framework
- **Monaco Editor**: Code editor component

### Desktop

- **Electron**: Cross-platform desktop application framework

### Libraries

- **marked**: Markdown parsing and rendering
- **DOMPurify**: XSS protection for HTML sanitization
- **monaco-editor/react**: Monaco Editor React integration

## Project Structure

```
inkrun/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── NotesList.jsx    # Notes list view
│   │   ├── NotePreview.jsx  # Markdown preview
│   │   └── MarkdownEditor.jsx # Monaco editor
│   ├── hooks/               # Custom React hooks
│   │   └── useNotes.js      # Notes management logic
│   ├── App.jsx              # Main application component
│   ├── App.css              # Global styles and theme
│   └── main.jsx             # Application entry point
├── public/                  # Static assets
├── docs/                    # Project documentation
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── vite.config.js           # Vite configuration
```

## Color Scheme (Solarized Dark)

### Base Colors

- **base03**: `#00141A` - Background
- **base02**: `#002B36` - Content background
- **base01**: `#073642` - Borders and dividers
- **base00**: `#103B3D` - Secondary borders

### Content Colors

- **base0**: `#586e75` - Comments and secondary text
- **base1**: `#657b83` - Body text
- **base2**: `#839496` - Primary text
- **base3**: `#93a1a1` - Emphasized text
- **base4**: `#eee8d5` - Highlighted text
- **base5**: `#fdf6e3` - Headers and titles

### Accent Colors

- **blue**: `#268bd2` - Links and primary actions
- **cyan**: `#2aa198` - Code and inline elements
- **green**: `#859900` - Success states
- **yellow**: `#b58900` - Warnings
- **orange**: `#cb4b16` - Unsaved changes
- **red**: `#dc322f` - Errors and destructive actions
- **magenta**: `#d33682` - Special highlights
- **violet**: `#6c71c4` - Secondary highlights

## Development Philosophy

### Minimalism

- No unnecessary UI elements or decorations
- Focus on content and functionality
- Clean, professional appearance

### Performance

- Efficient state management with React hooks
- Debounced auto-save to prevent excessive storage operations
- Optimized Monaco Editor configuration

### User Experience

- Intuitive navigation and organization
- Clear visual feedback for all actions
- Keyboard-first workflow with mouse support

### Reliability

- Comprehensive error handling for storage operations
- Graceful degradation when features are unavailable
- Data integrity through version control and validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

```bash
git clone <repository-url>
cd slidesapp
npm install
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Electron Development

```bash
npm run electron:dev
```

## Next Steps

### Planned Features

1. **Search Functionality**: Full-text search across all notes
2. **Tag System**: Enhanced note organization
3. **Export Options**: PDF, HTML, and other format exports
4. **Sync System**: Cloud synchronization capabilities
5. **Plugin System**: Extensible architecture for custom features

### Monetization Strategy

- **Freemium Model**: Basic features free, advanced features paid
- **Subscription Tiers**: Different feature sets for different user types
- **One-time Purchase**: Alternative to subscription model
- **Team Features**: Collaboration and sharing capabilities

## Contributing

### Development Guidelines

1. Follow existing code style and conventions
2. Maintain the minimalist design philosophy
3. Ensure all changes work with the Solarized color scheme
4. Add appropriate error handling and validation
5. Update documentation for any new features

### Code Style

- Use functional components with hooks
- Implement proper TypeScript types (when migrating)
- Follow React best practices for state management
- Maintain consistent naming conventions

---

_Last updated: January 2024_
_Version: 1.0.0_
