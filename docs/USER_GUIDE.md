# Inkrun User Guide

## Introduction

Inkrun is a minimalist markdown editor designed for professional note-taking and document creation. Built with inspiration from craftzdog's Inkdrop, it provides a clean, distraction-free environment for working with markdown content.

## Getting Started

### First Launch

When you first open Inkrun, you'll see:

1. **Sidebar**: Navigation panel on the left
2. **Notes List**: Middle panel showing all your notes
3. **Preview Area**: Right panel for viewing note content

### Sample Notes

Inkrun comes with two sample notes to help you get started:

- **Project Planning Notes**: Demonstrates note organization features
- **Learning Neovim**: Shows markdown formatting capabilities

## Interface Overview

### Three-Column Layout

#### Sidebar (Left Panel)

- **All Notes**: View all notes in your collection
- **Pinned**: Quick access to important notes
- **Notebooks**: Organize by categories (Personal, Work, Projects)
- **Status**: Track note states and workflow

#### Notes List (Middle Panel)

- **Search Bar**: Find notes quickly (UI ready)
- **Note Cards**: Preview title, content, and metadata
- **New Button**: Create new notes instantly
- **Selection**: Click to preview, yellow indicator for current selection

#### Preview/Editor (Right Panel)

- **Preview Mode**: Read-only view with enhanced typography
- **Editor Mode**: Professional code editor for markdown
- **Seamless Switching**: Toggle between preview and editing

## Working with Notes

### Creating Notes

#### New Note Button

1. Click **"New"** button in notes list header
2. Or click **"+"** in sidebar
3. Editor opens with blank note
4. Default title: "Untitled Note"
5. Default notebook: "Personal"

#### Note Properties

- **Title**: Editable at top of editor
- **Content**: Full markdown support
- **Notebook**: Category for organization
- **Tags**: Keywords for grouping (displayed in UI)
- **Pin Status**: Priority marking with "\*" indicator

### Editing Notes

#### Opening Editor

1. Select note from list (preview appears)
2. Click **"Edit"** button in preview header
3. Editor opens with current note content

#### Editor Features

- **Monaco Editor**: Professional code editing experience
- **Solarized Dark Theme**: Easy on the eyes
- **Line Numbers**: Track your position
- **Syntax Highlighting**: Markdown-specific coloring
- **Auto-indent**: Proper formatting assistance

#### Formatting Toolbar

Quick access buttons for common markdown:

- **B**: Bold text (`**bold**`)
- **I**: Italic text (`*italic*`)
- **Code**: Inline code (`\`code\``)
- **Link**: Links (`[text](url)`)
- **List**: Bullet lists (`- item`)
- **Quote**: Blockquotes (`> quote`)
- **H**: Headers (`# heading`)

#### Keyboard Shortcuts

- **Ctrl+S**: Save note
- **Ctrl+B**: Bold formatting
- **Ctrl+I**: Italic formatting
- **Ctrl+L**: Link formatting
- **Ctrl+E**: Code formatting

### Saving and Auto-Save

#### Save Behavior

- **Auto-save**: Saves 2 seconds after you stop typing
- **Visual Feedback**: Save button shows "Save\*" for unsaved changes
- **Status Bar**: Shows "Unsaved" or "Saved" status
- **Manual Save**: Click save button or use Ctrl+S

#### Data Persistence

- **Local Storage**: All notes saved to your browser's local storage
- **Automatic**: No setup required, works offline
- **Reliable**: Data persists between sessions

### Organizing Notes

#### Notebooks

Organize notes into categories:

- **Personal**: Private notes and thoughts
- **Work**: Professional documents and tasks
- **Projects**: Project-specific documentation

#### Pinning Notes

- **Pin Important Notes**: Mark with star (\*) indicator
- **Quick Access**: Pinned section in sidebar
- **Visual Priority**: Shows in notes list with yellow star

#### Tags

- **Keyword Organization**: Group related notes
- **Multiple Tags**: Each note can have several tags
- **Visual Display**: Show as colored badges in UI

## Advanced Features

### Preview Mode

#### Enhanced Typography

- **Optimized Reading**: Solarized color scheme for reduced eye strain
- **Proper Spacing**: Line height and margins for readability
- **Typography Scale**: Hierarchical heading sizes
- **Code Highlighting**: Syntax highlighting for code blocks

#### Markdown Support

