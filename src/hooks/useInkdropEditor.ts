/**
 * Custom hook for InkdropEditor logic
 * Separates editor initialization and management from UI component
 */

import { useEffect, useRef, useCallback } from 'react'
import { EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { createEditorExtensions } from '../config/editorExtensions'
import { attachFormatSelection } from '../config/editorKeybindings'
import { editorLogger } from '../utils/logger'

interface EditorPreset {
  includeCore: boolean
  includeKeyboard: boolean
  includeFeatures: boolean
  includeBehavior: boolean
  lineNumbers?: boolean
  theme: string
}

interface UseInkdropEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showLineNumbers?: boolean
  theme?: string
  preset?: EditorPreset | null
}

interface InkdropEditorMethods {
  insertText: (text: string) => void
  formatSelection: (prefix: string, suffix?: string) => void
  getView: () => EditorView | null
  focus: () => void
}

export function useInkdropEditor({
  value = '',
  onChange,
  placeholder = 'Start writing your markdown here...',
  showLineNumbers = false,
  theme = 'default',
  preset = null,
}: UseInkdropEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  // Initialize editor
  const initializeEditor = useCallback(() => {
    if (!editorRef.current) return

    try {
      editorLogger.debug('Initializing editor with theme:', theme)

      const extensions = createEditorExtensions({
        placeholder,
        showLineNumbers,
        theme,
        preset: preset || {
          includeCore: true,
          includeKeyboard: true,
          includeFeatures: true,
          includeBehavior: true,
          lineNumbers: showLineNumbers,
          theme
        }
      })

      const state = EditorState.create({
        doc: value,
        extensions: [
          ...extensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
              const newValue = update.state.doc.toString()
              onChange(newValue)
            }
          })
        ]
      })

      const view = new EditorView({
        state,
        parent: editorRef.current
      })

      viewRef.current = view

      // Attach format selection functionality
      attachFormatSelection(view)

      editorLogger.debug('Editor initialized successfully')
    } catch (error) {
      editorLogger.error('Failed to initialize editor:', error)
    }
  }, [value, onChange, placeholder, showLineNumbers, theme, preset])

  // Cleanup editor
  const destroyEditor = useCallback(() => {
    if (viewRef.current) {
      editorLogger.debug('Destroying editor')
      viewRef.current.destroy()
      viewRef.current = null
    }
  }, [])

  // Update editor content when value changes externally
  const updateEditorContent = useCallback((newValue: string) => {
    if (!viewRef.current) return

    const currentContent = viewRef.current.state.doc.toString()
    if (currentContent !== newValue) {
      editorLogger.debug('Updating editor content')
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newValue
        }
      })
    }
  }, [])

  // Editor methods
  const insertText = useCallback((text: string) => {
    if (!viewRef.current) return

    const view = viewRef.current
    const { from, to } = view.state.selection.main
    
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length }
    })
    
    view.focus()
  }, [])

  const formatSelection = useCallback((prefix: string, suffix = '') => {
    if (!viewRef.current) return

    const view = viewRef.current
    const { from, to } = view.state.selection.main
    const selectedText = view.state.doc.sliceString(from, to)
    
    // Check if text is already formatted
    const beforeText = view.state.doc.sliceString(Math.max(0, from - prefix.length), from)
    const afterText = view.state.doc.sliceString(to, Math.min(view.state.doc.length, to + suffix.length))
    
    if (beforeText === prefix && afterText === suffix) {
      // Remove formatting
      view.dispatch({
        changes: [
          { from: from - prefix.length, to: from, insert: '' },
          { from: to - prefix.length, to: to + suffix.length - prefix.length, insert: '' }
        ],
        selection: { anchor: from - prefix.length, head: to - prefix.length }
      })
    } else {
      // Add formatting
      const formattedText = `${prefix}${selectedText}${suffix}`
      view.dispatch({
        changes: { from, to, insert: formattedText },
        selection: { 
          anchor: from + prefix.length, 
          head: to + prefix.length 
        }
      })
    }
    
    view.focus()
  }, [])

  const focus = useCallback(() => {
    if (viewRef.current) {
      viewRef.current.focus()
    }
  }, [])

  const getView = useCallback(() => {
    return viewRef.current
  }, [])

  // Initialize editor on mount
  useEffect(() => {
    initializeEditor()
    return destroyEditor
  }, [initializeEditor, destroyEditor])

  // Update content when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      updateEditorContent(value)
    }
  }, [value, updateEditorContent])

  // Recreate editor when key settings change
  useEffect(() => {
    destroyEditor()
    initializeEditor()
  }, [theme, showLineNumbers, preset])

  const methods: InkdropEditorMethods = {
    insertText,
    formatSelection,
    getView,
    focus
  }

  return {
    editorRef,
    methods
  }
}

export type { EditorPreset, InkdropEditorMethods }