import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import PropTypes from 'prop-types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import InkdropEditor from '../InkdropEditor'
import FloatingViewControls from './FloatingViewControls'
import { useScrollSync } from './hooks/useScrollSync'

const SplitEditor = forwardRef(
  (
    { value, onChange, placeholder = 'Start writing your markdown here...' },
    ref
  ) => {
    const [viewMode, setViewMode] = useState('editor')
    const { editorContainerRef, previewContainerRef, handlePreviewScroll } =
      useScrollSync(viewMode)
    const editorRef = useRef(null)

    // Expose editor methods to parent components
    useImperativeHandle(
      ref,
      () => ({
        insertText: text => {
          if (editorRef.current) {
            editorRef.current.insertText(text)
          }
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

    const getPreviewHtml = useCallback(() => {
      if (!value)
        return '<p class="text-theme-text-muted">Start writing to see preview...</p>'

      const html = marked(value, {
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
      })

      return DOMPurify.sanitize(html)
    }, [value])

    const renderEditor = () => (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={editorContainerRef} className="flex-1 overflow-hidden">
          <InkdropEditor
            ref={editorRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      </div>
    )

    const renderPreview = () => (
      <div className="flex-1 flex flex-col bg-theme-bg-primary overflow-hidden">
        <div
          ref={previewContainerRef}
          className="flex-1 overflow-y-auto p-6 text-theme-text-primary"
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.7',
            height: '100%',
          }}
        >
          <div
            className="markdown-content max-w-none preview-white-text"
            style={{
              color: '#ffffff',
              maxWidth: 'none',
            }}
            dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
          />
        </div>
      </div>
    )

    const renderSplitView = () => (
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-theme-border-primary">
          <div ref={editorContainerRef} className="flex-1 overflow-hidden">
            <InkdropEditor
              ref={editorRef}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-theme-bg-primary">
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-y-auto p-6 text-theme-text-primary"
            onScroll={handlePreviewScroll}
            style={{
              fontFamily: 'inherit',
              lineHeight: '1.7',
            }}
          >
            <div
              className="markdown-content max-w-none preview-white-text"
              style={{
                color: '#ffffff',
                maxWidth: 'none',
              }}
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
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
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{ backgroundColor: '#171617' }}
      >
        {renderContent()}
        <FloatingViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    )
  }
)

SplitEditor.displayName = 'SplitEditor'

SplitEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}

export default SplitEditor
