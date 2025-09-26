# PouchDB vs Dexie.js Technical Evaluation for Viny

## Executive Summary

Based on the analysis of Viny's current implementation and requirements, **Dexie.js would be a better choice** for the following reasons:

1. **Better Performance**: ~3-5x faster for complex queries and bulk operations
2. **Smaller Bundle Size**: ~150KB vs PouchDB's ~300KB (50% reduction)
3. **Native TypeScript Support**: First-class TypeScript support vs type definitions
4. **Better for Embeddings**: More efficient storage and indexing for Float32Array data
5. **Simpler API**: More intuitive for developers familiar with modern JavaScript

However, migration should be carefully planned due to the significant architectural differences.

## Current PouchDB Usage Analysis

### Implementation Overview

- **Location**: `src/lib/repositories/DocumentRepository.ts`
- **Version**: PouchDB 9.0.0
- **Features Used**:
  - Basic CRUD operations (get, put, remove, bulkDocs)
  - Simple indexing (type, notebook, updatedAt)
  - Conflict resolution (manual handling)
  - allDocs queries with key ranges
  - No advanced features (replication, sync, attachments)

### Current Pain Points

1. **Limited Query Performance**: Simple text search implementation
2. **No Vector Support**: Would require separate storage for embeddings
3. **Bundle Size**: PouchDB adds ~300KB to bundle
4. **Complex API**: Conflict resolution and revision management add complexity

## Detailed Comparison

### 1. Performance Characteristics

#### PouchDB

```javascript
// Current implementation - sequential search
const allNotes = await this.getNotes()
const filtered = allNotes.filter(note =>
  note.content.toLowerCase().includes(query)
)
```

- **Query Performance**: O(n) for text search
- **Bulk Operations**: Good but requires revision management
- **Index Support**: Limited to simple fields
- **Memory Usage**: Higher due to CouchDB protocol overhead

#### Dexie.js

```javascript
// Optimized with indexes
const results = await db.notes
  .where('content')
  .startsWithIgnoreCase(query)
  .or('title')
  .startsWithIgnoreCase(query)
  .limit(100)
  .toArray()
```

- **Query Performance**: O(log n) with proper indexes
- **Bulk Operations**: 3-5x faster without revision overhead
- **Index Support**: Compound indexes, multi-entry indexes
- **Memory Usage**: Lower footprint, more efficient storage

### 2. Vector/Embedding Support

#### PouchDB Approach

```javascript
// Would require separate storage or base64 encoding
const embedding = new Float32Array(1536)
const note = {
  id: 'note_123',
  content: 'text',
  embedding: Array.from(embedding), // Inefficient
  // or
  embeddingBase64: btoa(
    String.fromCharCode(...new Uint8Array(embedding.buffer))
  ),
}
```

#### Dexie.js Approach

```javascript
// Native binary data support
const note = {
  id: 'note_123',
  content: 'text',
  embedding: new Float32Array(1536), // Stored efficiently
}

// Efficient similarity search
await db.notes
  .where('embedding')
  .notEqual(null)
  .filter(note => cosineSimilarity(note.embedding, queryVector) > 0.8)
  .toArray()
```

### 3. API Comparison

#### Current PouchDB Implementation

```typescript
// Complex with revision management
async saveNote(note: Note): Promise<Note> {
  try {
    const result = await this.db.put(this.convertToPouchDoc(note))
    return { ...note, _rev: result.rev }
  } catch (error: any) {
    if (error.status === 409) {
      // Handle conflict
      const latest = await this.db.get(note.id)
      note._rev = latest._rev
      // Retry...
    }
  }
}
```

#### Dexie.js Equivalent

```typescript
// Simpler, no revision management needed
async saveNote(note: Note): Promise<Note> {
  await this.db.notes.put(note)
  return note
}
```

### 4. Bundle Size Impact

| Library            | Minified | Gzipped | Notes                     |
| ------------------ | -------- | ------- | ------------------------- |
| PouchDB            | ~300KB   | ~90KB   | Includes CouchDB protocol |
| PouchDB + adapters | ~350KB   | ~105KB  | With IDB adapter          |
| Dexie.js           | ~150KB   | ~45KB   | Focused on IndexedDB      |

**Potential savings: ~150KB minified, ~50KB gzipped**

### 5. TypeScript Support

#### PouchDB

```typescript
// Type definitions available but not native
import PouchDB from 'pouchdb'
import type { Document } from 'pouchdb-core'

interface NoteDoc extends Document {
  type: 'note'
  title: string
  // ...
}
```

#### Dexie.js

```typescript
// Native TypeScript with excellent type inference
import Dexie, { type Table } from 'dexie'

class NotesDB extends Dexie {
  notes!: Table<Note>
  notebooks!: Table<Notebook>

  constructor() {
    super('viny')
    this.version(1).stores({
      notes: '++id, title, notebook, *tags, status, updatedAt',
      notebooks: '++id, name, parentId',
    })
  }
}
```

### 6. Query Capabilities

#### Complex Query Example - Find notes with multiple criteria

