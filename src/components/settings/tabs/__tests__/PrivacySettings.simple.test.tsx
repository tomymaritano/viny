import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import PrivacySettings from '../PrivacySettings'

// Mock the new settings service
vi.mock('../../../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      telemetryEnabled: false,
      crashReporting: true,
      localOnlyMode: true,
      dataRetentionDays: 365,
      autoLockMinutes: 15,
    },
    setSetting: vi.fn(),
    schemas: [
      { key: 'telemetryEnabled', type: 'boolean', defaultValue: false, label: 'Enable Telemetry', category: 'privacy' },
      { key: 'crashReporting', type: 'boolean', defaultValue: true, label: 'Crash Reporting', category: 'privacy' },
      { key: 'localOnlyMode', type: 'boolean', defaultValue: true, label: 'Local-Only Mode', category: 'privacy' },
    ],
    errors: {},
    loading: false
  })
}))

// Mock the settings error handler
vi.mock('../../../../hooks/useSettingsErrorHandler', () => ({
  useSettingsErrorHandler: () => ({
    errors: {},
    handleSettingsError: vi.fn(),
    validateAndHandle: vi.fn(),
    clearError: vi.fn()
  })
}))

// Mock the privacy service
vi.mock('../../../../services/privacyService', () => ({
  privacyService: {
    clearUsageData: vi.fn(),
    downloadUserData: vi.fn()
  }
}))

// Mock the error boundary
vi.mock('../../SettingsErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => children
}))

// Mock the app store
vi.mock('../../../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    addToast: vi.fn()
  })
}))

// Simple mock components  
vi.mock('../../../Icons', () => ({
  default: {
    Download: () => null,
    ArrowRight: () => null,
    Trash2: () => null,
    ChevronRight: () => null,
    AlertTriangle: () => null,
    Info: () => null,
    Shield: () => null,
    X: () => null,
    RefreshCw: () => null,
    RotateCcw: () => null,
  }
}))

describe('PrivacySettings - Simple', () => {
  it('renders without crashing', () => {
    render(<PrivacySettings />)
    expect(screen.getByText('Analytics & Tracking')).toBeInTheDocument()
  })
})