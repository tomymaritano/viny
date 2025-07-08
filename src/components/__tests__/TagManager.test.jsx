import { render, screen } from '@testing-library/react'
import TagManager from '../TagManager'

describe('TagManager Component', () => {
  const defaultProps = {
    note: { tags: ['tag1', 'tag2'] },
    onSave: vi.fn(),
    onClose: vi.fn(),
    allTags: ['tag1', 'tag2', 'tag3'],
  }

  it('should render tag manager', () => {
    render(<TagManager {...defaultProps} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('should render with empty tags', () => {
    render(<TagManager {...defaultProps} note={{ tags: [] }} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
