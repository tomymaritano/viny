# Date Utils

Utility functions for formatting and displaying dates in the note-taking application with support for relative time, localization, and various display formats.

## Import

```typescript
import { formatDate, formatRelativeDate } from '../utils/dateUtils'
import type { FormatDateOptions } from '../utils/dateUtils'
```

## Core Functions

### formatDate

Primary date formatting function with flexible options for different display contexts.

```typescript
function formatDate(
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string
```

#### Parameters

```typescript
interface FormatDateOptions {
  includeTime?: boolean // Include time in output (default: true)
  relative?: boolean // Use relative format like "2 hours ago" (default: false)
  longFormat?: boolean // Use long month names (default: false)
}
```

#### Basic Usage

```typescript
const now = new Date()
const yesterday = new Date(Date.now() - 86400000)

// Default format (includes time)
formatDate(now)
// Result: "Dec 15, 2024, 2:30 PM"

// Date only
formatDate(now, { includeTime: false })
// Result: "Dec 15, 2024"

// Long format
formatDate(now, { longFormat: true })
// Result: "December 15, 2024, 2:30 PM"

// Relative format
formatDate(yesterday, { relative: true })
// Result: "Yesterday"
```

#### Advanced Usage

```typescript
// Note metadata display
const NoteMeta = ({ note }) => {
  const created = formatDate(note.createdAt, { longFormat: true })
  const modified = formatDate(note.lastModified, { relative: true })

  return (
    <div className="note-meta">
      <div>Created: {created}</div>
      <div>Modified: {modified}</div>
    </div>
  )
}

// Note list display
const NoteListItem = ({ note }) => {
  const dateText = formatDate(note.lastModified, {
    includeTime: false,
    relative: isRecent(note.lastModified)
  })

  return (
    <div className="note-item">
      <h3>{note.title}</h3>
      <span className="note-date">{dateText}</span>
    </div>
  )
}
```

### formatRelativeDate

Specialized function for relative time formatting (e.g., "2 hours ago", "Yesterday").

```typescript
function formatRelativeDate(date: Date): string
```

#### Usage

```typescript
const now = new Date()

// Recent times
formatRelativeDate(new Date(now.getTime() - 30000)) // "Just now"
formatRelativeDate(new Date(now.getTime() - 300000)) // "5 minutes ago"
formatRelativeDate(new Date(now.getTime() - 7200000)) // "2 hours ago"

// Days
formatRelativeDate(new Date(now.getTime() - 86400000)) // "Yesterday"
formatRelativeDate(new Date(now.getTime() - 86400000 * 3)) // "3 days ago"

// Weeks and months
formatRelativeDate(new Date(now.getTime() - 86400000 * 7)) // "1 week ago"
formatRelativeDate(new Date(now.getTime() - 86400000 * 30)) // "1 month ago"
formatRelativeDate(new Date(now.getTime() - 86400000 * 365)) // "1 year ago"
```

#### Time Ranges

| Time Difference | Output Format     | Example         |
| --------------- | ----------------- | --------------- |
| < 1 minute      | "Just now"        | "Just now"      |
| 1-59 minutes    | "X minute(s) ago" | "5 minutes ago" |
| 1-23 hours      | "X hour(s) ago"   | "2 hours ago"   |
| 1 day           | "Yesterday"       | "Yesterday"     |
| 2-6 days        | "X days ago"      | "3 days ago"    |
| 1 week          | "1 week ago"      | "1 week ago"    |
| 2-3 weeks       | "X weeks ago"     | "2 weeks ago"   |
| 1 month         | "1 month ago"     | "1 month ago"   |
| 2-11 months     | "X months ago"    | "3 months ago"  |
| 1 year          | "1 year ago"      | "1 year ago"    |
| 2+ years        | "X years ago"     | "2 years ago"   |

## Practical Examples

### Note Editor Timestamps

```typescript
import { formatDate, formatRelativeDate } from '../utils/dateUtils'

const NoteEditor = ({ note }) => {
  const [showFullDates, setShowFullDates] = useState(false)

  const formatNoteDate = (date) => {
    return showFullDates
      ? formatDate(date, { longFormat: true })
      : formatRelativeDate(new Date(date))
  }

  return (
    <div className="note-editor">
      <div className="note-header">
        <h1>{note.title}</h1>
        <button
          onClick={() => setShowFullDates(!showFullDates)}
          className="date-toggle"
        >
          {showFullDates ? 'Show relative' : 'Show full dates'}
        </button>
      </div>

      <div className="note-timestamps">
        <div>Created: {formatNoteDate(note.createdAt)}</div>
        <div>Modified: {formatNoteDate(note.lastModified)}</div>
        {note.lastSynced && (
          <div>Synced: {formatNoteDate(note.lastSynced)}</div>
        )}
      </div>
    </div>
  )
}
```