- **Headers**: H1-H6 with proper styling
- **Lists**: Ordered and unordered lists
- **Links**: Clickable links with hover effects
- **Code**: Inline code and code blocks
- **Quotes**: Styled blockquotes
- **Tables**: Formatted table display
- **Task Lists**: Checkbox support for todos

### Editor Mode

#### IDE-Style Features

- **Line Highlighting**: Current line highlighted
- **Bracket Matching**: Matching brackets highlighted
- **Find and Replace**: Built-in search functionality
- **Multiple Cursors**: Advanced text selection
- **Code Folding**: Collapse sections for better navigation

#### Markdown-Specific

- **Live Validation**: Real-time syntax checking
- **Auto-completion**: Smart suggestions for markdown
- **Format On Type**: Automatic formatting as you type
- **Word Wrap**: Long lines wrap naturally

### Split View

- **Preview Toggle**: Show preview alongside editor
- **Live Updates**: Preview updates as you type
- **Synchronized Scrolling**: Keep preview in sync with editor
- **Responsive Layout**: Automatically adjusts panel sizes

## Data Management

### Export and Backup

#### Export Notes

1. Access export functionality through app menu
2. Downloads JSON file with all notes
3. Filename format: `inkrun-notes-YYYY-MM-DD.json`
4. Includes metadata and version information

#### Backup Structure

```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "notes": [...],
  "totalNotes": 42
}
```

### Import and Restore

#### Import Process

1. Select import option in app menu
2. Choose previously exported JSON file
3. System merges notes (no duplicates)
4. Shows import summary (X of Y notes imported)

#### Data Safety

- **No Overwrite**: Existing notes preserved
- **Duplicate Prevention**: Same ID notes not imported twice
- **Validation**: File format checked before import
- **Error Handling**: Clear messages for any issues

## Tips and Best Practices

### Effective Note Organization

#### Notebook Strategy

- **Keep Categories Broad**: Don't over-categorize
- **Use Consistently**: Stick to your chosen system
- **Review Regularly**: Reorganize as needs change

#### Tagging Best Practices

- **Descriptive Tags**: Use meaningful keywords
- **Consistent Naming**: Stick to naming conventions
- **Limit Quantity**: 3-5 tags per note maximum

### Writing Workflow

#### Start Simple

1. Begin with basic title and content
2. Add formatting as needed
3. Organize with notebooks and tags later
4. Pin important notes for quick access

#### Use Live Preview

- **Check Formatting**: Ensure output looks correct
- **Catch Errors**: Spot markdown syntax issues
- **Visual Feedback**: See how content will appear

#### Regular Maintenance

- **Review Old Notes**: Update or archive outdated content
- **Clean Up Tags**: Remove unused or redundant tags
- **Export Regularly**: Create backup files for important work

### Performance Tips

#### Optimal Usage

- **Keep Notes Focused**: Shorter notes load faster
- **Use Appropriate Formatting**: Don't over-format simple content
- **Regular Cleanup**: Remove unused notes occasionally

#### Storage Management

- **Monitor Usage**: Large note collections may slow performance
- **Export Archives**: Move old notes to archive files
- **Browser Limits**: Be aware of localStorage size limits

## Troubleshooting

### Common Issues

#### Notes Not Saving

1. **Check Status Bar**: Look for save status indicator
2. **Manual Save**: Use Ctrl+S or save button
3. **Browser Storage**: Ensure localStorage is enabled
4. **Space Available**: Check if storage quota exceeded

#### Editor Not Loading

1. **Refresh Page**: Reload the application
2. **Clear Cache**: Browser cache may be corrupted
3. **Check Console**: Look for JavaScript errors
4. **Update Browser**: Ensure modern browser version

#### Formatting Issues

1. **Check Markdown Syntax**: Verify proper markdown formatting
2. **Preview Mode**: Use preview to see rendered output
3. **Special Characters**: Escape special markdown characters
4. **Line Breaks**: Ensure proper spacing for formatting

### Data Recovery

#### Lost Notes

1. **Check All Notebooks**: Notes may be in different category
2. **Search Function**: Use search to locate notes
3. **Browser History**: Previous sessions may have cached data
4. **Export Backups**: Restore from previous export files

#### Corrupted Data

1. **Export Current**: Save what's recoverable
2. **Clear Storage**: Reset localStorage if necessary
3. **Import Backup**: Restore from known good backup
4. **Manual Recreation**: Re-enter content if needed

---

_User Guide Version: 1.0.0_
_Last Updated: January 2024_
