# 🚀 Advanced Plugin Development Guide

## Overview

Viny's enhanced plugin system provides a secure, high-performance API that integrates with the Repository Pattern for optimal data consistency and performance.

## 🏗️ Architecture

### Repository Pattern Integration

All plugin operations now go through the Repository layer, ensuring:

- **Consistent data handling**
- **Automatic error recovery**
- **Performance optimization**
- **Transaction safety**

```typescript
// Enhanced Plugin API with Repository Pattern
const api = {
  notes: {
    // All operations are async and repository-backed
    getAll: async (): Promise<Note[]>
    getById: async (id: string): Promise<Note | null>
    search: async (query: string, options?): Promise<Note[]>
    create: async (noteData: Partial<Note>): Promise<Note>
    update: async (id: string, updates: Partial<Note>): Promise<Note>
    delete: async (id: string, permanent?: boolean): Promise<void>

    // New batch operations for performance
    createBatch: async (notesData: Partial<Note>[]): Promise<Note[]>
    getStats: async (): Promise<NoteStatistics>
  },

  notebooks: {
    getAll: async (): Promise<Notebook[]>
    create: async (notebookData: Partial<Notebook>): Promise<Notebook>
  }
}
```

## 🔐 Enhanced Security Framework

### Permission System

Plugins operate under strict security policies:

```typescript
const securityPolicy = {
  pluginName: 'my-plugin',
  permissions: [
    'notes.read', // Read notes
    'notes.write', // Create/update notes
    'notes.delete', // Delete notes
    'notebooks.read', // Read notebooks
    'notebooks.write', // Create/update notebooks
    'ui.modify', // Modify UI elements
    'storage.access', // Access local storage
    'network.fetch', // Make network requests
  ],
  resourceLimits: {
    maxMemoryMB: 50,
    maxExecutionTimeMs: 5000,
    maxNetworkRequests: 10,
    maxStorageMB: 10,
    maxConcurrentOperations: 3,
  },
  sandboxLevel: 'strict',
}
```

### Security Monitoring

The system automatically monitors:

- **Resource usage** (memory, execution time)
- **Permission violations**
- **Network activity**
- **Storage consumption**

## 📊 Plugin Development Patterns

### 1. Basic Plugin Structure

```typescript
// manifest.json
{
  "name": "my-advanced-plugin",
  "version": "1.0.0",
  "description": "Advanced plugin with repository integration",
  "author": "Developer Name",
  "permissions": ["notes.read", "notes.write", "ui.modify"],
  "main": "index.js"
}

// index.js
export default class MyAdvancedPlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
  }

  async initialize() {
    // Plugin initialization
    const tracker = this.security.startOperation('initialization')

    try {
      await this.setupUI()
      await this.loadPluginData()
      tracker.finish()
    } catch (error) {
      tracker.finish()
      throw error
    }
  }

  async setupUI() {
    // Add plugin UI elements
    this.api.ui.addSidebarSection({
      id: 'my-plugin-section',
      title: 'My Plugin',
      content: '<div>Plugin content</div>'
    })
  }

  async loadPluginData() {
    // Load notes using repository-backed API
    const notes = await this.api.notes.getAll()
    const stats = await this.api.notes.getStats()

    console.log(`Loaded ${notes.length} notes`)
    console.log('Note statistics:', stats)
  }
}
```

### 2. Advanced Data Operations

```typescript
export default class DataProcessorPlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
  }

  async processNotes() {
    const tracker = this.security.startOperation('process-notes')

    try {
      // Search for specific notes
      const todoNotes = await this.api.notes.search('TODO', {
        includeContent: true,
        tags: ['task'],
      })

      // Batch create processed notes
      const processedNotes = todoNotes.map(note => ({
        title: `Processed: ${note.title}`,
        content: this.processContent(note.content),
        notebook: 'processed',
        tags: [...note.tags, 'processed'],
      }))

      const createdNotes = await this.api.notes.createBatch(processedNotes)

      tracker.finish()
      return createdNotes
    } catch (error) {
      tracker.finish()
      throw error
    }
  }

  processContent(content) {
    // Process note content
    return content.replace(/TODO:/g, '✅ DONE:')
  }
}
```

### 3. Performance-Optimized Plugin

```typescript
export default class PerformancePlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
    this.cache = new Map()
  }

  async getNotesWithCaching() {
    // Check cache first
    const cacheKey = 'all-notes'
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const tracker = this.security.startOperation('get-notes-cached')

    try {
      const notes = await this.api.notes.getAll()

      // Cache for 5 minutes
      this.cache.set(cacheKey, notes)
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000)

      tracker.finish()
      return notes
    } catch (error) {
      tracker.finish()
      throw error
    }
  }

  async efficientSearch(query) {
    // Use statistics to optimize search
    const stats = await this.api.notes.getStats()

    // If we have few notes, search everything
    if (stats.total < 100) {
      return await this.api.notes.search(query, { includeContent: true })
    }

    // For many notes, search titles first
    const titleResults = await this.api.notes.search(query, {
      includeContent: false,
    })

    // If we get few results, expand to content search
    if (titleResults.length < 10) {
      return await this.api.notes.search(query, { includeContent: true })
    }

    return titleResults
  }
}
```

## 🛡️ Security Best Practices

