# Logger System

A comprehensive logging utility system designed for development debugging and production monitoring with environment-aware logging, specialized loggers, and performance tracking.

## Import

```typescript
import {
  logger, // Default logger
  initLogger, // Initialization logging
  storageLogger, // Storage operations
  noteLogger, // Note operations
  searchLogger, // Search operations
  perfLogger, // Performance logging
  devLogger, // Development-only logging
  assert, // Production-safe assertions
} from '../utils/logger'

// For custom loggers
import Logger, { LogLevel, LogConfig } from '../utils/logger'
```

## Core Logger Class

### Basic Usage

```typescript
import { logger } from '../utils/logger'

// Basic logging (only shows in development)
logger.debug('Component mounted', { componentName: 'NoteEditor' })
logger.info('User action completed', 'NoteEdit', { noteId: '123' })
logger.warn('Deprecated function used', 'legacyFunction')
logger.error('Operation failed', { error: 'Network timeout' })
```

### Logger Configuration

```typescript
interface LogConfig {
  enabled: boolean // Enable/disable logging
  level: LogLevel // Minimum log level to show
  prefix?: string // Prefix for all log messages
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
```

### Creating Custom Loggers

```typescript
import Logger from '../utils/logger'

// Custom logger with specific configuration
const apiLogger = new Logger({
  enabled: true,
  level: 'info',
  prefix: 'API',
})

// Usage
apiLogger.info('Request started', { url: '/api/notes', method: 'GET' })
apiLogger.error('Request failed', { status: 500, error: 'Server error' })
```

## Specialized Loggers

### Pre-configured Module Loggers

```typescript
import {
  initLogger, // App initialization
  storageLogger, // localStorage/IndexedDB operations
  noteLogger, // Note CRUD operations
  sidebarLogger, // Sidebar interactions
  themeLogger, // Theme switching
  searchLogger, // Search operations
  editorLogger, // Editor interactions
} from '../utils/logger'

// Module-specific logging
initLogger.info('App initialization started')
storageLogger.debug('Loading notes from storage', { count: 150 })
noteLogger.info('Note created', { noteId: 'note-123', title: 'My Note' })
searchLogger.debug('Search query executed', {
  query: 'javascript',
  results: 25,
})
```

### Development-Only Logger

```typescript
import { devLogger } from '../utils/logger'

// This NEVER logs in production, even for errors
devLogger.debug('Debug info for development')
devLogger.error('This won\'t show in production')

// Useful for temporary debugging
const MyComponent = () => {
  devLogger.debug('Component rendering', { props })

  useEffect(() => {
    devLogger.info('Effect running', { dependencies })
  }, [dependencies])

  return <div>Component</div>
}
```

## Advanced Logging Features

### Performance Logging

```typescript
import { perfLogger, logger } from '../utils/logger'

// Performance timing
const measureOperation = async () => {
  logger.time('loadNotes')

  try {
    const notes = await loadNotesFromStorage()
    logger.timeEnd('loadNotes') // Shows: "Timer: loadNotes: 1.234ms"

    perfLogger.info('Notes loaded successfully', {
      count: notes.length,
      loadTime: performance.now(),
    })
  } catch (error) {
    logger.timeEnd('loadNotes')
    logger.error('Failed to load notes', error)
  }
}

// Performance monitoring hook
const usePerformanceLogger = operationName => {
  const startTime = useRef(performance.now())

  useEffect(() => {
    return () => {
      const duration = performance.now() - startTime.current
      perfLogger.info(`${operationName} completed`, { duration })
    }
  }, [operationName])
}
```

### Grouped Logging

```typescript
const debugComplexOperation = async () => {
  logger.group('Complex Operation Started')

  logger.debug('Step 1: Validation')
  logger.debug('Step 2: Data processing')
  logger.debug('Step 3: Storage update')

  try {
    await performComplexOperation()
    logger.info('Operation completed successfully')
  } catch (error) {
    logger.error('Operation failed', error)
  } finally {
    logger.groupEnd()
  }
}
```

### Child Loggers

```typescript
// Create specialized loggers for different features
const noteEditLogger = logger.child('NoteEdit')
const noteSyncLogger = logger.child('NoteSync')

// Usage with inherited configuration
noteEditLogger.debug('Started editing note', { noteId: '123' })
// Output: "14:30:15 [NoteEdit] Started editing note"

noteSyncLogger.info('Sync completed', { notes: 5, conflicts: 0 })
// Output: "14:30:15 [NoteSync] Sync completed"

// Nested child loggers
const noteEditAutoSaveLogger = noteEditLogger.child('AutoSave')
noteEditAutoSaveLogger.debug('Auto-save triggered')
// Output: "14:30:15 [NoteEdit:AutoSave] Auto-save triggered"
```

