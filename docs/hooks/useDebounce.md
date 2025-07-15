# useDebounce Hook

Performance optimization hook that delays the execution of operations until a specified time has passed since the last invocation. Essential for optimizing search inputs, API calls, and expensive computations.

## Import

```typescript
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce'
```

## Functions

### useDebounce

Debounces a value, returning the delayed version after the specified timeout.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

### useDebouncedCallback

Returns a debounced version of a callback function.

```typescript
function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T
```

## Basic Usage

### Search Input Optimization

```typescript
import { useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'

const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  // This effect only runs when user stops typing for 300ms
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <input
      type="text"
      placeholder="Search notes..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  )
}
```

### API Call Optimization

```typescript
const AutoSaveEditor = ({ noteId, initialContent }) => {
  const [content, setContent] = useState(initialContent)
  const debouncedContent = useDebounce(content, 1000)

  // Auto-save only after user stops typing for 1 second
  useEffect(() => {
    if (debouncedContent !== initialContent) {
      saveNote(noteId, debouncedContent)
    }
  }, [debouncedContent, noteId, initialContent])

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Start typing..."
    />
  )
}
```

## Advanced Usage with useDebouncedCallback

### Optimized Event Handlers

```typescript
import { useDebouncedCallback } from '../hooks/useDebounce'

const OptimizedComponent = () => {
  // Debounce expensive operations
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      console.log('Searching for:', query)
      performExpensiveSearch(query)
    },
    500
  )

  const debouncedResize = useDebouncedCallback(
    () => {
      console.log('Window resized, recalculating layout')
      recalculateLayout()
    },
    250
  )

  useEffect(() => {
    window.addEventListener('resize', debouncedResize)
    return () => window.removeEventListener('resize', debouncedResize)
  }, [debouncedResize])

  return (
    <div>
      <input
        onChange={(e) => debouncedSearch(e.target.value)}
        placeholder="Search with debounced callback"
      />
    </div>
  )
}
```

### Form Validation

```typescript
const ValidatedForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  // Debounce validation to avoid excessive API calls
  const debouncedValidate = useDebouncedCallback(
    async (field: string, value: string) => {
      try {
        const isValid = await validateField(field, value)
        setErrors(prev => ({
          ...prev,
          [field]: isValid ? null : `Invalid ${field}`
        }))
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Validation failed'
        }))
      }
    },
    800
  )

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    debouncedValidate(field, value)
  }

  return (
    <form>
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleFieldChange('username', e.target.value)}
          placeholder="Username"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
    </form>
  )
}
```

## Performance Optimization Examples

### Search with Worker Integration

```typescript
import { useDebounce } from '../hooks/useDebounce'
import { useSearchWorker } from '../hooks/useSearchWorker'

const HighPerformanceSearch = ({ notes }) => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { search, searchResults, isSearching } = useSearchWorker(notes)

  // Only search when user stops typing
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery)
    } else {
      search('') // Clear results
    }
  }, [debouncedQuery, search])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search thousands of notes..."
      />

      {isSearching && <div>Searching...</div>}

      <div className="search-results">
        {searchResults.map(note => (
          <div key={note.id}>{note.title}</div>
        ))}
      </div>
    </div>
  )
}
```

### Scroll-based Operations

```typescript
const InfiniteScrollList = ({ loadMoreItems }) => {
  const [isLoading, setIsLoading] = useState(false)

  // Debounce scroll events to avoid excessive checks
  const debouncedScrollHandler = useDebouncedCallback(
    async () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement

      // Check if near bottom (within 100px)
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
        setIsLoading(true)
        await loadMoreItems()
        setIsLoading(false)
      }
    },
    200
  )

  useEffect(() => {
    window.addEventListener('scroll', debouncedScrollHandler)
    return () => window.removeEventListener('scroll', debouncedScrollHandler)
  }, [debouncedScrollHandler, isLoading])

  return (
    <div>
      {/* List items */}
      {isLoading && <div>Loading more items...</div>}
    </div>
  )
}
```

### Settings Auto-Save

```typescript
const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 14,
    autoSave: true
  })

  // Debounce settings save to avoid excessive writes
  const debouncedSave = useDebouncedCallback(
    async (newSettings) => {
      try {
        await saveSettings(newSettings)
        showToast('Settings saved', 'success')
      } catch (error) {
        showToast('Failed to save settings', 'error')
      }
    },
    1500
  )

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    debouncedSave(newSettings)
  }

  return (
    <div className="settings-panel">
      <div>
        <label>Theme:</label>
        <select
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>Font Size:</label>
        <input
          type="range"
          min="12"
          max="24"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}
```

## Custom Debounce Variations

### useThrottledDebounce

Combination of throttling and debouncing for high-frequency events:

```typescript
const useThrottledDebounce = <T>(value: T, delay: number, throttleMs: number): T => {
  const [throttledValue, setThrottledValue] = useState(value)
  const [lastRun, setLastRun] = useState(Date.now())

  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    const now = Date.now()

    // Throttle: ensure minimum time between updates
    if (now - lastRun >= throttleMs) {
      setThrottledValue(debouncedValue)
      setLastRun(now)
    }
  }, [debouncedValue, throttleMs, lastRun])

  return throttledValue
}

// Usage for scroll events
const ScrollComponent = () => {
  const [scrollY, setScrollY] = useState(0)
  const throttledScrollY = useThrottledDebounce(scrollY, 100, 50)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // This only updates every 50ms minimum, with 100ms debounce
  console.log('Scroll position:', throttledScrollY)

  return <div>Scroll to see throttled updates</div>
}
```

