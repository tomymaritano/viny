# Viny/Viny Code Style Guide

This guide defines the coding standards and best practices for the Viny/Viny project to ensure consistency, readability, and maintainability across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript](#typescript)
- [React Components](#react-components)
- [Hooks](#hooks)
- [State Management](#state-management)
- [Styling](#styling)
- [Testing](#testing)
- [File Organization](#file-organization)
- [Documentation](#documentation)
- [Git Conventions](#git-conventions)

## General Principles

### DRY (Don't Repeat Yourself)

- Extract common logic into utilities or custom hooks
- Create reusable components for repeated UI patterns
- Use constants for repeated values

### KISS (Keep It Simple, Stupid)

- Prefer simple, readable solutions over clever ones
- Break complex functions into smaller, focused ones
- Avoid premature optimization

### YAGNI (You Aren't Gonna Need It)

- Don't add functionality until it's needed
- Remove dead code immediately
- Keep interfaces minimal

## TypeScript

### Type Definitions

```typescript
// ✅ Good - Use interfaces for objects
interface User {
  id: string
  name: string
  email: string
}

// ✅ Good - Use type for unions and primitives
type Theme = 'light' | 'dark' | 'auto'
type ID = string | number

// ❌ Bad - Avoid using 'any'
const processData = (data: any) => {
  /* ... */
}

// ✅ Good - Be explicit about types
const processData = (data: UserData) => {
  /* ... */
}
```

### Naming Conventions

```typescript
// Interfaces: PascalCase with descriptive names
interface NoteMetadata {
  /* ... */
}

// Type aliases: PascalCase
type NoteStatus = 'draft' | 'published' | 'archived'

// Enums: PascalCase with UPPER_SNAKE_CASE values
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const API_TIMEOUT = 5000
```

### Function Types

```typescript
// ✅ Good - Use arrow functions for inline callbacks
const filtered = items.filter(item => item.active)

// ✅ Good - Use function declarations for named functions
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Good - Type function parameters and return values
const formatDate = (date: Date, format: string): string => {
  // implementation
}
```

## React Components

### Component Structure

```tsx
// ✅ Good - Functional components with TypeScript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
```

### Component Guidelines

1. **Use functional components** - No class components
2. **One component per file** - Makes testing and maintenance easier
3. **Props interface naming** - Use `ComponentNameProps`
4. **Default props** - Use destructuring with defaults
5. **Export style** - Prefer named exports

```tsx
// ✅ Good - Named export
export const Button: React.FC<ButtonProps> = () => {
  /* ... */
}

// ❌ Avoid - Default export
export default Button
```

### Component Organization

```tsx
// 1. Imports
import React, { useState, useCallback } from 'react'
import { useAppStore } from '../stores'
import { Button } from '../components/ui'
import type { Note } from '../types'

// 2. Types/Interfaces
interface EditorProps {
  note: Note
  onSave: (note: Note) => void
}

// 3. Component definition
export const Editor: React.FC<EditorProps> = ({ note, onSave }) => {
  // 4. State and hooks
  const [content, setContent] = useState(note.content)
  const { settings } = useAppStore()

  // 5. Event handlers and callbacks
  const handleSave = useCallback(() => {
    onSave({ ...note, content })
  }, [note, content, onSave])

  // 6. Effects
  useEffect(() => {
    // effect logic
  }, [])

  // 7. Render
  return <div>...</div>
}
```

## Hooks

### Custom Hooks Guidelines

```typescript
// ✅ Good - Descriptive name starting with 'use'
export const useNoteActions = () => {
  const { notes, updateNote, deleteNote } = useAppStore()

  const saveNote = useCallback(
    async (note: Note) => {
      // implementation
    },
    [updateNote]
  )

  return { saveNote, deleteNote }
}

// ✅ Good - Return consistent object shape
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    resetSettings,
  }
}
```

### Hook Patterns

1. **Naming** - Always prefix with `use`
2. **Return value** - Return an object for multiple values
3. **Dependencies** - Be explicit about dependencies
4. **Memoization** - Use `useMemo` and `useCallback` appropriately

## State Management

### Zustand Store Guidelines

```typescript
// ✅ Good - Slice pattern
interface NotesSlice {
  notes: Note[]
  currentNote: Note | null
  setNotes: (notes: Note[]) => void
  updateNote: (note: Note) => void
  deleteNote: (id: string) => void
}

export const createNotesSlice: StateCreator<NotesSlice> = set => ({
  notes: [],
  currentNote: null,
  setNotes: notes => set({ notes }),
  updateNote: updatedNote =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === updatedNote.id ? updatedNote : note
      ),
    })),
  deleteNote: id =>
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
    })),
})
```

### State Management Rules

1. **No direct mutations** - Always return new objects/arrays
2. **Atomic updates** - Keep actions focused
3. **Derived state** - Use selectors for computed values
4. **Action naming** - Use verb prefixes (set, update, delete, toggle)

## Styling

### CSS Organization

```css
/* Component-specific styles */
.note-editor {
  /* Layout */
  display: flex;
  flex-direction: column;

  /* Spacing */
  padding: 1rem;
  margin: 0;

  /* Visual */
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);

  /* Typography */
  font-size: var(--font-size-base);
  line-height: 1.5;
}
```

### Tailwind Guidelines

```tsx
// ✅ Good - Use Tailwind utilities
<div className="flex flex-col p-4 bg-white rounded-lg shadow-md">

// ✅ Good - Extract complex styles to components
<Card className="p-4">

// ❌ Avoid - Inline styles
<div style={{ padding: '16px', background: 'white' }}>
```

## Testing

### Test Structure

```typescript
// ✅ Good - Descriptive test names
describe('useNoteActions', () => {
  it('should create a new note with default values', () => {
    // Arrange
    const { result } = renderHook(() => useNoteActions())

    // Act
    act(() => {
      result.current.createNote()
    })

    // Assert
    expect(result.current.notes).toHaveLength(1)
    expect(result.current.notes[0]).toMatchObject({
      title: 'Untitled',
      content: '',
    })
  })
})
```

### Testing Guidelines

1. **Test naming** - Use descriptive names that explain the behavior
2. **AAA Pattern** - Arrange, Act, Assert
3. **One assertion per test** - Keep tests focused
4. **Mock external dependencies** - Isolate unit tests
5. **Test edge cases** - Don't just test the happy path

## File Organization

### Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── editor/         # Editor-specific components
│   └── settings/       # Settings-related components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── stores/             # Zustand store definitions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### File Naming

```
// Components: PascalCase
Button.tsx
NoteEditor.tsx
SettingsModal.tsx

// Hooks: camelCase
useSettings.ts
useNoteActions.ts

// Utils: camelCase
dateFormatter.ts
validation.ts

// Types: PascalCase
Note.ts
Settings.ts

// Tests: Same as source + .test
Button.test.tsx
useSettings.test.ts
```

## Documentation

### JSDoc Standards

```typescript
/**
 * Hook for managing note operations with optimistic updates and error handling.
 *
 * @description
 * This hook provides a complete interface for CRUD operations on notes,
 * including optimistic updates, conflict resolution, and automatic saving.
 *
 * @returns {Object} Note management interface
 * @returns {Note[]} returns.notes - Array of all notes
 * @returns {Function} returns.createNote - Create a new note
 * @returns {Function} returns.updateNote - Update an existing note
 * @returns {Function} returns.deleteNote - Delete a note
 *
 * @example
 * const { notes, createNote, updateNote } = useNoteActions()
 *
 * // Create a new note
 * const newNote = await createNote({ title: 'My Note' })
 *
 * // Update the note
 * await updateNote({ ...newNote, content: 'Updated content' })
 */
export const useNoteActions = () => {
  // implementation
}
```

### Comment Guidelines

```typescript
// ✅ Good - Explain why, not what
// We need to debounce saves to prevent overwhelming the API
const debouncedSave = useMemo(() => debounce(saveNote, 1000), [saveNote])

// ❌ Bad - Obvious comment
// Set loading to true
setLoading(true)

// ✅ Good - Document complex logic
// Calculate the diff between local and remote changes,
// prioritizing local changes for fields modified within
// the last 5 minutes to prevent data loss
const mergedChanges = mergeWithConflictResolution(
  localChanges,
  remoteChanges,
  lastSyncTime
)
```

## Git Conventions

### Branch Naming

```bash
feature/add-markdown-export
fix/note-sync-error
chore/update-dependencies
docs/api-documentation
refactor/settings-architecture
```

### Commit Messages

Follow conventional commits format:

```bash
# Format: <type>(<scope>): <subject>

feat(editor): add vim keybindings support
fix(sync): resolve race condition in note updates
docs(api): add JSDoc for all public hooks
style(ui): update button hover states
refactor(settings): extract validation logic
test(hooks): add tests for useNoteActions
chore(deps): update React to 18.2.0
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc)
- **refactor**: Code changes that neither fix bugs nor add features
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (updating dependencies, etc)

### Pull Request Guidelines

1. **Title**: Clear description of changes
2. **Description**: Include:
   - What changed and why
   - How to test the changes
   - Screenshots for UI changes
   - Breaking changes (if any)
3. **Size**: Keep PRs small and focused
4. **Reviews**: Address all feedback before merging

## Enforcement

### Automated Tools

1. **ESLint** - Enforces code style rules
2. **Prettier** - Formats code consistently
3. **TypeScript** - Enforces type safety
4. **Husky** - Runs pre-commit hooks
5. **lint-staged** - Lints only staged files

### Pre-commit Checks

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.test.{ts,tsx}": ["vitest related --run"]
  }
}
```

## Exceptions

While these guidelines should be followed in most cases, use your judgment. If deviating from a guideline makes the code significantly clearer or solves a specific problem, document why you made that choice.

---

Last updated: July 2025
Version: 1.0.0
