# Core Hooks

This directory contains smaller, focused hooks that were extracted from larger hooks for better separation of concerns.

## Available Hooks

### useStorageInit

- Handles loading data from storage (notes, tags, settings)
- Provides fallback for settings loading
- Returns loading state and errors

### useThemeInit

- Manages theme initialization and updates
- Handles system theme preferences
- Updates DOM theme attributes

### useDataInit

- Initializes default data if needed
- Creates welcome notes for new users
- Runs once on app startup

### useAppDiagnostics

- Runs storage diagnostics in development mode
- Checks storage availability
- Reports potential storage issues

## Usage

These hooks can be used individually for more granular control:

```typescript
import { useStorageInit } from './core/useStorageInit'
import { useThemeInit } from './core/useThemeInit'

function MyComponent() {
  const { isLoading, error } = useStorageInit()
  const { currentTheme } = useThemeInit()

  // Component logic...
}
```

Or composed together as needed for specific initialization flows.

## Migration

The original `useAppInit` hook remains for backward compatibility but uses these smaller hooks internally. New code should prefer using the individual hooks directly for better modularity.
