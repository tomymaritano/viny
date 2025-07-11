import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import PropTypes from 'prop-types'
import InkdropEditor from '../InkdropEditor'
import FloatingViewControls from './FloatingViewControls'
import NoteMetadata from './metadata/NoteMetadata'
import { useScrollSync } from './hooks/useScrollSync'
import { renderMarkdownForEditor } from '../../utils/markdownRenderer'

const SplitEditor = forwardRef(
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
      return renderMarkdownForEditor(value)
    }, [value])

    const renderEditor = () => (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={editorContainerRef} className="flex-1 overflow-auto">
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
      <div className="flex-1 flex flex-col bg-theme-bg-primary overflow-hidden">
        {/* Note Metadata in Preview Mode */}
        {selectedNote && (
          <NoteMetadata
            note={selectedNote}
            notebooks={[]}
            onTitleChange={() => {}} // No-op in preview mode
            onNotebookChange={() => {}} // No-op in preview mode
            onStatusChange={() => {}} // No-op in preview mode
            onTagsChange={() => {}} // No-op in preview mode
            isPreviewMode={true}
          />
        )}

        <div
          ref={previewContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 text-theme-text-primary"
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.4',
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
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        {/* Editor Panel - equal size with preview */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-theme-border-primary">
          <div ref={editorContainerRef} className="flex-1 overflow-auto">
            <InkdropEditor
              ref={editorRef}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              showLineNumbers={showLineNumbers}
            />
          </div>
        </div>

        {/* Preview Panel - equal size with editor */}
        <div className="flex-1 min-w-0 flex flex-col bg-theme-bg-primary">
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-y-auto p-3 lg:p-6 text-theme-text-primary custom-scrollbar"
            onScroll={handlePreviewScroll}
            style={{
              fontFamily: 'inherit',
              lineHeight: '1.4',
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
  selectedNote: PropTypes.object,
  showLineNumbers: PropTypes.bool,
}

export default SplitEditor
