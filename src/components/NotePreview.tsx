import React, { useState, useRef, useEffect, memo, Suspense } from 'react'
import { ExportDialog } from './features/LazyComponents'
import { useSettingsService } from '../hooks/useSettingsService'
import { useAppStore } from '../stores/newSimpleStore'
import EmptyNoteState from './preview/EmptyNoteState'
import NotePreviewHeader from './preview/NotePreviewHeader'
import NotePreviewMenu from './preview/NotePreviewMenu'
import NotePreviewContent from './preview/NotePreviewContent'

import { Note } from '../types'

interface NotePreviewProps {
  note: Note | null
  onEdit?: (note: Note) => void
  onTogglePin?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onDelete?: (note: Note) => void
  viewMode?: 'preview' | 'edit'
  onViewModeChange?: (mode: 'preview' | 'edit') => void
  isTrashView?: boolean
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  onExport?: (note: Note) => void
}

const NotePreview: React.FC<NotePreviewProps> = ({
  note,
  onEdit,
  onTogglePin,
  onDuplicate,
  onDelete,
  viewMode = 'preview',
  onViewModeChange,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onExport,
}) => {
  const { settings } = useSettingsService()
  const { getTagColor } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Show empty state if no note is selected
  if (!note) {
    return <EmptyNoteState />
  }

  const handleToggleMenu = () => {
    setShowMenu(!showMenu)
  }

  return (
    <div className="flex-1 bg-theme-bg-primary flex flex-col markdown-font">
      {/* Header with metadata and actions */}
      <NotePreviewHeader
        note={note}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onEdit={onEdit}
        showMenu={showMenu}
        onToggleMenu={handleToggleMenu}
        isTrashView={isTrashView}
        menuRef={menuRef}
      />

      {/* Context menu */}
      <NotePreviewMenu
        note={note}
        showMenu={showMenu}
        onTogglePin={onTogglePin}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onExport={onExport}
        onEdit={onEdit}
        isTrashView={isTrashView}
        onRestoreNote={onRestoreNote}
        onPermanentDelete={onPermanentDelete}
        onSetShowExportDialog={setShowExportDialog}
      />

      {/* Main content area */}
      <NotePreviewContent
        note={note}
        settings={settings}
        getTagColor={getTagColor}
      />

      {/* Export Dialog */}
      {showExportDialog && (
        <Suspense fallback={<div>Loading Export Dialog...</div>}>
          <ExportDialog
            isVisible={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            notes={note ? [note] : []}
            type="single"
          />
        </Suspense>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
const MemoizedNotePreview = memo(NotePreview, (prevProps, nextProps) => {
  return (
    prevProps.note?.id === nextProps.note?.id &&
    prevProps.note?.content === nextProps.note?.content &&
    prevProps.note?.title === nextProps.note?.title &&
    prevProps.note?.updatedAt === nextProps.note?.updatedAt &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isTrashView === nextProps.isTrashView
  )
})

export { MemoizedNotePreview as NotePreview }