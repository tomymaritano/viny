/**
 * Refactored InkdropEditor component
 * Simplified by extracting logic to useInkdropEditor hook
 */

import React, { useImperativeHandle, forwardRef } from 'react'
import { useInkdropEditor, type EditorPreset, type InkdropEditorMethods } from '../hooks/useInkdropEditor'

interface InkdropEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showLineNumbers?: boolean
  theme?: string
  preset?: EditorPreset | null
}

const InkdropEditor = forwardRef<InkdropEditorMethods, InkdropEditorProps>(
  (props, ref) => {
    const { editorRef, methods } = useInkdropEditor(props)

    // Expose editor methods to parent components
    useImperativeHandle(ref, () => methods, [methods])

    return (
      <div
        ref={editorRef}
        className="inkdrop-editor h-full"
        style={{
          minHeight: '100%',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      />
    )
  }
)

InkdropEditor.displayName = 'InkdropEditor'

export default InkdropEditor
export type { InkdropEditorProps, InkdropEditorMethods, EditorPreset }