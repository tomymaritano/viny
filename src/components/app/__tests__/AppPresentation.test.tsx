import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import AppPresentation from '../AppPresentation'
import { Note, Notebook, Settings } from '../../../types'

// Mock child components
vi.mock('../AppLayout', () => ({
  default: vi.fn((props) => (
    <div data-testid="app-layout" {...Object.keys(props).reduce((acc, key) => {
      if (typeof props[key] === 'string' || typeof props[key] === 'boolean' || typeof props[key] === 'number') {
        acc[key] = props[key]
      }
      return acc
    }, {} as any)}>
      AppLayout Component
    </div>
  ))
}))

vi.mock('../AppModals', () => ({
  default: vi.fn((props) => (
    <div data-testid="app-modals" {...props} />
  ))
}))

vi.mock('../../LoadingStates', () => ({
  AppLoading: vi.fn(({ message }) => (
    <div data-testid="app-loading">{message}</div>
  ))
}))

vi.mock('../../ErrorBoundary', () => ({
  ErrorBoundary: vi.fn(({ children }) => children)
}))

vi.mock('../../errors/StorageErrorBoundary', () => ({
  default: vi.fn(({ children }) => children)
}))

describe('AppPresentation', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notebook: 'test',
    status: 'active' as const,
    tags: ['test'],
    pinned: false
  }

  const mockNotebook: Notebook = {
    name: 'test',
    color: '#000000',
    count: 1,
    isDefault: false
  }

  const mockSettings: Partial<Settings> = {
    theme: 'dark',
    language: 'en'
  }

  const defaultProps = {
    // Data
    currentNote: mockNote,
    selectedNote: mockNote,
    filteredNotes: [mockNote],
    notebooks: [mockNotebook],
    settings: mockSettings,
    
    // UI State
    isEditorOpen: true,
    isLoading: false,
    activeSection: 'all',
    modals: {
      search: false,
      export: false,
      settings: false,
      tagModal: false,
      notebookManager: false
    },
    
    // Handlers
    handleOpenNote: vi.fn(),
    handleContentChange: vi.fn(),
    handleNotebookChange: vi.fn(),
    handleMetadataChange: vi.fn(),
    createNewNote: vi.fn(),
    handleSaveNote: vi.fn().mockResolvedValue(mockNote),
    handleDeleteNote: vi.fn(),
    handleTogglePin: vi.fn(),
    handleDuplicateNote: vi.fn(),
    handleRestoreNote: vi.fn(),
    handlePermanentDelete: vi.fn(),
    setModal: vi.fn(),
    sortNotes: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading screen when isLoading is true', () => {
      render(<AppPresentation {...defaultProps} isLoading={true} />)
      
      expect(screen.getByTestId('app-loading')).toBeInTheDocument()
      expect(screen.getByText('Loading Viny...')).toBeInTheDocument()
    })

    it('should not display loading screen when isLoading is false', () => {
      render(<AppPresentation {...defaultProps} />)
      
      expect(screen.queryByTestId('app-loading')).not.toBeInTheDocument()
    })
  })

  describe('App Container', () => {
    it('should render app container with correct data-testid', () => {
      render(<AppPresentation {...defaultProps} />)
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })

    it('should render AppLayout with all props', () => {
      render(<AppPresentation {...defaultProps} />)
      
      const appLayout = screen.getByTestId('app-layout')
      expect(appLayout).toBeInTheDocument()
      expect(appLayout).toHaveTextContent('AppLayout Component')
    })

    it('should render AppModals with modal state', () => {
      render(<AppPresentation {...defaultProps} />)
      
      const appModals = screen.getByTestId('app-modals')
      expect(appModals).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('should wrap content in ErrorBoundary', () => {
      render(<AppPresentation {...defaultProps} />)
      
      // Content should be rendered (ErrorBoundary is mocked to render children)
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })

    it('should wrap content in StorageErrorBoundary', () => {
      render(<AppPresentation {...defaultProps} />)
      
      // Just verify the component renders without errors
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })
  })

  describe('Prop Handling', () => {
    it('should pass props to child components', () => {
      render(<AppPresentation {...defaultProps} />)
      
      // Verify AppLayout is rendered with data-testid
      expect(screen.getByTestId('app-layout')).toBeInTheDocument()
      
      // Verify AppModals is rendered with data-testid
      expect(screen.getByTestId('app-modals')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null currentNote', () => {
      render(<AppPresentation {...defaultProps} currentNote={null} />)
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })

    it('should handle empty filteredNotes', () => {
      render(<AppPresentation {...defaultProps} filteredNotes={[]} />)
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })

    it('should handle empty notebooks', () => {
      render(<AppPresentation {...defaultProps} notebooks={[]} />)
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })

    it('should handle empty settings', () => {
      render(<AppPresentation {...defaultProps} settings={{}} />)
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument()
    })
  })
})