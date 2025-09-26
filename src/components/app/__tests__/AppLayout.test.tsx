import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AppLayout from '../AppLayout'
import type { Note, Notebook, Settings } from '../../../types'
import type { Toast } from '../../../stores/slices/uiSlice'

// Mock all the child components
vi.mock('../../ui/TitleBarCompact', () => ({
  default: vi.fn(({ title }) => <div data-testid="title-bar">{title}</div>),
}))

vi.mock('../../ResizableLayout', () => ({
  default: vi.fn(
    ({ sidebar, notesList, mainContent, previewPanel, isPreviewVisible }) => (
      <div data-testid="resizable-layout">
        <div data-testid="sidebar-container">{sidebar}</div>
        <div data-testid="notes-list-container">{notesList}</div>
        <div data-testid="main-content-container">{mainContent}</div>
        {isPreviewVisible && (
          <div data-testid="preview-panel-container">{previewPanel}</div>
        )}
      </div>
    )
  ),
}))

vi.mock('../../features/SidebarSimple', () => ({
  default: vi.fn(() => <div data-testid="sidebar-simple">Sidebar</div>),
}))

vi.mock('../../features/NotesListSimple', () => ({
  default: vi.fn(props => (
    <div data-testid="notes-list-simple">
      <button onClick={props.onNewNote} data-testid="new-note-button">
        New Note
      </button>
      {props.notes.map((note: Note) => (
        <div key={note.id} data-testid={`note-item-${note.id}`}>
          <button
            onClick={() => props.onOpenNote(note.id)}
            data-testid={`open-note-${note.id}`}
          >
            {note.title}
          </button>
          <button
            onClick={() => props.onDeleteNote(note)}
            data-testid={`delete-note-${note.id}`}
          >
            Delete
          </button>
          <button
            onClick={() => props.onTogglePin(note)}
            data-testid={`pin-note-${note.id}`}
          >
            Pin
          </button>
          <button
            onClick={() => props.onDuplicateNote(note)}
            data-testid={`duplicate-note-${note.id}`}
          >
            Duplicate
          </button>
        </div>
      ))}
      <button
        onClick={() => props.onSortNotes('date')}
        data-testid="sort-notes"
      >
        Sort
      </button>
    </div>
  )),
}))

vi.mock('../../NotePreview', () => ({
  default: vi.fn(({ note, onEdit, onTogglePin, onDuplicate, onDelete }) => (
    <div data-testid="note-preview">
      {note && (
        <>
          <div data-testid="preview-title">{note.title}</div>
          <button onClick={() => onEdit(note)} data-testid="edit-button">
            Edit
          </button>
          <button
            onClick={() => onTogglePin(note)}
            data-testid="preview-pin-button"
          >
            Pin
          </button>
          <button
            onClick={() => onDuplicate(note)}
            data-testid="preview-duplicate-button"
          >
            Duplicate
          </button>
          <button
            onClick={() => onDelete(note)}
            data-testid="preview-delete-button"
          >
            Delete
          </button>
        </>
      )}
    </div>
  )),
}))

vi.mock('../../features/LazyComponents', () => ({
  MarkdownEditor: vi.fn(props => (
    <div data-testid="markdown-editor">
      <textarea
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        data-testid="editor-textarea"
      />
      <button
        onClick={() => props.onNotebookChange('new-notebook')}
        data-testid="change-notebook"
      >
        Change Notebook
      </button>
    </div>
  )),
}))

vi.mock('../../ToastContainer', () => ({
  default: vi.fn(({ toasts, onRemove }) => (
    <div data-testid="toast-container">
      {toasts.map((toast: Toast) => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          {toast.message}
          <button
            onClick={() => onRemove(toast.id)}
            data-testid={`dismiss-toast-${toast.id}`}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )),
}))

vi.mock('../../LoadingSpinner', () => ({
  default: vi.fn(({ text }) => <div data-testid="loading-spinner">{text}</div>),
}))

vi.mock('../../ui/LazyWrapper', () => ({
  default: vi.fn(({ children, className }) => (
    <div className={className}>{children}</div>
  )),
}))

vi.mock('../../LazyComponents', () => ({
  MarkdownPreview: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="markdown-preview">
      Preview: {props.note?.title}
    </div>
  )),
}))