### useSmartDebounce

Adaptive debouncing based on input frequency:

```typescript
const useSmartDebounce = <T>(value: T, baseDelay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [lastChange, setLastChange] = useState(Date.now())
  const [changeFrequency, setChangeFrequency] = useState(0)

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastChange = now - lastChange

    // Calculate change frequency (changes per second)
    const frequency = timeSinceLastChange < 1000 ? changeFrequency + 1 : 1
    setChangeFrequency(frequency)
    setLastChange(now)

    // Adaptive delay: faster typing = longer delay
    const adaptiveDelay = baseDelay + frequency * 50

    const handler = setTimeout(
      () => {
        setDebouncedValue(value)
      },
      Math.min(adaptiveDelay, 1000)
    ) // Cap at 1 second

    return () => clearTimeout(handler)
  }, [value, baseDelay, lastChange, changeFrequency])

  return debouncedValue
}
```

## Integration with Other Hooks

### With useFormValidation

```typescript
import { useDebounce } from '../hooks/useDebounce'
import { useFormValidation } from '../hooks/useFormValidation'

const SmartForm = () => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: ''
  })

  // Debounce values before validation
  const debouncedEmail = useDebounce(formValues.email, 500)
  const debouncedPassword = useDebounce(formValues.password, 500)

  const { errors, validateField } = useFormValidation({
    initialValues: formValues,
    validationRules: {
      email: (value) => validateEmail(value),
      password: (value) => validatePassword(value)
    }
  })

  // Validate only after user stops typing
  useEffect(() => {
    if (debouncedEmail) {
      validateField('email', debouncedEmail)
    }
  }, [debouncedEmail, validateField])

  useEffect(() => {
    if (debouncedPassword) {
      validateField('password', debouncedPassword)
    }
  }, [debouncedPassword, validateField])

  return (
    <form>
      <input
        type="email"
        value={formValues.email}
        onChange={(e) => setFormValues(prev => ({
          ...prev,
          email: e.target.value
        }))}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  )
}
```

### With useSearchWorker

```typescript
const DebouncedSearchWorker = ({ notes }) => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)

  const {
    search,
    searchResults,
    isSearching,
    searchTime
  } = useSearchWorker(notes)

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search with worker + debounce..."
      />

      <div className="search-info">
        {isSearching ? 'Searching...' : `${searchResults.length} results`}
        {searchTime > 0 && ` (${searchTime.toFixed(2)}ms)`}
      </div>
    </div>
  )
}
```

## Performance Considerations

### Memory Usage

```typescript
// Good: Single debounced value
const OptimizedComponent = () => {
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 300)

  return <SearchResults query={debouncedInput} />
}

// Avoid: Multiple debounced instances for same value
const SubOptimalComponent = () => {
  const [input, setInput] = useState('')
  const debouncedForSearch = useDebounce(input, 300)
  const debouncedForSave = useDebounce(input, 1000)

  // Better to use a single debounced value and handle timing in effects
  return <div>...</div>
}
```

### Cleanup

```typescript
// The hooks automatically handle cleanup, but for custom implementations:
const useCustomDebounce = (callback, delay) => {
  const timeoutRef = useRef()

  const debouncedCallback = useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )

  // Important: cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return debouncedCallback
}
```

## Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 300 })
    expect(result.current).toBe('initial') // Still old value

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    // Rapid changes
    rerender({ value: 'change1' })
    act(() => vi.advanceTimersByTime(100))

    rerender({ value: 'change2' })
    act(() => vi.advanceTimersByTime(100))

    rerender({ value: 'final' })
    act(() => vi.advanceTimersByTime(300))

    expect(result.current).toBe('final')
  })
})

describe('useDebouncedCallback', () => {
  it('should debounce callback execution', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 300))

    // Call multiple times rapidly
    act(() => {
      result.current('arg1')
      result.current('arg2')
      result.current('arg3')
    })

    expect(mockCallback).not.toHaveBeenCalled()

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('arg3')
  })
})
```

## Best Practices

1. **Choose appropriate delays** - 300ms for search, 1000ms for auto-save
2. **Use useDebouncedCallback for functions** - Better performance than recreating functions
3. **Combine with other optimization hooks** - useSearchWorker, useMemo, etc.
4. **Consider user experience** - Don't make delays too long
5. **Test with real interactions** - Verify debouncing works in practice
6. **Handle cleanup** - Hooks handle this automatically
7. **Monitor performance impact** - Measure improvement in real scenarios

## Common Delays

| Use Case        | Recommended Delay | Reasoning                            |
| --------------- | ----------------- | ------------------------------------ |
| Search input    | 300-500ms         | Balance responsiveness vs. API calls |
| Auto-save       | 1000-2000ms       | Allow time for continued editing     |
| Form validation | 500-800ms         | Show errors after user pauses        |
| Scroll events   | 100-200ms         | Smooth performance without lag       |
| Resize events   | 250ms             | Allow window to finish resizing      |
| API calls       | 400-600ms         | Reduce server load                   |

## Related Components

- `useSearchWorker` - Search optimization with debouncing
- `useFormValidation` - Form validation with debounced input
- `VirtualizedList` - Performance optimization for large lists
- `searchUtils` - Text processing utilities for search
