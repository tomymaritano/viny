# Visual Regression Testing Guide

This document outlines the visual regression testing setup for the Viny application, providing comprehensive screenshot-based testing to ensure UI consistency across browsers, themes, and viewports.

## Overview

Visual regression testing automatically captures screenshots of the application UI and compares them against baseline images to detect unintended visual changes. This helps maintain design consistency and catch visual bugs early in the development process.

## Features

- ✅ **Multi-browser testing** - Chrome, Firefox, Safari
- ✅ **Responsive testing** - Mobile, tablet, desktop viewports
- ✅ **Theme testing** - Light and dark mode variations
- ✅ **Component-level screenshots** - Individual UI components
- ✅ **Full-page screenshots** - Complete application views
- ✅ **Cross-platform consistency** - Standardized rendering
- ✅ **Automated baseline management** - Easy snapshot updates

## Test Coverage

### Main Interface

- Application layout and structure
- Sidebar appearance and navigation
- Empty states and loading indicators
- Application header and controls

### Note Editor

- Empty editor state
- Editor with markdown content
- Toolbar and formatting controls
- Note metadata display

### Notes List

- Empty notes list
- List with multiple notes
- Individual note items
- Pinned note indicators

### Search Interface

- Search modal appearance
- Search results display
- No results state
- Search input and controls

### Modals and Dialogs

- Settings modal
- Context menus
- Error messages
- Confirmation dialogs

### Themes and Responsive Design

- Light theme rendering
- Dark theme rendering
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1280x720)

### Content Rendering

- Markdown preview
- Special characters
- Long content handling
- Unicode and internationalization

## Usage

### Running Visual Tests

```bash
# Run all visual regression tests
npm run test:visual

# Run visual tests with browser UI
npm run test:visual:headed

# Run visual tests in debug mode
npm run test:visual:debug

# Run visual tests for specific browser
npm run test:visual:chrome
npm run test:visual:firefox
npm run test:visual:webkit
```

### Managing Snapshots

```bash
# Update all visual test snapshots
npm run test:visual:update

# Clean old snapshots
npm run test:visual:clean

# Generate visual test report
npm run test:visual:report
```

### Development Workflow

1. **Initial Setup**: Run visual tests to create baseline snapshots

   ```bash
   npm run test:visual:update
   ```

2. **During Development**: Run visual tests to check for changes

   ```bash
   npm run test:visual
   ```

3. **Reviewing Changes**: If intentional UI changes were made, update snapshots

   ```bash
   npm run test:visual:update
   ```

4. **CI/CD**: Visual tests run automatically and fail on unexpected changes

## Configuration

### Global Settings

Visual testing configuration is managed in `/e2e/config/visual-config.ts`:

```typescript
export const VisualConfig = {
  comparison: {
    threshold: 0.2, // Pixel difference threshold
    maxDiffPixels: 100, // Maximum different pixels allowed
    animations: 'disabled', // Disable animations for consistency
  },

  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  },
}
```

### Browser-Specific Settings

Different browsers may render content slightly differently:

```typescript
browsers: {
  chromium: { threshold: 0.2, maxDiffPixels: 100 },
  firefox: { threshold: 0.3, maxDiffPixels: 150 },  // More lenient
  webkit: { threshold: 0.3, maxDiffPixels: 150 }    // More lenient
}
```

### Component-Specific Settings

Individual components can have custom comparison settings:

```typescript
components: {
  sidebar: { threshold: 0.1, clip: { x: 0, y: 0, width: 300, height: 600 } },
  editor: { threshold: 0.3, maxDiffPixels: 200 },
  modal: { threshold: 0.2, omitBackground: true }
}
```

## Best Practices

### Writing Visual Tests

1. **Use stable selectors**: Always use `data-testid` attributes
2. **Disable animations**: Set `animations: 'disabled'` for consistency
3. **Wait for content**: Ensure dynamic content is loaded before screenshots
4. **Use appropriate timeouts**: Allow sufficient time for rendering

Example:

```typescript
test('should match note editor', async ({ page }) => {
  await createNoteAndWaitForEditor(page, 'Test Note')

  const editor = await waitForElement(page, '[data-testid="note-editor"]')

  await expect(editor).toHaveScreenshot('note-editor.png', {
    animations: 'disabled',
  })
})
```

### Managing Test Data

1. **Use fixtures**: Leverage test fixtures for consistent data
2. **Clean up**: Reset state between tests
3. **Predictable content**: Use fixed content to avoid random failures

```typescript
import { createTestNote, TestData } from '../fixtures/test-fixtures'

// Use predefined test data
await createTestNote(page, TestData.notes.markdown)
```

### Handling Failures

1. **Review diff images**: Check generated diff images in test results
2. **Investigate changes**: Determine if changes are intentional
3. **Update selectively**: Only update snapshots for intended changes
4. **Use browser tools**: Debug visual issues with browser dev tools

## Troubleshooting

### Common Issues

**Flaky tests due to timing**

- Solution: Increase wait times, use proper element waiting
- Add `await waitForElement()` calls before screenshots

**Font rendering differences**

- Solution: Configure consistent fonts in test environment
- Use system fonts or web fonts consistently

**Animation interference**

- Solution: Ensure `animations: 'disabled'` is set
- Wait for animations to complete before screenshots

**Browser-specific differences**

- Solution: Adjust browser-specific thresholds
- Use browser-specific baselines if needed

**CI/CD environment differences**

- Solution: Use Docker for consistent rendering
- Adjust CI-specific thresholds

### Debugging Visual Tests

1. **Run with headed browser**:

   ```bash
   npm run test:visual:headed
   ```

2. **Enable debug mode**:

   ```bash
   npm run test:visual:debug
   ```

3. **Check test artifacts**:
   - View diff images in `test-results/`
   - Review HTML report with visual comparisons

4. **Generate detailed report**:
   ```bash
   npm run test:visual:report
   ```

## CI/CD Integration

### GitHub Actions

Visual tests are integrated into the CI pipeline:

```yaml
- name: Run visual regression tests
  run: npm run test:visual

- name: Upload visual test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: visual-test-results
    path: test-results/
```

### Baseline Management

- **Main branch**: Snapshots are the source of truth
- **Feature branches**: Visual tests must pass against main branch baselines
- **Updates**: Only update snapshots on main branch after review

## File Structure

```
e2e/
├── config/
│   └── visual-config.ts           # Visual testing configuration
├── fixtures/
│   └── test-fixtures.ts           # Test data and utilities
├── tests/
│   └── visual-regression.spec.ts  # Visual regression tests
└── utils/
    └── test-helpers.ts            # Helper functions

scripts/
└── visual-test-utils.js           # Snapshot management utilities

test-results/
├── visual-regression/             # Test results and diffs
└── playwright-report/             # HTML reports
```

## Performance Considerations

- **Parallel execution**: Visual tests run in parallel by default
- **Selective testing**: Run specific browser/viewport combinations
- **Snapshot optimization**: Compress images without quality loss
- **Smart waiting**: Use efficient wait strategies

## Future Enhancements

- [ ] **Automated A/B testing**: Compare different design variations
- [ ] **Performance metrics**: Capture rendering performance data
- [ ] **Accessibility validation**: Integrate accessibility checks
- [ ] **Cross-device testing**: Test on real mobile devices
- [ ] **AI-powered analysis**: Intelligent visual change detection

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-screenshots)
- [Visual Testing Best Practices](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
- [CSS Animation Control](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

---

For questions or issues with visual testing, please refer to the troubleshooting section or contact the development team.
