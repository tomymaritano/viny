/**
 * CodeMirror Plugin for Clickable TODOs
 * Allows users to click on TODO items to toggle their completion status
 */

import { ViewPlugin, Decoration } from '@codemirror/view'

// Regular expressions for different TODO formats
const TODO_PATTERNS = [
  { regex: /^(\s*[-*+]\s*)(\[ \]|\[x\]|\[X\])(\s+.*)/gm, type: 'checkbox' },
  { regex: /^(\s*\d+\.\s*)(\[ \]|\[x\]|\[X\])(\s+.*)/gm, type: 'numbered' },
  {
    regex: /^(\s*)(TODO|FIXME|HACK|NOTE|BUG|OPTIMIZE|REVIEW)(:?\s+.*)/gim,
    type: 'keyword',
  },
]

// Decoration types for different TODO states
const todoCheckboxDecoration = completed =>
  Decoration.mark({
    class: completed ? 'todo-checkbox-completed' : 'todo-checkbox-pending',
    tagName: 'span',
  })

const todoTextDecoration = completed =>
  Decoration.mark({
    class: completed ? 'todo-text-completed' : 'todo-text-pending',
    tagName: 'span',
  })

const todoKeywordDecoration = keyword =>
  Decoration.mark({
    class: `todo-keyword todo-keyword-${keyword.toLowerCase()}`,
    tagName: 'span',
  })

/**
 * Creates a click widget decoration for todo checkboxes
 */
const createCheckboxWidget = (pos, completed, onToggle) => {
  return Decoration.widget({
    widget: new (class {
      toDOM() {
        const span = document.createElement('span')
        span.className = `todo-checkbox-widget ${completed ? 'completed' : 'pending'}`
        span.innerHTML = completed ? '☑' : '☐'
        span.style.cursor = 'pointer'
        span.style.userSelect = 'none'
        span.style.marginRight = '4px'
        span.style.color = completed ? '#66bb6a' : '#888888'
        span.style.fontSize = '14px'

        span.addEventListener('click', e => {
          e.preventDefault()
          e.stopPropagation()
          onToggle()
        })

        return span
      }
      
      destroy() {
        // Clean up method required by CodeMirror
      }
    })(),
    side: 1,
  })
}

/**
 * Parses document for TODO items and returns decorations
 */
function getTodoDecorations(view) {
  const decorations = []
  const doc = view.state.doc
  const text = doc.toString()

  // Process checkbox TODOs
  TODO_PATTERNS.forEach(pattern => {
    let match
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)

    while ((match = regex.exec(text)) !== null) {
      const from = match.index
      const to = match.index + match[0].length

      if (pattern.type === 'checkbox' || pattern.type === 'numbered') {
        const prefix = match[1]
        const checkbox = match[2]
        const content = match[3]
        const completed = checkbox === '[x]' || checkbox === '[X]'

        // Position calculations
        const prefixEnd = from + prefix.length
        const checkboxStart = prefixEnd
        const checkboxEnd = checkboxStart + checkbox.length
        const contentStart = checkboxEnd
        const contentEnd = to

        try {
          // Add checkbox decoration
          decorations.push(
            todoCheckboxDecoration(completed).range(checkboxStart, checkboxEnd)
          )

          // Add text decoration for the content
          if (contentStart < contentEnd) {
            decorations.push(
              todoTextDecoration(completed).range(contentStart, contentEnd)
            )
          }

          // Add clickable widget at the start of the checkbox
          decorations.push(
            createCheckboxWidget(checkboxStart, completed, () => {
              // Toggle the checkbox state
              const newCheckbox = completed ? '[ ]' : '[x]'
              const transaction = view.state.update({
                changes: {
                  from: checkboxStart,
                  to: checkboxEnd,
                  insert: newCheckbox,
                },
              })
              view.dispatch(transaction)
            }).range(checkboxStart, checkboxStart)
          )
        } catch (error) {
          console.warn('Todo plugin decoration error:', error)
        }
      } else if (pattern.type === 'keyword') {
        const keyword = match[2]
        try {
          decorations.push(
            todoKeywordDecoration(keyword).range(
              from + match[1].length,
              from + match[1].length + keyword.length
            )
          )
        } catch (error) {
          console.warn('Todo keyword decoration error:', error)
        }
      }
    }
  })

  // Sort decorations by from position to avoid errors
  // Filter out any invalid decorations first
  const validDecorations = decorations.filter(d => 
    d && typeof d.from === 'number' && typeof d.to === 'number' && d.from <= d.to
  )
  
  // Sort by from position, then by to position for same from
  validDecorations.sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from
    return a.to - b.to
  })
  
  return Decoration.set(validDecorations)
}

/**
 * Main TODO plugin implementation
 */
export const todoPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = getTodoDecorations(view)
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = getTodoDecorations(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations,
  }
)

/**
 * CSS styles for TODO decorations (to be imported in the component)
 */
export const todoStyles = `
/* TODO Checkbox styles */
.todo-checkbox-pending {
  color: #888888;
  font-weight: bold;
}

.todo-checkbox-completed {
  color: #66bb6a;
  font-weight: bold;
}

.todo-text-pending {
  color: var(--color-base1);
}

.todo-text-completed {
  color: var(--color-base0);
  text-decoration: line-through;
  opacity: 0.7;
}

/* TODO Keyword styles */
.todo-keyword {
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.85em;
}

.todo-keyword-todo {
  color: #4fc3f7;
  background-color: rgba(79, 195, 247, 0.1);
}

.todo-keyword-fixme {
  color: #ef5350;
  background-color: rgba(239, 83, 80, 0.1);
}

.todo-keyword-hack {
  color: #ff8a65;
  background-color: rgba(255, 138, 101, 0.1);
}

.todo-keyword-note {
  color: #ffca28;
  background-color: rgba(255, 202, 40, 0.1);
}

.todo-keyword-bug {
  color: #ef5350;
  background-color: rgba(239, 83, 80, 0.1);
}

.todo-keyword-optimize {
  color: #66bb6a;
  background-color: rgba(102, 187, 106, 0.1);
}

.todo-keyword-review {
  color: #ba68c8;
  background-color: rgba(186, 104, 200, 0.1);
}

/* Checkbox widget hover effects */
.todo-checkbox-widget:hover {
  transform: scale(1.1);
  transition: transform 0.1s ease;
}

.todo-checkbox-widget.completed:hover {
  color: #4caf50 !important;
}

.todo-checkbox-widget.pending:hover {
  color: #aaaaaa !important;
}
`
