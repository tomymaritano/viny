# Search Utils

Utility functions for search functionality including text highlighting, result formatting, and search result optimization.

## Import

```typescript
import {
  highlightText,
  escapeRegExp,
  truncateText,
  extractPreview,
  formatSearchDate,
  getSearchResultIcon,
  sortSearchResults,
  formatKeyboardShortcut,
} from '../utils/searchUtils'
```

## Text Processing Functions

### highlightText

Highlights search terms in text with HTML mark tags.

```typescript
function highlightText(text: string, searchTerm: string): string
```

**Usage:**

```typescript
const text = "This is a sample text with important content"
const highlighted = highlightText(text, "sample")
// Result: "This is a <mark class="search-highlight">sample</mark> text with important content"

// Use in React components
<div dangerouslySetInnerHTML={{ __html: highlightText(note.title, query) }} />
```

**Features:**

- Case-insensitive highlighting
- Escapes special regex characters automatically
- Returns original text if search term is empty
- Adds CSS class `search-highlight` for styling

### escapeRegExp

Escapes special regular expression characters in strings.

```typescript
function escapeRegExp(string: string): string
```

**Usage:**

```typescript
const escaped = escapeRegExp('Hello (world) [test]')
// Result: "Hello \\(world\\) \\[test\\]"

// Use for safe regex construction
const regex = new RegExp(escapeRegExp(userInput), 'gi')
```

### truncateText

Truncates text to specified length with ellipsis.

```typescript
function truncateText(text: string, maxLength: number = 100): string
```

**Usage:**

```typescript
const longText = 'This is a very long piece of text that needs to be truncated'
const short = truncateText(longText, 20)
// Result: "This is a very long..."

// For note previews
const preview = truncateText(note.content, 150)
```

### extractPreview

Extracts contextual preview text from content, especially useful for search results.

```typescript
function extractPreview(
  content: string,
  searchTerm: string = '',
  previewLength: number = 150
): string
```

**Usage:**

```typescript
const content = `
# My Note Title

This is the **introduction** paragraph with some content.

Here is the main content where the search term appears.

More content follows after this.
`

const preview = extractPreview(content, 'main content', 100)
// Result: "...introduction paragraph with some content. Here is the main content where the search term appears. More content..."
```

**Features:**

- Removes Markdown formatting for clean preview
- Centers preview around search term when found
- Falls back to beginning of content if no search term
- Adds ellipsis when content is truncated
- Configurable preview length

## Date Formatting

### formatSearchDate

Formats dates for search results with relative time descriptions.

```typescript
function formatSearchDate(date: string | Date): string
```

**Usage:**

```typescript
// Recent dates
formatSearchDate(new Date()) // "Today"
formatSearchDate(new Date(Date.now() - 86400000)) // "Yesterday"
formatSearchDate(new Date(Date.now() - 86400000 * 3)) // "3 days ago"

// Older dates
formatSearchDate(new Date(Date.now() - 86400000 * 14)) // "2 weeks ago"
formatSearchDate(new Date(Date.now() - 86400000 * 60)) // "2 months ago"

// Very old dates fall back to locale string
formatSearchDate(new Date(2020, 0, 1)) // "1/1/2020" (or locale equivalent)
```

**Output Examples:**

- `"Today"` - same day
- `"Yesterday"` - previous day
- `"3 days ago"` - within a week
- `"2 weeks ago"` - within a month
- `"3 months ago"` - within a year
- `"12/25/2022"` - over a year old

## Search Result Enhancement

### getSearchResultIcon

Returns appropriate icon name for search results based on note properties.

```typescript
function getSearchResultIcon(note: Note): string
```

**Usage:**

```typescript
const note = {
  id: '1',
  title: 'My Note',
  isPinned: true,
  tags: ['important'],
  notebook: 'work',
}

const icon = getSearchResultIcon(note)
// Returns: "Pin" (because note is pinned)

// Icon priority order:
// 1. "Pin" - if note is pinned
// 2. "Tag" - if note has tags
// 3. "FolderOpen" - if note has notebook
// 4. "FileText" - default icon
```

