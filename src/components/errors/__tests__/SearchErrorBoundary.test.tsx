import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import SearchErrorBoundary from '../SearchErrorBoundary'
import { logSearchError } from '../../../services/errorLogger'

// Mock dependencies
vi.mock('../../Icons', () => ({
  default: {
    Search: vi.fn(() => <div data-testid="search-icon">Search Icon</div>),
    RefreshCw: vi.fn(() => <div data-testid="refresh-icon">Refresh Icon</div>),
    X: vi.fn(() => <div data-testid="x-icon">X Icon</div>)
  }
}))

vi.mock('../../../services/errorLogger', () => ({
  logSearchError: vi.fn()
}))

// Component that throws search errors
const ThrowSearchError = ({ errorType }: { errorType: 'syntax' | 'timeout' | 'generic' }) => {
  if (errorType === 'syntax') {
    throw new Error('Invalid search syntax: unclosed quote')
  } else if (errorType === 'timeout') {
    throw new Error('Search timeout: query took too long')
  } else if (errorType === 'generic') {
    throw new Error('Search failed')
  }
  return <div>Search results</div>
}

describe('SearchErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <SearchErrorBoundary>
        <div>Search content</div>
      </SearchErrorBoundary>
    )
    
    expect(screen.getByText('Search content')).toBeInTheDocument()
  })

  it('renders search error UI when error occurs', () => {
    render(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    expect(screen.getByText('Search Error')).toBeInTheDocument()
    expect(screen.getByText(/There was a problem with your search/)).toBeInTheDocument()
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('logs search errors to error logger', () => {
    render(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="syntax" />
      </SearchErrorBoundary>
    )
    
    expect(logSearchError).toHaveBeenCalledWith(
      'unknown_query',
      expect.objectContaining({
        message: 'Invalid search syntax: unclosed quote'
      }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('calls onClearSearch when Clear Search & Retry is clicked', () => {
    const onClearSearch = vi.fn()
    
    render(
      <SearchErrorBoundary onClearSearch={onClearSearch}>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Clear Search & Retry'))
    
    expect(onClearSearch).toHaveBeenCalled()
  })

  it('resets error state when retry is clicked', () => {
    let shouldThrow = true
    const TestWrapper = () => {
      const key = shouldThrow ? 'error' : 'no-error'
      return (
        <SearchErrorBoundary key={key}>
          {shouldThrow ? <ThrowSearchError errorType="generic" /> : <div>Search works now</div>}
        </SearchErrorBoundary>
      )
    }
    
    const { rerender } = render(<TestWrapper />)
    
    expect(screen.getByText('Search Error')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Clear Search & Retry'))
    
    // Update to not throw
    shouldThrow = false
    rerender(<TestWrapper />)
    
    expect(screen.getByText('Search works now')).toBeInTheDocument()
  })

  it('shows close button when onClose is provided', () => {
    const onClose = vi.fn()
    
    render(
      <SearchErrorBoundary onClose={onClose}>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    const closeButton = screen.getByText('Close')
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not show close button when onClose is not provided', () => {
    render(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('shows error details when showDetails is true', () => {
    render(
      <SearchErrorBoundary showDetails={true}>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    // Details should be visible
    expect(screen.getByText(/Search failed/)).toBeInTheDocument()
  })

  it('provides custom fallback message', () => {
    render(
      <SearchErrorBoundary fallbackMessage="Custom search error message">
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    expect(screen.getByText('Custom search error message')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <SearchErrorBoundary onError={onError}>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Search failed' }),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('handles errors during async search operations', () => {
    class AsyncSearchComponent extends React.Component {
      componentDidMount() {
        throw new Error('Async search error')
      }
      render() {
        return <div>Searching...</div>
      }
    }
    
    render(
      <SearchErrorBoundary>
        <AsyncSearchComponent />
      </SearchErrorBoundary>
    )
    
    expect(screen.getByText('Search Error')).toBeInTheDocument()
    expect(logSearchError).toHaveBeenCalledWith(
      'unknown_query',
      expect.objectContaining({ message: 'Async search error' }),
      expect.any(Object)
    )
  })

  it('maintains error state through rerenders', () => {
    const { rerender } = render(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    expect(screen.getByText('Search Error')).toBeInTheDocument()
    
    // Rerender without fixing the error
    rerender(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    // Should still show error
    expect(screen.getByText('Search Error')).toBeInTheDocument()
  })

  it('applies theme-specific styling', () => {
    render(
      <SearchErrorBoundary>
        <ThrowSearchError errorType="generic" />
      </SearchErrorBoundary>
    )
    
    const errorContainer = screen.getByText('Search Error').closest('div')?.parentElement
    expect(errorContainer).toHaveClass('bg-theme-bg-secondary')
  })
})