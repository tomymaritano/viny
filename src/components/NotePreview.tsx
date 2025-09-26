import React, { useState, memo, Suspense } from 'react'
import { ExportDialog } from './LazyComponents'
import { useSettings } from '../hooks/useSettings'
import { useAppStore } from '../stores/newSimpleStore'
import EmptyNoteState from './preview/EmptyNoteState'
import NotePreviewHeader from './preview/NotePreviewHeader'
import NotePreviewContent from './preview/NotePreviewContent'

import type { Note } from '../types'

interface NotePreviewProps {
  note: Note | null
  onEdit?: (note: Note) => void
  onSave?: (note: Note) => void
  onTogglePin?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onDelete?: (note: Note) => void
  viewMode?: 'preview' | 'edit'
  onViewModeChange?: (mode: 'preview' | 'edit') => void
  isTrashView?: boolean
  onRestoreNote?: (note: Note) => void
  onPermanentDelete?: (note: Note) => void
  onExport?: (note: Note) => void
  onOpenInNewWindow?: (note: Note) => void
  onViewHistory?: (note: Note) => void
}

const NotePreview: React.FC<NotePreviewProps> = ({
  note,
  onEdit,
  onSave,
  onTogglePin,
  onDuplicate,
  onDelete,
  viewMode = 'preview',
  onViewModeChange,
  isTrashView = false,
  onRestoreNote,
  onPermanentDelete,
  onExport,
  onOpenInNewWindow,
  onViewHistory,
}) => {
  const { settings } = useSettings()
  const { getTagColor } = useAppStore()
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Show empty state if no note is selected
  if (!note) {
    return <EmptyNoteState />
  }

  return (
    <div className="flex-1 bg-theme-bg-primary flex flex-col markdown-font">
      {/* Header with metadata and actions */}
      <NotePreviewHeader
        note={note}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onEdit={onEdit}
        onSave={onSave}
        isTrashView={isTrashView}
        onTogglePin={onTogglePin}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onRestoreNote={onRestoreNote}
        onPermanentDelete={onPermanentDelete}
        onOpenInNewWindow={onOpenInNewWindow}
        onViewHistory={onViewHistory}
      />

      {/* Main content area */}
      <NotePreviewContent
        note={note}
        settings={settings}
        getTagColor={getTagColor}
      />

      {/* Export Dialog */}
      {showExportDialog && (
        <Suspense 
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-white p-4 rounded">Loading Export Dialog...</div>
            </div>
          }
        >
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