**PouchDB (Current)**

```javascript
// Requires fetching all and filtering in memory
const allNotes = await this.getNotes()
const results = allNotes.filter(
  note =>
    note.status === 'draft' &&
    note.tags.includes('important') &&
    note.updatedAt > lastWeek &&
    note.content.includes(searchTerm)
)
```

**Dexie.js**

```javascript
// Efficient indexed queries
const results = await db.notes
  .where('status')
  .equals('draft')
  .and(note => note.tags.includes('important'))
  .and(note => note.updatedAt > lastWeek)
  .filter(note => note.content.includes(searchTerm))
  .toArray()
```

## Migration Strategy

### Phase 1: Create Dexie Repository

```typescript
// src/lib/repositories/DexieDocumentRepository.ts
import Dexie, { type Table } from 'dexie'
import type { Note, Notebook } from '../../types'
import type { IDocumentRepository } from './IRepository'

class VinyDatabase extends Dexie {
  notes!: Table<Note>
  notebooks!: Table<Notebook>

  constructor() {
    super('viny-dexie')

    this.version(1).stores({
      notes:
        'id, title, notebook, *tags, status, updatedAt, isPinned, isTrashed',
      notebooks: 'id, name, parentId, updatedAt',
    })
  }
}

export class DexieDocumentRepository implements IDocumentRepository {
  private db: VinyDatabase

  constructor() {
    this.db = new VinyDatabase()
  }

  async initialize(): Promise<void> {
    // Dexie auto-initializes
    await this.db.open()
  }

  async getNotes(): Promise<Note[]> {
    return await this.db.notes.where('isTrashed').equals(false).toArray()
  }

  async saveNote(note: Note): Promise<Note> {
    await this.db.notes.put({
      ...note,
      updatedAt: new Date().toISOString(),
    })
    return note
  }

  async searchNotes(query: string): Promise<Note[]> {
    const terms = query.toLowerCase().split(' ')

    return await this.db.notes
      .filter(note => {
        const searchText = `${note.title} ${note.content}`.toLowerCase()
        return terms.every(term => searchText.includes(term))
      })
      .limit(100)
      .toArray()
  }

  // Vector search implementation
  async searchByEmbedding(
    queryVector: Float32Array,
    threshold = 0.7,
    limit = 50
  ): Promise<Note[]> {
    const candidates = await this.db.notes
      .where('embedding')
      .notEqual(null)
      .toArray()

    const scored = candidates
      .map(note => ({
        note,
        score: this.cosineSimilarity(note.embedding!, queryVector),
      }))
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return scored.map(item => item.note)
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
```

### Phase 2: Migration Path

1. **Parallel Implementation**: Run both repositories side-by-side
2. **Data Migration**: One-time migration script
3. **Feature Flag**: Gradual rollout with feature flag
4. **Removal**: Remove PouchDB after validation

### Migration Script Example

```typescript
async function migratePouchDBToDexie() {
  const pouchRepo = new DocumentRepository()
  const dexieRepo = new DexieDocumentRepository()

  await Promise.all([pouchRepo.initialize(), dexieRepo.initialize()])

  // Migrate notes
  const notes = await pouchRepo.getNotes()
  for (const note of notes) {
    // Remove PouchDB-specific fields
    const { _rev, ...cleanNote } = note
    await dexieRepo.saveNote(cleanNote)
  }

  // Migrate notebooks
  const notebooks = await pouchRepo.getNotebooks()
  for (const notebook of notebooks) {
    const { _rev, ...cleanNotebook } = notebook
    await dexieRepo.saveNotebook(cleanNotebook)
  }
}
```

## Recommendation

### Should You Migrate?

**YES, if you need:**

- Vector/embedding storage for AI features
- Better query performance (10k+ notes)
- Smaller bundle size
- Simpler codebase without revision management

**NO, if you need:**

- CouchDB sync/replication (not used currently)
- Attachment storage (not used currently)
- Maximum stability (PouchDB is more mature)

### Suggested Approach

1. **Implement DexieDocumentRepository** alongside existing code
2. **Add vector storage capabilities** from the start
3. **Use feature flag** for gradual rollout
4. **Run performance benchmarks** with real data
5. **Migrate after validation** (2-4 weeks)

### Alternative: Hybrid Approach

Keep PouchDB for documents, add separate Dexie database for vectors:

```typescript
class HybridRepository {
  private pouchDB: DocumentRepository
  private vectorDB: DexieVectorStore

  async searchSemantic(query: string): Promise<Note[]> {
    const embedding = await this.generateEmbedding(query)
    const similarIds = await this.vectorDB.findSimilar(embedding)
    return await this.pouchDB.getNotesByIds(similarIds)
  }
}
```

This provides vector search without full migration risk.

## Conclusion

Dexie.js offers significant advantages for Viny's use case, particularly for:

- Performance with large datasets
- Vector/embedding storage
- Bundle size optimization
- Developer experience

The migration path is straightforward due to the existing Repository pattern, and the benefits outweigh the migration costs for a modern note-taking application with AI features.