## Production-Safe Assertions

```typescript
import { assert } from '../utils/logger'

const processNote = note => {
  // Development: throws error, Production: logs error and continues
  assert(note && note.id, 'Note must have an ID')
  assert(typeof note.title === 'string', 'Note title must be a string')

  // Safe to continue processing
  return processNoteContent(note)
}

// Usage in data validation
const validateNoteStructure = notes => {
  notes.forEach((note, index) => {
    assert(note.id, `Note at index ${index} missing ID`)
    assert(note.createdAt, `Note ${note.id} missing createdAt`)
    assert(Array.isArray(note.tags), `Note ${note.id} tags must be array`)
  })
}
```

## React Integration Examples

### Component Lifecycle Logging

```typescript
import { logger } from '../utils/logger'

const NoteEditor = ({ noteId }) => {
  const componentLogger = useMemo(() => logger.child('NoteEditor'), [])

  useEffect(() => {
    componentLogger.debug('Component mounted', { noteId })

    return () => {
      componentLogger.debug('Component unmounted', { noteId })
    }
  }, [componentLogger, noteId])

  const handleSave = async (content) => {
    componentLogger.info('Save initiated', { noteId, contentLength: content.length })

    try {
      await saveNote(noteId, content)
      componentLogger.info('Save completed', { noteId })
    } catch (error) {
      componentLogger.error('Save failed', { noteId, error: error.message })
    }
  }

  return <div>Editor content</div>
}
```

### Hook-based Logging

```typescript
const useOperationLogger = (operationName, dependencies = []) => {
  const opLogger = useMemo(() => logger.child(operationName), [operationName])

  const logOperation = useCallback((message, data = {}) => {
    opLogger.info(message, data)
  }, [opLogger])

  const logError = useCallback((message, error, data = {}) => {
    opLogger.error(message, { error: error.message, ...data })
  }, [opLogger])

  // Log when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      opLogger.debug('Dependencies changed', { dependencies })
    }
  }, dependencies)

  return { logOperation, logError, logger: opLogger }
}

// Usage
const NotesManager = () => {
  const { logOperation, logError } = useOperationLogger('NotesManager', [])

  const createNote = async (title) => {
    logOperation('Creating note', { title })

    try {
      const note = await api.createNote(title)
      logOperation('Note created', { noteId: note.id })
      return note
    } catch (error) {
      logError('Note creation failed', error, { title })
      throw error
    }
  }

  return <div>Notes interface</div>
}
```

### Error Boundary Integration

```typescript
import { logger } from '../utils/logger'

class LoggingErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.errorLogger = logger.child('ErrorBoundary')
  }

  componentDidCatch(error, errorInfo) {
    this.errorLogger.error('Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName
    })

    // Additional error reporting
    if (process.env.NODE_ENV === 'production') {
      this.reportToErrorService(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>
    }
    return this.props.children
  }
}
```

## Storage and Search Integration

### Storage Operations

```typescript
import { storageLogger } from '../utils/logger'

const NotesStorage = {
  async saveNote(note) {
    storageLogger.debug('Saving note to storage', {
      noteId: note.id,
      size: JSON.stringify(note).length,
    })

    try {
      const saved = await localStorage.setItem(
        `note_${note.id}`,
        JSON.stringify(note)
      )
      storageLogger.info('Note saved successfully', { noteId: note.id })
      return saved
    } catch (error) {
      storageLogger.error('Failed to save note', {
        noteId: note.id,
        error: error.message,
      })
      throw error
    }
  },

  async loadNotes() {
    storageLogger.debug('Loading notes from storage')

    const startTime = performance.now()
    const notes = await this.getAllNotes()
    const loadTime = performance.now() - startTime

    storageLogger.info('Notes loaded', {
      count: notes.length,
      loadTime: `${loadTime.toFixed(2)}ms`,
    })

    return notes
  },
}
```

### Search Operations

```typescript
import { searchLogger } from '../utils/logger'

const useSearchWithLogging = () => {
  const performSearch = useCallback(async query => {
    searchLogger.debug('Search initiated', { query, queryLength: query.length })

    const startTime = performance.now()

    try {
      const results = await searchNotes(query)
      const searchTime = performance.now() - startTime

      searchLogger.info('Search completed', {
        query,
        resultCount: results.length,
        searchTime: `${searchTime.toFixed(2)}ms`,
        avgRelevance:
          results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length,
      })

      return results
    } catch (error) {
      searchLogger.error('Search failed', { query, error: error.message })
      throw error
    }
  }, [])

  return { performSearch }
}
```

