import { useState, useEffect, useRef } from 'react'
import NotesList from './NotesList'
import ResizeHandle from './ResizeHandle'

const ResizableNotesList = ({
  notes,
  onOpenNote,
  onNewNote,
  selectedNoteId,
  isTrashView,
  onRestoreNote,
  onPermanentDelete,
}) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('inkrun-noteslist-width')
    return saved ? parseInt(saved) : 320
  })
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const minWidth = 280
  const maxWidth = 600

  useEffect(() => {
    localStorage.setItem('inkrun-noteslist-width', width.toString())
  }, [width])

  const handleMouseDown = clientX => {
    setIsResizing(true)
    startXRef.current = clientX
    startWidthRef.current = width

    const handleMouseMove = e => {
      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + deltaX)
      )
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-shrink-0 theme-bg-primary border-r border-theme-border-primary h-full"
      style={{ width: `${width}px` }}
    >
      <NotesList
        notes={notes}
        onOpenNote={onOpenNote}
        onNewNote={onNewNote}
        selectedNoteId={selectedNoteId}
        isTrashView={isTrashView}
        onRestoreNote={onRestoreNote}
        onPermanentDelete={onPermanentDelete}
      />

      <ResizeHandle onMouseDown={handleMouseDown} position="right" />

      {isResizing && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'col-resize' }} />
      )}
    </div>
  )
}

export default ResizableNotesList