### sortSearchResults

Sorts search results by relevance and importance.

```typescript
function sortSearchResults(results: Note[], searchTerm: string): Note[]
```

**Usage:**

```typescript
const results = [
  { title: 'Shopping List', content: 'Buy groceries', isPinned: false },
  { title: 'Groceries', content: 'Important items', isPinned: true },
  {
    title: 'Meeting Notes',
    content: 'About groceries budget',
    isPinned: false,
  },
]

const sorted = sortSearchResults(results, 'groceries')
// Result order:
// 1. "Groceries" (exact title match + pinned)
// 2. "Shopping List" (title contains term)
// 3. "Meeting Notes" (content contains term)
```

**Sorting Priority:**

1. **Title matches** before content matches
2. **Exact title matches** before partial matches
3. **Pinned notes** before unpinned
4. **Recent modifications** before older ones

## Keyboard Shortcuts

### formatKeyboardShortcut

Formats keyboard shortcut arrays into human-readable strings with platform-specific symbols.

```typescript
function formatKeyboardShortcut(keys: string[]): string
```

**Usage:**

```typescript
// On Mac
formatKeyboardShortcut(['cmd', 'shift', 'n']) // "⌘ + ⇧ + N"

// On Windows/Linux
formatKeyboardShortcut(['cmd', 'shift', 'n']) // "Ctrl + ⇧ + N"

// Special keys
formatKeyboardShortcut(['escape']) // "⎋"
formatKeyboardShortcut(['enter']) // "↵"
formatKeyboardShortcut(['tab']) // "⇥"
formatKeyboardShortcut(['up', 'down']) // "↑ + ↓"
```

**Supported Keys:**

- `cmd` → `⌘` (Mac) / `Ctrl` (Windows/Linux)
- `shift` → `⇧`
- `alt` → `⌥` (Mac) / `Alt` (Windows/Linux)
- `enter` → `↵`
- `escape` → `⎋`
- `tab` → `⇥`
- `up` → `↑`
- `down` → `↓`
- Other keys are capitalized

## Advanced Usage Examples

### Search Result Component

```typescript
import {
  highlightText,
  extractPreview,
  formatSearchDate,
  getSearchResultIcon
} from '../utils/searchUtils'

const SearchResultItem = ({ note, searchQuery }) => {
  const highlightedTitle = highlightText(note.title, searchQuery)
  const preview = extractPreview(note.content, searchQuery, 120)
  const highlightedPreview = highlightText(preview, searchQuery)
  const dateText = formatSearchDate(note.lastModified)
  const iconName = getSearchResultIcon(note)

  return (
    <div className="search-result">
      <div className="result-icon">
        <Icon name={iconName} />
      </div>

      <div className="result-content">
        <h3
          className="result-title"
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />

        <p
          className="result-preview"
          dangerouslySetInnerHTML={{ __html: highlightedPreview }}
        />

        <div className="result-meta">
          <span className="result-date">{dateText}</span>
          {note.tags.length > 0 && (
            <span className="result-tags">
              {note.tags.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Search Input with Shortcuts

```typescript
import { formatKeyboardShortcut } from '../utils/searchUtils'

const SearchInput = ({ onSearch, shortcuts }) => {
  const [query, setQuery] = useState('')

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onSearch(e.target.value)
        }}
      />

      <div className="search-shortcuts">
        {shortcuts.map(shortcut => (
          <span key={shortcut.id} className="shortcut-hint">
            {formatKeyboardShortcut(shortcut.keys)}: {shortcut.description}
          </span>
        ))}
      </div>
    </div>
  )
}
```

### Smart Search Results

```typescript
import { sortSearchResults, extractPreview } from '../utils/searchUtils'

