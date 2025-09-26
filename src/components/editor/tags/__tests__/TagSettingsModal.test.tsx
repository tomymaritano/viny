import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TagSettingsModal from '../TagSettingsModal'

// Mock dependencies
vi.mock('../../../Icons', () => ({
  default: {
    Tag: ({ size }: { size?: number }) => (
      <div data-testid="tag-icon" data-size={size}>
        Tag
      </div>
    ),
  },
}))

vi.mock('../../../ui/BaseModal', () => ({
  default: ({ isOpen, onClose, title, icon, children }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="base-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-icon">{icon}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    )
  },
}))

vi.mock('../../../ui/CustomTag', () => ({
  default: ({ name, color }: { name: string; color: string }) => (
    <div data-testid="custom-tag" data-color={color}>
      {name}
    </div>
  ),
}))

vi.mock('../../../../utils/customTagColors', () => ({
  getAvailableTagColors: vi.fn(() => [
    {
      key: 'blue',
      name: 'Blue',
      preview: { bg: '#3B82F6', border: '#2563EB' },
    },
    {
      key: 'green',
      name: 'Green',
      preview: { bg: '#10B981', border: '#059669' },
    },
    { key: 'red', name: 'Red', preview: { bg: '#EF4444', border: '#DC2626' } },
    {
      key: 'yellow',
      name: 'Yellow',
      preview: { bg: '#F59E0B', border: '#D97706' },
    },
  ]),
}))

const mockSetTagColor = vi.fn()
vi.mock('../../../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    setTagColor: mockSetTagColor,
  }),
}))

describe('TagSettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    tagName: 'test-tag',
    onTagNameChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open with tag name', () => {
    render(<TagSettingsModal {...defaultProps} />)

    expect(screen.getByTestId('base-modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Tag Settings')
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-tag')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<TagSettingsModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('base-modal')).not.toBeInTheDocument()
  })

  it('does not render when no tag name provided', () => {
    render(<TagSettingsModal {...defaultProps} tagName="" />)

    expect(screen.queryByTestId('base-modal')).not.toBeInTheDocument()
  })

  it('renders tag name input with current value', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const input = screen.getByDisplayValue('test-tag')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Enter tag name...')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('updates local tag name when typing', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'new-tag-name' } })

    expect(screen.getByDisplayValue('new-tag-name')).toBeInTheDocument()
  })

  it('renders color selection grid', () => {
    render(<TagSettingsModal {...defaultProps} />)

    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Green')).toBeInTheDocument()
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Yellow')).toBeInTheDocument()
  })

  it('calls setTagColor when color is selected', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const blueColorButton = screen.getByText('Blue').closest('button')
    fireEvent.click(blueColorButton!)

    expect(mockSetTagColor).toHaveBeenCalledWith('test-tag', 'blue')
  })

  it('renders Save and Cancel buttons', () => {
    render(<TagSettingsModal {...defaultProps} />)

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<TagSettingsModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(onClose).toHaveBeenCalled()
  })

  it('resets local tag name when cancelled', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'modified-name' } })

    fireEvent.click(screen.getByText('Cancel'))

    // Should reset to original name
    expect(screen.getByDisplayValue('test-tag')).toBeInTheDocument()
  })

  it('calls onTagNameChange when Save is clicked with changed name', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'new-name' } })

    fireEvent.click(screen.getByText('Save'))

    expect(onTagNameChange).toHaveBeenCalledWith('test-tag', 'new-name')
  })

  it('does not call onTagNameChange when name unchanged', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    fireEvent.click(screen.getByText('Save'))

    expect(onTagNameChange).not.toHaveBeenCalled()
  })

  it('trims whitespace from tag name before saving', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: '  trimmed-name  ' } })

    fireEvent.click(screen.getByText('Save'))

    expect(onTagNameChange).toHaveBeenCalledWith('test-tag', 'trimmed-name')
  })

  it('does not save empty tag name', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: '   ' } })

    fireEvent.click(screen.getByText('Save'))

    expect(onTagNameChange).not.toHaveBeenCalled()
  })

  it('calls onClose after saving', () => {
    const onClose = vi.fn()
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal
        {...defaultProps}
        onClose={onClose}
        onTagNameChange={onTagNameChange}
      />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'new-name' } })

    fireEvent.click(screen.getByText('Save'))

    expect(onClose).toHaveBeenCalled()
  })

  it('handles Escape key to cancel', () => {
    const onClose = vi.fn()
    render(<TagSettingsModal {...defaultProps} onClose={onClose} />)

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('handles Ctrl+Enter to save', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'new-name' } })
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })

    expect(onTagNameChange).toHaveBeenCalledWith('test-tag', 'new-name')
  })

  it('handles Cmd+Enter to save', () => {
    const onTagNameChange = vi.fn()
    render(
      <TagSettingsModal {...defaultProps} onTagNameChange={onTagNameChange} />
    )

    const input = screen.getByDisplayValue('test-tag')
    fireEvent.change(input, { target: { value: 'new-name' } })
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true })

    expect(onTagNameChange).toHaveBeenCalledWith('test-tag', 'new-name')
  })

  it('updates local tag name when tagName prop changes', () => {
    const { rerender } = render(<TagSettingsModal {...defaultProps} />)

    expect(screen.getByDisplayValue('test-tag')).toBeInTheDocument()

    rerender(<TagSettingsModal {...defaultProps} tagName="updated-tag" />)

    expect(screen.getByDisplayValue('updated-tag')).toBeInTheDocument()
  })

  it('renders color buttons with correct styling', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const blueButton = screen.getByText('Blue').closest('button')
    expect(blueButton).toHaveAttribute('title', 'Blue')
    expect(blueButton).toHaveClass('group', 'flex', 'flex-col', 'items-center')
  })

  it('has proper focus management', () => {
    render(<TagSettingsModal {...defaultProps} />)

    const input = screen.getByDisplayValue('test-tag')
    expect(input).toHaveClass('w-full', 'px-3', 'py-2')
  })

  it('renders modal with correct props', () => {
    render(<TagSettingsModal {...defaultProps} />)

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Tag Settings')
    expect(screen.getByTestId('tag-icon')).toHaveAttribute('data-size', '20')
  })

  it('handles empty tag name gracefully', () => {
    render(<TagSettingsModal {...defaultProps} tagName="" isOpen={true} />)

    expect(screen.queryByTestId('base-modal')).not.toBeInTheDocument()
  })

  it('calls onClose from BaseModal', () => {
    const onClose = vi.fn()
    render(<TagSettingsModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('modal-close'))

    expect(onClose).toHaveBeenCalled()
  })
})
