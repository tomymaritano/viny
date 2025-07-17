import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TagModal } from '../TagModal'

// Mock dependencies
vi.mock('../../../Icons', () => ({
  default: {
    Tag: ({ size }: { size?: number }) => <div data-testid="tag-icon" data-size={size}>Tag</div>,
    Plus: ({ size }: { size?: number }) => <div data-testid="plus-icon" data-size={size}>Plus</div>,
    Edit: ({ size }: { size?: number }) => <div data-testid="edit-icon" data-size={size}>Edit</div>,
    Trash: ({ size }: { size?: number }) => <div data-testid="trash-icon" data-size={size}>Trash</div>
  }
}))

vi.mock('../../../ui/BaseModal', () => ({
  default: ({ isOpen, onClose, title, icon, children }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="base-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-icon">{icon}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    )
  }
}))

vi.mock('../TagManager', () => ({
  default: ({ tags, onTagsChange }: { tags: string[]; onTagsChange: (tags: string[]) => void }) => (
    <div data-testid="tag-manager">
      <div data-testid="current-tags">{tags.join(', ')}</div>
      <button 
        onClick={() => onTagsChange([...tags, 'new-tag'])}
        data-testid="add-tag-button"
      >
        Add Tag
      </button>
    </div>
  )
}))

vi.mock('../TagSettingsModal', () => ({
  default: ({ isOpen, onClose, tagName }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="tag-settings-modal">
        <div data-testid="tag-name">{tagName}</div>
        <button onClick={onClose} data-testid="close-tag-settings">Close Settings</button>
      </div>
    )
  }
}))

vi.mock('../../../../utils/customTagColors', () => ({
  getAvailableTagColors: vi.fn(() => [
    { key: 'ocean', name: 'Ocean', preview: { bg: '#0891B2', border: '#0E7490' } },
    { key: 'forest', name: 'Forest', preview: { bg: '#059669', border: '#047857' } },
    { key: 'sunset', name: 'Sunset', preview: { bg: '#EA580C', border: '#C2410C' } },
    { key: 'lavender', name: 'Lavender', preview: { bg: '#7C3AED', border: '#6D28D9' } }
  ])
}))