### 1. Permission Management

```typescript
class SecurePlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
  }

  async safeOperation() {
    // Always wrap operations in try-catch
    const tracker = this.security.startOperation('safe-operation')

    try {
      // Check permissions before sensitive operations
      if (!this.security.validatePermission('notes.write')) {
        throw new Error('Insufficient permissions')
      }

      // Perform operation
      const result = await this.api.notes.create({
        title: 'Safe Note',
        content: 'Created safely',
      })

      tracker.finish()
      return result
    } catch (error) {
      tracker.finish()
      throw error
    }
  }
}
```

### 2. Resource Management

```typescript
class ResourceAwarePlugin {
  async heavyOperation() {
    const tracker = this.security.startOperation('heavy-operation')

    try {
      // Check execution time periodically
      const startTime = Date.now()

      const notes = await this.api.notes.getAll()

      for (const note of notes) {
        // Check if we're approaching time limit
        if (Date.now() - startTime > 4000) {
          // 4s of 5s limit
          console.warn('Approaching execution time limit, stopping early')
          break
        }

        await this.processNote(note)
      }

      tracker.finish()
    } catch (error) {
      tracker.finish()
      throw error
    }
  }
}
```

## 📈 Performance Guidelines

### 1. Use Batch Operations

```typescript
// ❌ Inefficient - multiple repository calls
for (const noteData of notesArray) {
  await api.notes.create(noteData)
}

// ✅ Efficient - single batch operation
await api.notes.createBatch(notesArray)
```

### 2. Implement Caching

```typescript
class CachingPlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
    this.cache = new Map()
    this.cacheExpiry = new Map()
  }

  async getCachedNotes() {
    const key = 'notes'

    if (this.cache.has(key) && this.cacheExpiry.get(key) > Date.now()) {
      return this.cache.get(key)
    }

    const notes = await this.api.notes.getAll()
    this.cache.set(key, notes)
    this.cacheExpiry.set(key, Date.now() + 60000) // 1 minute cache

    return notes
  }
}
```

### 3. Use Statistics for Optimization

```typescript
async optimizedOperation() {
  const stats = await this.api.notes.getStats()

  // Adapt behavior based on data size
  if (stats.total > 1000) {
    // Use pagination or streaming for large datasets
    return await this.handleLargeDataset()
  } else {
    // Use simple approach for small datasets
    return await this.handleSmallDataset()
  }
}
```

## 🔧 Debugging and Monitoring

### Security Audit

```typescript
// Get plugin security report
const auditReport = security.getAuditReport('my-plugin')
console.log('Security Status:', auditReport.riskLevel)
console.log('Violations:', auditReport.violations)
console.log('Resource Usage:', auditReport.metrics)
```

### System Monitoring

```typescript
// Get system-wide security summary
const summary = security.getSecuritySummary()
console.log('Active Plugins:', summary.activePlugins)
console.log('High Risk Plugins:', summary.highRiskPlugins)
console.log('Resource Usage:', summary.resourceUsage)
```

## 🎯 Migration from Legacy API

### Before (Legacy API)

```typescript
// Direct store access
const notes = store.notes.filter(note => !note.isTrashed)
```

### After (Enhanced API)

```typescript
// Repository-backed API
const notes = await api.notes.getAll()
```

### Migration Checklist

- [ ] Update all operations to async/await
- [ ] Add proper error handling with try-catch
- [ ] Implement operation tracking for resource monitoring
- [ ] Update permission requirements in manifest
- [ ] Test with security policy enforcement
- [ ] Add performance optimizations (caching, batching)

## 🚀 Advanced Features

### 1. Custom Security Policies

```typescript
// Register custom security policy
await security.registerPlugin('my-plugin', {
  permissions: ['notes.read', 'notes.write'],
  resourceLimits: {
    maxMemoryMB: 100, // Increased for data-heavy plugin
    maxExecutionTimeMs: 10000, // Longer time for complex operations
    maxConcurrentOperations: 5,
  },
  sandboxLevel: 'moderate',
  trustedOrigins: ['https://my-plugin-api.com'],
})
```

### 2. Plugin Communication

```typescript
// Safe inter-plugin communication through events
class CommunicatingPlugin {
  constructor(api, security) {
    this.api = api
    this.security = security
  }

  async shareData(targetPlugin, data) {
    // Validate target plugin permissions
    const targetReport = this.security.getAuditReport(targetPlugin)
    if (targetReport.riskLevel === 'critical') {
      throw new Error('Cannot communicate with high-risk plugin')
    }

    // Send data through secure channel
    this.api.events.emit('plugin-message', {
      from: 'my-plugin',
      to: targetPlugin,
      data: data,
    })
  }
}
```

## 📚 Reference

### Full API Documentation

- [Plugin API Reference](./PLUGIN-API.md)
- [Security Framework](./PLUGIN-SECURITY.md)
- [Performance Guide](./PLUGIN-PERFORMANCE.md)

### Example Plugins

- [Note Statistics Plugin](../examples/plugins/note-stats/)
- [Content Processor Plugin](../examples/plugins/content-processor/)
- [Export Enhancement Plugin](../examples/plugins/export-enhanced/)

This enhanced plugin system provides enterprise-grade security, performance, and developer experience while maintaining backward compatibility with existing plugins.