### Search Results with Dates

```typescript
const SearchResults = ({ results, query }) => {
  const formatSearchDate = (date) => {
    const daysDiff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24))

    // Use relative dates for recent notes, absolute for older ones
    return daysDiff < 7
      ? formatRelativeDate(new Date(date))
      : formatDate(date, { includeTime: false })
  }

  return (
    <div className="search-results">
      {results.map(note => (
        <div key={note.id} className="search-result">
          <h3>{note.title}</h3>
          <p>{note.preview}</p>
          <div className="result-meta">
            <span className="result-date">{formatSearchDate(note.lastModified)}</span>
            <span className="result-tags">{note.tags.join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Activity Timeline

```typescript
const ActivityTimeline = ({ activities }) => {
  const groupActivitiesByDate = (activities) => {
    return activities.reduce((groups, activity) => {
      const date = formatDate(activity.timestamp, {
        includeTime: false,
        relative: false
      })

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {})
  }

  const grouped = groupActivitiesByDate(activities)

  return (
    <div className="activity-timeline">
      {Object.entries(grouped).map(([date, dayActivities]) => (
        <div key={date} className="timeline-day">
          <h3 className="timeline-date">{date}</h3>
          {dayActivities.map(activity => (
            <div key={activity.id} className="timeline-item">
              <span className="activity-time">
                {formatDate(activity.timestamp, { includeTime: true }).split(', ')[1]}
              </span>
              <span className="activity-description">{activity.description}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Smart Date Display Hook

```typescript
import { useState, useEffect } from 'react'
import { formatRelativeDate, formatDate } from '../utils/dateUtils'

const useSmartDate = (date, updateInterval = 60000) => {
  const [displayDate, setDisplayDate] = useState('')
  const [isRelative, setIsRelative] = useState(true)

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const targetDate = new Date(date)
      const diffHours = (now - targetDate) / (1000 * 60 * 60)

      // Use relative dates for recent items, absolute for older ones
      if (diffHours < 24) {
        setDisplayDate(formatRelativeDate(targetDate))
        setIsRelative(true)
      } else {
        setDisplayDate(formatDate(targetDate, { includeTime: false }))
        setIsRelative(false)
      }
    }

    updateDate()

    // Update relative dates periodically
    if (isRelative) {
      const interval = setInterval(updateDate, updateInterval)
      return () => clearInterval(interval)
    }
  }, [date, updateInterval, isRelative])

  return displayDate
}

// Usage
const NoteItem = ({ note }) => {
  const smartDate = useSmartDate(note.lastModified)

  return (
    <div className="note-item">
      <h3>{note.title}</h3>
      <span className="note-date">{smartDate}</span>
    </div>
  )
}
```

## Localization Support

### Custom Locale Formatting

```typescript
const formatDateLocalized = (date, locale = 'en-US', options = {}) => {
  const defaultOptions = {
    includeTime: true,
    relative: false,
    longFormat: false,
    ...options
  }

  if (defaultOptions.relative) {
    // For relative dates, you might want to implement locale-specific relative formatting
    return formatRelativeDate(new Date(date))
  }

  const dateObj = new Date(date)
  const formatOptions = {
    year: 'numeric',
    month: defaultOptions.longFormat ? 'long' : 'short',
    day: 'numeric',
    ...(defaultOptions.includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return dateObj.toLocaleDateString(locale, formatOptions)
}

// Usage with different locales
const MultiLocaleDate = ({ date }) => {
  const [locale, setLocale] = useState('en-US')

  const locales = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' }
  ]

  return (
    <div>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {locales.map(loc => (
          <option key={loc.code} value={loc.code}>{loc.name}</option>
        ))}
      </select>

      <div className="formatted-dates">
        <div>Standard: {formatDateLocalized(date, locale)}</div>
        <div>Long: {formatDateLocalized(date, locale, { longFormat: true })}</div>
        <div>Date only: {formatDateLocalized(date, locale, { includeTime: false })}</div>
      </div>
    </div>
  )
}
```

## Edge Cases and Error Handling

### Robust Date Handling

```typescript
const safeFormatDate = (date, options = {}) => {
  try {
    // Handle null/undefined
    if (!date) return 'No date'

    // Handle invalid dates
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided:', date)
      return 'Invalid date'
    }

    // Handle future dates
    if (dateObj > new Date()) {
      return formatDate(dateObj, { ...options, relative: false })
    }

    return formatDate(dateObj, options)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Date error'
  }
}

// Usage in components
const SafeDateDisplay = ({ date, label }) => {
  const formattedDate = safeFormatDate(date, { relative: true })

  return (
    <div className="date-display">
      <span className="date-label">{label}:</span>
      <span className="date-value">{formattedDate}</span>
    </div>
  )
}
```

## Performance Optimization

### Memoized Date Formatting

```typescript
import { useMemo } from 'react'

const OptimizedNoteList = ({ notes }) => {
  const notesWithFormattedDates = useMemo(() => {
    return notes.map(note => ({
      ...note,
      formattedDate: formatDate(note.lastModified, { relative: true }),
      formattedCreated: formatDate(note.createdAt, { includeTime: false })
    }))
  }, [notes])

  return (
    <div className="note-list">
      {notesWithFormattedDates.map(note => (
        <div key={note.id} className="note-item">
          <h3>{note.title}</h3>
          <div className="note-meta">
            <span>Modified: {note.formattedDate}</span>
            <span>Created: {note.formattedCreated}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Testing

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatDate, formatRelativeDate } from '../dateUtils'

describe('dateUtils', () => {
  let mockNow: Date

  beforeEach(() => {
    mockNow = new Date('2024-12-15T15:30:00Z')
    vi.setSystemTime(mockNow)
  })

  describe('formatDate', () => {
    it('should format date with default options', () => {
      const date = new Date('2024-12-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/Dec 15, 2024/)
    })

    it('should format date without time', () => {
      const date = new Date('2024-12-15T10:30:00Z')
      const result = formatDate(date, { includeTime: false })
      expect(result).toBe('Dec 15, 2024')
    })

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid date')
    })

    it('should handle null dates', () => {
      const result = formatDate(null)
      expect(result).toBe('')
    })
  })

  describe('formatRelativeDate', () => {
    it('should format recent times', () => {
      const thirtySecondsAgo = new Date(mockNow.getTime() - 30000)
      expect(formatRelativeDate(thirtySecondsAgo)).toBe('Just now')

      const fiveMinutesAgo = new Date(mockNow.getTime() - 300000)
      expect(formatRelativeDate(fiveMinutesAgo)).toBe('5 minutes ago')
    })

    it('should format yesterday', () => {
      const yesterday = new Date(mockNow.getTime() - 86400000)
      expect(formatRelativeDate(yesterday)).toBe('Yesterday')
    })

    it('should format weeks and months', () => {
      const oneWeekAgo = new Date(mockNow.getTime() - 86400000 * 7)
      expect(formatRelativeDate(oneWeekAgo)).toBe('1 week ago')

      const twoMonthsAgo = new Date(mockNow.getTime() - 86400000 * 60)
      expect(formatRelativeDate(twoMonthsAgo)).toBe('2 months ago')
    })
  })
})
```

## CSS Styling

```css
/* Date display styles */
.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #666;
}

.date-label {
  font-weight: 500;
}

.date-value {
  color: #888;
}

/* Note meta styles */
.note-meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #999;
  margin-top: 8px;
}

.note-date {
  white-space: nowrap;
}

/* Timeline styles */
.timeline-date {
  font-size: 1rem;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 4px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  font-size: 0.875rem;
}

.activity-time {
  color: #666;
  font-weight: 500;
  min-width: 60px;
}

/* Dark mode */
.dark .date-display,
.dark .note-meta {
  color: #ccc;
}

.dark .date-value {
  color: #999;
}

.dark .timeline-date {
  color: #fff;
  border-bottom-color: #333;
}
```

## Best Practices

1. **Handle edge cases** - Always check for null/undefined dates
2. **Use relative dates wisely** - For recent content, absolute for historical
3. **Consider timezones** - Be aware of user's local timezone
4. **Memoize expensive operations** - Cache formatted dates when possible
5. **Provide fallbacks** - Show meaningful text for invalid dates
6. **Test with real data** - Verify with various date ranges and edge cases
7. **Consider accessibility** - Provide full dates in title attributes

## Related Components

- `searchUtils` - Uses date formatting for search results
- `useFormValidation` - Date validation in forms
- `SyncManager` - Timestamps for sync operations
- `ErrorHandler` - Error timestamps and logging
