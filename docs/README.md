# Viny - Component Documentation

This documentation covers the new components, hooks, and utilities implemented for performance optimization, validation, error handling, and data synchronization.

## Table of Contents

- [Validation System](#validation-system)
- [Error Handling](#error-handling)
- [Synchronization](#synchronization)
- [Performance Optimizations](#performance-optimizations)
- [UI Components](#ui-components)
- [React Hooks](#react-hooks)
- [Utilities](#utilities)

## Quick Start

```bash
npm install
npm run dev
npm run test
```

## Architecture Overview

The application uses a modern React architecture with:

- **Zustand** for state management
- **TypeScript** for type safety
- **Vite** for build tooling
- **Vitest** for testing
- **TailwindCSS** for styling

---

## Validation System

### Overview

Comprehensive form validation system with real-time feedback and customizable rules.

### Files

- `src/utils/validation.ts` - Core validation logic
- `src/hooks/useFormValidation.ts` - React hook for form validation
- `src/components/ui/ValidationMessage.tsx` - UI component for validation feedback

### Quick Example

```typescript
import { useFormValidation } from '../hooks/useFormValidation'
import { SettingsValidation } from '../utils/validation'

const MyForm = () => {
  const { values, errors, handleFieldChange, getFieldProps } = useFormValidation({
    initialValues: { email: '', name: '' },
    validationRules: {
      email: SettingsValidation.general.email,
      name: (value: string) => ValidationRules.required(value, 'name')
    }
  })

  return (
    <form>
      <input {...getFieldProps('email')} />
      <input {...getFieldProps('name')} />
    </form>
  )
}
```

---

## Error Handling

### Overview

Centralized error management with automatic classification, severity levels, and user-friendly messaging.

### Files

- `src/utils/errorHandler.ts` - Core error handling logic
- `src/hooks/useErrorHandler.ts` - React hook for error integration
- `src/components/ui/Toast.tsx` - Toast notification component

### Quick Example

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler'

const MyComponent = () => {
  const { handleError, withErrorHandling } = useErrorHandler()

  const saveData = withErrorHandling(async (data) => {
    // This function will automatically handle errors
    await api.save(data)
  })

  return <button onClick={() => saveData(myData)}>Save</button>
}
```

---

## Synchronization

### Overview

Robust data synchronization with conflict detection and resolution strategies.

### Files

- `src/utils/syncManager.ts` - Core sync logic
- `src/hooks/useSync.ts` - React hook for sync operations
- `src/components/sync/SyncStatusIndicator.tsx` - Sync status UI

### Quick Example

```typescript
import { useSync } from '../hooks/useSync'

const SyncExample = () => {
  const { performSync, syncState, resolveConflict } = useSync({
    autoSync: true,
    syncInterval: 30000
  })

  return (
    <div>
      <button onClick={performSync}>Sync Now</button>
      <p>Status: {syncState.status}</p>
      {syncState.conflicts.map(conflict => (
        <ConflictResolver key={conflict.id} conflict={conflict} onResolve={resolveConflict} />
      ))}
    </div>
  )
}
```

---

## Performance Optimizations

### Lazy Loading

Components are loaded on-demand to reduce initial bundle size.

```typescript
// Example: Lazy loaded settings tabs
const GeneralSettings = lazy(() => import('./tabs/GeneralSettings'))

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <GeneralSettings />
</Suspense>
```

### Virtualization

Large lists use windowing to render only visible items.

```typescript
import VirtualizedList from '../ui/VirtualizedList'

<VirtualizedList
  items={notes}
  itemHeight={60}
  containerHeight={400}
  renderItem={({ item, index }) => <NoteItem key={item.id} note={item} />}
/>
```

### Web Workers

Search operations use web workers for better performance.

```typescript
import { useSearchWorker } from '../hooks/useSearchWorker'

const { searchResults, search, isSearching } = useSearchWorker(notes, {
  enableWorker: notes.length > 500,
})
```

---

## UI Components

Components follow consistent design patterns with dark mode support and accessibility features.

### Component Categories

- **Form Components**: ValidationMessage, inputs with validation
- **Feedback Components**: Toast notifications, loading states
- **Sync Components**: Status indicators, progress bars
- **Layout Components**: Modals, containers, lists

---

## Testing

All components include comprehensive test coverage:

```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

### Test Structure

- **Unit tests** for utilities and hooks
- **Component tests** for UI components
- **Integration tests** for complex workflows
- **Mock strategies** for external dependencies

---

## Development Guidelines

### Code Standards

- Use TypeScript for all new code
- Follow the existing component patterns
- Write tests for new functionality
- Update documentation when adding features

### Performance Considerations

- Lazy load heavy components
- Use virtualization for large lists
- Implement proper memoization
- Minimize re-renders with proper dependencies

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Support keyboard navigation
- Maintain color contrast ratios

---

## Troubleshooting

### Common Issues

**Validation not working:**

- Check that validation rules are properly defined
- Ensure form values are correctly bound
- Verify TypeScript types match validation expectations

**Sync conflicts:**

- Review conflict resolution strategies
- Check network connectivity
- Validate data integrity

**Performance issues:**

- Enable virtualization for large datasets
- Check for unnecessary re-renders
- Use React DevTools Profiler

### Getting Help

1. Check this documentation
2. Review test files for usage examples
3. Check the console for error messages
4. Use React DevTools for debugging

---

## Contributing

When adding new components or features:

1. Write comprehensive tests
2. Update relevant documentation
3. Follow existing code patterns
4. Consider performance implications
5. Ensure accessibility compliance

## License

[Your License Here]
