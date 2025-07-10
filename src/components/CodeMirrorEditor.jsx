import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import {
  EditorView as EditorViewType,
  placeholder as placeholderExtension,
} from '@codemirror/view'

const CodeMirrorEditor = ({
  value,
  onChange,
  placeholder = 'Start writing your markdown here...',
}) => {
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Clear any existing editor
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    // Simple clean Inkdrop theme
    const inkdropTheme = EditorViewType.theme({
      '&': {
        color: '#ffffff',
        backgroundColor: 'transparent',
        fontSize: '16px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      '.cm-content': {
        padding: '24px',
        caretColor: '#4FC3F7',
        minHeight: '400px',
        lineHeight: '1.8',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-line': {
        padding: '0',
      },
      // Headers - THE MOST IMPORTANT PART
      '.cm-header': {
        lineHeight: '1.3',
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
      },
      '.cm-header.cm-header1': {
        fontSize: '2.2em',
        fontWeight: '700',
        color: '#4FC3F7',
      },
      '.cm-header.cm-header2': {
        fontSize: '1.8em',
        fontWeight: '700',
        color: '#26C6DA',
      },
      '.cm-header.cm-header3': {
        fontSize: '1.4em',
        fontWeight: '600',
        color: '#00BCD4',
      },
      '.cm-header.cm-header4': {
        fontSize: '1.2em',
        fontWeight: '600',
        color: '#00ACC1',
      },
      '.cm-header.cm-header5': {
        fontSize: '1.1em',
        fontWeight: '600',
        color: '#0097A7',
      },
      '.cm-header.cm-header6': {
        fontSize: '1em',
        fontWeight: '600',
        color: '#00838F',
      },
      // Basic markdown
      '.cm-strong': {
        fontWeight: '700',
      },
      '.cm-em': {
        fontStyle: 'italic',
      },
      '.cm-link': {
        color: '#4FC3F7',
        textDecoration: 'underline',
      },
      '.cm-monospace': {
        backgroundColor: 'rgba(79, 195, 247, 0.15)',
        padding: '2px 4px',
        borderRadius: '3px',
        fontFamily: 'SF Mono, Monaco, Consolas, monospace',
      },
    })

    // Custom placeholder theme
    const placeholderTheme = EditorViewType.theme({
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
        inkdropTheme,
        placeholderTheme,
        placeholderExtension(placeholder),
        EditorViewType.updateListener.of(update => {
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
      className="codemirror-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    />
  )
}

export default CodeMirrorEditor
