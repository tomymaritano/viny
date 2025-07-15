import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SyncProgressBar from '../SyncProgressBar'
import { SyncStatus } from '../../../utils/syncManager'

// Mock the useSyncStatus hook
const mockUseSyncStatus = {
  status: SyncStatus.IDLE,
  progress: 0,
  isSyncing: false,
  isOnline: true,
  lastSync: null,
  hasConflicts: false,
  conflictCount: 0
}

vi.mock('../../../hooks/useSync', () => ({
  useSyncStatus: () => mockUseSyncStatus
}))

describe('SyncProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to default state
    mockUseSyncStatus.status = SyncStatus.IDLE
    mockUseSyncStatus.progress = 0
    mockUseSyncStatus.isSyncing = false
  })

  it('renders nothing when not syncing', () => {
    const { container } = render(<SyncProgressBar />)
    
    expect(container.firstChild).toBeNull()
  })

  it('renders when isSyncing is true', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.status = SyncStatus.SYNCING
    mockUseSyncStatus.progress = 50
    
    render(<SyncProgressBar />)
    
    // Check for progress bar container by class
    const progressBar = document.querySelector('.bg-gray-200')
    expect(progressBar).toBeInTheDocument()
  })

  it('renders when status is SYNCING', () => {
    mockUseSyncStatus.status = SyncStatus.SYNCING
    mockUseSyncStatus.progress = 25
    
    render(<SyncProgressBar />)
    
    const progressBar = document.querySelector('.bg-gray-200')
    expect(progressBar).toBeInTheDocument()
  })

  it('applies correct width based on progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 75
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('[style*="width: 75%"]')
    expect(progressFill).toBeInTheDocument()
  })

  it('shows text when showText is true', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 30
    
    render(<SyncProgressBar showText={true} />)
    
    expect(screen.getByText('Syncing...')).toBeInTheDocument()
  })

  it('shows percentage when showPercentage is true', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 42.7
    
    render(<SyncProgressBar showText={true} showPercentage={true} />)
    
    expect(screen.getByText('43%')).toBeInTheDocument()
  })

  it('does not show percentage when showText is false', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 50
    
    render(<SyncProgressBar showText={false} showPercentage={true} />)
    
    expect(screen.queryByText('50%')).not.toBeInTheDocument()
  })

  it('applies correct height class for small size', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar height="sm" />)
    
    const progressBg = document.querySelector('.h-1')
    expect(progressBg).toBeInTheDocument()
  })

  it('applies correct height class for medium size', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar height="md" />)
    
    const progressBg = document.querySelector('.h-2')
    expect(progressBg).toBeInTheDocument()
  })

  it('applies correct height class for large size', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar height="lg" />)
    
    const progressBg = document.querySelector('.h-3')
    expect(progressBg).toBeInTheDocument()
  })

  it('applies default medium height when no height specified', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar />)
    
    const progressBg = document.querySelector('.h-2')
    expect(progressBg).toBeInTheDocument()
  })

  it('applies red color for low progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 20
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.bg-red-500')
    expect(progressFill).toBeInTheDocument()
  })

  it('applies yellow color for medium progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 50
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.bg-yellow-500')
    expect(progressFill).toBeInTheDocument()
  })

  it('applies green color for high progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 80
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.bg-green-500')
    expect(progressFill).toBeInTheDocument()
  })

  it('applies custom className', () => {
    mockUseSyncStatus.isSyncing = true
    
    const { container } = render(<SyncProgressBar className="custom-class" />)
    
    const progressContainer = container.querySelector('.custom-class')
    expect(progressContainer).toBeInTheDocument()
  })

  it('handles zero progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 0
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('[style*="width: 0%"]')
    expect(progressFill).toBeInTheDocument()
  })

  it('handles 100% progress', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 100
    
    render(<SyncProgressBar showText={true} showPercentage={true} />)
    
    const progressFill = document.querySelector('[style*="width: 100%"]')
    expect(progressFill).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('rounds percentage to nearest integer', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 66.7
    
    render(<SyncProgressBar showText={true} showPercentage={true} />)
    
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('shows progress bar with transition classes', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 45
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.transition-all')
    expect(progressFill).toBeInTheDocument()
    expect(progressFill).toHaveClass('duration-300', 'ease-out')
  })

  it('applies dark mode background classes', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar />)
    
    const progressBg = document.querySelector('.dark\\:bg-gray-700')
    expect(progressBg).toBeInTheDocument()
  })

  it('applies rounded corners to progress bar', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar />)
    
    const progressBg = document.querySelector('.rounded-full')
    expect(progressBg).toBeInTheDocument()
    
    const progressFill = document.querySelector('.rounded-full')
    expect(progressFill).toBeInTheDocument()
  })

  it('maintains consistent height classes on both background and fill', () => {
    mockUseSyncStatus.isSyncing = true
    
    render(<SyncProgressBar height="lg" />)
    
    const progressBg = document.querySelector('.h-3')
    const progressFill = document.querySelector('.bg-red-500')
    
    expect(progressBg).toBeInTheDocument()
    expect(progressFill).toHaveClass('h-3')
  })

  it('handles edge case where progress is exactly 30', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 30
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.bg-yellow-500')
    expect(progressFill).toBeInTheDocument()
  })

  it('handles edge case where progress is exactly 70', () => {
    mockUseSyncStatus.isSyncing = true
    mockUseSyncStatus.progress = 70
    
    render(<SyncProgressBar />)
    
    const progressFill = document.querySelector('.bg-green-500')
    expect(progressFill).toBeInTheDocument()
  })
})