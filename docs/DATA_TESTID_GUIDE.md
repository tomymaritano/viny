# Data-TestID Style Guide

This document establishes consistent naming conventions and best practices for `data-testid` attributes used in E2E and component testing.

## Quick Reference

```tsx
// ✅ Good examples
<button data-testid="create-note-button">Create Note</button>
<input data-testid="search-input" placeholder="Search notes..." />
<div data-testid="notes-list">...</div>
<div data-testid="settings-modal">...</div>

// ❌ Bad examples
<button data-testid="btn1">Create Note</button>
<input data-testid="searchInput" placeholder="Search notes..." />
<div data-testid="notesList">...</div>
<div data-testid="modal">...</div>
```

## Naming Convention

### Format: `kebab-case`

- Use lowercase letters separated by hyphens
- Be descriptive and specific
- Follow the pattern: `[context-]element[-action]`

### Pattern Examples

```tsx
// Basic elements
data-testid="sidebar"
data-testid="notes-list"
data-testid="editor"

// Actions/buttons
data-testid="create-note-button"
data-testid="save-button"
data-testid="delete-button"
data-testid="toggle-preview"

// Form inputs
data-testid="note-title-input"
data-testid="search-input"
data-testid="font-size-slider"

// Modals and dialogs
data-testid="settings-modal"
data-testid="export-dialog"
data-testid="confirm-modal"

// Status and indicators
data-testid="save-indicator"
data-testid="loading-spinner"
data-testid="error-message"
```

## Component-Specific Patterns

### 1. Containers & Layout

```tsx
data-testid="app-container"           // Main app wrapper
data-testid="sidebar"                 // Navigation sidebar
data-testid="main-content"            // Primary content area
data-testid="notes-list"              // List containers
data-testid="preview-panel"           // Preview areas
```

### 2. Interactive Elements

```tsx
// Buttons - always end with -button
data-testid="create-note-button"
data-testid="settings-button"
data-testid="export-button"

// Toggles - use -toggle suffix
data-testid="preview-toggle"
data-testid="auto-save-toggle"
data-testid="dark-mode-toggle"

// Links - use -link suffix
data-testid="note-link"
data-testid="external-link"
```

### 3. Form Controls

```tsx
// Inputs - always end with -input
data-testid="note-title-input"
data-testid="search-input"
data-testid="tag-input"

// Selectors - use -select suffix
data-testid="notebook-select"
data-testid="theme-select"
data-testid="sort-select"

// Sliders - use -slider suffix
data-testid="font-size-slider"
data-testid="opacity-slider"
```

### 4. Modals & Overlays

```tsx
// Modals - always end with -modal
data-testid="settings-modal"
data-testid="export-modal"
data-testid="tag-modal"

// Close buttons in modals
data-testid="settings-close"
data-testid="modal-close"

// Dialogs - use -dialog suffix
data-testid="export-dialog"
data-testid="confirm-dialog"
```

### 5. Lists & Items

```tsx
// List containers
data-testid="notes-list"
data-testid="tags-list"
data-testid="notebooks-list"

// Individual items - use -item suffix
data-testid="note-item"
data-testid="tag-item"
data-testid="notebook-item"

// For dynamic items, include identifier
data-testid="note-item-${noteId}"
data-testid="tag-item-${tagName}"
```

### 6. Status & Feedback

```tsx
// Indicators
data-testid="save-indicator"
data-testid="sync-indicator"
data-testid="loading-spinner"

// Messages
data-testid="error-message"
data-testid="success-message"
data-testid="search-no-results"

// States
data-testid="empty-state"
data-testid="loading-state"
```

## Hierarchical Naming

For nested components, use context prefixes:

```tsx
// Editor toolbar
data-testid="editor-toolbar"
data-testid="toolbar-bold"
data-testid="toolbar-italic"
data-testid="toolbar-save"

// Settings tabs
data-testid="settings-tabs"
data-testid="general-settings"
data-testid="theme-settings"

// Note metadata
data-testid="note-metadata"
data-testid="note-title"
data-testid="note-tags"
data-testid="note-date"
```

## Dynamic Values

For components that render multiple similar items:

```tsx
// Theme buttons
{
  themes.map(theme => (
    <button data-testid={`theme-${theme.value}`}>{theme.label}</button>
  ))
}

// Note list items
{
  notes.map(note => (
    <div data-testid={`note-item-${note.id}`}>{note.title}</div>
  ))
}

// Toolbar actions
const toolbarItems = [
  { icon: Bold, testId: 'toolbar-bold' },
  { icon: Italic, testId: 'toolbar-italic' },
  { icon: Code, testId: 'toolbar-code' },
]
```

## Implementation Guidelines

### 1. When to Add TestIDs

**Always add for:**

- User interactive elements (buttons, inputs, links)
- Main navigation and layout containers
- Modal dialogs and overlays
- Form controls and settings
- List containers and items
- Status indicators and messages

**Consider adding for:**

- Complex UI components
- Components with conditional rendering
- Error and empty states
- Dynamic content areas

**Don't add for:**

