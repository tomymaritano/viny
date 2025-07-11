import { useState, useEffect, useRef, useCallback } from 'react'
import ResizeHandle from './ResizeHandle'
import Icons from './Icons'

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
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState('notes') // 'sidebar', 'notes', 'editor'
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Column widths
  const [notesListWidth, setNotesListWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-noteslist-width')
    return saved ? parseInt(saved) : settings?.notesListWidth || 320
  })

  const [previewWidth, setPreviewWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-preview-width')
    return saved ? parseInt(saved) : settings?.previewWidth || 350
  })

  const sidebarWidth = settings?.sidebarWidth || 200
  const minNotesListWidth = 280
  const maxNotesListWidth = 500
  const minPreviewWidth = 280
  const minMainContentWidth = 400

  // Update container width and mobile detection on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)
        setIsMobile(width < 768) // Mobile if less than 768px (md breakpoint)
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
    (isSidebarVisible ? sidebarWidth : 0) -
    (isNotesListVisible ? notesListWidth : 0) -
    (isPreviewVisible ? previewWidth : 0)

  // Mobile render
  if (isMobile) {
    return (
      <div ref={containerRef} className="flex flex-col h-full w-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 bg-theme-bg-secondary border-b border-theme-border-primary">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 rounded hover:bg-theme-bg-tertiary text-theme-text-secondary"
          >
            <Icons.Menu size={20} />
          </button>

          <h1 className="text-lg font-semibold text-theme-text-primary">
            {mobileView === 'sidebar'
              ? 'Folders'
              : mobileView === 'notes'
                ? 'Notes'
                : 'Editor'}
          </h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                /* TODO: Add search handler */
              }}
              className="p-2 rounded hover:bg-theme-bg-tertiary text-theme-text-secondary"
            >
              <Icons.Search size={20} />
            </button>
            <button
              onClick={() => {
                /* TODO: Add new note handler */
              }}
              className="p-2 rounded hover:bg-theme-bg-tertiary text-theme-text-secondary"
            >
              <Icons.Plus size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {mobileView === 'notes' && <div className="h-full">{notesList}</div>}
          {mobileView === 'editor' && (
            <div className="h-full">{mainContent}</div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="flex bg-theme-bg-secondary border-t border-theme-border-primary">
          <button
            onClick={() => setMobileView('notes')}
            className={`flex-1 py-3 text-center text-sm ${
              mobileView === 'notes'
                ? 'text-theme-accent-primary bg-theme-bg-tertiary'
                : 'text-theme-text-secondary'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-3 text-center text-sm ${
              mobileView === 'editor'
                ? 'text-theme-accent-primary bg-theme-bg-tertiary'
                : 'text-theme-text-secondary'
            }`}
            disabled={!mainContent}
          >
            Editor
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-80 bg-theme-bg-primary border-r border-theme-border-primary">
              <div className="flex items-center justify-between p-3 border-b border-theme-border-primary">
                <h2 className="text-lg font-semibold text-theme-text-primary">
                  Folders
                </h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded hover:bg-theme-bg-tertiary text-theme-text-secondary"
                >
                  <Icons.X size={20} />
                </button>
              </div>
              <div className="h-full overflow-y-auto">{sidebar}</div>
            </div>
            <div
              className="flex-1 bg-black bg-opacity-50"
              onClick={() => setShowMobileSidebar(false)}
            />
          </div>
        )}
      </div>
    )
  }

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
          className="relative flex-shrink-0"
          style={{ width: notesListWidth }}
        >
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
      )}

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
