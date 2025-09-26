import { useState, useEffect, useRef, useCallback } from 'react'
import ResizeHandle from './ResizeHandle'
import { createEnhancedDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { logger } from '../utils/logger'

const ResizableLayout = ({
  sidebar,
  notesList,
  mainContent,
  aiChat,
  isSidebarVisible = true,
  isNotesListVisible = true,
  isAIChatVisible = false,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Column widths
  const [notesListWidth, setNotesListWidth] = useState(() => {
    return settings?.notesListWidth || 300
  })

  // Sidebar width with state for resizing
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return settings?.sidebarWidth || 200
  })

  // AI Chat width with state for resizing
  const [aiChatWidth, setAIChatWidth] = useState(() => {
    return settings?.aiChatWidth || 380
  })

  const minSidebarWidth = 160
  const maxSidebarWidth = 400
  const minNotesListWidth = 220
  const maxNotesListWidth = 500
  const minMainContentWidth = 400
  const minAIChatWidth = 320
  const maxAIChatWidth = 600

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

  // Load initial values from repository
  useEffect(() => {
    const loadLayoutState = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()

        const [savedNotesListWidth, savedSidebarWidth, savedAIChatWidth] =
          await Promise.all([
            repository.getUIState<number>('layout', 'notesListWidth'),
            repository.getUIState<number>('layout', 'sidebarWidth'),
            repository.getUIState<number>('layout', 'aiChatWidth'),
          ])

        if (savedNotesListWidth !== null) {
          // If saved value is the old default (320), use new default (300)
          const width =
            savedNotesListWidth === 320
              ? settings?.notesListWidth || 300
              : savedNotesListWidth
          setNotesListWidth(width)
        }

        if (savedSidebarWidth !== null) {
          setSidebarWidth(savedSidebarWidth)
        }

        if (savedAIChatWidth !== null) {
          setAIChatWidth(savedAIChatWidth)
        }
      } catch (error) {
        logger.warn('Failed to load layout state:', error)
      }
    }

    loadLayoutState()
  }, [settings])

  // Save to repository
  useEffect(() => {
    const saveLayoutState = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()
        await repository.setUIState('layout', 'notesListWidth', notesListWidth)
      } catch (error) {
        logger.warn('Failed to save notes list width:', error)
      }
    }

    saveLayoutState()
  }, [notesListWidth])

  useEffect(() => {
    const saveLayoutState = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()
        await repository.setUIState('layout', 'sidebarWidth', sidebarWidth)
      } catch (error) {
        logger.warn('Failed to save sidebar width:', error)
      }
    }

    saveLayoutState()
  }, [sidebarWidth])

  useEffect(() => {
    const saveLayoutState = async () => {
      try {
        const repository = createEnhancedDocumentRepository()
        await repository.initialize()
        await repository.setUIState('layout', 'aiChatWidth', aiChatWidth)
      } catch (error) {
        logger.warn('Failed to save AI chat width:', error)
      }
    }

    saveLayoutState()
  }, [aiChatWidth])

  // Calculate available space and constraints
  const getConstraints = useCallback(() => {
    const usedWidth =
      (isSidebarVisible ? sidebarWidth : 0) +
      (isAIChatVisible ? aiChatWidth : 0)
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
    isAIChatVisible,
    sidebarWidth,
    aiChatWidth,
  ])

  // Handle Sidebar resize
  const handleSidebarResize = useCallback((clientX, startX, startWidth) => {
    const deltaX = clientX - startX
    const newWidth = Math.max(
      minSidebarWidth,
      Math.min(maxSidebarWidth, startWidth + deltaX)
    )
    setSidebarWidth(newWidth)
  }, [])

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

  // Handle AI Chat resize
  const handleAIChatResize = useCallback((clientX, startX, startWidth) => {
    const deltaX = startX - clientX // Reverse because it's on the right
    const newWidth = Math.max(
      minAIChatWidth,
      Math.min(maxAIChatWidth, startWidth + deltaX)
    )
    setAIChatWidth(newWidth)
  }, [])

  // Calculate main content width
  const mainContentWidth =
    containerWidth -
    (isSidebarVisible ? sidebarWidth : 0) -
    (isNotesListVisible ? notesListWidth : 0) -
    (isAIChatVisible ? aiChatWidth : 0)

  // Desktop render
  return (
    <div ref={containerRef} className="flex h-full w-full flex-1">
      {/* Sidebar - Resizable */}
      {isSidebarVisible && (
        <div
          className="relative flex-shrink-0 h-full"
          style={{ width: sidebarWidth }}
        >
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

      {/* AI Chat - Resizable */}
      {isAIChatVisible && (
        <div
          className="relative flex-shrink-0 h-full"
          style={{ width: aiChatWidth }}
        >
          <ResizeHandle
            onMouseDown={startX => {
              const handleMouseMove = e => {
                handleAIChatResize(e.clientX, startX, aiChatWidth)
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
            position="left"
          />
          {aiChat}
        </div>
      )}
    </div>
  )
}

export { ResizableLayout }
