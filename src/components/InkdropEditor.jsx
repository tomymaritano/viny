import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { placeholder as placeholderExtension } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Custom color scheme with specified colors
const customHighlightStyle = HighlightStyle.define([
  // Headers - #EEC951
  {
    tag: t.heading1,
    color: '#EEC951',
    fontWeight: '700',
    fontSize: '1.8em',
    lineHeight: '1.3',
  },
  {
    tag: t.heading2,
    color: '#EEC951',
    fontWeight: '700',
    fontSize: '1.6em',
    lineHeight: '1.3',
  },
  {
    tag: t.heading3,
    color: '#EEC951',
    fontWeight: '700',
    fontSize: '1.4em',
    lineHeight: '1.3',
  },
  {
    tag: t.heading4,
    color: '#EEC951',
    fontWeight: '600',
    fontSize: '1.2em',
    lineHeight: '1.3',
  },
  {
    tag: t.heading5,
    color: '#EEC951',
    fontWeight: '600',
    fontSize: '1.1em',
    lineHeight: '1.3',
  },
  {
    tag: t.heading6,
    color: '#EEC951',
    fontWeight: '600',
    fontSize: '1em',
    lineHeight: '1.3',
  },

  // Bold text - #ED6E3F
  { tag: t.strong, fontWeight: 'bold', color: '#ED6E3F' },

  // Links and images - #587EC6
  { tag: t.link, color: '#587EC6', textDecoration: 'underline' },
  { tag: t.url, color: '#587EC6' },

  // Code tags - #DA5677
  {
    tag: t.monospace,
    backgroundColor: 'rgba(218, 86, 119, 0.15)',
    padding: '2px 4px',
    color: '#DA5677',
    borderRadius: '3px',
  },

  // Other elements
  { tag: t.emphasis, fontStyle: 'italic', color: '#ffffff' },
  { tag: t.quote, color: '#b0b0b0', fontStyle: 'italic' },
  { tag: t.list, color: '#ffffff' },
])

const InkdropEditor = forwardRef(
  (
    { value, onChange, placeholder = 'Start writing your markdown here...' },
    ref
  ) => {
    const editorRef = useRef(null)
    const viewRef = useRef(null)

    // Expose editor methods to parent components
    useImperativeHandle(
      ref,
      () => ({
        insertText: text => {
          if (viewRef.current) {
            const view = viewRef.current
            const selection = view.state.selection.main
            const transaction = view.state.update({
              changes: {
                from: selection.from,
                to: selection.to,
                insert: text,
              },
              selection: {
                anchor: selection.from + text.length,
                head: selection.from + text.length,
              },
            })
            view.dispatch(transaction)
          }
        },
        getView: () => viewRef.current,
        focus: () => {
          if (viewRef.current) {
            viewRef.current.focus()
          }
        },
      }),
      []
    )

    useEffect(() => {
      if (!editorRef.current) return

      // Clear any existing editor
      if (viewRef.current) {
        viewRef.current.destroy()
      }

      // Inkdrop-style theme
      const inkdropTheme = EditorView.theme({
        '&': {
          color: '#ffffff',
          backgroundColor: 'transparent',
          fontSize: '12px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          height: '100%',
        },
        '.cm-content': {
          padding: '16px',
          caretColor: '#4FC3F7',
          minHeight: '400px',
          lineHeight: '1.6',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          border: 'none',
        },
        '.cm-scroller': {
          overflow: 'auto',
          maxHeight: '100%',
          height: '100%',
        },
        '.cm-lineNumbers': {
          paddingRight: '4px',
          minWidth: '20px',
        },
      })

      // Custom placeholder theme
      const placeholderTheme = EditorView.theme({
        '.cm-placeholder': {
          color: '#546E7A',
          fontStyle: 'italic',
        },
      })

      const startState = EditorState.create({
        doc: value || '',
        extensions: [
          basicSetup,
          markdown(),
          oneDark,
          syntaxHighlighting(customHighlightStyle),
          inkdropTheme,
          placeholderTheme,
          placeholderExtension(placeholder),
          EditorView.lineWrapping, // Enable line wrapping
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              onChange?.(newValue)
            }
          }),
        ],
      })

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      })

      viewRef.current = view

      // Focus the editor
      view.focus()

      return () => {
        if (viewRef.current) {
          viewRef.current.destroy()
          viewRef.current = null
        }
      }
    }, [placeholder])

    // Update content when value prop changes externally
    useEffect(() => {
      if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: value || '',
          },
        })
        viewRef.current.dispatch(transaction)
      }
    }, [value])

    return (
      <div
        ref={editorRef}
        className="inkdrop-editor-container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0px',
        }}
      />
    )
  }
)

InkdropEditor.displayName = 'InkdropEditor'

export default InkdropEditor
