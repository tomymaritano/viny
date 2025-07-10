// Markdown formatting utilities for editor toolbar

export const createMarkdownFormatter = insertText => {
  return {
    // Text formatting
    insertBold: () => insertText('**bold text**'),
    insertItalic: () => insertText('*italic text*'),
    insertStrikethrough: () => insertText('~~strikethrough text~~'),
    insertCode: () => insertText('`inline code`'),

    // Headings
    insertHeading: (level = 1) => {
      const prefix = '#'.repeat(level) + ' '
      insertText('\n' + prefix + 'Heading\n')
    },

    // Links and media
    insertLink: () => insertText('[link text](https://example.com)'),
    insertImage: () => insertText('![alt text](image-url.jpg)'),

    // Lists
    insertList: () => insertText('\n- Item 1\n- Item 2\n- Item 3\n'),
    insertOrderedList: () => insertText('\n1. Item 1\n2. Item 2\n3. Item 3\n'),
    insertCheckbox: () =>
      insertText('\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n'),

    // Blocks
    insertCodeBlock: () => insertText('\n```javascript\n// code here\n```\n'),
    insertQuote: () => insertText('\n> Quote text\n'),
    insertTable: () =>
      insertText(
        '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'
      ),
    insertHorizontalRule: () => insertText('\n---\n'),

    // Advanced formatting
    insertMathBlock: () => insertText('\n$$\n\\LaTeX\n$$\n'),
    insertMathInline: () => insertText('$\\LaTeX$'),
    insertFootnote: () => insertText('[^1]\n\n[^1]: Footnote text'),
  }
}

// Keyboard shortcuts mapping
export const keyboardShortcuts = {
  'Ctrl+B': 'insertBold',
  'Cmd+B': 'insertBold',
  'Ctrl+I': 'insertItalic',
  'Cmd+I': 'insertItalic',
  'Ctrl+K': 'insertLink',
  'Cmd+K': 'insertLink',
  'Ctrl+E': 'insertCode',
  'Cmd+E': 'insertCode',
  'Ctrl+Shift+C': 'insertCodeBlock',
  'Cmd+Shift+C': 'insertCodeBlock',
  'Ctrl+Shift+Q': 'insertQuote',
  'Cmd+Shift+Q': 'insertQuote',
  'Ctrl+Shift+L': 'insertList',
  'Cmd+Shift+L': 'insertList',
}

// Text statistics utilities
export const calculateStats = text => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length

  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0).length
  const lines = text.split('\n').length

  return {
    words,
    chars,
    charsNoSpaces,
    paragraphs,
    lines,
  }
}
