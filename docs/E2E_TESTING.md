# End-to-End Testing with Playwright

This guide explains how to run and write end-to-end tests for Viny/Viny using Playwright.

## Quick Start

### Installation

First, install Playwright browsers:

```bash
npm install
npm run test:e2e:install
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests for specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit

# Debug tests
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

## Test Structure

Tests are located in the `e2e/tests` directory:

```
e2e/
└── tests/
    ├── app-initialization.spec.ts  # App startup and loading
    ├── note-creation.spec.ts       # Creating and editing notes
    ├── settings.spec.ts            # Settings functionality
    ├── search.spec.ts              # Search feature
    └── editor.spec.ts              # Editor features
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="some-button"]')

    // Act
    await page.fill('[data-testid="input"]', 'test value')

    // Assert
    await expect(page.locator('[data-testid="result"]')).toContainText(
      'expected'
    )
  })
})
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection:

   ```tsx
   <button data-testid="create-note-button">Create Note</button>
   ```

2. **Wait for elements** before interacting:

   ```typescript
   await page.waitForSelector('[data-testid="editor"]')
   ```

3. **Use proper assertions**:

   ```typescript
   await expect(element).toBeVisible()
   await expect(element).toHaveText('expected text')
   await expect(element).toHaveAttribute('data-theme', 'dark')
   ```

4. **Handle async operations**:

   ```typescript
   // Wait for auto-save
   await page.waitForTimeout(2000)

   // Wait for network requests
   await page.waitForLoadState('networkidle')
   ```

5. **Test user flows**, not implementation details

### Common Patterns

#### Testing Keyboard Shortcuts

```typescript
// Press Cmd/Ctrl + K
await page.keyboard.press('Meta+K')

// Press multiple keys
await page.keyboard.press('Meta+Shift+P')
```

#### Testing Modal Dialogs

```typescript
// Open modal
await page.click('[data-testid="open-modal"]')

// Verify modal is visible
await expect(page.locator('[data-testid="modal"]')).toBeVisible()

// Close modal
await page.keyboard.press('Escape')
// or
await page.click('[data-testid="modal-close"]')
```

#### Testing Drag and Drop

```typescript
await page.dragAndDrop(
  '[data-testid="draggable"]',
  '[data-testid="drop-target"]'
)
```

## Adding data-testid Attributes

For comprehensive guidelines on naming and using data-testid attributes, see the **[Data-TestID Style Guide](./DATA_TESTID_GUIDE.md)**.

### Quick Examples

```tsx
// Components - use kebab-case, be descriptive
<div data-testid="app-container">
<button data-testid="create-note-button">
<input data-testid="search-input">
<div data-testid="note-editor">
<div data-testid="note-preview">

// Modals and dialogs
<div data-testid="settings-modal">
<button data-testid="settings-close">

// Lists and items
<ul data-testid="notes-list">
  <li data-testid="note-item">

// Interactive elements
<button data-testid="toolbar-bold">
<input data-testid="font-size-slider">
<select data-testid="theme-selector">
```

### Naming Conventions

- **Format**: Use `kebab-case` (lowercase with hyphens)
- **Pattern**: `[context-]element[-action]`
- **Examples**: `create-note-button`, `settings-modal`, `search-input`
- **Be specific**: `note-title-input` not just `input`

See the [style guide](./DATA_TESTID_GUIDE.md) for complete patterns and examples.

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Base URL**: http://localhost:5173
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## CI/CD Integration

To run tests in CI:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

## Debugging Failed Tests

1. **Use UI Mode** for step-by-step debugging:

   ```bash
   npm run test:e2e:ui
   ```

2. **Check screenshots and videos** in the `test-results` folder

3. **Use debug mode**:

   ```bash
   npm run test:e2e:debug
   ```

4. **Add console logs**:

   ```typescript
   console.log(await page.locator('[data-testid="debug"]').textContent())
   ```

5. **Pause execution**:
   ```typescript
   await page.pause() // Opens Playwright Inspector
   ```

## Troubleshooting

### Tests are flaky

- Add explicit waits: `await page.waitForSelector()`
- Use `waitForLoadState('networkidle')`
- Increase timeouts for slow operations

### Element not found

- Check if element has `data-testid`
- Verify element is visible
- Check for timing issues

### Tests pass locally but fail in CI

- Ensure same browser versions
- Check for environment differences
- Add more explicit waits

## Next Steps

1. Add more test coverage for critical user flows
2. Integrate with CI/CD pipeline
3. Set up visual regression testing
4. Add performance testing
