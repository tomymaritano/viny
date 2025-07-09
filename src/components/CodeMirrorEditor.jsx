import { useEffect, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useSettings } from '../hooks/useSettings'

const CodeMirrorEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const { settings } = useSettings()
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Clean up previous editor
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    // Simple theme
    const customTheme = EditorView.theme({
      '&': {
        color: 'var(--color-base2)',
        backgroundColor: 'transparent',
        fontSize: '15px',
        fontFamily: 'var(--font-family-editor)',
      },
      '.cm-content': {
        padding: '20px',
        minHeight: '400px',
        lineHeight: '1.6',
        caretColor: 'var(--color-blue)',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-editor': {
        borderRadius: '8px',
        height: '100%',
      },
      '.cm-scroller': {
        fontFamily: 'inherit',
      },
    })

    const extensions = [
      basicSetup,
      markdown(),
      customTheme,
      oneDark,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString()
          onChange?.(newValue)
        }
      }),
      EditorView.lineWrapping,
    ]

    const startState = EditorState.create({
      doc: value || '',
      extensions,
    })

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
      }
    }
  }, [])

  // Update document when value changes externally
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
      }}
    />
  )
}

export default CodeMirrorEditor