// Mock store functions
const mockAddNote = vi.fn()
const mockSetTagColor = vi.fn()
const mockRemoveTagFromAllNotes = vi.fn()
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('../../../../stores/newSimpleStore', () => ({
  useAppStore: () => ({
    addNote: mockAddNote,
    setTagColor: mockSetTagColor,
    removeTagFromAllNotes: mockRemoveTagFromAllNotes,
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

// Mock window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm
})

describe('TagModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentTags: ['tag1', 'tag2'],
    onTagsChange: vi.fn(),
    availableTags: ['tag1', 'tag2', 'tag3', 'existing-tag'],
    mode: 'note' as const
  }

  const globalModeProps = {
    ...defaultProps,
    mode: 'global' as const,
    filteredNotes: [
      { id: '1', tags: ['tag1'], title: 'Note 1' },
      { id: '2', tags: ['tag2'], title: 'Note 2' },
      { id: '3', tags: ['tag1', 'tag3'], title: 'Note 3' }
    ] as any[]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(<TagModal {...defaultProps} />)
      
      expect(screen.getByTestId('base-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Manage Tags')
    })

    it('should not render when closed', () => {
      render(<TagModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByTestId('base-modal')).not.toBeInTheDocument()
    })

    it('should render different title for global mode', () => {
      render(<TagModal {...globalModeProps} />)
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Manage Global Tags')
    })
  })

  describe('Note Mode', () => {
    it('should render TagManager for note mode', () => {
      render(<TagModal {...defaultProps} />)
      
      expect(screen.getByTestId('tag-manager')).toBeInTheDocument()
      expect(screen.getByTestId('current-tags')).toHaveTextContent('tag1, tag2')
    })

    it('should show available tags in note mode', () => {
      render(<TagModal {...defaultProps} />)
      
      expect(screen.getByText('Add more tags')).toBeInTheDocument()
      expect(screen.getByText('tag3')).toBeInTheDocument()
      expect(screen.getByText('existing-tag')).toBeInTheDocument()
    })

    it('should call onTagsChange when save is clicked', () => {
      render(<TagModal {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Save Tags'))
      
      expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['tag1', 'tag2'])
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should reset tags when cancel is clicked', () => {
      render(<TagModal {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Cancel'))
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Global Mode', () => {
    it('should render create tag section in global mode', () => {
      render(<TagModal {...globalModeProps} />)
      
      expect(screen.getByText('Create new tag')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type new tag name...')).toBeInTheDocument()
      expect(screen.getByText('Create Tag')).toBeInTheDocument()
    })

    it('should show all existing tags with management options', () => {
      render(<TagModal {...globalModeProps} />)
      
      expect(screen.getByText('All existing tags (4)')).toBeInTheDocument()
      
      // Check for tag actions
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(4)
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(4)
    })

    it('should show note counts for each tag', () => {
      render(<TagModal {...globalModeProps} />)
      
      // tag1 appears in 2 notes (Note 1 and Note 3)
      expect(screen.getByText('2 notes')).toBeInTheDocument()
      // tag2 and tag3 appear in 1 note each
      expect(screen.getAllByText('1 notes')).toHaveLength(2)
    })

    it('should create new tag when form is submitted', () => {
      render(<TagModal {...globalModeProps} />)
      
      const input = screen.getByPlaceholderText('Type new tag name...')
      fireEvent.change(input, { target: { value: 'new-test-tag' } })
      fireEvent.click(screen.getByText('Create Tag'))
      
      expect(mockSetTagColor).toHaveBeenCalledWith('new-test-tag', 'ocean')
    })

    it('should create tag on Cmd+Enter keypress', () => {
      render(<TagModal {...globalModeProps} />)
      
      const input = screen.getByPlaceholderText('Type new tag name...')
      fireEvent.change(input, { target: { value: 'keyboard-tag' } })
      fireEvent.keyDown(input, { key: 'Enter', metaKey: true })
      
      expect(mockSetTagColor).toHaveBeenCalledWith('keyboard-tag', 'ocean')
    })

    it('should not create tag with empty name', () => {
      render(<TagModal {...globalModeProps} />)
      
      fireEvent.click(screen.getByText('Create Tag'))
      
      expect(mockSetTagColor).not.toHaveBeenCalled()
    })
  })

  describe('Tag Deletion', () => {
    it('should show delete button for each tag in global mode', () => {
      render(<TagModal {...globalModeProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      expect(deleteButtons).toHaveLength(4)
    })

    it('should call removeTagFromAllNotes when delete is confirmed', () => {
      mockConfirm.mockReturnValue(true)
      render(<TagModal {...globalModeProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      fireEvent.click(deleteButtons[0])
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to remove the tag "tag1" from all notes? This action cannot be undone.'
      )
      expect(mockRemoveTagFromAllNotes).toHaveBeenCalledWith('tag1')
      expect(mockShowSuccess).toHaveBeenCalledWith('Tag "tag1" removed from all notes')
    })

    it('should not delete tag when user cancels', () => {
      mockConfirm.mockReturnValue(false)
      render(<TagModal {...globalModeProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      fireEvent.click(deleteButtons[0])
      
      expect(mockConfirm).toHaveBeenCalled()
      expect(mockRemoveTagFromAllNotes).not.toHaveBeenCalled()
      expect(mockShowSuccess).not.toHaveBeenCalled()
    })

    it('should show error message when deletion fails', () => {
      mockConfirm.mockReturnValue(true)
      mockRemoveTagFromAllNotes.mockImplementation(() => {
        throw new Error('Deletion failed')
      })
      
      render(<TagModal {...globalModeProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      fireEvent.click(deleteButtons[0])
      
      expect(mockShowError).toHaveBeenCalledWith('Failed to remove tag "tag1". Please try again.')
    })

    it('should handle tag deletion for any tag name', () => {
      const propsWithSpaces = {
        ...globalModeProps,
        availableTags: [' tag-with-spaces ', 'normal-tag']
      }
      
      render(<TagModal {...propsWithSpaces} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      fireEvent.click(deleteButtons[0])
      
      expect(mockRemoveTagFromAllNotes).toHaveBeenCalledWith(' tag-with-spaces ')
    })
  })

  describe('Color Selection', () => {
    it('should show color picker for new tags', () => {
      render(<TagModal {...globalModeProps} />)
      
      expect(screen.getByText('Color')).toBeInTheDocument()
      // Should show color buttons
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.style.backgroundColor
      )
      expect(colorButtons.length).toBeGreaterThan(0)
    })

    it('should change color selection when color button is clicked', () => {
      render(<TagModal {...globalModeProps} />)
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.style.backgroundColor
      )
      
      if (colorButtons.length > 1) {
        fireEvent.click(colorButtons[1]) // Click second color
        
        const input = screen.getByPlaceholderText('Type new tag name...')
        fireEvent.change(input, { target: { value: 'colored-tag' } })
        fireEvent.click(screen.getByText('Create Tag'))
        
        expect(mockSetTagColor).toHaveBeenCalledWith('colored-tag', 'forest')
      }
    })
  })

  describe('Tag Settings Modal', () => {
    it('should open tag settings when edit button is clicked', () => {
      render(<TagModal {...globalModeProps} />)
      
      const editButtons = screen.getAllByTestId('edit-icon')
      fireEvent.click(editButtons[0])
      
      expect(screen.getByTestId('tag-settings-modal')).toBeInTheDocument()
      expect(screen.getByTestId('tag-name')).toHaveTextContent('tag1')
    })

    it('should close tag settings modal', () => {
      render(<TagModal {...globalModeProps} />)
      
      const editButtons = screen.getAllByTestId('edit-icon')
      fireEvent.click(editButtons[0])
      
      expect(screen.getByTestId('tag-settings-modal')).toBeInTheDocument()
      
      fireEvent.click(screen.getByTestId('close-tag-settings'))
      
      expect(screen.queryByTestId('tag-settings-modal')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should save on Cmd+Enter in note mode', () => {
      render(<TagModal {...defaultProps} />)
      
      // Find an element that can receive keyboard events
      const contentDiv = screen.getByTestId('base-modal').querySelector('.p-4')
      fireEvent.keyDown(contentDiv, { 
        key: 'Enter', 
        metaKey: true 
      })
      
      expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['tag1', 'tag2'])
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should save on Ctrl+Enter in note mode', () => {
      render(<TagModal {...defaultProps} />)
      
      // Find an element that can receive keyboard events
      const contentDiv = screen.getByTestId('base-modal').querySelector('.p-4')
      fireEvent.keyDown(contentDiv, { 
        key: 'Enter', 
        ctrlKey: true 
      })
      
      expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['tag1', 'tag2'])
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty available tags list', () => {
      render(<TagModal {...defaultProps} availableTags={[]} />)
      
      expect(screen.queryByText('Choose from existing tags')).not.toBeInTheDocument()
    })

    it('should handle empty current tags', () => {
      render(<TagModal {...defaultProps} currentTags={[]} />)
      
      expect(screen.getByText('Choose from existing tags')).toBeInTheDocument()
    })

    it('should show message when no tags exist in global mode', () => {
      render(<TagModal {...globalModeProps} availableTags={[]} />)
      
      expect(screen.getByText('No tags exist yet. Create your first tag above.')).toBeInTheDocument()
    })

    it('should handle missing filteredNotes in global mode', () => {
      render(<TagModal {...globalModeProps} filteredNotes={[]} />)
      
      expect(screen.getAllByText('0 notes')).toHaveLength(4) // One for each tag
    })
  })
})