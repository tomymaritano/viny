import { useState, useEffect, useRef, useCallback } from 'react'
import ResizeHandle from './ResizeHandle'

const ResizableLayout = ({
  sidebar,
  notesList,
  mainContent,
  previewPanel,
  isPreviewVisible = false,
}) => {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Column widths
  const [notesListWidth, setNotesListWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-noteslist-width')
    return saved ? parseInt(saved) : 320
  })

  const [previewWidth, setPreviewWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-preview-width')
    return saved ? parseInt(saved) : 350
  })

  const sidebarWidth = 240 // Fixed
  const minNotesListWidth = 280
  const maxNotesListWidth = 500
  const minPreviewWidth = 280
  const minMainContentWidth = 400

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('inkrun-noteslist-width', notesListWidth.toString())
  }, [notesListWidth])

  useEffect(() => {
    localStorage.setItem('inkrun-preview-width', previewWidth.toString())
  }, [previewWidth])

  // Calculate available space and constraints
  const getConstraints = useCallback(() => {
    const usedWidth = sidebarWidth + (isPreviewVisible ? previewWidth : 0)
    const availableForNotesAndMain = containerWidth - usedWidth
    const maxNotesListWidthConstrained = Math.min(
      maxNotesListWidth,
      availableForNotesAndMain - minMainContentWidth
    )

    return {
      minNotesListWidth,
      maxNotesListWidth: Math.max(
        minNotesListWidth,
        maxNotesListWidthConstrained
      ),
      minPreviewWidth,
      maxPreviewWidth:
        containerWidth - sidebarWidth - minNotesListWidth - minMainContentWidth,
    }
  }, [containerWidth, isPreviewVisible, previewWidth])

  // Handle NotesList resize
  const handleNotesListResize = useCallback(
    (clientX, startX, startWidth) => {
      const constraints = getConstraints()
      const deltaX = clientX - startX
      const newWidth = Math.max(
        constraints.minNotesListWidth,
        Math.min(constraints.maxNotesListWidth, startWidth + deltaX)
      )
      setNotesListWidth(newWidth)
    },
    [getConstraints]
  )

  // Handle Preview resize
  const handlePreviewResize = useCallback(
    (clientX, startX, startWidth) => {
      const constraints = getConstraints()
      const deltaX = startX - clientX // Inverted for left handle
      const newWidth = Math.max(
        constraints.minPreviewWidth,
        Math.min(constraints.maxPreviewWidth, startWidth + deltaX)
      )
      setPreviewWidth(newWidth)
    },
    [getConstraints]
  )

  // Calculate main content width
  const mainContentWidth =
    containerWidth -
    sidebarWidth -
    notesListWidth -
    (isPreviewVisible ? previewWidth : 0)

  return (
    <div ref={containerRef} className="flex h-full w-full flex-1">
      {/* Sidebar - Fixed */}
      <div className="flex-shrink-0" style={{ width: sidebarWidth }}>
        {sidebar}
      </div>

      {/* NotesList - Resizable */}
      <div className="relative flex-shrink-0" style={{ width: notesListWidth }}>
        {notesList}
        <ResizeHandle
          onMouseDown={startX => {
            const startWidth = notesListWidth

            const handleMouseMove = e => {
              handleNotesListResize(e.clientX, startX, startWidth)
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
              document.body.style.cursor = ''
              document.body.style.userSelect = ''
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
          }}
          position="right"
        />
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1" style={{ minWidth: minMainContentWidth }}>
        {mainContent}
      </div>

      {/* Preview Panel - Resizable when visible */}
      {isPreviewVisible && (
        <div className="relative flex-shrink-0" style={{ width: previewWidth }}>
          <ResizeHandle
            onMouseDown={startX => {
              const startWidth = previewWidth

              const handleMouseMove = e => {
                handlePreviewResize(e.clientX, startX, startWidth)
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
              document.body.style.cursor = 'col-resize'
              document.body.style.userSelect = 'none'
            }}
            position="left"
          />
          {previewPanel}
        </div>
      )}
    </div>
  )
}

export default ResizableLayout
