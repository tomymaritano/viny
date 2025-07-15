import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PrivacySettings from '../PrivacySettings'
import { useAppStore } from '../../../../stores/newSimpleStore'

// Mock all dependencies
vi.mock('../../../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn()
}))

vi.mock('../../../Icons', () => ({
  default: {
    Download: () => <div data-testid="download-icon">Download</div>,
    ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
    Trash2: () => <div data-testid="trash-icon">Trash2</div>,
    AlertTriangle: () => <div data-testid="alert-icon">AlertTriangle</div>,
    Info: () => <div data-testid="info-icon">Info</div>
  }
}))

vi.mock('../../ui/ValidationMessage', () => ({
  default: ({ type, message }: { type: string; message: string }) => (
    <div data-testid={`validation-${type}`}>{message}</div>
  )
}))

vi.mock('../../../hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    values: { dataRetentionDays: 365, inactivityTimeoutMinutes: 15 },
    errors: {},
    warnings: {},
    getFieldProps: () => ({ onBlur: vi.fn() }),
    handleFieldChange: vi.fn(),
    validateAllFields: vi.fn()
  })
}))

// Mock window methods
const mockConfirm = vi.fn()
const mockReload = vi.fn()
const mockCreateElement = vi.fn()
const mockClick = vi.fn()
const mockRevokeObjectURL = vi.fn()

Object.defineProperty(window, 'confirm', { value: mockConfirm, writable: true })
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: mockRevokeObjectURL
  },
  writable: true
})

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

// Mock location.reload differently to avoid redefine error
const originalLocation = window.location
delete (window as any).location
window.location = { ...originalLocation, reload: mockReload } as any

