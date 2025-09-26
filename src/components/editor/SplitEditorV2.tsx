/**
 * SplitEditorV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2 + UI-only Store
 */

import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  memo,
} from 'react'
import type { Note } from '../../types'
import InkdropEditor from '../InkdropEditor'
import FloatingViewControls from './FloatingViewControls'
import NoteMetadata from './metadata/NoteMetadata'
import ResizeHandle from '../ResizeHandle'
import { useScrollSync } from './hooks/useScrollSync'
import { MarkdownProcessor } from '../../lib/markdown'
import DOMPurify from 'dompurify'
import { useEditorStore, useSettingsUI } from '../../stores/cleanUIStore'
import { useUpdateSettingsMutationV2 } from '../../hooks/queries/useSettingsServiceQueryV2'
import { useServices } from '../../contexts/ServiceProviderV2'
import { editorLogger } from '../../utils/logger'

interface SplitEditorV2Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  selectedNote?: Note | null
  showLineNumbers?: boolean
}

const SplitEditorV2 = memo(forwardRef<unknown, SplitEditorV2Props>(
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
    // UI State from clean store
    const { viewMode, setViewMode, fontSize, lineHeight } = useEditorStore()
    const { setHasUnsavedChanges } = useSettingsUI()
    
    // Mutations
    const updateSettingsMutation = useUpdateSettingsMutationV2()
    
    // Local state
    const [splitRatio, setSplitRatio] = useState(50)
    const [localViewMode, setLocalViewMode] = useState(viewMode || 'editor')
    
    // Refs
    const splitContainerRef = useRef<HTMLDivElement>(null)
    const { editorContainerRef, previewContainerRef, handlePreviewScroll } =
      useScrollSync(localViewMode)
    const editorRef = useRef(null)
    const scrollTimeoutRef = useRef<NodeJS.Timeout>()

    // Load saved split ratio from settings
    useEffect(() => {
      const savedRatio = localStorage.getItem('editor-split-ratio')
      if (savedRatio) {
        setSplitRatio(Number(savedRatio))
      }
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
        insertText: (text: string) => {
          if (editorRef.current) {
            ;(editorRef.current as any).insertText(text)
          }
        },
        formatSelection: (prefix: string, suffix: string) => {
          if (editorRef.current) {
            ;(editorRef.current as any).formatSelection(prefix, suffix)
          }
        },
        getEditorView: () => {
          if (editorRef.current) {
            return (editorRef.current as any).view
          }
          return null
        },
        getEditorText: () => value,
      }),
      [value]
    )

    const handleViewModeChange = useCallback((mode: string) => {
      setLocalViewMode(mode)
      setViewMode(mode as any)
    }, [setViewMode])

    const handleSplitResize = useCallback((delta: number) => {
      if (!splitContainerRef.current) return

      const containerWidth = splitContainerRef.current.offsetWidth
      const deltaPercentage = (delta / containerWidth) * 100
      const newRatio = Math.min(80, Math.max(20, splitRatio + deltaPercentage))
      
      setSplitRatio(newRatio)
      
      // Save to localStorage for persistence
      localStorage.setItem('editor-split-ratio', String(newRatio))
    }, [splitRatio])

    // Process markdown for preview
    const processedContent = useMemo(() => {
      if (!value) return ''
      
      try {
        const rawHtml = MarkdownProcessor.render(value)
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ['iframe'],
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        })
        return cleanHtml
      } catch (error) {
        editorLogger.error('Failed to process markdown:', error)
        return '<p>Error processing markdown</p>'
      }
    }, [value])

    // Handle content changes
    const handleContentChange = useCallback((newValue: string) => {
      onChange(newValue)
      setHasUnsavedChanges(true)
    }, [onChange, setHasUnsavedChanges])

    // Editor scroll handler
    const handleEditorScroll = useCallback(() => {
      if (editorContainerRef.current) {
        handleScrollbarVisibility(editorContainerRef.current)
      }
    }, [editorContainerRef, handleScrollbarVisibility])

    // Clean up on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }, [])

    const showEditor = localViewMode === 'editor' || localViewMode === 'split'
    const showPreview = localViewMode === 'preview' || localViewMode === 'split'
    const editorWidth = localViewMode === 'split' ? `${splitRatio}%` : '100%'
    const previewWidth = localViewMode === 'split' ? `${100 - splitRatio}%` : '100%'

    return (
      <div className="h-full flex flex-col overflow-hidden bg-theme-bg-primary">
        {/* Metadata header */}
        {selectedNote && (
          <div className="px-6 pt-4 pb-2 border-b border-theme-border">
            <NoteMetadata note={selectedNote} />
          </div>
        )}

        {/* Floating controls */}
        <FloatingViewControls
          viewMode={localViewMode}
          onViewModeChange={handleViewModeChange}
          onInsertImage={() => {
            if (editorRef.current) {
              ;(editorRef.current as any).insertText('\n![Image description](url)\n')
            }
          }}
        />

        {/* Editor and preview */}
        <div 
          ref={splitContainerRef}
          className="flex-1 flex overflow-hidden"
        >
          {/* Editor */}
          {showEditor && (
            <div
              ref={editorContainerRef}
              className="h-full overflow-y-auto custom-scrollbar"
              style={{ width: editorWidth }}
              onScroll={handleEditorScroll}
            >
              <div className="h-full p-6">
                <InkdropEditor
                  ref={editorRef}
                  value={value}
                  onChange={handleContentChange}
                  placeholder={placeholder}
                  showLineNumbers={showLineNumbers}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                />
              </div>
            </div>
          )}

          {/* Resize handle */}
          {localViewMode === 'split' && (
            <ResizeHandle
              onResize={handleSplitResize}
              className="h-full"
            />
          )}

          {/* Preview */}
          {showPreview && (
            <div
              ref={previewContainerRef}
              className="h-full overflow-y-auto custom-scrollbar bg-theme-bg-secondary"
              style={{ width: previewWidth }}
              onScroll={handlePreviewScroll}
            >
              <article
                className="prose prose-theme max-w-none p-6"
                dangerouslySetInnerHTML={{ __html: processedContent }}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
))

SplitEditorV2.displayName = 'SplitEditorV2'

export default SplitEditorV2