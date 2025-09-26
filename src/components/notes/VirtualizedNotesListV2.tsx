/**
 * VirtualizedNotesListV2 - Performance optimized notes list with virtualization
 */

import React, { memo, useCallback, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { Note } from '../../types'
import { Icons } from '../Icons'
import { formatDistanceToNow } from 'date-fns'

interface VirtualizedNotesListV2Props {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
  onDeleteNote?: (noteId: string) => void
  onTogglePin?: (noteId: string) => void
  className?: string
}

interface NoteItemProps {
  note: Note
  isSelected: boolean
  onSelect: () => void
  onDelete?: () => void
  onTogglePin?: () => void
  style: React.CSSProperties
}

const NoteItem = memo<NoteItemProps>(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete, 
  onTogglePin,
  style 
}) => {
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }, [onDelete])
  
  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePin?.()
  }, [onTogglePin])
  
  const formattedDate = useMemo(() => 
    formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }),
    [note.updatedAt]
  )
  
  return (
    <div
      style={style}
      onClick={onSelect}
      className={`
        px-4 py-3 border-b border-theme-border cursor-pointer
        transition-colors hover:bg-theme-hover
        ${isSelected ? 'bg-theme-hover' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <Icons.Pin className="w-3 h-3 text-theme-primary flex-shrink-0" />
            )}
            <h3 className="font-medium text-theme-text-primary truncate">
              {note.title || 'Untitled'}
            </h3>
          </div>
          <p className="text-sm text-theme-text-secondary truncate mt-1">
            {note.content.substring(0, 100)}...
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-theme-text-tertiary">
            <span>{formattedDate}</span>
            {note.tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Icons.Tag className="w-3 h-3" />
                  <span>{note.tags.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleTogglePin}
            className="p-1 hover:bg-theme-hover rounded"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Icons.Pin className={`w-4 h-4 ${note.isPinned ? 'text-theme-primary' : 'text-theme-text-secondary'}`} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-theme-hover rounded"
            title="Delete"
          >
            <Icons.Trash className="w-4 h-4 text-theme-text-secondary hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
})

NoteItem.displayName = 'NoteItem'

export const VirtualizedNotesListV2 = memo<VirtualizedNotesListV2Props>(({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  className = ''
}) => {
  const itemHeight = 90 // Height of each note item in pixels
  
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = notes[index]
    if (!note) return null
    
    return (
      <NoteItem
        key={note.id}
        note={note}
        isSelected={note.id === selectedNoteId}
        onSelect={() => onSelectNote(note.id)}
        onDelete={() => onDeleteNote?.(note.id)}
        onTogglePin={() => onTogglePin?.(note.id)}
        style={{
          ...style,
          top: `${parseFloat(style.top as string) + 1}px`, // Add 1px gap
        }}
      />
    )
  }, [notes, selectedNoteId, onSelectNote, onDeleteNote, onTogglePin])
  
  // Memoize the item count
  const itemCount = useMemo(() => notes.length, [notes.length])
  
  if (notes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${className}`}>
        <Icons.FileText className="w-12 h-12 text-theme-text-tertiary mb-4" />
        <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
          No notes found
        </h3>
        <p className="text-sm text-theme-text-tertiary">
          Create a new note to get started
        </p>
      </div>
    )
  }
  
  return (
    <div className={`h-full ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={itemCount}
            itemSize={itemHeight}
            width={width}
            overscanCount={5} // Render 5 items outside of visible area for smoother scrolling
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  )
})

VirtualizedNotesListV2.displayName = 'VirtualizedNotesListV2'

export default VirtualizedNotesListV2