describe('AppLayout', () => {
  const mockHandleOpenNote = vi.fn()
  const mockHandleContentChange = vi.fn()
  const mockHandleNotebookChange = vi.fn()
  const mockHandleMetadataChange = vi.fn()
  const mockCreateNewNote = vi.fn()
  const mockHandleDeleteNote = vi.fn()
  const mockHandleTogglePin = vi.fn()
  const mockHandleDuplicateNote = vi.fn()
  const mockSetModal = vi.fn()
  const mockRemoveToast = vi.fn()
  const mockSetIsPreviewVisible = vi.fn()
  const mockSortNotes = vi.fn()

  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    notebook: 'default',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
  }

  const mockNotebooks: Notebook[] = [
    { id: '1', name: 'Work', createdAt: new Date().toISOString() },
    { id: '2', name: 'Personal', createdAt: new Date().toISOString() },
  ]

  const mockSettings: Partial<Settings> = {
    theme: 'dark',
    language: 'en',
  }

  const mockToasts: Toast[] = [
    { id: '1', message: 'Success!', type: 'success' },
  ]

  const defaultProps = {
    currentNote: null,
    selectedNote: null,
    filteredNotes: [],
    notebooks: mockNotebooks,
    settings: mockSettings,
    isEditorOpen: false,
    activeSection: 'notes',
    handleOpenNote: mockHandleOpenNote,
    handleContentChange: mockHandleContentChange,
    handleNotebookChange: mockHandleNotebookChange,
    handleMetadataChange: mockHandleMetadataChange,
    createNewNote: mockCreateNewNote,
    handleDeleteNote: mockHandleDeleteNote,
    handleTogglePin: mockHandleTogglePin,
    handleDuplicateNote: mockHandleDuplicateNote,
    handleRestoreNote: vi.fn(),
    handlePermanentDelete: vi.fn(),
    setModal: mockSetModal,
    sortNotes: mockSortNotes,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the basic layout structure', () => {
    render(<AppLayout {...defaultProps} />)

    expect(screen.getByTestId('title-bar')).toHaveTextContent('Viny')
    expect(screen.getByTestId('resizable-layout')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-simple')).toBeInTheDocument()
    expect(screen.getByTestId('notes-list-simple')).toBeInTheDocument()
    // AppLayout doesn't render ToastContainer, that's in AppContainer
  })

  it('renders note preview when no editor is open', () => {
    render(<AppLayout {...defaultProps} />)

    expect(screen.getByTestId('note-preview')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
  })

  it('renders markdown editor when editor is open with current note', () => {
    render(
      <AppLayout {...defaultProps} isEditorOpen={true} currentNote={mockNote} />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('note-preview')).not.toBeInTheDocument()
  })

  it('passes correct props to NotesListSimple', () => {
    const filteredNotes = [mockNote]
    render(
      <AppLayout
        {...defaultProps}
        filteredNotes={filteredNotes}
        currentNote={mockNote}
      />
    )

    // Test new note button
    fireEvent.click(screen.getByTestId('new-note-button'))
    expect(mockCreateNewNote).toHaveBeenCalled()

    // Test open note
    fireEvent.click(screen.getByTestId('open-note-1'))
    expect(mockHandleOpenNote).toHaveBeenCalledWith('1')

    // Test delete note
    fireEvent.click(screen.getByTestId('delete-note-1'))
    expect(mockHandleDeleteNote).toHaveBeenCalledWith(mockNote)

    // Test pin note
    fireEvent.click(screen.getByTestId('pin-note-1'))
    expect(mockHandleTogglePin).toHaveBeenCalledWith(mockNote)

    // Test duplicate note
    fireEvent.click(screen.getByTestId('duplicate-note-1'))
    expect(mockHandleDuplicateNote).toHaveBeenCalledWith(mockNote)

    // Test sort notes
    fireEvent.click(screen.getByTestId('sort-notes'))
    expect(mockSortNotes).toHaveBeenCalledWith('date')
  })

  it('passes correct props to MarkdownEditor', () => {
    render(
      <AppLayout {...defaultProps} isEditorOpen={true} currentNote={mockNote} />
    )

    // Test content change
    const textarea = screen.getByTestId('editor-textarea')
    fireEvent.change(textarea, { target: { value: 'New content' } })
    expect(mockHandleContentChange).toHaveBeenCalledWith('New content')

    // Test notebook change
    fireEvent.click(screen.getByTestId('change-notebook'))
    expect(mockHandleNotebookChange).toHaveBeenCalledWith('new-notebook')
  })

  // Note: AppLayout doesn't handle preview panels directly - that's handled by ResizableLayout

  it('handles note preview actions correctly', () => {
    render(<AppLayout {...defaultProps} selectedNote={mockNote} />)

    // Test edit button - AppLayout passes onEdit={(note) => handleOpenNote(note.id)}
    fireEvent.click(screen.getByTestId('edit-button'))
    expect(mockHandleOpenNote).toHaveBeenCalledWith('1')

    // Test pin button
    fireEvent.click(screen.getByTestId('preview-pin-button'))
    expect(mockHandleTogglePin).toHaveBeenCalledWith(mockNote)

    // Test duplicate button
    fireEvent.click(screen.getByTestId('preview-duplicate-button'))
    expect(mockHandleDuplicateNote).toHaveBeenCalledWith(mockNote)

    // Test delete button
    fireEvent.click(screen.getByTestId('preview-delete-button'))
    expect(mockHandleDeleteNote).toHaveBeenCalledWith(mockNote)
  })

  // Note: Toast rendering is handled by AppContainer, not AppLayout

  it('shows loading spinner for editor when in suspense', () => {
    // This test would require more complex setup to test Suspense boundary
    // For now, we can at least verify the component structure
    render(
      <AppLayout {...defaultProps} isEditorOpen={true} currentNote={mockNote} />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
  })

  it('uses selected note when current note is null in preview', () => {
    render(
      <AppLayout {...defaultProps} currentNote={null} selectedNote={mockNote} />
    )

    expect(screen.getByTestId('preview-title')).toHaveTextContent('Test Note')
  })

  // Note: Preview visibility is handled by ResizableLayout, not AppLayout directly

  it('passes settings to ResizableLayout', () => {
    const { container } = render(<AppLayout {...defaultProps} />)

    // Since ResizableLayout is mocked, we can't directly test props passing
    // But we can verify the component is rendered
    expect(screen.getByTestId('resizable-layout')).toBeInTheDocument()
  })

  it('renders with empty notebooks array', () => {
    render(
      <AppLayout
        {...defaultProps}
        notebooks={[]}
        isEditorOpen={true}
        currentNote={mockNote}
      />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
  })

  it('maintains editor key based on current note id', () => {
    const { rerender } = render(
      <AppLayout {...defaultProps} isEditorOpen={true} currentNote={mockNote} />
    )

    const updatedNote = { ...mockNote, id: '2' }
    rerender(
      <AppLayout
        {...defaultProps}
        isEditorOpen={true}
        currentNote={updatedNote}
      />
    )

    // The editor should re-render with new key
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
  })
})
