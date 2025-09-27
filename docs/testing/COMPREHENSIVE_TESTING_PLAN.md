# 🧪 Comprehensive Testing Plan for Viny V2

**Date:** January 23, 2025  
**Purpose:** Complete testing strategy for V2 architecture

## 📋 Testing Overview

### **Coverage Goals**

- Unit Tests: 80%+ coverage
- Integration Tests: Critical paths
- E2E Tests: User workflows
- Performance Tests: Key metrics

## 🎯 1. Component Testing

### **High Priority Components**

#### **NotesList** ✅

- [x] Basic rendering
- [x] Empty states
- [x] Click handlers
- [x] Context menu
- [x] Keyboard navigation
- [ ] Virtual scrolling with 1000+ items
- [ ] Drag and drop

#### **Editor Components**

- [x] SplitEditor basic tests
- [ ] InkdropEditor integration
- [ ] MarkdownPreview rendering
- [ ] Toolbar functionality
- [ ] Image handling
- [ ] Code highlighting
- [ ] Auto-save behavior

#### **Sidebar**

- [ ] Navigation items
- [ ] Notebook tree
- [ ] Tag list
- [ ] Expand/collapse
- [ ] Context menus
- [ ] Drag and drop

#### **Search**

- [ ] Search input
- [ ] Results display
- [ ] Filtering
- [ ] Keyboard shortcuts
- [ ] Recent searches

#### **Modals**

- [x] RenameModal fix
- [ ] SettingsModal tabs
- [ ] ExportDialog formats
- [ ] TagModal CRUD
- [ ] NotebookManager

### **Medium Priority Components**

#### **Metadata Components**

- [ ] NotebookSelector
- [ ] TagsInput
- [ ] StatusSelector
- [ ] TitleEditor

#### **UI Components**

- [ ] Button variants
- [ ] Toast notifications
- [ ] Dropdown menus
- [ ] Modal base
- [ ] Loading states

## 🔧 2. Logic/Unit Testing

### **Repository Layer**

```typescript
// Test files needed:
- DocumentRepository.test.ts (update existing)
- DexieDocumentRepository.test.ts
- SettingsRepository.test.ts (exists)
- RepositoryFactory.test.ts (exists)
```

### **Service Layer**

```typescript
// New test files:
;-NoteServiceV2.test.ts -
  NotebookServiceV2.test.ts -
  SettingsServiceV2.test.ts -
  SearchService.test.ts
```

### **Hooks Testing**

```typescript
// Critical hooks:
;-useNotesQuery.test.ts -
  useNotebooksQuery.test.ts -
  useFilteredNotesV2.test.ts -
  useSearchQuery.test.ts -
  useSaveNoteMutation.test.ts
```

### **Store Testing**

```typescript
// Zustand stores:
- cleanUIStore.test.ts
- newSimpleStore.test.ts (update)
- Individual slices
```

## 🌐 3. Integration Testing

### **Critical Flows**

#### **Note Creation Flow**

```typescript
test('complete note creation flow', async () => {
  // 1. Click create button
  // 2. Enter title and content
  // 3. Assign notebook and tags
  // 4. Verify auto-save
  // 5. Check persistence
})
```

#### **Search and Filter Flow**

```typescript
test('search and filter integration', async () => {
  // 1. Enter search query
  // 2. Apply notebook filter
  // 3. Apply tag filter
  // 4. Verify results
  // 5. Clear filters
})
```

#### **Multi-tab Sync**

```typescript
test('data sync across tabs', async () => {
  // 1. Open two tabs
  // 2. Create note in tab 1
  // 3. Verify appears in tab 2
  // 4. Edit in tab 2
  // 5. Verify update in tab 1
})
```

## 🎭 4. E2E Testing (Playwright)

### **User Workflows**

#### **New User Onboarding**

```typescript
test.describe('New User Experience', () => {
  test('first time setup', async ({ page }) => {
    // Clear all data
    // Load app
    // Verify welcome note
    // Create first note
    // Explore features
  })
})
```

#### **Power User Workflow**

```typescript
test.describe('Power User Features', () => {
  test('keyboard-driven workflow', async ({ page }) => {
    // Cmd+K search
    // Cmd+N new note
    // Keyboard navigation
    // Markdown shortcuts
    // Quick switching
  })
})
```

#### **Data Management**

```typescript
test.describe('Data Operations', () => {
  test('export and import', async ({ page }) => {
    // Create notes
    // Export to JSON
    // Clear data
    // Import JSON
    // Verify integrity
  })
})
```

## 📊 5. Performance Testing

### **Metrics to Track**

```javascript
// Performance test suite
describe('Performance Benchmarks', () => {
  test('initial load time', () => {
    // Target: < 2s
  })

  test('note list with 1000 items', () => {
    // Target: < 100ms render
  })

  test('search performance', () => {
    // Target: < 200ms for 10k notes
  })

  test('memory usage over time', () => {
    // Target: < 150MB after 1hr
  })
})
```

### **Load Testing**

- Create 10,000 notes
- 50 notebooks with nesting
- 100 unique tags
- Measure all operations

## 🛡️ 6. Security Testing

### **Input Validation**

- XSS in markdown
- SQL injection attempts
- Path traversal
- Large file uploads
- Malformed data

### **Data Integrity**

- Concurrent edits
- Offline/online sync
- Data corruption recovery
- Backup/restore

## 📝 7. Test Implementation Order

### **Week 1: Foundation**

1. Fix existing test failures
2. Update component tests for V2
3. Create service layer tests
4. Hook testing setup

### **Week 2: Integration**

1. Critical flow tests
2. Data sync tests
3. Error handling tests
4. Performance baseline

### **Week 3: E2E & Polish**

1. Playwright setup
2. User workflow tests
3. Cross-browser testing
4. Documentation

## 🚀 8. CI/CD Integration

### **GitHub Actions**

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - npm run test:unit
      - npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - npm run test:e2e
```

### **Test Scripts**

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/",
    "test:integration": "vitest run tests/integration/",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## 📈 9. Success Metrics

### **Coverage Targets**

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### **Performance Targets**

- All tests run in < 5 minutes
- E2E tests < 10 minutes
- No flaky tests
- Clear error messages

## 🎯 10. Next Steps

1. **Immediate**: Fix RenameModal warning ✅
2. **Today**: Verify CRUD operations
3. **This Week**: Component test suite
4. **Next Week**: Integration tests
5. **Following Week**: E2E suite

---

**Note:** This plan ensures comprehensive coverage while being realistic about implementation time. Focus on high-impact areas first.