describe('PrivacySettings', () => {
  const mockUpdateSettings = vi.fn()
  const mockSettings = {
    analyticsEnabled: false,
    crashReporting: true,
    usageStatistics: false,
    improveDataSharing: false,
    localDataOnly: true,
    encryptLocalStorage: false,
    clearDataOnExit: false,
    anonymousMode: false,
    trackingProtection: true,
    exportIncludeMetadata: true,
    exportIncludeHistory: false,
    dataRetentionDays: 365,
    autoDeleteOldData: false,
    secureNoteDeletion: true,
    lockAfterInactivity: false,
    inactivityTimeoutMinutes: 15,
    requirePasswordOnStart: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup store mock
    const useAppStoreMock = useAppStore as unknown as ReturnType<typeof vi.fn>
    useAppStoreMock.mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings
    })
    
    // Setup DOM mocks
    const mockElement = {
      href: '',
      download: '',
      click: mockClick
    }
    mockCreateElement.mockReturnValue(mockElement)
  })

  it('renders all privacy sections', () => {
    render(<PrivacySettings />)
    
    expect(screen.getByText('Data Collection & Analytics')).toBeInTheDocument()
    expect(screen.getByText('Data Storage & Protection')).toBeInTheDocument()
    expect(screen.getByText('Data Retention')).toBeInTheDocument()
    expect(screen.getByText('Export & Sharing')).toBeInTheDocument()
    expect(screen.getByText('Security & Access')).toBeInTheDocument()
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('toggles analytics setting', () => {
    render(<PrivacySettings />)
    
    const analyticsToggle = screen.getByRole('checkbox', { name: /anonymous usage analytics/i })
    fireEvent.click(analyticsToggle)
    
    expect(mockUpdateSettings).toHaveBeenCalledWith({ analyticsEnabled: true })
  })

  it('toggles crash reporting setting', () => {
    render(<PrivacySettings />)
    
    const crashReportingToggle = screen.getByRole('checkbox', { name: /crash reporting/i })
    fireEvent.click(crashReportingToggle)
    
    expect(mockUpdateSettings).toHaveBeenCalledWith({ crashReporting: false })
  })

  it('updates data retention period', () => {
    render(<PrivacySettings />)
    
    const retentionInput = screen.getByDisplayValue('365')
    fireEvent.change(retentionInput, { target: { value: '180' } })
    
    expect(mockUpdateSettings).toHaveBeenCalledWith({ dataRetentionDays: 180 })
  })

  it('shows inactivity timeout when lock after inactivity is enabled', () => {
    // Update mock to have lockAfterInactivity enabled
    const useAppStoreMock = useAppStore as unknown as ReturnType<typeof vi.fn>
    useAppStoreMock.mockReturnValue({
      settings: { ...mockSettings, lockAfterInactivity: true },
      updateSettings: mockUpdateSettings
    })
    
    render(<PrivacySettings />)
    
    expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    expect(screen.getByText('Inactivity Timeout (minutes)')).toBeInTheDocument()
  })

  it('handles export data functionality', () => {
    render(<PrivacySettings />)
    
    const exportButton = screen.getByText('Export All Data')
    fireEvent.click(exportButton)
    
    // Verify URL creation and download
    expect(window.URL.createObjectURL).toHaveBeenCalled()
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url')
    
    // Verify success toast
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      showToast: { type: 'success', message: 'Data exported successfully' }
    })
  })

  it('handles clear all data with confirmation', () => {
    mockConfirm.mockReturnValue(true)
    
    render(<PrivacySettings />)
    
    const clearButton = screen.getByText('Clear All Data')
    fireEvent.click(clearButton)
    
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('permanently delete ALL your notes')
    )
    
    // Verify success toast and reload
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      showToast: { type: 'success', message: 'All data cleared successfully' }
    })
  })

  it('cancels clear all data when not confirmed', () => {
    mockConfirm.mockReturnValue(false)
    
    render(<PrivacySettings />)
    
    const clearButton = screen.getByText('Clear All Data')
    fireEvent.click(clearButton)
    
    expect(mockConfirm).toHaveBeenCalled()
    
    // Should not clear data or show success message
    expect(mockUpdateSettings).not.toHaveBeenCalledWith({
      showToast: { type: 'success', message: 'All data cleared successfully' }
    })
  })

  it('validates data retention days input', async () => {
    render(<PrivacySettings />)
    
    const retentionInput = screen.getByDisplayValue('365')
    
    // Test invalid value (too high)
    fireEvent.change(retentionInput, { target: { value: '5000' } })
    fireEvent.blur(retentionInput)
    
    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 10 years/i)).toBeInTheDocument()
    })
  })

  it('validates inactivity timeout input when enabled', async () => {
    // Enable lock after inactivity
    const useAppStoreMock = useAppStore as unknown as ReturnType<typeof vi.fn>
    useAppStoreMock.mockReturnValue({
      settings: { ...mockSettings, lockAfterInactivity: true },
      updateSettings: mockUpdateSettings
    })
    
    render(<PrivacySettings />)
    
    const timeoutInput = screen.getByDisplayValue('15')
    
    // Test invalid value (too high)
    fireEvent.change(timeoutInput, { target: { value: '2000' } })
    fireEvent.blur(timeoutInput)
    
    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 24 hours/i)).toBeInTheDocument()
    })
  })

  it('shows privacy notice', () => {
    render(<PrivacySettings />)
    
    expect(screen.getByText(/Privacy Notice/)).toBeInTheDocument()
    expect(screen.getByText(/Viny respects your privacy/)).toBeInTheDocument()
  })

  it('handles anonymous mode filtering in exports', () => {
    // Enable anonymous mode
    const useAppStoreMock = useAppStore as unknown as ReturnType<typeof vi.fn>
    useAppStoreMock.mockReturnValue({
      settings: { ...mockSettings, anonymousMode: true },
      updateSettings: mockUpdateSettings
    })
    
    render(<PrivacySettings />)
    
    const exportButton = screen.getByText('Export All Data')
    fireEvent.click(exportButton)
    
    // Should still export but filter sensitive data
    expect(window.URL.createObjectURL).toHaveBeenCalled()
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      showToast: { type: 'success', message: 'Data exported successfully' }
    })
  })
})