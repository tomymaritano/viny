import { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSettings } from '../hooks/useSettings'

const SyntaxHighlightedEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const { settings } = useSettings()
  const editorRef = useRef(null)
  const highlightRef = useRef(null)
  const [highlightedContent, setHighlightedContent] = useState('')

  // Syntax highlighting function
  const highlightSyntax = useCallback(text => {
    if (!text) return ''

    return (
      text
        // Headers - diferentes tamaños y colores
        .replace(
          /^(#{1})\s+(.+)$/gm,
          '<span class="md-h1"><span class="md-hash">$1</span> $2</span>'
        )
        .replace(
          /^(#{2})\s+(.+)$/gm,
          '<span class="md-h2"><span class="md-hash">$1</span> $2</span>'
        )
        .replace(
          /^(#{3})\s+(.+)$/gm,
          '<span class="md-h3"><span class="md-hash">$1</span> $2</span>'
        )
        .replace(
          /^(#{4})\s+(.+)$/gm,
          '<span class="md-h4"><span class="md-hash">$1</span> $2</span>'
        )
        .replace(
          /^(#{5})\s+(.+)$/gm,
          '<span class="md-h5"><span class="md-hash">$1</span> $2</span>'
        )
        .replace(
          /^(#{6})\s+(.+)$/gm,
          '<span class="md-h6"><span class="md-hash">$1</span> $2</span>'
        )

        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<span class="md-bold">**$1**</span>')
        .replace(/__([^_]+)__/g, '<span class="md-bold">__$1__</span>')

        // Italic text
        .replace(
          /\*([^*\s][^*]*[^*\s])\*/g,
          '<span class="md-italic">*$1*</span>'
        )
        .replace(
          /_([^_\s][^_]*[^_\s])_/g,
          '<span class="md-italic">_$1_</span>'
        )

        // Inline code
        .replace(/`([^`]+)`/g, '<span class="md-code">`$1`</span>')

        // Code blocks
        .replace(/^```[\s\S]*?```$/gm, match => {
          return `<span class="md-code-block">${match}</span>`
        })

        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<span class="md-link-text">[$1]</span><span class="md-link-url">($2)</span>'
        )

        // Blockquotes
        .replace(/^>\s*(.+)$/gm, '<span class="md-blockquote">> $1</span>')

        // Unordered lists
        .replace(
          /^(\s*)([-*+])\s+(.+)$/gm,
          '$1<span class="md-list-marker">$2</span> <span class="md-list-item">$3</span>'
        )

        // Ordered lists
        .replace(
          /^(\s*)(\d+\.)\s+(.+)$/gm,
          '$1<span class="md-list-marker">$2</span> <span class="md-list-item">$3</span>'
        )

        // Task lists
        .replace(
          /^(\s*)([-*+])\s+(\[[ x]\])\s+(.+)$/gm,
          '$1<span class="md-list-marker">$2</span> <span class="md-task-marker">$3</span> <span class="md-task-item">$4</span>'
        )

        // Horizontal rules
        .replace(/^(---+|===+|\*\*\*+)$/gm, '<span class="md-hr">$1</span>')

        // Strikethrough
        .replace(/~~([^~]+)~~/g, '<span class="md-strikethrough">~~$1~~</span>')
    )
  }, [])

  // Update highlighted content when value changes
  useEffect(() => {
    const highlighted = highlightSyntax(value || '')
    setHighlightedContent(highlighted)
  }, [value, highlightSyntax])

  // Sync scroll between textarea and highlight overlay
  const handleScroll = useCallback(e => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop
      highlightRef.current.scrollLeft = e.target.scrollLeft
    }
  }, [])

  // Handle input changes
  const handleChange = useCallback(
    e => {
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <div className="syntax-highlighted-editor">
      {/* Syntax highlighting overlay */}
      <div
        ref={highlightRef}
        className="syntax-overlay"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        aria-hidden="true"
      />

      {/* Actual textarea */}
      <textarea
        ref={editorRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        className="editor-textarea"
        style={{
          fontFamily: settings?.fontFamily || 'var(--font-family-editor)',
          fontSize: settings?.fontSize || 'var(--font-size-editor)',
          lineHeight: settings?.lineHeight || 'var(--line-height)',
        }}
        placeholder={placeholder}
        spellCheck={settings?.spellCheck !== false}
      />
    </div>
  )
}

SyntaxHighlightedEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}

export default SyntaxHighlightedEditor
