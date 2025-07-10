import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import {
  syntaxHighlighting,
  HighlightStyle,
  syntaxTree,
} from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import {
  ViewPlugin,
  Decoration,
  EditorView as ViewExtension,
  placeholder,
} from '@codemirror/view'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'

// Custom syntax highlighting with your specific colors
const customHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, color: '#EEC951', fontWeight: '700' },
  { tag: t.heading2, color: '#EEC951', fontWeight: '700' },
  { tag: t.heading3, color: '#EEC951', fontWeight: '600' },
  { tag: t.heading4, color: '#EEC951', fontWeight: '600' },
  { tag: t.heading5, color: '#EEC951', fontWeight: '600' },
  { tag: t.heading6, color: '#EEC951', fontWeight: '600' },
  { tag: t.strong, fontWeight: 'bold', color: '#ED6E3F' },
  {
    tag: t.emphasis,
    fontStyle: 'italic',
    color: 'var(--color-base1, #B0BEC5)',
  },
  { tag: t.link, color: '#488076', textDecoration: 'underline' },
  { tag: t.url, color: '#488076' },
  {
    tag: t.monospace,
    backgroundColor: 'var(--color-base02, rgba(79, 195, 247, 0.15))',
    padding: '2px 4px',
    color: '#DA5677',
  },
  {
    tag: t.strikethrough,
    textDecoration: 'line-through',
    color: 'var(--color-base0, #78909C)',
  },
])

const headerSizePlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.computeDecorations(view)
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.computeDecorations(update.view)
      }
    }

    computeDecorations(view) {
      const decorations = []
      const { from, to } = view.viewport

      syntaxTree(view.state).iterate({
        from,
        to,
        enter: node => {
          if (node.name.startsWith('ATXHeading')) {
            const level = parseInt(node.name.slice(-1), 10)
            if (level >= 1 && level <= 6) {
              const line = view.state.doc.lineAt(node.from)
              decorations.push(
                Decoration.line({
                  class: `cm-header-${level}`,
                }).range(line.from)
              )
            }
          }
        },
      })

      return Decoration.set(decorations)
    }
  },
  {
    decorations: v => v.decorations,
  }
)