- Pure styling/layout divs with no functionality
- Simple text displays (unless they change dynamically)
- Decorative elements

### 2. Consistency Rules

1. **Be descriptive**: `create-note-button` not `button1`
2. **Use context**: `editor-save-button` not just `save-button` if there are multiple save buttons
3. **Follow patterns**: All modals end with `-modal`, all buttons with `-button`
4. **Avoid abbreviations**: `navigation` not `nav`, `settings` not `config`
5. **Be specific**: `search-input` not `input`

### 3. Component Interface

For reusable components, accept testId as a prop:

```tsx
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  'data-testid'?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  'data-testid': testId
}) => (
  <button onClick={onClick} data-testid={testId}>
    {children}
  </button>
)

// Usage
<Button data-testid="create-note-button" onClick={createNote}>
  Create Note
</Button>
```

## Testing Best Practices

### 1. Selector Priority

1. **data-testid** (preferred)
2. **role + accessible name** (good for accessibility)
3. **text content** (fragile, avoid for dynamic content)
4. **CSS selectors** (avoid, implementation details)

```tsx
// ✅ Preferred
await page.click('[data-testid="create-note-button"]')

// ✅ Good alternative
await page.click('button[name="create-note"]')

// ❌ Avoid
await page.click('.btn-primary')
await page.click('text=Create Note') // fragile to text changes
```

### 2. Waiting Strategies

Use testids with proper wait strategies:

```tsx
// Wait for element to appear
await page.waitForSelector('[data-testid="notes-list"]')

// Wait for element to be visible
await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible()

// Wait for specific state
await expect(page.locator('[data-testid="note-title"]')).toContainText(
  'My Note'
)
```

### 3. Test Organization

Group tests by functionality, use testids consistently:

```tsx
test.describe('Note Creation', () => {
  test('should create new note', async ({ page }) => {
    await page.click('[data-testid="create-note-button"]')
    await page.waitForSelector('[data-testid="note-editor"]')
    await page.fill('[data-testid="note-title-input"]', 'Test Note')
    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible()
  })
})
```

## Common Anti-Patterns

### ❌ Avoid These Patterns

```tsx
// Too generic
data-testid="button"
data-testid="input"
data-testid="modal"

// CamelCase (inconsistent)
data-testid="createNoteButton"
data-testid="searchInput"

// Abbreviations (unclear)
data-testid="crt-btn"
data-testid="srch-inp"

// Numbers/indices (brittle)
data-testid="button-1"
data-testid="item-0"

// Implementation details
data-testid="flex-container"
data-testid="grid-item"
```

### ✅ Better Alternatives

```tsx
// Specific and descriptive
data-testid="create-note-button"
data-testid="search-input"
data-testid="settings-modal"

// Clear kebab-case
data-testid="note-title-input"
data-testid="theme-selector"

// Full words (readable)
data-testid="create-button"
data-testid="search-input"

// Semantic identifiers
data-testid="note-item-featured"
data-testid="notebook-item-inbox"

// Functional purpose
data-testid="content-area"
data-testid="sidebar-navigation"
```

## Migration Strategy

When updating existing components:

1. **Audit current testids**: Document what exists
2. **Identify inconsistencies**: Note naming pattern violations
3. **Plan updates**: Group related changes together
4. **Update tests simultaneously**: Keep tests and components in sync
5. **Test thoroughly**: Ensure E2E tests still pass

## Tools & Automation

### ESLint Rules (Future)

```json
{
  "rules": {
    "testid-naming-convention": ["error", "kebab-case"],
    "testid-required-elements": ["warn", ["button", "input", "select"]]
  }
}
```

### VS Code Snippets

```json
{
  "Data TestID": {
    "prefix": "testid",
    "body": "data-testid=\"$1\"",
    "description": "Add data-testid attribute"
  }
}
```

## Examples by Feature Area

### Note Management

```tsx
// Creation
data-testid="create-note-button"
data-testid="note-title-input"
data-testid="note-editor"

// Listing
data-testid="notes-list"
data-testid="note-item"
data-testid="note-preview"

// Actions
data-testid="delete-note-button"
data-testid="duplicate-note-button"
data-testid="pin-note-button"
```

### Search & Navigation

```tsx
data-testid="search-modal"
data-testid="search-input"
data-testid="search-results"
data-testid="search-result-item"
data-testid="search-no-results"
```

### Settings & Configuration

```tsx
data-testid="settings-modal"
data-testid="settings-close"
data-testid="theme-light"
data-testid="theme-dark"
data-testid="auto-save-toggle"
data-testid="font-size-slider"
```

### Editor & Preview

```tsx
data-testid="editor-toolbar"
data-testid="toolbar-bold"
data-testid="toolbar-italic"
data-testid="preview-toggle"
data-testid="split-view-toggle"
data-testid="save-indicator"
```

---

## Conclusion

Following these guidelines will ensure:

- **Consistent** and predictable naming across the application
- **Reliable** E2E and component tests
- **Maintainable** test suite that survives refactoring
- **Clear** intent and purpose for each test identifier

Remember: Good testids are an investment in test maintainability and developer productivity.
