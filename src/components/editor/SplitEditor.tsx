import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
} from 'react'
import type { Note } from '../../types'
import InkdropEditor from '../InkdropEditor'
import FloatingViewControls from './FloatingViewControls'
import NoteMetadata from './metadata/NoteMetadata'
import ResizeHandle from '../ResizeHandle'
import { useScrollSync } from './hooks/useScrollSync'
import { MarkdownProcessor } from '../../lib/markdown'
import DOMPurify from 'dompurify'
import { createEnhancedDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import { useServices } from '../../services/ServiceProvider'
import { editorLogger } from '../../utils/logger'

interface SplitEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  selectedNote?: Note | null
  showLineNumbers?: boolean
}

const SplitEditor = forwardRef<unknown, SplitEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start writing your markdown here...',
      selectedNote = null,
      showLineNumbers = false,
    },
    ref
  ) => {
    const { securityService } = useServices()
    const [viewMode, setViewMode] = useState('editor')
    const [splitRatio, setSplitRatio] = useState(50)
    const splitContainerRef = useRef<HTMLDivElement>(null)
    const { editorContainerRef, previewContainerRef, handlePreviewScroll } =
      useScrollSync(viewMode)
    const editorRef = useRef(null)
    const scrollTimeoutRef = useRef<NodeJS.Timeout>()

    // Load initial split ratio from repository
    useEffect(() => {
      const loadSplitRatio = async () => {
        try {
          const repository = createEnhancedDocumentRepository()
          await repository.initialize()
          const savedRatio = await repository.getUIState<number>(
            'editor',
            'splitRatio'
          )
          if (savedRatio !== null) {
            setSplitRatio(savedRatio)
          }
        } catch (error) {
          editorLogger.warn('Failed to load split ratio:', error)
        }
      }

      loadSplitRatio()
    }, [])

    // Handle scrollbar visibility
    const handleScrollbarVisibility = useCallback((element: HTMLElement) => {
      // Add scrolling class
      element.classList.add('is-scrolling')

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Remove scrolling class after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        element.classList.remove('is-scrolling')
      }, 1000)
    }, [])

    // Expose editor methods to parent components
    useImperativeHandle(
      ref,
      () => ({
        insertText: text => {
          if (editorRef.current) {
            editorRef.current.insertText(text)
          }
        },
        formatSelection: (prefix, suffix) => {
          if (editorRef.current) {
            editorRef.current.formatSelection(prefix, suffix)
          }
        },
        // Expose the editor view for autocomplete
        get view() {
          return editorRef.current?.view
        },
        get editor() {
          return editorRef.current
        },
        getView: () => {
          if (editorRef.current) {
            return editorRef.current.getView()
          }
        },
        focus: () => {
          if (editorRef.current) {
            editorRef.current.focus()
          }
        },
      }),
      []
    )

    // Handle split panel resize with optimized performance
    const handleSplitResize = useCallback(
      (startX: number) => {
        if (!splitContainerRef.current) return

        const containerRect = splitContainerRef.current.getBoundingClientRect()
        const containerWidth = containerRect.width
        let rafId: number | null = null
        let finalRatio = splitRatio

        const handleMouseMove = (e: MouseEvent) => {
          // Cancel previous RAF to throttle updates
          if (rafId) cancelAnimationFrame(rafId)

          rafId = requestAnimationFrame(() => {
            const currentX = e.clientX
            const deltaX = currentX - containerRect.left
            const newRatio = Math.max(
              20,
              Math.min(80, (deltaX / containerWidth) * 100)
            )

            setSplitRatio(newRatio)
            finalRatio = newRatio
          })
        }

        const handleMouseUp = () => {
          // Clean up RAF
          if (rafId) cancelAnimationFrame(rafId)

          // Save to repository only once on mouse up
          const saveRatio = async () => {
            try {
              const repository = createEnhancedDocumentRepository()
              await repository.initialize()
              await repository.setUIState('editor', 'splitRatio', finalRatio)
            } catch (error) {
              editorLogger.warn('Failed to save split ratio:', error)
            }
          }
          saveRatio()

          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.body.style.cursor = ''
          document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      },
      [splitRatio]
    )

    // Debounced markdown processing state
    const [debouncedValue, setDebouncedValue] = useState(value)
    const debounceTimeoutRef = useRef<NodeJS.Timeout>()

    // Debounce the value updates for preview
    useEffect(() => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value)
      }, 300) // 300ms debounce for preview updates

      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
        }
      }
    }, [value])

    // Memoized DOMPurify configuration (constant across renders)
    const domPurifyConfig = useMemo(
      () => ({
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'div',
          'span',
          'strong',
          'b',
          'em',
          'i',
          'u',
          'code',
          'pre',
          'blockquote',
          'ul',
          'ol',
          'li',
          'a',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
          'del',
          'ins',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'class',
          'id',
          'target',
          'rel',
        ],
        ALLOW_DATA_ATTR: false,
        ADD_TAGS: ['span'],
        ALLOWED_SCHEMES: ['http', 'https', 'mailto', 'tel'],
        // Allow highlight.js classes and enhanced highlighting
        ALLOWED_CLASSES: {
          pre: ['hljs', /^language-/],
          code: ['hljs', /^language-/, /^hljs-/],
          span: [/^hljs-/, 'env-var', /^js-/],
        },
      }),
      []
    )

    // Memoized HTML generation (only recalculates on debounced value change)
    const previewHtml = useMemo(() => {
      if (!debouncedValue) {
        return '<p class="text-theme-text-muted">Start writing to see preview...</p>'
      }

      const rawHtml = MarkdownProcessor.render(debouncedValue)
      return DOMPurify.sanitize(rawHtml, domPurifyConfig)
    }, [debouncedValue, domPurifyConfig])

    const renderEditor = () => (
      <div
        className="flex-1 flex flex-col overflow-hidden"
        data-testid="note-editor"
      >
        <div
          ref={editorContainerRef}
          className="flex-1 overflow-auto"
          data-context-menu="editor"
          onContextMenu={e => {
            if (window.electronAPI?.isElectron) {
              e.preventDefault()
              window.electronAPI.showContextMenu('editor')
            }
          }}
        >
          <InkdropEditor
            ref={editorRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            showLineNumbers={showLineNumbers}
          />
        </div>
      </div>
    )

    const renderPreview = () => (
      <div
        className="flex-1 flex flex-col bg-theme-bg-primary overflow-hidden"
        data-testid="note-preview"
      >
        {/* Note Metadata in Preview Mode */}
        {selectedNote && (
          <NoteMetadata
            note={selectedNote}
            onTitleChange={() => {}} // No-op in preview mode
            onNotebookChange={() => {}} // No-op in preview mode
            onStatusChange={() => {}} // No-op in preview mode
            onTagsChange={() => {}} // No-op in preview mode
            isPreviewMode={true}
          />
        )}

        <div
          ref={previewContainerRef}
          className="flex-1 overflow-y-auto p-4 text-theme-text-primary scrollbar-on-scroll"
          onScroll={e => handleScrollbarVisibility(e.currentTarget)}
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.4',
            height: '100%',
          }}
        >
          <div
            className="prose-theme max-w-none break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    )

    const renderSplitView = () => (
      <div ref={splitContainerRef} className="flex-1 flex overflow-hidden">
        {/* Editor Panel - width based on split ratio */}
        <div
          className="min-w-0 flex flex-col border-r border-theme-border-primary relative"
          style={{ width: `${splitRatio}%` }}
        >
          <div
            ref={editorContainerRef}
            className="flex-1 overflow-auto"
            data-context-menu="editor"
            onContextMenu={e => {
              if (window.electronAPI?.isElectron) {
                e.preventDefault()
                window.electronAPI.showContextMenu('editor')
              }
            }}
          >
            <InkdropEditor
              ref={editorRef}
              value={value}
              onChange={newValue => {
                // Validate input for security
                const validationResult = securityService.validateInput(
                  newValue,
                  {
                    type: 'text',
                    maxLength: 100000, // 100KB limit for notes
                  }
                )

                if (validationResult.isValid) {
                  onChange(validationResult.sanitized || newValue)
                } else {
                  // Log security warning but still allow change (with sanitization)
                  editorLogger.warn(
                    'Input validation warnings:',
                    validationResult.warnings
                  )
                  onChange(validationResult.sanitized || newValue)
                }
              }}
              placeholder={placeholder}
              showLineNumbers={showLineNumbers}
            />
          </div>

          {/* Resize Handle */}
          <ResizeHandle onMouseDown={handleSplitResize} position="right" />
        </div>

        {/* Preview Panel - takes remaining space */}
        <div
          className="min-w-0 flex flex-col bg-theme-bg-primary"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-y-auto p-4 text-theme-text-primary scrollbar-on-scroll"
            onScroll={e => {
              handlePreviewScroll(e)
              handleScrollbarVisibility(e.currentTarget)
            }}
            style={{
              fontFamily: 'inherit',
              lineHeight: '1.4',
            }}
          >
            <div
              className="prose-theme max-w-none break-words overflow-wrap-anywhere"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    )

    const renderContent = () => {
      switch (viewMode) {
        case 'editor':
          return renderEditor()
        case 'preview':
          return renderPreview()
        case 'split':
          return renderSplitView()
        default:
          return renderEditor()
      }
    }

    return (
      <div
        data-testid="note-editor"
        className="flex-1 flex flex-col overflow-hidden relative bg-theme-bg-primary"
      >
        {renderContent()}
        <FloatingViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          splitRatio={splitRatio}
        />
      </div>
    )
  }
)

SplitEditor.displayName = 'SplitEditor'

export default SplitEditor
