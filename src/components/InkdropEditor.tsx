import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { createEditorExtensions } from '../config/editorExtensions'

interface EditorPreset {
  includeCore: boolean
  includeKeyboard: boolean
  includeFeatures: boolean
  includeBehavior: boolean
  lineNumbers?: boolean
  theme: string
}

interface InkdropEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showLineNumbers?: boolean
  theme?: string
  preset?: EditorPreset | null
}

export interface InkdropEditorHandle {
  insertText: (text: string) => void
  formatSelection: (prefix: string, suffix?: string) => void
  getView: () => EditorView | null
  focus: () => void
}

const InkdropEditor = forwardRef<InkdropEditorHandle, InkdropEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start writing your markdown here...',
      showLineNumbers = false,
      theme = 'default',
      preset = null,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)

    // Expose editor methods to parent components
    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
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
        formatSelection: (prefix: string, suffix: string = '') => {
          if (viewRef.current) {
            const view = viewRef.current
            const selection = view.state.selection.main
            const selectedText = view.state.doc.sliceString(selection.from, selection.to)
            
            // Check if the selected text already has the formatting
            const hasPrefix = selectedText.startsWith(prefix)
            const hasSuffix = selectedText.endsWith(suffix)
            
            if (hasPrefix && hasSuffix && selectedText.length > prefix.length + suffix.length) {
              // Remove formatting if it already exists
              const unformattedText = selectedText.slice(prefix.length, -suffix.length || undefined)
              const transaction = view.state.update({
                changes: {
                  from: selection.from,
                  to: selection.to,
                  insert: unformattedText,
                },
                selection: {
                  anchor: selection.from,
                  head: selection.from + unformattedText.length,
                },
              })
              view.dispatch(transaction)
            } else {
              // Add formatting if it doesn't exist
              const textToFormat = selectedText || 'text'
              const formattedText = prefix + textToFormat + suffix
              
              const transaction = view.state.update({
                changes: {
                  from: selection.from,
                  to: selection.to,
                  insert: formattedText,
                },
                selection: {
                  anchor: selection.from + prefix.length,
                  head: selection.from + prefix.length + textToFormat.length,
                },
              })
              view.dispatch(transaction)
            }
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

      // Create extensions using the modular configuration
      const extensions = createEditorExtensions({
        placeholder,
        showLineNumbers,
        onChange,
        theme,
      })

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
    }, [placeholder, showLineNumbers, theme, onChange])

    // Update content when value prop changes externally (but avoid cursor jumps)
    useEffect(() => {
      if (viewRef.current) {
        const currentContent = viewRef.current.state.doc.toString()
        const newValue = value || ''
        
        // Only update if content is significantly different (not just typing)
        if (newValue !== currentContent && !viewRef.current.hasFocus) {
          const transaction = viewRef.current.state.update({
            changes: {
              from: 0,
              to: viewRef.current.state.doc.length,
              insert: newValue,
            },
          })
          viewRef.current.dispatch(transaction)
        }
      }
    }, [value])

    return (
      <div
        ref={editorRef}
        className="inkdrop-editor-container custom-scrollbar"
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
