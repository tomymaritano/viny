import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesList } from '../NotesList'
import type { Note } from '../../../types'

// Mock hooks
vi.mock('../../../hooks/useNotesListLogic', () => ({
  useNotesListLogic: () => ({
    sortedNotes: mockNotes,
    selectedNoteId: 'note-1',
    handleNoteClick: vi.fn(),
    handleNoteDelete: vi.fn(),
    handleNoteDuplicate: vi.fn(),
    isLoading: false,
  })
}))

vi.mock('../../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    setSortBy: vi.fn(),
    setSortDirection: vi.fn(),
  })
}))

const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'Content 1',
    notebook: 'inbox',
    tags: ['test'],
    status: 'draft',
    isPinned: true,
    isTrashed: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'note-2',
    title: 'Test Note 2',
    content: 'Content 2',
    notebook: 'personal',
    tags: ['important'],
    status: 'completed',
    isPinned: false,
    isTrashed: false,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
]

describe('NotesList Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notes list with correct items', () => {
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.getByText('Test Note 2')).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    render(<NotesList notes={[]} activeSection="all-notes" />)
    
    expect(screen.getByText(/No notes yet/i)).toBeInTheDocument()
  })

  it('displays pinned indicator for pinned notes', () => {
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    const pinnedNote = screen.getByText('Test Note 1').closest('.note-item')
    expect(pinnedNote).toHaveClass('pinned')
  })

  it('handles note click', async () => {
    const { handleNoteClick } = useNotesListLogic()
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    await user.click(screen.getByText('Test Note 1'))
    
    expect(handleNoteClick).toHaveBeenCalledWith('note-1')
  })

  it('shows context menu on right click', async () => {
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    const noteItem = screen.getByText('Test Note 1')
    fireEvent.contextMenu(noteItem)
    
    await waitFor(() => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  it('displays note metadata correctly', () => {
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    expect(screen.getByText('inbox')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('handles sorting dropdown', async () => {
    const { setSortBy } = useAppStore()
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    const sortButton = screen.getByRole('button', { name: /sort/i })
    await user.click(sortButton)
    
    const titleOption = screen.getByText('Title')
    await user.click(titleOption)
    
    expect(setSortBy).toHaveBeenCalledWith('title')
  })

  it('shows loading state', () => {
    vi.mocked(useNotesListLogic).mockReturnValueOnce({
      ...useNotesListLogic(),
      isLoading: true,
    })
    
    render(<NotesList notes={[]} activeSection="all-notes" />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('filters notes based on active section', () => {
    render(<NotesList notes={mockNotes} activeSection="notebook-inbox" />)
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument()
  })

  it('handles keyboard navigation', async () => {
    const { handleNoteClick } = useNotesListLogic()
    render(<NotesList notes={mockNotes} activeSection="all-notes" />)
    
    const firstNote = screen.getByText('Test Note 1')
    firstNote.focus()
    
    await user.keyboard('{Enter}')
    expect(handleNoteClick).toHaveBeenCalledWith('note-1')
    
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toHaveTextContent('Test Note 2')
  })
})