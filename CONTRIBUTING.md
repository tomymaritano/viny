# Contributing to Viny

Thank you for your interest in contributing to Viny! This document provides guidelines and information for contributors.

## 🎯 Current Focus: Settings System

We're currently focusing on implementing a comprehensive settings system to achieve feature parity with leading note-taking applications like Inkdrop. All contributions in this area are especially welcome.

## 📋 Issue Templates

We have structured issue templates to help organize different types of contributions:

- **Feature Request**: General feature suggestions and enhancements
- **Bug Report**: Report bugs and issues with detailed information
- **Settings Enhancement**: Specific improvements to the settings system

## 🏗️ Development Roadmap

Our development is organized into milestones:

### Current Milestones

1. **Settings Core v2.0** (Due: Aug 1, 2025)
   - UI Settings implementation
   - Privacy Settings
   - Backup Settings

2. **Advanced Features v2.1** (Due: Aug 15, 2025)
   - Preview Settings with markdown rendering
   - Export system enhancements
   - Initial keybinding support

3. **Keybinding System v2.2** (Due: Sep 1, 2025)
   - Visual keybinding editor
   - Command palette
   - Preset keymaps (Vim, Emacs, Sublime)

4. **Plugin Foundation v2.3** (Due: Sep 15, 2025)
   - Plugin API architecture
   - Plugin manager
   - Plugin discovery system

5. **Cloud & Collaboration v3.0** (Due: Oct 1, 2025)
   - End-to-end encrypted sync
   - Real-time collaboration
   - Multi-device support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tomymaritano/viny.git
cd viny

# Install dependencies
npm install

# Start development server
npm run dev

# For backend development (optional)
npm run dev:fast  # Hybrid mode with Docker backend
```

### Quick Development Modes

We offer multiple development modes for different needs:

- `npm run dev:local` - Frontend only with localStorage (fastest)
- `npm run dev:fast` - Hybrid: Docker backend + local frontend
- `npm run dev` - Full Docker development environment
- `npm run dev:smart` - Auto-detect best mode for your system

## 📁 Project Structure

```
viny/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── settings/       # Settings-related components
│   │   ├── editor/         # Editor components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── src/controllers/   # API route handlers
│   ├── src/routes/        # Express routes
│   └── prisma/            # Database schema
├── .github/               # GitHub templates and workflows
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔧 Settings System Architecture

The settings system is our current development focus. Here's how it's structured:

### Settings Components

- `src/components/settings/sections/` - Individual settings sections
- `src/hooks/useSettings.ts` - Settings state management
- `src/types/settings.ts` - Settings type definitions

### Settings Categories

1. **General Settings** - Application-wide preferences
2. **Editor Settings** - Editor behavior and appearance
3. **Theme Settings** - Visual themes and typography
4. **Preview Settings** - Markdown rendering options
5. **Export Settings** - Export format configurations
6. **Sync Settings** - Cloud sync and backup preferences
7. **Privacy Settings** - Security and privacy controls
8. **Keybinding Settings** - Keyboard shortcuts
9. **Plugin Settings** - Plugin management and configuration

## 🎨 Code Style

### React Components

- Use functional components with hooks
- Prefer TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling

```tsx
// Example component structure
interface ComponentProps {
  setting: SettingValue
  onUpdate: (value: SettingValue) => void
}

const SettingComponent: React.FC<ComponentProps> = ({ setting, onUpdate }) => {
  return <div className="setting-item">{/* Component content */}</div>
}
```

### Settings Implementation

- Each setting should have a clear type definition
- Settings should be validated on both client and server
- Default values must be provided
- Settings should support import/export

```typescript
// Example setting definition
interface EditorSetting {
  key: string
  label: string
  description: string
  type: 'boolean' | 'string' | 'number' | 'select'
  defaultValue: unknown
  validation?: (value: unknown) => boolean
  options?: string[] // for select type
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- Unit tests for individual components
- Integration tests for settings workflows
- End-to-end tests for complete user journeys

## 📝 Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the code style guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Create a pull request** with a clear description

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] PR description explains the changes
- [ ] Screenshots for UI changes (if applicable)

### PR Template

```markdown
## Summary

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Settings enhancement
- [ ] Documentation update
- [ ] Refactoring

## Changes Made

- List of specific changes
- Include component/file names

## Testing

- [ ] Tests added/updated
- [ ] Manual testing completed
- [ ] Cross-platform testing (if applicable)

## Screenshots

(If applicable)
```

## 🏷️ Issue Labels

We use a structured labeling system:

### Type Labels

- `type:feature` - New feature or functionality
- `type:enhancement` - Enhancement to existing feature
- `type:docs` - Documentation improvements
- `type:chore` - Maintenance and housekeeping
- `bug` - Something isn't working

### Component Labels

- `comp:settings` - Settings and configuration
- `comp:editor` - Markdown editor functionality
- `comp:ui` - User interface components
- `comp:export` - Export functionality
- `comp:sync` - Synchronization features
- `comp:plugins` - Plugin system
- `comp:search` - Search functionality

### Priority Labels

- `priority:critical` - Immediate attention required
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

### Effort Labels

- `effort:small` - 1-2 hours
- `effort:medium` - 1-3 days
- `effort:large` - 1+ weeks

### Status Labels

- `status:ready` - Ready for development
- `status:blocked` - Blocked by dependencies
- `status:needs-design` - Needs design or specification

## 🤝 Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Share knowledge and best practices
- Focus on the user experience

## 🔐 Security

If you discover a security vulnerability, please email [maintainer email] instead of opening a public issue. Security issues will be addressed promptly.

## 📄 License

By contributing to Viny, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🎉 Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Project documentation (when appropriate)

## 📞 Getting Help

- **GitHub Discussions**: For questions and community discussion
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check the `/docs` folder for guides
- **Discord/Slack**: [Coming soon] Community chat

Thank you for contributing to Viny! 🚀

---

_Last updated: July 2025_
