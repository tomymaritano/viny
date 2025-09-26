# TanStack Query Migration Guide

## Overview

This guide explains how to migrate from the current `forceRefresh` pattern to TanStack Query for improved performance and user experience in Viny.

## Benefits of Migration

### Current Pattern Issues

- Manual `forceRefresh()` calls after every operation
- No optimistic updates (UI feels slow)
- No automatic background refetching
- No built-in caching
- Manual loading and error states

### TanStack Query Benefits

- ✅ Automatic background refetching
- ✅ Optimistic updates (instant UI feedback)
- ✅ Built-in caching with smart invalidation
- ✅ Automatic loading and error states
- ✅ Deduplication of requests
- ✅ Offline support
- ✅ DevTools for debugging

## Migration Examples

### 1. Fetching Notes

**Before (forceRefresh pattern):**

```typescript
// In component
const { notes, loadNotes } = useAppStore()
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetchNotes = async () => {
    setLoading(true)
    await loadNotes()
    setLoading(false)
  }
  fetchNotes()
}, [])

// After creating a note
await createNote(noteData)
await forceRefresh() // Manual refresh
```

**After (TanStack Query):**

```typescript
// In component
const { data: notes = [], isLoading, error } = useNotesQuery()

// That's it! Notes automatically fetch and refetch
// No manual loading states or refresh calls needed
```

### 2. Creating Notes with Optimistic Updates

**Before:**

```typescript
const handleCreate = async () => {
  setLoading(true)
  try {
    await createNewNote()
    await forceRefresh() // UI updates after server response
    showSuccess('Note created')
  } catch (error) {
    showError('Failed to create note')
  } finally {
    setLoading(false)
  }
}
```

**After:**

```typescript
const createMutation = useSaveNoteMutation()

const handleCreate = () => {
  createMutation.mutate(newNote) // UI updates instantly!
}

// Loading and error states are automatic:
if (createMutation.isPending) // ...
if (createMutation.isError) // ...
```

### 3. Complex Operations (Empty Trash)

**Before:**

```typescript
const handleEmptyTrash = async () => {
  setLoading(true)
  try {
    const trashedNotes = notes.filter(n => n.isTrashed)
    await Promise.all(trashedNotes.map(n => deleteNote(n.id)))
    await forceRefresh()
    showSuccess('Trash emptied')
  } catch (error) {
    showError('Failed to empty trash')
  } finally {
    setLoading(false)
  }
}
```

**After:**

```typescript
const emptyTrashMutation = useEmptyTrashMutation()

const handleEmptyTrash = () => {
  emptyTrashMutation.mutate()
}

// Status is available:
<Button
  onClick={handleEmptyTrash}
  disabled={emptyTrashMutation.isPending}
>
  {emptyTrashMutation.isPending ? 'Emptying...' : 'Empty Trash'}
</Button>
```

## Step-by-Step Migration

### Phase 1: Setup (✅ Completed)

1. Install dependencies: `@tanstack/react-query`
2. Create QueryClient with optimized settings
3. Wrap app with QueryClientProvider
4. Create base query hooks

### Phase 2: Migrate Read Operations

1. Replace `useAppStore()` notes/notebooks access with query hooks
2. Remove manual `loadNotes()` calls
3. Remove manual loading states
4. Update components to use query data

### Phase 3: Migrate Write Operations

1. Replace save/create/delete operations with mutations
2. Remove `forceRefresh()` calls
3. Add optimistic updates for instant feedback
4. Update error handling to use mutation states

### Phase 4: Advanced Features

1. Add prefetching for predictable navigation
2. Implement infinite queries for large lists
3. Add offline persistence
4. Configure background refetch intervals

## Component Migration Example

### Before:

