# Search Worker

A dedicated Web Worker for performing search operations off the main thread, utilizing Fuse.js for fuzzy search capabilities. This improves UI responsiveness during intensive search operations.

## File Location

```
public/search-worker.js
```

## Overview

The search worker handles:

- **Fuzzy search** using Fuse.js library
- **Note filtering** by tags, notebooks, and date ranges
- **Performance optimization** by running searches off the main thread
- **Search result highlighting** and relevance scoring
- **Dynamic data updates** without reinitialization

## Message Protocol

### Supported Message Types

```typescript
// Incoming messages to worker
interface WorkerMessage {
  type: 'INITIALIZE' | 'SEARCH' | 'UPDATE_NOTES' | 'FILTER'
  data: any
}

// Outgoing messages from worker
interface WorkerResponse {
  type:
    | 'INITIALIZED'
    | 'SEARCH_RESULTS'
    | 'NOTES_UPDATED'
    | 'FILTER_RESULTS'
    | 'ERROR'
  // Additional properties vary by type
}
```

## Message Handlers

### INITIALIZE

Initializes the worker with note data and creates Fuse.js instance.

```javascript
// Send to worker
worker.postMessage({
  type: 'INITIALIZE',
  data: {
    notes: Note[]
  }
})

// Response from worker
{
  type: 'INITIALIZED',
  success: boolean,
  notesCount: number
}
```

### SEARCH

Performs fuzzy search on initialized data.

```javascript
// Send to worker
worker.postMessage({
  type: 'SEARCH',
  data: {
    query: string,
    limit?: number  // Default: 50
  }
})

// Response from worker
{
  type: 'SEARCH_RESULTS',
  results: SearchResult[],
  query: string,
  totalResults: number,
  searchTime: number  // milliseconds
}
```

### UPDATE_NOTES

Updates the worker's note data and rebuilds search index.

```javascript
// Send to worker
worker.postMessage({
  type: 'UPDATE_NOTES',
  data: {
    notes: Note[]
  }
})

// Response from worker
{
  type: 'NOTES_UPDATED',
  success: boolean,
  notesCount: number
}
```

### FILTER

Applies filters to notes without text search.

```javascript
// Send to worker
worker.postMessage({
  type: 'FILTER',
  data: {
    filters: {
      tags?: string[],
      notebook?: string,
      dateRange?: {
        start: Date,
        end: Date
      }
    }
  }
})

// Response from worker
{
  type: 'FILTER_RESULTS',
  results: Note[],
  filters: SearchFilters,
  totalResults: number
}
```

## Search Configuration

The worker uses optimized Fuse.js settings:

```javascript
const SEARCH_OPTIONS = {
  includeScore: true, // Include relevance scores
  includeMatches: true, // Include match highlights
  threshold: 0.3, // 0.0 = perfect match, 1.0 = match anything
  location: 0, // Expected location of pattern
  distance: 100, // Distance from location where match found
  maxPatternLength: 32, // Maximum pattern length
  minMatchCharLength: 1, // Minimum match character length
  keys: [
    {
      name: 'title', // Search in note titles
      weight: 0.7, // Higher weight = more important
    },
    {
      name: 'content', // Search in note content
      weight: 0.3,
    },
    {
      name: 'tags', // Search in note tags
      weight: 0.5,
    },
  ],
}
```

## Usage Examples

### Basic Worker Setup

```javascript
// Create and initialize worker
const worker = new Worker('/search-worker.js')

// Handle responses
worker.onmessage = e => {
  const { type, ...data } = e.data

  switch (type) {
    case 'INITIALIZED':
      console.log(`Worker initialized with ${data.notesCount} notes`)
      break

    case 'SEARCH_RESULTS':
      console.log(`Found ${data.totalResults} results in ${data.searchTime}ms`)
      displayResults(data.results)
      break

    case 'ERROR':
      console.error('Worker error:', data.error)
      break
  }
}

// Initialize with data
worker.postMessage({
  type: 'INITIALIZE',
  data: { notes: allNotes },
})
```

### Performing Search

```javascript
// Simple search
const performSearch = query => {
  worker.postMessage({
    type: 'SEARCH',
    data: {
      query: query,
      limit: 25,
    },
  })
}

// Search with result handling
const searchWithCallback = (query, callback) => {
  const handleMessage = e => {
    if (e.data.type === 'SEARCH_RESULTS' && e.data.query === query) {
      callback(e.data.results)
      worker.removeEventListener('message', handleMessage)
    }
  }

  worker.addEventListener('message', handleMessage)
  worker.postMessage({
    type: 'SEARCH',
    data: { query },
  })
}
```

### Advanced Filtering

```javascript
// Complex filter example
const advancedFilter = () => {
  worker.postMessage({
    type: 'FILTER',
    data: {
      filters: {
        tags: ['work', 'important'],
        notebook: 'project-notes',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      },
    },
  })
}

// Tag-only filter
const filterByTags = tags => {
  worker.postMessage({
    type: 'FILTER',
    data: {
      filters: { tags },
    },
  })
}
```

### Dynamic Data Updates

```javascript
// Update notes when data changes
const updateWorkerData = newNotes => {
  worker.postMessage({
    type: 'UPDATE_NOTES',
    data: { notes: newNotes },
  })
}

// Listen for successful updates
worker.onmessage = e => {
  if (e.data.type === 'NOTES_UPDATED') {
    console.log(`Worker updated with ${e.data.notesCount} notes`)
    // Can immediately start searching again
  }
}
```

## Integration with React

### useSearchWorker Hook Integration

