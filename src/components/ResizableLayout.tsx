import { useState, useEffect, useRef, useCallback } from 'react'
import ResizeHandle from './ResizeHandle'

const ResizableLayout = ({
  sidebar,
  notesList,
  mainContent,
  previewPanel,
  isPreviewVisible = false,
  isSidebarVisible = true,
  isNotesListVisible = true,
  settings,
}) => {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Column widths
  const [notesListWidth, setNotesListWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-noteslist-width')
    const savedWidth = saved ? parseInt(saved) : null

    // If no saved value or it's the old default (320), use new default (300)
    if (!savedWidth || savedWidth === 320) {
      return settings?.notesListWidth || 300
    }

    return savedWidth
  })

  const [previewWidth, setPreviewWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-preview-width')
    return saved ? parseInt(saved) : settings?.previewWidth || 350
  })

  const sidebarWidth = 200 // Force new width
  const minNotesListWidth = 220
  const maxNotesListWidth = 500
  const minPreviewWidth = 280
  const minMainContentWidth = 400

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)
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
    const usedWidth =
      (isSidebarVisible ? sidebarWidth : 0) +
      (isPreviewVisible ? previewWidth : 0)
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
        containerWidth -
        (isSidebarVisible ? sidebarWidth : 0) -
        (isNotesListVisible ? minNotesListWidth : 0) -
        minMainContentWidth,
    }
  }, [
    containerWidth,
    isPreviewVisible,
    previewWidth,
    isSidebarVisible,
    isNotesListVisible,
  ])

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
      const deltaX = startX - clientX // Reverse delta for right-side resize
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
    (isSidebarVisible ? sidebarWidth : 0) -
    (isNotesListVisible ? notesListWidth : 0) -
    (isPreviewVisible ? previewWidth : 0)

  // Desktop render
  return (
    <div ref={containerRef} className="flex h-full w-full flex-1">
      {/* Sidebar - Fixed */}
      {isSidebarVisible && (
        <div className="flex-shrink-0" style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
      )}

      {/* NotesList - Resizable */}
      {isNotesListVisible && (
        <div
          className="relative flex-shrink-0 h-full"
          style={{ width: notesListWidth }}
        >
          {notesList}
          <ResizeHandle
            onMouseDown={startX => {
              const handleMouseMove = e => {
                handleNotesListResize(e.clientX, startX, notesListWidth)
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
            position="right"
          />
        </div>
      )}

      {/* Main Content - Flexible */}
      <div
        className="flex-1 overflow-hidden"
        style={{ minWidth: minMainContentWidth }}
      >
        {mainContent}
      </div>

      {/* Preview Panel - Resizable */}
      {isPreviewVisible && (
        <div className="relative flex-shrink-0" style={{ width: previewWidth }}>
          <ResizeHandle
            onMouseDown={startX => {
              const startWidth = previewWidth
              return { startX, startWidth }
            }}
            onMouseMove={(data, e) => {
              handlePreviewResize(e.clientX, data.startX, data.startWidth)
            }}
            direction="left"
          />
          {previewPanel}
        </div>
      )}
    </div>
  )
}

export default ResizableLayout
