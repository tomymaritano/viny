import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { createEditorExtensions } from '../config/editorExtensions'
import { attachFormatSelection } from '../config/editorKeybindings'

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
            
            // Expand selection to include formatting markers if they exist
            const lineStart = view.state.doc.lineAt(selection.from).from
            const lineEnd = view.state.doc.lineAt(selection.to).to
            const lineText = view.state.doc.sliceString(lineStart, lineEnd)
            
            // Find the start and end of the current word/phrase with potential formatting
            let expandedFrom = selection.from
            let expandedTo = selection.to
            
            // Look backward for prefix
            while (expandedFrom > lineStart) {
              const checkText = view.state.doc.sliceString(expandedFrom - prefix.length, expandedFrom)
              if (checkText === prefix) {
                expandedFrom -= prefix.length
                break
              }
              if (view.state.doc.sliceString(expandedFrom - 1, expandedFrom) === ' ') break
              expandedFrom--
            }
            
            // Look forward for suffix
            while (expandedTo < lineEnd) {
              const checkText = view.state.doc.sliceString(expandedTo, expandedTo + suffix.length)
              if (checkText === suffix) {
                expandedTo += suffix.length
                break
              }
              if (view.state.doc.sliceString(expandedTo, expandedTo + 1) === ' ') break
              expandedTo++
            }
            
            const expandedText = view.state.doc.sliceString(expandedFrom, expandedTo)
            const hasFormatting = expandedText.startsWith(prefix) && expandedText.endsWith(suffix) && expandedText.length > prefix.length + suffix.length
            
            if (hasFormatting) {
              // Remove formatting
              const unformattedText = expandedText.slice(prefix.length, -suffix.length || undefined)
              const transaction = view.state.update({
                changes: {
                  from: expandedFrom,
                  to: expandedTo,
                  insert: unformattedText,
                },
                selection: {
                  anchor: expandedFrom,
                  head: expandedFrom + unformattedText.length,
                },
              })
              view.dispatch(transaction)
            } else {
              // Add formatting to selected text or current word
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

      // Attach formatSelection function to the editor DOM for keybindings
      if (editorRef.current) {
        attachFormatSelection(editorRef.current, (prefix: string, suffix: string = '') => {
          // Delegate to the formatSelection method from the imperative handle
          if (viewRef.current) {
            const selection = viewRef.current.state.selection.main
            const selectedText = viewRef.current.state.doc.sliceString(selection.from, selection.to)
            
            // Use the same logic as in formatSelection
            const lineStart = viewRef.current.state.doc.lineAt(selection.from).from
            const lineEnd = viewRef.current.state.doc.lineAt(selection.to).to
            
            let expandedFrom = selection.from
            let expandedTo = selection.to
            
            // Look backward for prefix
            while (expandedFrom > lineStart) {
              const checkText = viewRef.current.state.doc.sliceString(expandedFrom - prefix.length, expandedFrom)
              if (checkText === prefix) {
                expandedFrom -= prefix.length
                break
              }
              if (viewRef.current.state.doc.sliceString(expandedFrom - 1, expandedFrom) === ' ') break
              expandedFrom--
            }
            
            // Look forward for suffix
            while (expandedTo < lineEnd) {
              const checkText = viewRef.current.state.doc.sliceString(expandedTo, expandedTo + suffix.length)
              if (checkText === suffix) {
                expandedTo += suffix.length
                break
              }
              if (viewRef.current.state.doc.sliceString(expandedTo, expandedTo + 1) === ' ') break
              expandedTo++
            }
            
            const expandedText = viewRef.current.state.doc.sliceString(expandedFrom, expandedTo)
            const hasFormatting = expandedText.startsWith(prefix) && expandedText.endsWith(suffix) && expandedText.length > prefix.length + suffix.length
            
            if (hasFormatting) {
              // Remove formatting
              const unformattedText = expandedText.slice(prefix.length, -suffix.length || undefined)
              const transaction = viewRef.current.state.update({
                changes: {
                  from: expandedFrom,
                  to: expandedTo,
                  insert: unformattedText,
                },
                selection: {
                  anchor: expandedFrom,
                  head: expandedFrom + unformattedText.length,
                },
              })
              viewRef.current.dispatch(transaction)
            } else {
              // Add formatting
              const textToFormat = selectedText || 'text'
              const formattedText = prefix + textToFormat + suffix
              
              const transaction = viewRef.current.state.update({
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
              viewRef.current.dispatch(transaction)
            }
          }
        })
      }

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
