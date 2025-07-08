import { render, screen } from '@testing-library/react'
import Toast from '../Toast'

describe('Toast Component', () => {
  const defaultProps = {
    id: '1',
    type: 'success',
    message: 'Test message',
    onRemove: vi.fn(),
  }

  it('should render toast message', () => {
    render(<Toast {...defaultProps} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render different types', () => {
    const { rerender } = render(<Toast {...defaultProps} />)

    rerender(<Toast {...defaultProps} type="error" />)
    expect(screen.getByText('Test message')).toBeInTheDocument()

    rerender(<Toast {...defaultProps} type="warning" />)
    expect(screen.getByText('Test message')).toBeInTheDocument()

    rerender(<Toast {...defaultProps} type="info" />)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })
})
