# Testing Guide for Viny

This document outlines the testing strategy and guidelines for Viny.

## 🎯 Testing Philosophy

We follow a **pragmatic testing approach** focused on:

- **Critical functionality coverage** - Test essential user workflows
- **Confidence over coverage** - Quality tests over quantity metrics
- **Fast feedback loops** - Tests run quickly during development
- **Real-world scenarios** - Tests reflect actual usage patterns

## 🧪 Testing Stack

- **Test Runner**: [Vitest](https://vitest.dev/) - Fast, modern testing framework
- **Component Testing**: [@testing-library/react](https://testing-library.com/react) - User-centric testing
- **DOM Environment**: [jsdom](https://github.com/jsdom/jsdom) - Browser simulation
- **Mocking**: Vitest built-in `vi` - Function and module mocking
- **Coverage**: Vitest with v8 provider - Code coverage reporting

## 📁 Test Structure

```
src/
├── __tests__/                 # Global test setup and utilities
│   ├── setup.js              # Test configuration
│   └── basic.test.js          # Infrastructure validation
├── components/__tests__/      # Component tests
├── hooks/__tests__/           # Custom hook tests
├── stores/__tests__/          # State management tests
├── utils/__tests__/           # Utility function tests
└── lib/__tests__/             # Library function tests
```

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run with coverage thresholds
npm run test:coverage:threshold
```

### CI/CD Commands

```bash
# Pre-commit testing (used by husky)
npm run test:run && npm run lint

# Full CI pipeline
npm run test:coverage:threshold && npm run build
```

## 📊 Coverage Targets

### Current Thresholds

- **Global minimum**: 20% (to allow gradual improvement)
- **Stores**: 50% (critical state management)
- **Settings hooks**: 70% (essential user preferences)

### Coverage Philosophy

We prioritize **meaningful coverage** over raw percentages:

✅ **High Priority for Testing**:

- User workflows (creating, editing, saving notes)
- Data persistence and recovery
- Settings management
- Search and filtering
- Error handling

✅ **Medium Priority**:

- UI components with complex logic
- Custom hooks with side effects
- Utility functions with edge cases

⏸️ **Lower Priority**:

- Simple UI components
- Type definitions
- Configuration files
- Build scripts

## 🎯 Testing Guidelines

### 1. Test Structure

Follow the **Arrange-Act-Assert** pattern:

```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - Setup test data and mocks
    const input = { test: 'data' }

    // Act - Execute the functionality
    const result = someFunction(input)

    // Assert - Verify the outcome
    expect(result).toBe(expectedValue)
  })
})
```

### 2. Test Naming

Use descriptive test names that explain the scenario:

```javascript
// ❌ Bad
it('works correctly')

// ✅ Good
it('should save note to localStorage when auto-save is triggered')
it('should return empty array when no notes match search term')
it('should handle invalid settings import gracefully')
```

### 3. Mock Strategy

**Mock external dependencies**, not internal implementation:

```javascript
// ❌ Don't mock internal functions
vi.mock('./utils/helper')

// ✅ Mock external dependencies
vi.mock('localStorage')
vi.mock('../../stores/newSimpleStore')
```

### 4. Test Data

Use **realistic test data** that represents actual usage:

```javascript
const mockNote = {
  id: 'note-123',
  title: 'Meeting Notes - Project Kickoff',
  content: '## Agenda\n- Review requirements\n- Timeline discussion',
  tags: ['meeting', 'project'],
  createdAt: '2025-07-12T10:00:00Z',
  modifiedAt: '2025-07-12T10:30:00Z',
  isPinned: false,
}
```

### 5. Async Testing

Handle async operations properly:

```javascript
it('should save data asynchronously', async () => {
  const result = await saveNote(noteData)
  expect(result).toBe(true)
})

it('should handle async errors', async () => {
  mockSaveFunction.mockRejectedValue(new Error('Save failed'))

  await expect(saveNote(noteData)).rejects.toThrow('Save failed')
})
```

## 🔧 Writing New Tests

### 1. Component Testing

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const onSubmit = vi.fn()
    render(<MyComponent onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalled()
  })
})
```

### 2. Hook Testing

```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(defaultValue)
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook())

    act(() => {
      result.current.setValue(newValue)
    })

    expect(result.current.value).toBe(newValue)
  })
})
```

### 3. Utility Testing

```javascript
import { describe, it, expect } from 'vitest'
import { formatDate, validateEmail } from '../utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-07-12T10:00:00Z')
      expect(formatDate(date)).toBe('July 12, 2025')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })
})
```

## 🚨 Common Testing Patterns

### Error Handling Tests

```javascript
it('should handle errors gracefully', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => riskyFunction()).not.toThrow()
  expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error))

  consoleSpy.mockRestore()
})
```

### LocalStorage Mocking

```javascript
beforeEach(() => {
  global.localStorageMock.clear()
  vi.clearAllMocks()
})

it('should save to localStorage', () => {
  saveData('key', 'value')
  expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value')
})
```

### Timer Testing

```javascript
it('should debounce function calls', () => {
  vi.useFakeTimers()
  const callback = vi.fn()

  debouncedFunction(callback)
  debouncedFunction(callback)
  debouncedFunction(callback)

  expect(callback).not.toHaveBeenCalled()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  vi.useRealTimers()
})
```

## 🔍 Debugging Tests

### Running Specific Tests

```bash
# Run specific test file
npm run test src/utils/__tests__/simple.test.js

# Run tests matching pattern
npm run test -- --grep "should save"

# Run single test
npm run test -- --grep "should save note to localStorage"
```

### Debug Mode

```bash
# Run with debug output
npm run test -- --reporter=verbose

# Run with coverage and open report
npm run test:coverage && open coverage/index.html
```

### VS Code Integration

Add to your VS Code settings:

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test"
}
```

## 📈 Continuous Improvement

### Adding Tests Gradually

1. **Start with critical paths** - User workflows that must work
2. **Test bug fixes** - Add tests when fixing bugs
3. **Cover edge cases** - Handle error conditions
4. **Refactor with confidence** - Tests enable safe refactoring

### Monitoring Coverage

```bash
# Check current coverage
npm run test:coverage

# Set coverage thresholds in vitest.config.js
# Gradually increase thresholds as tests are added
```

### Performance Considerations

- Keep tests **fast** (< 30 seconds total)
- Mock **expensive operations** (file I/O, network requests)
- Use **beforeEach/afterEach** for cleanup
- Avoid **global state** between tests

## 🚀 CI/CD Integration

Tests run automatically on:

- **Every commit** (pre-commit hook)
- **Pull requests** (GitHub Actions)
- **Main branch pushes** (GitHub Actions)

The CI pipeline:

1. Runs linter and formatter
2. Executes all tests
3. Generates coverage report
4. Checks coverage thresholds
5. Builds application

Failing tests **block** the merge to main branch.

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Remember**: Tests are **living documentation** of how your code should behave. Write tests that future developers (including yourself) will understand and appreciate.

_Last updated: July 2025_
