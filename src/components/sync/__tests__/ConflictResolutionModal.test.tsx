import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import ConflictResolutionModal from '../ConflictResolutionModal'
import type { SyncConflict } from '../../../utils/syncManager'
import { ConflictResolution } from '../../../utils/syncManager'
import type { Note, Notebook } from '../../../types'

// Mock dependencies
vi.mock('../../ui/StandardModal', () => ({
  default: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="standard-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
}))

vi.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: any) => (
    <div data-testid="alert-icon" className={className}>
      Alert
    </div>
  ),
  User: ({ className }: any) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
  Cloud: ({ className }: any) => (
    <div data-testid="cloud-icon" className={className}>
      Cloud
    </div>
  ),
  GitMerge: ({ className }: any) => (
    <div data-testid="merge-icon" className={className}>
      Merge
    </div>
  ),
  Copy: ({ className }: any) => (
    <div data-testid="copy-icon" className={className}>
      Copy
    </div>
  ),
  Clock: ({ className }: any) => (
    <div data-testid="clock-icon" className={className}>
      Clock
    </div>
  ),
  FileText: ({ className }: any) => (
    <div data-testid="file-icon" className={className}>
      File
    </div>
  ),
  Folder: ({ className }: any) => (
    <div data-testid="folder-icon" className={className}>
      Folder
    </div>
  ),
}))

// Test data
const createTestNote = (overrides?: Partial<Note>): Note => ({
  id: 'note-1',
  title: 'Test Note',
  content: 'Test content',
  tags: ['test', 'mock'],
  notebookId: 'notebook-1',
  isFavorite: false,
  isArchived: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  ...overrides,
})

const createTestNotebook = (overrides?: Partial<Notebook>): Notebook => ({
  id: 'notebook-1',
  name: 'Test Notebook',
  description: 'Test description',
  color: '#3B82F6',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  icon: null,
  noteCount: 5,
  sortOrder: 0,
  ...overrides,
})

const createNoteConflict = (): SyncConflict => ({
  id: 'conflict-1',
  type: 'note',
  itemId: 'note-1',
  localVersion: createTestNote({
    title: 'Local Note Title',
    content: 'This is the local version with local changes',
    updatedAt: '2024-01-01T12:00:00Z',
  }),
  remoteVersion: createTestNote({
    title: 'Remote Note Title',
    content: 'This is the remote version with remote changes',
    updatedAt: '2024-01-01T13:00:00Z',
  }),
  timestamp: new Date('2024-01-01T14:00:00Z'),
  resolved: false,
})

const createNotebookConflict = (): SyncConflict => ({
  id: 'conflict-2',
  type: 'notebook',
  itemId: 'notebook-1',
  localVersion: createTestNotebook({
    name: 'Local Notebook',
    description: 'Local description',
    color: '#EF4444',
    updatedAt: '2024-01-01T12:00:00Z',
  }),
  remoteVersion: createTestNotebook({
    name: 'Remote Notebook',
    description: 'Remote description',
    color: '#10B981',
    updatedAt: '2024-01-01T13:00:00Z',
  }),
  timestamp: new Date('2024-01-01T14:00:00Z'),
  resolved: false,
})