const useSmartSearch = (notes, query) => {
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Basic search
    const matches = notes.filter(
      note =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    // Sort by relevance
    const sorted = sortSearchResults(matches, query)

    // Add previews
    const withPreviews = sorted.map(note => ({
      ...note,
      searchPreview: extractPreview(note.content, query, 150),
    }))

    setResults(withPreviews)
  }, [notes, query])

  return results
}
```

## CSS Styling

```css
/* Search highlighting styles */
.search-highlight {
  background-color: #ffeb3b;
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}

/* Dark mode highlighting */
.dark .search-highlight {
  background-color: #ff9800;
  color: #fff;
}

/* Search result styles */
.search-result {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result:hover {
  background-color: #f5f5f5;
}

.result-icon {
  margin-right: 12px;
  color: #666;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.result-preview {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.result-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 12px;
}

.shortcut-hint {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 8px;
}
```

## Performance Considerations

### Debounced Search

```typescript
import { useDebounce } from '../hooks/useDebounce'
import { extractPreview, highlightText } from '../utils/searchUtils'

const useOptimizedSearch = (notes) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    // Only process previews for visible results
    const matches = notes
      .filter(note => /* search logic */)
      .slice(0, 50) // Limit results
      .map(note => ({
        ...note,
        preview: extractPreview(note.content, debouncedQuery, 120)
      }))

    setResults(matches)
  }, [notes, debouncedQuery])

  return { query, setQuery, results }
}
```

### Memoized Highlighting

```typescript
import { useMemo } from 'react'
import { highlightText } from '../utils/searchUtils'

const MemoizedSearchResult = ({ note, query }) => {
  const highlightedTitle = useMemo(
    () => highlightText(note.title, query),
    [note.title, query]
  )

  const highlightedContent = useMemo(
    () => highlightText(note.preview, query),
    [note.preview, query]
  )

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: highlightedTitle }} />
      <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
    </div>
  )
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import {
  highlightText,
  extractPreview,
  formatSearchDate,
  sortSearchResults,
} from '../searchUtils'

describe('searchUtils', () => {
  describe('highlightText', () => {
    it('should highlight search terms', () => {
      const result = highlightText('Hello world', 'world')
      expect(result).toBe('Hello <mark class="search-highlight">world</mark>')
    })

    it('should be case insensitive', () => {
      const result = highlightText('Hello World', 'world')
      expect(result).toBe('Hello <mark class="search-highlight">World</mark>')
    })

    it('should escape special regex characters', () => {
      const result = highlightText('Hello (world)', '(world)')
      expect(result).toBe('Hello <mark class="search-highlight">(world)</mark>')
    })
  })

  describe('extractPreview', () => {
    it('should extract preview around search term', () => {
      const content =
        'This is some content with the important keyword in the middle'
      const result = extractPreview(content, 'keyword', 30)
      expect(result).toContain('keyword')
      expect(result.length).toBeLessThanOrEqual(35) // Account for ellipsis
    })

    it('should remove markdown formatting', () => {
      const content = '# Title\n\n**Bold** text with *italic* and `code`'
      const result = extractPreview(content, '', 50)
      expect(result).not.toContain('#')
      expect(result).not.toContain('**')
      expect(result).not.toContain('*')
      expect(result).not.toContain('`')
    })
  })

  describe('sortSearchResults', () => {
    it('should prioritize title matches', () => {
      const results = [
        { title: 'Content match', content: 'test content' },
        { title: 'test title', content: 'other content' },
      ]
      const sorted = sortSearchResults(results, 'test')
      expect(sorted[0].title).toBe('test title')
    })
  })
})
```

## Best Practices

1. **Debounce search input** - Use with `useDebounce` hook for performance
2. **Limit result highlighting** - Only highlight visible search results
3. **Sanitize HTML output** - When using `dangerouslySetInnerHTML`
4. **Cache previews** - Memoize expensive preview generation
5. **Provide fallbacks** - Handle edge cases like empty content
6. **Test with real data** - Verify with actual note content and edge cases

## Related Components

- `useSearchWorker` - For heavy search operations
- `useDebounce` - For optimizing search frequency
- `VirtualizedList` - For displaying large search results
- `search-worker.js` - Web Worker implementation
