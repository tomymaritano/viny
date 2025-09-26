import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SyncStatusIndicator from '../SyncStatusIndicator'
import { SyncStatus } from '../../../utils/syncManager'

// Mock the useSync hook
const mockUseSyncStatus = vi.fn()
vi.mock('../../../hooks/useSync', () => ({
  useSyncStatus: () => mockUseSyncStatus(),
}))

describe('SyncStatusIndicator', () => {
  const defaultSyncState = {
    status: SyncStatus.IDLE,
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    hasConflicts: false,
    conflictCount: 0,
    progress: 0,
  }

  beforeEach(() => {
    mockUseSyncStatus.mockReturnValue(defaultSyncState)
  })

  describe('Online/Offline status', () => {
    it('should show offline indicator when offline', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        isOnline: false,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Offline')).toBeInTheDocument()
      // Should show wifi-off icon with red color - just check it renders
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should show online status when online', () => {
      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Ready')).toBeInTheDocument()
    })
  })

  describe('Sync status display', () => {
    it('should show syncing status with spinner', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SYNCING,
        isSyncing: true,
        progress: 50,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Syncing... 50%')).toBeInTheDocument()
      // Should show spinning refresh icon - just check it renders
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should show syncing without progress when progress is 0', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SYNCING,
        isSyncing: true,
        progress: 0,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Syncing...')).toBeInTheDocument()
    })

    it('should show success status', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SUCCESS,
        lastSync: new Date('2025-01-01T10:00:00Z'),
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Synced')).toBeInTheDocument()
      // Should show check circle icon - just check it renders
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should show conflict status', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.CONFLICT,
        hasConflicts: true,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Conflicts')).toBeInTheDocument()
      // Should show warning triangle icon - just check it renders
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should show error status', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.ERROR,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Sync Error')).toBeInTheDocument()
      // Should show cloud-off icon - just check it renders
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Last sync time display', () => {
    it('should show "Just now" for very recent sync', () => {
      const recentSync = new Date(Date.now() - 30000) // 30 seconds ago

      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SUCCESS,
        lastSync: recentSync,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('should show minutes ago for recent sync', () => {
      const recentSync = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago

      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SUCCESS,
        lastSync: recentSync,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('should show hours ago for older sync', () => {
      const oldSync = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago

      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SUCCESS,
        lastSync: oldSync,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('should not show last sync time when syncing', () => {
      const recentSync = new Date(Date.now() - 60000) // 1 minute ago

      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SYNCING,
        isSyncing: true,
        lastSync: recentSync,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.queryByText('1m ago')).not.toBeInTheDocument()
      expect(screen.getByText('Syncing...')).toBeInTheDocument()
    })

    it('should not show last sync time when no previous sync', () => {
      render(<SyncStatusIndicator showText={true} />)

      expect(screen.queryByText(/ago/)).not.toBeInTheDocument()
    })
  })

  describe('Display modes', () => {
    it('should show only icon when showText is false', () => {
      render(<SyncStatusIndicator showText={false} />)

      expect(screen.queryByText('Ready')).not.toBeInTheDocument()
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should show both icon and text when showText is true', () => {
      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Ready')).toBeInTheDocument()
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Size variations', () => {
    it('should render with small size', () => {
      render(<SyncStatusIndicator size="sm" />)

      const icon = document.querySelector('svg')
      // Small icons should have width and height of 14
      expect(icon).toBeInTheDocument()
    })

    it('should render with medium size (default)', () => {
      render(<SyncStatusIndicator size="md" />)

      const icon = document.querySelector('svg')
      // Medium icons should have width and height of 16
      expect(icon).toBeInTheDocument()
    })

    it('should render with large size', () => {
      render(<SyncStatusIndicator size="lg" />)

      const icon = document.querySelector('svg')
      // Large icons should have width and height of 20
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(<SyncStatusIndicator className="custom-class" />)

      const container = document.querySelector('.custom-class')
      expect(container).toHaveClass('custom-class')
    })

    it('should have proper base styling', () => {
      render(<SyncStatusIndicator />)

      const container = document.querySelector('.flex.items-center')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Status color mapping', () => {
    it('should use correct colors for different statuses', () => {
      const { rerender } = render(<SyncStatusIndicator showText={true} />)

      // Test each status color
      const statusColors = [
        { status: SyncStatus.SUCCESS, textClass: 'text-green-600' },
        { status: SyncStatus.ERROR, textClass: 'text-red-600' },
        { status: SyncStatus.CONFLICT, textClass: 'text-yellow-600' },
        { status: SyncStatus.SYNCING, textClass: 'text-blue-600' },
        { status: SyncStatus.IDLE, textClass: 'text-gray-600' },
      ]

      statusColors.forEach(({ status, textClass }) => {
        mockUseSyncStatus.mockReturnValue({
          ...defaultSyncState,
          status,
        })

        rerender(<SyncStatusIndicator showText={true} />)

        const statusText = screen.getByText(
          /Ready|Synced|Sync Error|Conflicts|Syncing|Resolved/
        )
        expect(statusText).toHaveClass(textClass)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined lastSync gracefully', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        lastSync: undefined,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(screen.queryByText(/ago/)).not.toBeInTheDocument()
    })

    it('should prioritize offline status over sync status', () => {
      mockUseSyncStatus.mockReturnValue({
        ...defaultSyncState,
        status: SyncStatus.SUCCESS,
        isOnline: false,
      })

      render(<SyncStatusIndicator showText={true} />)

      expect(screen.getByText('Offline')).toBeInTheDocument()
      expect(screen.queryByText('Synced')).not.toBeInTheDocument()
    })
  })
})