## Configuration Examples

### Environment-Specific Configuration

```typescript
// config/logger.ts
const getLoggerConfig = () => {
  const isDev = process.env.NODE_ENV === 'development'
  const isTest = process.env.NODE_ENV === 'test'

  if (isTest) {
    return {
      enabled: false, // Disable logging in tests
      level: 'error' as LogLevel,
    }
  }

  if (isDev) {
    return {
      enabled: true,
      level: 'debug' as LogLevel,
      prefix: 'DEV',
    }
  }

  // Production
  return {
    enabled: true,
    level: 'warn' as LogLevel, // Only warnings and errors
    prefix: 'PROD',
  }
}

export const appLogger = new Logger(getLoggerConfig())
```

### Feature-Specific Loggers

```typescript
// Create loggers for different app features
export const createFeatureLoggers = () => ({
  editor: logger.child('Editor'),
  sync: logger.child('Sync'),
  search: logger.child('Search'),
  storage: logger.child('Storage'),
  auth: logger.child('Auth'),
  ui: logger.child('UI'),
})

// Usage across the app
const featureLoggers = createFeatureLoggers()

// In editor components
const EditorComponent = () => {
  featureLoggers.editor.debug('Editor rendered')
  // ...
}

// In sync service
const SyncService = {
  async sync() {
    featureLoggers.sync.info('Sync started')
    // ...
  },
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Logger, { logger } from '../logger'

describe('Logger', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore())
  })

  it('should log debug messages in development', () => {
    process.env.NODE_ENV = 'development'
    const devLogger = new Logger({ enabled: true, level: 'debug' })

    devLogger.debug('Test message')
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('Test message')
    )
  })

  it('should not log debug messages in production', () => {
    const prodLogger = new Logger({ enabled: true, level: 'info' })

    prodLogger.debug('Debug message')
    expect(consoleSpy.log).not.toHaveBeenCalled()
  })

  it('should always log errors', () => {
    const logger = new Logger({ enabled: true, level: 'error' })

    logger.error('Error message')
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('Error message')
    )
  })

  it('should create child loggers with inherited config', () => {
    const parentLogger = new Logger({ prefix: 'Parent' })
    const childLogger = parentLogger.child('Child')

    childLogger.info('Test message')
    expect(consoleSpy.info).toHaveBeenCalledWith(
      expect.stringContaining('[Parent:Child]')
    )
  })
})
```

## Production Considerations

### Log Level Management

```typescript
// Set production log levels
const getProductionLogger = () => {
  return new Logger({
    enabled: true,
    level: 'warn', // Only warnings and errors in production
    prefix: 'APP',
  })
}

// Critical errors for monitoring
const criticalLogger = new Logger({
  enabled: true,
  level: 'error',
  prefix: 'CRITICAL',
})

// Usage
criticalLogger.error('Database connection lost', {
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  url: window.location.href,
})
```

### Remote Logging Integration

```typescript
// Extend logger for remote logging
class RemoteLogger extends Logger {
  constructor(config, endpoint) {
    super(config)
    this.endpoint = endpoint
  }

  error(message, contextOrArg, ...args) {
    // Call parent logger
    super.error(message, contextOrArg, ...args)

    // Send to remote service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToRemote('error', message, contextOrArg, ...args)
    }
  }

  async sendToRemote(level, message, ...data) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      console.error('Failed to send log to remote service:', error)
    }
  }
}
```

## Best Practices

1. **Use appropriate log levels** - Debug for development, warn/error for production
2. **Include relevant context** - Add useful data for debugging
3. **Avoid logging sensitive data** - Never log passwords, tokens, or personal data
4. **Use specialized loggers** - Create module-specific loggers for better organization
5. **Performance considerations** - Disable verbose logging in production
6. **Error handling** - Always log errors with sufficient context
7. **Testing** - Mock console methods when testing logging functionality

## Performance Impact

| Environment | Log Level | Performance Impact | Use Case                |
| ----------- | --------- | ------------------ | ----------------------- |
| Development | debug     | Low                | Full debugging info     |
| Development | info      | Very Low           | General information     |
| Production  | warn      | Minimal            | Important warnings only |
| Production  | error     | Minimal            | Critical errors only    |
| Tests       | disabled  | None               | Clean test output       |

## Related Components

- `ErrorHandler` - Integrates with logger for error tracking
- `useErrorHandler` - Uses logging for error context
- `search-worker.js` - Uses logging for performance monitoring
- `SyncManager` - Uses logging for sync operation tracking
