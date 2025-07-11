/**
 * Complete metadata editor that combines all edit mode components
 */
import React from 'react'
import TitleEditor from './TitleEditor'
import NotebookSelector from './NotebookSelector'
import StatusSelector from './StatusSelector'
import TagsEditor from './TagsEditor'

interface Note {
  id: string
  title?: string
  content?: string
  createdAt?: string
  updatedAt?: string
  notebook?: { name: string } | string
  tags?: string[]
  status?: string
}

interface Notebook {
  id: string
  name: string
}

interface MetadataEditorProps {
  note: Note
  notebooks: Notebook[]
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTitleBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  onNotebookChange: (notebookId: string) => void
  onStatusChange: (status: string) => void
  onTagAdd: (tag: string) => void
  onTagUpdate: (oldTag: string, newTag: string) => void
  onTagDelete: (tag: string) => void
  onTagsChange: (tags: string[]) => void
  dropdowns: {
    notebook: {
      isOpen: boolean
      onToggle: () => void
    }
    status: {
      isOpen: boolean
      onToggle: () => void
    }
  }
  contextMenu: {
    isOpen: boolean
    position: { x: number, y: number }
    tagValue: string
  }
  onContextMenuClose: () => void
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({
  note,
  notebooks,
  onTitleChange,
  onTitleBlur,
  onNotebookChange,
  onStatusChange,
  onTagAdd,
  onTagUpdate,
  onTagDelete,
  onTagsChange,
  dropdowns,
  contextMenu,
  onContextMenuClose
}) => {
  return (
    <div className="p-3 border-b border-theme-border-primary bg-theme-bg-secondary/30">
      <TitleEditor
        title={note.title || ''}
        onChange={onTitleChange}
        onBlur={onTitleBlur}
      />

      <div className="flex items-center space-x-3 mb-3">
        <NotebookSelector
          notebooks={notebooks}
          selectedNotebook={note.notebook}
          isOpen={dropdowns.notebook.isOpen}
          onToggle={dropdowns.notebook.onToggle}
          onSelect={onNotebookChange}
        />

        <StatusSelector
          selectedStatus={note.status}
          isOpen={dropdowns.status.isOpen}
          onToggle={dropdowns.status.onToggle}
          onSelect={onStatusChange}
        />
      </div>

      <TagsEditor
        tags={note.tags || []}
        onTagAdd={onTagAdd}
        onTagUpdate={onTagUpdate}
        onTagDelete={onTagDelete}
        onTagsChange={onTagsChange}
        contextMenu={contextMenu}
        onContextMenuClose={onContextMenuClose}
      />
    </div>
  )
}

export default MetadataEditor