const InkdropEditor = ({
  value,
  onChange,
  placeholder: placeholderText = 'Start writing...',
  onPreviewUpdate,
}) => {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const processorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const onPreviewUpdateRef = useRef(onPreviewUpdate)

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange
    onPreviewUpdateRef.current = onPreviewUpdate
  })

  useEffect(() => {
    processorRef.current = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(rehypeStringify)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    if (viewRef.current) {
      viewRef.current.destroy()
    }

    const inkdropTheme = ViewExtension.theme({
      '&': {
        height: '100%',
        width: '100%',
        fontSize: '12px',
        fontFamily: 'var(--font-family-markdown, var(--font-family-ui))',
        color: 'var(--color-base2, #ffffff)',
        backgroundColor: 'transparent',
        border: 'none !important',
        borderRadius: '0 !important',
        margin: '0 !important',
        padding: '0 !important',
        overflow: 'visible',
      },
      '.cm-editor': {
        border: 'none !important',
        borderRadius: '0 !important',
        outline: 'none !important',
        backgroundColor: 'transparent !important',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: 'none !important',
      },
      '.cm-editor.cm-focused': {
        outline: 'none !important',
        border: 'none !important',
        borderRadius: '0 !important',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '.cm-editor:focus': {
        outline: 'none !important',
        border: 'none !important',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '.cm-editor:focus-within': {
        outline: 'none !important',
        border: 'none !important',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '.cm-content': {
        padding: '24px',
        minHeight: '100%',
        caretColor: 'var(--color-cyan, #4FC3F7)',
        lineHeight: '1.6',
        border: 'none !important',
        backgroundColor: 'transparent !important',
        flex: '1 1 auto',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      },
      '.cm-focused': {
        outline: 'none !important',
        border: 'none !important',
        borderRadius: '0 !important',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
      },
      '.cm-line': {
        padding: '0',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '24px',
        paddingRight: '4px',
        border: 'none !important',
        borderRadius: '0 !important',
      },
      '.cm-lineNumbers': {
        minWidth: '24px',
        color: 'var(--color-base0, #546E7A)',
        fontSize: '0.85em',
        paddingRight: '8px',
        textAlign: 'right',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        paddingRight: '6px !important',
        minWidth: '20px !important',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--color-base03, rgba(79, 195, 247, 0.1))',
      },
      '.cm-header-1': {
        fontSize: '1.15em !important',
        fontWeight: '700 !important',
        color: '#EEC951 !important',
        lineHeight: '1.4 !important',
        marginTop: '0.2em !important',
        marginBottom: '0.1em !important',
      },
      '.cm-header-2': {
        fontSize: '1.1em !important',
        fontWeight: '700 !important',
        color: '#EEC951 !important',
        lineHeight: '1.4 !important',
        marginTop: '0.2em !important',
        marginBottom: '0.1em !important',
      },
      '.cm-header-3': {
        fontSize: '1.05em !important',
        fontWeight: '600 !important',
        color: '#EEC951 !important',
        lineHeight: '1.4 !important',
        marginTop: '0.15em !important',
        marginBottom: '0.05em !important',
      },
      '.cm-header-4': {
        fontSize: '1.02em !important',
        fontWeight: '600 !important',
        color: '#EEC951 !important',
        marginTop: '0.1em !important',
        marginBottom: '0.05em !important',
      },
      '.cm-header-5': {
        fontSize: '1em !important',
        fontWeight: '600 !important',
        color: '#EEC951 !important',
        marginTop: '0.1em !important',
        marginBottom: '0.05em !important',
      },
      '.cm-header-6': {
        fontSize: '1em !important',
        fontWeight: '600 !important',
        color: '#EEC951 !important',
        marginTop: '0.1em !important',
        marginBottom: '0.05em !important',
      },
      '.cm-scroller': {
        fontFamily: 'inherit',
        width: '100%',
        backgroundColor: 'transparent !important',
        flex: '1 1 auto',
      },
      '.cm-theme': {
        backgroundColor: 'transparent !important',
        border: 'none !important',
        borderRadius: '0 !important',
      },
      '.cm-wrap': {
        border: 'none !important',
        borderRadius: '0 !important',
        backgroundColor: 'transparent !important',
      },
      '& *': {
        border: 'none !important',
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      '&:focus-within': {
        outline: 'none !important',
        border: 'none !important',
        boxShadow: 'none !important',
      },
      '@media (max-width: 768px)': {
        '.cm-content': {
          padding: '16px !important',
        },
        '.cm-gutters': {
          minWidth: '20px !important',
          paddingRight: '2px !important',
        },
        '.cm-lineNumbers': {
          minWidth: '18px !important',
          fontSize: '0.8em !important',
        },
      },
    })

    const startState = EditorState.create({
      doc: value || '',
      extensions: [
        basicSetup,
        markdown(),
        syntaxHighlighting(customHighlightStyle),
        headerSizePlugin,
        inkdropTheme,
        placeholder(placeholderText),
        ViewExtension.updateListener.of(update => {
          if (update.docChanged) {
            const content = update.state.doc.toString()
            if (onChangeRef.current) {
              onChangeRef.current(content)
            }

            if (onPreviewUpdateRef.current && processorRef.current) {
              processorRef.current
                .process(content)
                .then(file => {
                  if (onPreviewUpdateRef.current) {
                    onPreviewUpdateRef.current(String(file))
                  }
                })
                .catch(() => {
                  // Silently handle markdown processing errors
                })
            }
          }
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    viewRef.current = view
    view.focus()

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [placeholderText])

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const currentCursor = viewRef.current.state.selection.main.head
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value || '',
        },
        selection: { anchor: Math.min(currentCursor, (value || '').length) },
      })
      viewRef.current.dispatch(transaction)
    }
  }, [value])

  return (
    <div
      ref={editorRef}
      className="inkdrop-editor"
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: 'none',
        borderRadius: '0',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    />
  )
}

InkdropEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  onPreviewUpdate: PropTypes.func,
}

export default InkdropEditor
