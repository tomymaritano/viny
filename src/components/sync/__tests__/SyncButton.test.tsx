import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import SyncButton from '../SyncButton'
import type { SyncConflict } from '../../../utils/syncManager'

// Mock the useSync hook
const mockUseSync = {
  syncState: {
    status: 'idle',
    lastSync: null,
    conflicts: [],
    errors: [],
    progress: 0,
    totalItems: 0,
    syncedItems: 0,
  },
  isOnline: true,
  isSyncing: false,
  hasUnresolvedConflicts: false,
  forceSync: vi.fn(),
  getUnresolvedConflicts: vi.fn(() => []),
  resolveConflict: vi.fn(),
}

vi.mock('../../../hooks/useSync', () => ({
  useSync: () => mockUseSync,
}))

// Mock ConflictResolutionModal
vi.mock('../ConflictResolutionModal', () => ({
  default: ({ isOpen, onClose, conflict, onResolve }: any) =>
    isOpen ? (
      <div data-testid="conflict-modal">
        <button onClick={() => onResolve('conflict-1', { strategy: 'merge' })}>
          Resolve
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

// Mock icons
vi.mock('lucide-react', () => ({
  RefreshCw: ({ size, className }: any) => (
    <div data-testid="refresh-icon" className={className} data-size={size}>
      Refresh
    </div>
  ),
  AlertTriangle: ({ size, className }: any) => (
    <div data-testid="alert-icon" className={className} data-size={size}>
      Alert
    </div>
  ),
  Cloud: ({ size }: any) => (
    <div data-testid="cloud-icon" data-size={size}>
      Cloud
    </div>
  ),
  WifiOff: ({ size, className }: any) => (
    <div data-testid="wifi-off-icon" className={className} data-size={size}>
      Offline
    </div>
  ),
}))

// Test conflict data
const createTestConflict = (): SyncConflict => ({
  id: 'conflict-1',
  type: 'note',
  itemId: 'note-1',
  localVersion: {
    id: 'note-1',
    title: 'Local Note',
    content: 'Local content',
    tags: [],
    notebookId: 'notebook-1',
    isFavorite: false,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
  remoteVersion: {
    id: 'note-1',
    title: 'Remote Note',
    content: 'Remote content',
    tags: [],
    notebookId: 'notebook-1',
    isFavorite: false,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T13:00:00Z',
  },
  timestamp: new Date('2024-01-01T14:00:00Z'),
  resolved: false,
})

describe('SyncButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to default state
    mockUseSync.isOnline = true
    mockUseSync.isSyncing = false
    mockUseSync.hasUnresolvedConflicts = false
    mockUseSync.getUnresolvedConflicts.mockReturnValue([])
  })

  it('renders with default props', () => {
    render(<SyncButton />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('cloud-icon')).toBeInTheDocument()
  })

  it('shows text when showText is true', () => {
    render(<SyncButton showText={true} />)

    expect(screen.getByText('Sync')).toBeInTheDocument()
  })

  it('displays offline state correctly', () => {
    mockUseSync.isOnline = false

    render(<SyncButton showText={true} />)

    expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument()
    expect(screen.getAllByText('Offline')).toHaveLength(2) // One in icon mock, one in text span
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('displays syncing state correctly', () => {
    mockUseSync.isSyncing = true

    render(<SyncButton showText={true} />)

    const refreshIcon = screen.getByTestId('refresh-icon')
    expect(refreshIcon).toBeInTheDocument()
    expect(refreshIcon).toHaveClass('animate-spin')
    expect(screen.getByText('Syncing...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('displays conflict state correctly', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([createTestConflict()])

    render(<SyncButton showText={true} />)

    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    expect(screen.getByText('1 Conflict')).toBeInTheDocument()
  })

  it('displays multiple conflicts correctly', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([
      createTestConflict(),
      { ...createTestConflict(), id: 'conflict-2' },
    ])

    render(<SyncButton showText={true} />)

    expect(screen.getByText('2 Conflicts')).toBeInTheDocument()
  })

  it('calls forceSync when clicked without conflicts', () => {
    render(<SyncButton />)

    fireEvent.click(screen.getByRole('button'))

    expect(mockUseSync.forceSync).toHaveBeenCalled()
  })

  it('opens conflict modal when clicked with conflicts', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([createTestConflict()])

    render(<SyncButton />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByTestId('conflict-modal')).toBeInTheDocument()
    expect(mockUseSync.forceSync).not.toHaveBeenCalled()
  })

  it('handles conflict resolution', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([createTestConflict()])

    render(<SyncButton />)

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Resolve'))

    expect(mockUseSync.resolveConflict).toHaveBeenCalledWith('conflict-1', {
      strategy: 'merge',
    })
    expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument()
  })

  it('closes conflict modal on close button', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([createTestConflict()])

    render(<SyncButton />)

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('conflict-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument()
  })

  it('applies correct styles for primary variant', () => {
    render(<SyncButton variant="primary" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-theme-accent-primary')
  })

  it('applies correct styles for secondary variant', () => {
    render(<SyncButton variant="secondary" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-theme-bg-secondary')
  })

  it('applies correct styles for ghost variant', () => {
    render(<SyncButton variant="ghost" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-theme-text-secondary')
  })

  it('applies correct size styles', () => {
    const { rerender } = render(<SyncButton size="sm" />)
    let icon = screen.getByTestId('cloud-icon')
    expect(icon).toHaveAttribute('data-size', '14')

    rerender(<SyncButton size="md" />)
    icon = screen.getByTestId('cloud-icon')
    expect(icon).toHaveAttribute('data-size', '16')

    rerender(<SyncButton size="lg" />)
    icon = screen.getByTestId('cloud-icon')
    expect(icon).toHaveAttribute('data-size', '20')
  })

  it('applies custom className', () => {
    render(<SyncButton className="custom-class" />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('shows correct title attribute when offline', () => {
    mockUseSync.isOnline = false

    render(<SyncButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Cannot sync while offline')
  })

  it('shows correct title attribute when syncing', () => {
    mockUseSync.isSyncing = true

    render(<SyncButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Synchronization in progress...')
  })

  it('shows correct title attribute with conflicts', () => {
    mockUseSync.hasUnresolvedConflicts = true
    mockUseSync.getUnresolvedConflicts.mockReturnValue([createTestConflict()])

    render(<SyncButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Click to resolve sync conflicts')
  })

  it('shows correct title attribute in normal state', () => {
    render(<SyncButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Sync your notes')
  })

  it('does not show text by default', () => {
    render(<SyncButton />)

    expect(screen.queryByText('Sync')).not.toBeInTheDocument()
  })

  it('handles empty conflicts array', () => {
    mockUseSync.hasUnresolvedConflicts = false
    mockUseSync.getUnresolvedConflicts.mockReturnValue([])

    render(<SyncButton />)

    fireEvent.click(screen.getByRole('button'))

    expect(mockUseSync.forceSync).toHaveBeenCalled()
    expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument()
  })
})
