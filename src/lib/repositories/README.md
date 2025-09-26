# Repository System Documentation

## Overview

The Repository System provides a comprehensive, production-ready storage abstraction layer that replaces the complex localStorage patterns throughout the codebase. It implements proper error handling, retry logic, circuit breaker patterns, and comprehensive type safety.

## Architecture

### Core Components

1. **Enhanced Repository Types** (`types/RepositoryTypes.ts`)
   - Comprehensive error handling with typed exceptions
   - Storage key mappings for localStorage migration
   - Performance and resilience configuration
   - Plugin storage security types

2. **Enhanced Repository Interface** (`interfaces/IEnhancedRepository.ts`)
   - Unified interface supporting all localStorage patterns
   - Settings, UI state, plugin data, content, and analytics storage
   - Migration, backup, transaction, and event system support

3. **Error Handling System** (`errors/RepositoryErrorHandler.ts`)
   - Typed error classes with context and retry logic
   - Exponential backoff with jitter
   - Circuit breaker pattern for resilience
   - Error classification and recovery strategies

4. **Implementation** (`DocumentRepository.ts`)
   - Enhanced implementation with comprehensive error handling
   - Retry logic integrated into all operations
   - Proper conflict resolution for concurrent operations
   - Support for both Electron and browser environments

## Key Features

### Error Handling & Resilience

- **Typed Exceptions**: Specific error types for different failure scenarios
- **Retry Logic**: Exponential backoff with jitter for transient failures
- **Circuit Breaker**: Automatic service protection during sustained failures
- **Error Classification**: Intelligent categorization of errors for proper handling

### Storage Migration

- **localStorage Audit**: Complete mapping of all existing localStorage usage
- **Safe Migration**: Gradual migration with fallback and validation
- **Key Mapping**: Predefined mappings for 47 localStorage patterns across 25 files

### Performance & Security

- **Caching**: Intelligent caching with TTL and size limits
- **Plugin Sandboxing**: Secure plugin storage with quota enforcement
- **Encryption**: Optional encryption for sensitive data
- **Metrics**: Comprehensive performance and health monitoring

## Usage Examples

### Basic Document Operations

```typescript
import { DocumentRepository } from './DocumentRepository'

const repo = new DocumentRepository()
await repo.initialize()

// Get all notes with error handling
const notes = await repo.getNotes()

// Save with conflict resolution
const savedNote = await repo.saveNote(note)
```

### Error Handling

```typescript
import {
  RepositoryErrorHandler,
  isConflictError,
  isStorageNotAvailableError,
} from './errors/RepositoryErrorHandler'

try {
  await repo.saveNote(note)
} catch (error) {
  if (isConflictError(error)) {
    // Handle conflict with latest data
    console.log('Conflict detected:', error.context)
  } else if (isStorageNotAvailableError(error)) {
    // Handle storage unavailability
    console.log('Storage unavailable, trying fallback')
  }
}
```

### Enhanced Repository (Future)

```typescript
import { IEnhancedDocumentRepository } from './interfaces/IEnhancedRepository'

// Settings management
await repo.setSettings({ theme: 'dark' })
const theme = await repo.getSetting('theme')

// UI state persistence
await repo.setUIState('sidebar', 'width', 300)
const width = await repo.getUIState('sidebar', 'width')

// Plugin storage (sandboxed)
await repo.setPluginData('my-plugin', 'config', data, {
  sandboxed: true,
  encrypted: true,
})
```

## Migration Strategy

### Phase 1: Foundation (Current)

- ✅ Enhanced repository types and error handling
- ✅ Extended DocumentRepository interface
- ✅ Comprehensive error handling with retry logic
- 🔄 Update existing repository implementations

### Phase 2: localStorage Migration

- Replace localStorage usage patterns systematically
- Implement enhanced repository with all localStorage methods
- Add comprehensive migration utilities
- Ensure backward compatibility during transition

### Phase 3: Production Features

- Add transaction support for complex operations
- Implement event system for reactive updates
- Add backup/restore functionality
- Performance optimization and monitoring

## Storage Patterns Supported

The repository system handles all identified localStorage patterns:

### Settings & Configuration (High Priority)

- `viny-settings` → Enhanced settings repository
- `language`, `theme` → UI state management
- `viny-initialized` → App initialization tracking

### Plugin System (High Priority - Security Critical)

- `viny_security_config` → Secure plugin configuration
- Plugin-specific storage with sandboxing and quotas

### UI State (Medium Priority)

- `viny-sidebar-width`, `viny-noteslist-width` → Layout persistence
- `viny-split-ratio` → Editor split ratios
- Component state management

### Content & Media (Medium Priority)

- `viny-images` → Image storage with size limits
- Attachment handling with compression

### Analytics & Search (Low Priority)

- `viny_search_history` → Privacy-compliant search tracking
- `viny_analytics`, `viny_telemetry` → Usage metrics
- Optional data collection with user consent

### Error Handling (Low Priority)

- `viny_error_reports` → Error tracking and debugging
- Automatic cleanup of old error data

## Configuration

### Retry Configuration

```typescript
const retryConfig = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  exponentialBackoff: true,
  jitter: true,
}
```

### Circuit Breaker Configuration

```typescript
const circuitBreakerConfig = {
  enabled: true,
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  monitoringPeriodMs: 60000,
}
```

## Testing

The repository system includes comprehensive unit tests covering:

- Error handling scenarios
- Retry logic with various failure patterns
- Circuit breaker state transitions
- Migration utilities
- Performance under load

## Security Considerations

- **Plugin Sandboxing**: All plugin data is isolated and quota-limited
- **Encryption**: Optional encryption for sensitive settings
- **Error Context**: Sensitive data is redacted from error logs
- **Permission Checks**: Storage access validation
- **Input Validation**: All data is validated before storage

## Performance Metrics

The system tracks:

- Operation latency (p50, p95, p99)
- Error rates by operation type
- Cache hit/miss ratios
- Storage usage by category
- Circuit breaker state changes

## Future Enhancements

- **RxDB Integration**: Preparation for RxDB + Supabase migration
- **Conflict Resolution**: CRDT-based conflict resolution
- **Offline Support**: Robust offline-first capabilities
- **Sync Protocol**: Bidirectional sync with conflict handling
- **Schema Evolution**: Automatic data migration for schema changes
