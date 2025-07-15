import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacySettings from '../PrivacySettings'

// Mock store
vi.mock('../../../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    settings: {
      analyticsEnabled: false,
      crashReporting: true,
      localDataOnly: true,
      dataRetentionDays: 365,
      inactivityTimeoutMinutes: 15,
    },
    updateSettings: vi.fn()
  })
}))

// Simple mock components
vi.mock('../../../Icons', () => ({
  default: {
    Download: () => null,
    ArrowRight: () => null,
    Trash: () => null,
    AlertTriangle: () => null,
    Info: () => null,
  }
}))

vi.mock('../../ui/ValidationMessage', () => ({
  default: () => null
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

describe('PrivacySettings - Simple', () => {
  it('renders without crashing', () => {
    render(<PrivacySettings />)
    expect(screen.getByText('Data Collection & Analytics')).toBeInTheDocument()
  })
})