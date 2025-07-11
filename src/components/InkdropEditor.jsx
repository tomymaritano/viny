import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { EditorView, minimalSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { placeholder as placeholderExtension } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { searchKeymap, search } from '@codemirror/search'
import { keymap } from '@codemirror/view'
import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { history } from '@codemirror/commands'
import { lineNumbers } from '@codemirror/view'
import { getEditorColor } from '../config/editorColors'

// Custom color scheme using configurable colors
const createCustomHighlightStyle = () =>
  HighlightStyle.define([
    // Headers
    {
      tag: t.heading1,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.8em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading2,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.6em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading3,
      color: getEditorColor('heading'),
      fontWeight: '700',
      fontSize: '1.4em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading4,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1.2em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading5,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1.1em',
      lineHeight: '1.3',
    },
    {
      tag: t.heading6,
      color: getEditorColor('heading'),
      fontWeight: '600',
      fontSize: '1em',
      lineHeight: '1.3',
    },

    // Bold text
    { tag: t.strong, fontWeight: 'bold', color: getEditorColor('bold') },

    // Links and images
    { tag: t.link, color: getEditorColor('link'), textDecoration: 'underline' },
    { tag: t.url, color: getEditorColor('link') },

    // Code tags
    {
      tag: t.monospace,
      backgroundColor: getEditorColor('codeBackground'),
      padding: '2px 4px',
      color: getEditorColor('code'),
      borderRadius: '3px',
    },

    // Other elements
    { tag: t.emphasis, fontStyle: 'italic', color: getEditorColor('text') },
    { tag: t.quote, color: getEditorColor('quote'), fontStyle: 'italic' },
    { tag: t.list, color: getEditorColor('text') },
  ])

const InkdropEditor = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = 'Start writing your markdown here...',
      showLineNumbers = false,
    },
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
          color: getEditorColor('text'),
          backgroundColor: getEditorColor('background'),
          fontSize: '12px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          height: '100%',
        },
        '.cm-content': {
          padding: '16px',
          caretColor: getEditorColor('cursor'),
          minHeight: '100%',
          lineHeight: '1.5',
          backgroundColor: getEditorColor('background'),
          fontSize: '12px',
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeft: `2px solid ${getEditorColor('cursor')}`,
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          border: 'none',
          backgroundColor: getEditorColor('background'),
        },
        '.cm-scroller': {
          overflow: 'auto',
          height: '100%',
          backgroundColor: getEditorColor('background'),
        },
        '.cm-lineNumbers': {
          paddingRight: '4px',
          minWidth: '20px',
          color: getEditorColor('lineNumber'),
          backgroundColor: getEditorColor('background'),
        },
        '.cm-gutters': {
          backgroundColor: getEditorColor('background'),
          color: getEditorColor('lineNumber'),
          border: 'none',
        },
      })

      // Custom placeholder theme
      const placeholderTheme = EditorView.theme({
        '.cm-placeholder': {
          color: getEditorColor('placeholder'),
          fontStyle: 'italic',
        },
      })

      const extensions = [
        minimalSetup,
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        search(),
        markdown(),
        syntaxHighlighting(createCustomHighlightStyle()),
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
      ]

      // Add line numbers extension if enabled
      if (showLineNumbers) {
        extensions.push(lineNumbers())
      }

      const startState = EditorState.create({
        doc: value || '',
        extensions,
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
    }, [placeholder, showLineNumbers])

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
