import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StorageErrorBoundary from '../StorageErrorBoundary'

// Mock logger
vi.mock('../../../utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}))

// Component that throws on render
const ThrowError = () => {
  throw new Error('Test error')
}

describe('StorageErrorBoundary - Simple', () => {
  it('renders children when there is no error', () => {
    render(
      <StorageErrorBoundary>
        <div>Test content</div>
      </StorageErrorBoundary>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('catches and displays errors', () => {
    // Suppress console errors for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <StorageErrorBoundary>
        <ThrowError />
      </StorageErrorBoundary>
    )
    
    expect(screen.getByText('Storage Error')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})