describe('ConflictResolutionModal', () => {
  const mockOnClose = vi.fn()
  const mockOnResolve = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when conflict is null', () => {
    const { container } = render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={null}
        onResolve={mockOnResolve}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders modal when open with note conflict', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByTestId('standard-modal')).toBeInTheDocument()
    expect(screen.getByText('Resolve Sync Conflict')).toBeInTheDocument()
    expect(screen.getByText('Note Conflict Detected')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ConflictResolutionModal
        isOpen={false}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.queryByTestId('standard-modal')).not.toBeInTheDocument()
  })

  it('displays local and remote versions side by side', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByText('Local Version')).toBeInTheDocument()
    expect(screen.getByText('Remote Version')).toBeInTheDocument()
    expect(screen.getByText('Local Note Title')).toBeInTheDocument()
    expect(screen.getByText('Remote Note Title')).toBeInTheDocument()
  })

  it('shows note content preview truncated to 200 characters', () => {
    const longContent = 'a'.repeat(250)
    const conflict = createNoteConflict()
    ;(conflict.localVersion as Note).content = longContent

    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={conflict}
        onResolve={mockOnResolve}
      />
    )

    const preview = screen.getByText(/^a{200}\.\.\./)
    expect(preview).toBeInTheDocument()
  })

  it('displays notebook conflict information', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNotebookConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByText('Notebook Conflict Detected')).toBeInTheDocument()
    expect(screen.getByText('Local Notebook')).toBeInTheDocument()
    expect(screen.getByText('Remote Notebook')).toBeInTheDocument()
    expect(screen.getByText('Local description')).toBeInTheDocument()
    expect(screen.getByText('Remote description')).toBeInTheDocument()
  })

  it('shows all resolution strategy options', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByText('Use Local Version')).toBeInTheDocument()
    expect(screen.getByText('Use Remote Version')).toBeInTheDocument()
    expect(screen.getByText('Merge Changes')).toBeInTheDocument()
    expect(screen.getByText('Keep Both')).toBeInTheDocument()
  })

  it('selects merge strategy by default', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    const mergeRadio = screen.getByLabelText(/Merge Changes/)
    expect(mergeRadio).toBeChecked()
  })

  it('allows selecting different resolution strategies', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    const localRadio = screen.getByLabelText(/Use Local Version/)
    fireEvent.click(localRadio)
    expect(localRadio).toBeChecked()

    const remoteRadio = screen.getByLabelText(/Use Remote Version/)
    fireEvent.click(remoteRadio)
    expect(remoteRadio).toBeChecked()
  })

  it('calls onResolve with correct parameters when resolving', () => {
    const conflict = createNoteConflict()

    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={conflict}
        onResolve={mockOnResolve}
      />
    )

    const useLocalRadio = screen.getByLabelText(/Use Local Version/)
    fireEvent.click(useLocalRadio)

    const resolveButton = screen.getByText('Resolve Conflict')
    fireEvent.click(resolveButton)

    expect(mockOnResolve).toHaveBeenCalledWith(
      'conflict-1',
      expect.objectContaining({
        strategy: 'use_local',
        timestamp: expect.any(Date),
      })
    )
  })

  it('calls onClose after resolving conflict', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    const resolveButton = screen.getByText('Resolve Conflict')
    fireEvent.click(resolveButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnResolve).not.toHaveBeenCalled()
  })

  it('displays note tags when present', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    const testTags = screen.getAllByText('test')
    const mockTags = screen.getAllByText('mock')

    expect(testTags).toHaveLength(2) // One for local, one for remote
    expect(mockTags).toHaveLength(2) // One for local, one for remote
  })

  it('formats dates correctly', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    // Check that date formatting is applied
    const dateElements = screen.getAllByText(/Modified:/)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('shows appropriate icons for note conflicts', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByTestId('file-icon')).toBeInTheDocument()
  })

  it('shows appropriate icons for notebook conflicts', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNotebookConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByTestId('folder-icon')).toBeInTheDocument()
  })

  it('displays strategy descriptions', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={createNoteConflict()}
        onResolve={mockOnResolve}
      />
    )

    expect(
      screen.getByText('Keep your local changes and discard remote changes')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Use the remote version and discard local changes')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Automatically merge both versions (recommended)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Create separate copies of both versions')
    ).toBeInTheDocument()
  })

  it('handles notebook without description', () => {
    const conflict = createNotebookConflict()
    ;(conflict.localVersion as Notebook).description = ''

    render(
      <ConflictResolutionModal
        isOpen={true}
        onClose={mockOnClose}
        conflict={conflict}
        onResolve={mockOnResolve}
      />
    )

    expect(screen.getByText('No description')).toBeInTheDocument()
  })
})