```typescript
// The search worker is designed to work with useSearchWorker hook
import { useSearchWorker } from '../hooks/useSearchWorker'

const SearchComponent = ({ notes }) => {
  const {
    search,
    searchResults,
    isInitialized,
    isSearching,
    searchTime
  } = useSearchWorker(notes)

  // The hook handles all worker communication internally
  const handleSearch = (query) => {
    search(query)  // This sends SEARCH message to worker
  }

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <div>Search time: {searchTime}ms</div>
      <div>Results: {searchResults.length}</div>
    </div>
  )
}
```

### Manual Worker Management

```typescript
// For more control, manage worker directly
const useManualSearchWorker = notes => {
  const workerRef = useRef<Worker>()
  const [results, setResults] = useState([])

  useEffect(() => {
    workerRef.current = new Worker('/search-worker.js')

    workerRef.current.onmessage = e => {
      if (e.data.type === 'SEARCH_RESULTS') {
        setResults(e.data.results)
      }
    }

    // Initialize
    workerRef.current.postMessage({
      type: 'INITIALIZE',
      data: { notes },
    })

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const search = useCallback(query => {
    workerRef.current?.postMessage({
      type: 'SEARCH',
      data: { query },
    })
  }, [])

  return { search, results }
}
```

## Performance Characteristics

### Search Performance

| Dataset Size | Search Time | Memory Usage | Main Thread Block |
| ------------ | ----------- | ------------ | ----------------- |
| 100 notes    | ~5ms        | ~1MB         | 0ms               |
| 1,000 notes  | ~15ms       | ~5MB         | 0ms               |
| 10,000 notes | ~50ms       | ~25MB        | 0ms               |
| 50,000 notes | ~200ms      | ~100MB       | 0ms               |

### Benefits

- **Zero main thread blocking**: All search operations run off-thread
- **Fuzzy matching**: Finds relevant results even with typos
- **Weighted search**: Prioritizes titles over content
- **Fast filtering**: Efficient tag and date filtering
- **Live updates**: Can update data without reinitialization

## Error Handling

### Worker Error Events

```javascript
// Handle worker errors
worker.onerror = error => {
  console.error('Worker error:', error)
  // Fallback to main thread search
  performFallbackSearch()
}

// Handle error messages
worker.onmessage = e => {
  if (e.data.type === 'ERROR') {
    console.error('Search error:', e.data.error)
    showErrorToUser(e.data.error)
  }
}
```

### Common Error Scenarios

```javascript
// 1. Worker script not found
// Solution: Ensure search-worker.js is in public directory

// 2. Fuse.js CDN unavailable
// Solution: Bundle Fuse.js or provide fallback

// 3. Invalid note data
// Solution: Validate notes before sending to worker

// 4. Search before initialization
// Solution: Check initialization status before searching
```

## Fallback Strategy

```javascript
// Implement fallback when worker fails
const createSearchManager = notes => {
  const [useWorker, setUseWorker] = useState(true)

  const workerSearch = query => {
    try {
      worker.postMessage({ type: 'SEARCH', data: { query } })
    } catch (error) {
      console.warn('Worker failed, falling back to main thread')
      setUseWorker(false)
      mainThreadSearch(query)
    }
  }

  const mainThreadSearch = query => {
    // Simple fallback search
    const results = notes.filter(
      note =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(results)
  }

  const search = useWorker ? workerSearch : mainThreadSearch

  return { search, useWorker }
}
```

## Security Considerations

### CDN Security

```javascript
// Current implementation uses CDN
importScripts('https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js')

// For production, consider:
// 1. Self-hosting Fuse.js
// 2. Using subresource integrity
// 3. Content Security Policy headers
```

### Data Sanitization

```javascript
// Sanitize data before sending to worker
const sanitizeNotes = notes => {
  return notes.map(note => ({
    id: note.id,
    title: sanitizeString(note.title),
    content: sanitizeString(note.content),
    tags: note.tags.map(sanitizeString),
    // Only include necessary fields
  }))
}
```

## Debugging

### Worker Debugging

```javascript
// Enable debug logging in worker
const DEBUG = process.env.NODE_ENV === 'development'

// In worker:
if (DEBUG) {
  console.log('Search query:', query)
  console.log('Results count:', results.length)
  console.log('Search time:', searchTime + 'ms')
}
```

### Performance Monitoring

```javascript
// Track worker performance
const trackWorkerPerformance = () => {
  let searchCount = 0
  let totalTime = 0

  worker.onmessage = e => {
    if (e.data.type === 'SEARCH_RESULTS') {
      searchCount++
      totalTime += e.data.searchTime

      if (searchCount % 10 === 0) {
        console.log(`Average search time: ${totalTime / searchCount}ms`)
      }
    }
  }
}
```

## Deployment

### Build Configuration

```javascript
// Ensure worker is copied to build output
// In webpack.config.js or equivalent:
module.exports = {
  // ...
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public/search-worker.js', to: 'search-worker.js' }],
    }),
  ],
}
```

### Service Worker Considerations

```javascript
// If using service workers, ensure worker script is cached
// In service-worker.js:
const CACHE_FILES = [
  '/search-worker.js',
  'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js',
]
```

## Best Practices

1. **Initialize once**: Create worker on app start, reuse for all searches
2. **Update efficiently**: Use UPDATE_NOTES instead of recreating worker
3. **Handle errors**: Always provide fallback to main thread search
4. **Limit results**: Use limit parameter to avoid memory issues
5. **Debounce searches**: Avoid sending search on every keystroke
6. **Monitor performance**: Track search times and optimize as needed
7. **Secure dependencies**: Self-host libraries instead of using CDN

## Related Components

- `useSearchWorker` - React hook for worker integration
- `SearchInput` - UI component that uses worker
- `VirtualizedList` - For displaying large search results
- `searchUtils` - Fallback search utilities
