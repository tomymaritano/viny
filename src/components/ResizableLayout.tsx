import { useState, useEffect, useRef, useCallback } from 'react'
import ResizeHandle from './ResizeHandle'

const ResizableLayout = ({
  sidebar,
  notesList,
  mainContent,
  isSidebarVisible = true,
  isNotesListVisible = true,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
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

  // Sidebar width with state for resizing
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-sidebar-width')
    return saved ? parseInt(saved) : settings?.sidebarWidth || 200
  })

  const minSidebarWidth = 160
  const maxSidebarWidth = 400
  const minNotesListWidth = 220
  const maxNotesListWidth = 500
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
    localStorage.setItem('inkrun-sidebar-width', sidebarWidth.toString())
  }, [sidebarWidth])



  // Calculate available space and constraints
  const getConstraints = useCallback(() => {
    const usedWidth =
      (isSidebarVisible ? sidebarWidth : 0)
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
    }
  }, [
    containerWidth,
    isSidebarVisible,
    isNotesListVisible,
    sidebarWidth,
  ])

  // Handle Sidebar resize
  const handleSidebarResize = useCallback(
    (clientX, startX, startWidth) => {
      const deltaX = clientX - startX
      const newWidth = Math.max(
        minSidebarWidth,
        Math.min(maxSidebarWidth, startWidth + deltaX)
      )
      setSidebarWidth(newWidth)
    },
    []
  )

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


  // Calculate main content width
  const mainContentWidth =
    containerWidth -
    (isSidebarVisible ? sidebarWidth : 0) -
    (isNotesListVisible ? notesListWidth : 0)

  // Desktop render
  return (
    <div ref={containerRef} className="flex h-full w-full flex-1">
      {/* Sidebar - Resizable */}
      {isSidebarVisible && (
        <div className="relative flex-shrink-0 h-full" style={{ width: sidebarWidth }}>
          {sidebar}
          <ResizeHandle
            onMouseDown={startX => {
              const handleMouseMove = e => {
                handleSidebarResize(e.clientX, startX, sidebarWidth)
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

    </div>
  )
}

export { ResizableLayout }