```tsx
const NotesList = () => {
  const { notes, loadNotes } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadNotes().finally(() => setLoading(false))
  }, [refreshTrigger])

  const handleDelete = async note => {
    await deleteNote(note)
    setRefreshTrigger(prev => prev + 1) // Force refresh
  }

  if (loading) return <Spinner />

  return (
    <div>
      {notes.map(note => (
        <NoteItem key={note.id} note={note} onDelete={handleDelete} />
      ))}
    </div>
  )
}
```

### After:

```tsx
const NotesList = () => {
  const { data: notes = [], isLoading } = useNotesQuery()
  const deleteMutation = useDeleteNoteMutation()

  if (isLoading) return <Spinner />

  return (
    <div>
      {notes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onDelete={() => deleteMutation.mutate(note)}
        />
      ))}
    </div>
  )
}
```

## Best Practices

### 1. Query Keys

Always use the centralized `queryKeys` factory:

```typescript
import { queryKeys } from '@/lib/queryClient'

// Good
queryClient.invalidateQueries({ queryKey: queryKeys.notes() })

// Bad - can lead to typos
queryClient.invalidateQueries({ queryKey: ['notes'] })
```

### 2. Optimistic Updates

Always provide rollback data:

```typescript
onMutate: async newData => {
  const previousData = queryClient.getQueryData(queryKey)
  // Optimistically update
  queryClient.setQueryData(queryKey, newData)
  return { previousData } // For rollback
}
```

### 3. Error Handling

Use mutation callbacks for user feedback:

```typescript
const mutation = useMutation({
  onSuccess: () => showSuccess('Saved!'),
  onError: error => showError(error.message),
})
```

### 4. Background Refetching

Configure per-query for optimal UX:

```typescript
useQuery({
  queryKey: ['critical-data'],
  refetchInterval: 30000, // Every 30 seconds
  refetchOnWindowFocus: true,
})
```

## Gradual Migration Strategy

You don't need to migrate everything at once:

1. **Start with read-only data** (notes list, notebooks list)
2. **Add mutations for common operations** (save, delete)
3. **Migrate complex operations** (empty trash, bulk operations)
4. **Remove old patterns** once fully migrated

The old and new patterns can coexist during migration.

### Using Feature Flags

We've implemented feature flags to allow gradual migration without breaking existing functionality:

```javascript
// Enable TanStack Query for notes list
localStorage.setItem('feature_useQueryForNotesList', 'true')
window.location.reload()

// Or in development console:
window.toggleFeatureFlag('useQueryForNotesList', true) -
  // Available flags:
  useQueryForNotesList - // Use TanStack Query for notes list
  useQueryForNotebooks - // Use TanStack Query for notebooks
  useQueryForSettings - // Use TanStack Query for settings
  useOptimisticUpdates - // Enable optimistic updates (default: true)
  showReactQueryDevTools // Show React Query DevTools (default: true in dev)
```

You can also enable flags via environment variables:

```bash
VITE_FEATURE_USEQUERYFORNOTESLIST=true npm run dev
```

## Testing

TanStack Query provides excellent testing utilities:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

test('notes query', async () => {
  const { result } = renderHook(() => useNotesQuery(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  })

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })

  expect(result.current.data).toHaveLength(3)
})
```

## Performance Monitoring

Use React Query DevTools in development:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In your app
{
  import.meta.env.DEV && <ReactQueryDevtools />
}
```

This shows:

- Active queries and their states
- Cache contents
- Mutation history
- Refetch timings

## Common Pitfalls

1. **Don't mix patterns** - Either use TanStack Query or the old pattern, not both
2. **Don't over-invalidate** - Trust the stale time configuration
3. **Don't ignore loading states** - They're automatic, use them!
4. **Don't skip error boundaries** - Queries can throw, wrap in error boundaries

## Conclusion

TanStack Query significantly improves the developer experience and application performance. The migration can be done gradually, and the benefits are immediate:

- 🚀 Instant UI updates with optimistic mutations
- 🔄 Automatic background sync
- 💾 Smart caching reduces server load
- 🛠️ Better DevX with less boilerplate
- 📱 Improved mobile experience with offline support

Start with one component and experience the difference!
