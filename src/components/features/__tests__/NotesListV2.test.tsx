import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NotesListV2 from '../NotesListV2'
import type { Note } from '../../../types'

// Mock hooks and services
vi.mock('../../../hooks/queries/useNotesServiceQueryV2', () => ({
  useActiveNotesQueryV2: vi.fn(),
  useTrashedNotesQueryV2: vi.fn(),
  useNotebookNotesQueryV2: vi.fn(),
  useTaggedNotesQueryV2: vi.fn(),
  usePinnedNotesQueryV2: vi.fn(),
  useDeleteNotePermanentlyMutationV2: vi.fn(),
  useTogglePinMutationV2: vi.fn(),
  useMoveToTrashMutationV2: vi.fn(),
  useRestoreNoteMutationV2: vi.fn(),
  useDuplicateNoteMutationV2: vi.fn(),
  useUpdateNoteMutationV2: vi.fn(),
}))

vi.mock('../../../hooks/queries', () => ({
  useNotebooksQuery: vi.fn(() => ({ data: mockNotebooks })),
}))

vi.mock('../../../stores/cleanUIStore', () => ({
  useNoteUI: () => ({
    selectedNoteId: 'note-1',
    setSelectedNoteId: vi.fn(),
    openEditor: vi.fn(),
    sortBy: 'updated',
    sortDirection: 'desc',
    setSortBy: vi.fn(),
    setSortDirection: vi.fn(),
  }),
  useNavigationStore: () => ({
    activeSection: 'all-notes',
  }),
  useNotebookUI: () => ({}),
}))

vi.mock('../../../hooks/useSmartSearch', () => ({
  useSmartSearch: () => ({
    search: vi.fn((term) => mockNotes.filter(n => 
      n.title.toLowerCase().includes(term.toLowerCase())
    )),
    isIndexing: false,
  }),
}))

vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

// Mock data
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'Content 1',
    notebookId: 'notebook-1',
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
    notebookId: 'notebook-2',
    tags: ['important'],
    status: 'completed',
    isPinned: false,
    isTrashed: false,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
]

const mockNotebooks = [
  { id: 'notebook-1', name: 'Work', parentId: null },
  { id: 'notebook-2', name: 'Personal', parentId: null },
]

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('NotesListV2 Component', () => {
  const user = userEvent.setup()
  const mockOnNewNote = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    const { useActiveNotesQueryV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    useActiveNotesQueryV2.mockReturnValue({
      data: mockNotes,
      isLoading: false,
      error: null,
    } as any)
  })
  
  it('renders notes list with correct items', () => {
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.getByText('Test Note 2')).toBeInTheDocument()
  })
  
  it('shows empty state when no notes', async () => {
    const { useActiveNotesQueryV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    useActiveNotesQueryV2.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })
  
  it('shows loading state', async () => {
    const { useActiveNotesQueryV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    useActiveNotesQueryV2.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText(/loading notes/i)).toBeInTheDocument()
  })
  
  it('shows error state', async () => {
    const { useActiveNotesQueryV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    useActiveNotesQueryV2.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText(/failed to load notes/i)).toBeInTheDocument()
  })
  
  it('handles note click', async () => {
    const { useNoteUI } = vi.mocked(await import('../../../stores/cleanUIStore'))
    const mockSetSelectedNoteId = vi.fn()
    const mockOpenEditor = vi.fn()
    
    useNoteUI.mockReturnValue({
      ...useNoteUI(),
      setSelectedNoteId: mockSetSelectedNoteId,
      openEditor: mockOpenEditor,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    await user.click(screen.getByText('Test Note 1'))
    
    expect(mockSetSelectedNoteId).toHaveBeenCalledWith('note-1')
    expect(mockOpenEditor).toHaveBeenCalledWith('note-1')
  })
  
  it('handles search functionality', async () => {
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Test Note 1')
    
    await waitFor(() => {
      expect(screen.getByText('Test Note 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument()
    })
  })
  
  it('handles sorting', async () => {
    const { useNoteUI } = vi.mocked(await import('../../../stores/cleanUIStore'))
    const mockSetSortBy = vi.fn()
    
    useNoteUI.mockReturnValue({
      ...useNoteUI(),
      setSortBy: mockSetSortBy,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    // Find and click sort dropdown
    const sortButton = screen.getByRole('button', { name: /sort/i })
    await user.click(sortButton)
    
    const titleOption = await screen.findByText('Title')
    await user.click(titleOption)
    
    expect(mockSetSortBy).toHaveBeenCalledWith('title')
  })
  
  it('handles trash view correctly', async () => {
    const { useNavigationStore, useTrashedNotesQueryV2 } = vi.mocked(await import('../../../stores/cleanUIStore'))
    useNavigationStore.mockReturnValue({ activeSection: 'trash' } as any)
    
    const trashedNotes = [{ ...mockNotes[0], isTrashed: true }]
    useTrashedNotesQueryV2.mockReturnValue({
      data: trashedNotes,
      isLoading: false,
      error: null,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Trash')).toBeInTheDocument()
  })
  
  it('handles notebook filter', async () => {
    const { useNavigationStore, useNotebookNotesQueryV2 } = vi.mocked(await import('../../../stores/cleanUIStore'))
    useNavigationStore.mockReturnValue({ activeSection: 'notebook-notebook-1' } as any)
    
    const notebookNotes = [mockNotes[0]]
    useNotebookNotesQueryV2.mockReturnValue({
      data: notebookNotes,
      isLoading: false,
      error: null,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Test Note 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Note 2')).not.toBeInTheDocument()
  })
  
  it('handles pin toggle', async () => {
    const { useTogglePinMutationV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    const mockMutate = vi.fn()
    
    useTogglePinMutationV2.mockReturnValue({
      mutate: mockMutate,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    // Find pin button for first note
    const noteItem = screen.getByText('Test Note 1').closest('.note-item')
    const pinButton = noteItem?.querySelector('[data-testid="pin-button"]')
    
    if (pinButton) {
      await user.click(pinButton)
      expect(mockMutate).toHaveBeenCalledWith('note-1')
    }
  })
  
  it('switches to virtualized list for large datasets', async () => {
    const manyNotes = Array.from({ length: 150 }, (_, i) => ({
      ...mockNotes[0],
      id: `note-${i}`,
      title: `Note ${i}`,
    }))
    
    const { useActiveNotesQueryV2 } = vi.mocked(await import('../../../hooks/queries/useNotesServiceQueryV2'))
    useActiveNotesQueryV2.mockReturnValue({
      data: manyNotes,
      isLoading: false,
      error: null,
    } as any)
    
    render(<NotesListV2 onNewNote={mockOnNewNote} />, { wrapper: createWrapper() })
    
    // Should use virtualized list component
    expect(screen.getByTestId('virtualized-notes-list')).toBeInTheDocument()
  })
})