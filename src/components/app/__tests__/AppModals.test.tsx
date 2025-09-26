import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AppModals from '../AppModals'
import type { Note } from '../../../types'

// Mock lazy loaded components
vi.mock('../../features/LazyComponents', () => ({
  LazySearchModal: vi.fn(props =>
    props.isOpen ? <div data-testid="search-modal" {...props} /> : null
  ),
  LazyExportDialog: vi.fn(props =>
    props.isVisible ? <div data-testid="export-dialog" {...props} /> : null
  ),
  LazySettingsModal: vi.fn(props =>
    props.isOpen ? <div data-testid="settings-modal" {...props} /> : null
  ),
  LazyTagModal: vi.fn(props =>
    props.isOpen ? <div data-testid="tag-modal" {...props} /> : null
  ),
  LazyNotebookManager: vi.fn(props =>
    props.isOpen ? <div data-testid="notebook-manager" {...props} /> : null
  ),
}))

describe('AppModals', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notebook: 'test',
    status: 'active' as const,
    tags: ['test'],
    pinned: false,
  }

  const defaultProps = {
    modals: {
      search: false,
      export: false,
      settings: false,
      tagModal: false,
      notebookManager: false,
    },
    currentNote: mockNote,
    filteredNotes: [mockNote],
    handleOpenNote: vi.fn(),
    handleSaveNote: vi.fn().mockResolvedValue(mockNote),
    setModal: vi.fn(),
    createNewNote: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render any modals when all are closed', () => {
      render(<AppModals {...defaultProps} />)

      expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('export-dialog')).not.toBeInTheDocument()
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('tag-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('notebook-manager')).not.toBeInTheDocument()
    })

    it('should render search modal when open', () => {
      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, search: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('search-modal')).toBeInTheDocument()
    })

    it('should render export dialog when open', () => {
      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, export: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('export-dialog')).toBeInTheDocument()
    })

    it('should render settings modal when open', () => {
      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, settings: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })

    it('should render tag modal when open', () => {
      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, tagModal: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('tag-modal')).toBeInTheDocument()
    })

    it('should render notebook manager when open', () => {
      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, notebookManager: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('notebook-manager')).toBeInTheDocument()
    })
  })

  describe('Multiple Modals', () => {
    it('should render multiple modals simultaneously', () => {
      const props = {
        ...defaultProps,
        modals: {
          search: true,
          export: true,
          settings: false,
          tagModal: false,
          notebookManager: false,
        },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('search-modal')).toBeInTheDocument()
      expect(screen.getByTestId('export-dialog')).toBeInTheDocument()
      expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument()
    })

    it('should render all modals when all are open', () => {
      const props = {
        ...defaultProps,
        modals: {
          search: true,
          export: true,
          settings: true,
          tagModal: true,
          notebookManager: true,
        },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('search-modal')).toBeInTheDocument()
      expect(screen.getByTestId('export-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
      expect(screen.getByTestId('tag-modal')).toBeInTheDocument()
      expect(screen.getByTestId('notebook-manager')).toBeInTheDocument()
    })
  })

  describe('Modal Props', () => {
    it('should pass correct props to search modal', () => {
      const LazySearchModal = vi.mocked(
        require('../../features/LazyComponents').LazySearchModal
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, search: true },
      }

      render(<AppModals {...props} />)

      expect(LazySearchModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
          onSelectNote: defaultProps.handleOpenNote,
        }),
        expect.anything()
      )
    })

    it('should pass correct props to export dialog', () => {
      const LazyExportDialog = vi.mocked(
        require('../../features/LazyComponents').LazyExportDialog
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, export: true },
      }

      render(<AppModals {...props} />)

      expect(LazyExportDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          isVisible: true,
          onClose: expect.any(Function),
          notes: [mockNote],
          type: 'single',
        }),
        expect.anything()
      )
    })

    it('should pass correct props to settings modal', () => {
      const LazySettingsModal = vi.mocked(
        require('../../features/LazyComponents').LazySettingsModal
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, settings: true },
      }

      render(<AppModals {...props} />)

      expect(LazySettingsModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
        }),
        expect.anything()
      )
    })

    it('should pass correct props to tag modal', () => {
      const LazyTagModal = vi.mocked(
        require('../../features/LazyComponents').LazyTagModal
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, tagModal: true },
      }

      render(<AppModals {...props} />)

      expect(LazyTagModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
          currentNote: mockNote,
          onSaveNote: defaultProps.handleSaveNote,
        }),
        expect.anything()
      )
    })

    it('should pass correct props to notebook manager', () => {
      const LazyNotebookManager = vi.mocked(
        require('../../features/LazyComponents').LazyNotebookManager
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, notebookManager: true },
      }

      render(<AppModals {...props} />)

      expect(LazyNotebookManager).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
          onCreateNew: defaultProps.createNewNote,
        }),
        expect.anything()
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle null currentNote for export dialog', () => {
      const props = {
        ...defaultProps,
        currentNote: null,
        modals: { ...defaultProps.modals, export: true },
      }

      render(<AppModals {...props} />)

      const LazyExportDialog = vi.mocked(
        require('../../features/LazyComponents').LazyExportDialog
      )
      expect(LazyExportDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: [],
        }),
        expect.anything()
      )
    })

    it('should handle empty filteredNotes', () => {
      const props = {
        ...defaultProps,
        filteredNotes: [],
        modals: { ...defaultProps.modals, search: true },
      }

      render(<AppModals {...props} />)

      expect(screen.getByTestId('search-modal')).toBeInTheDocument()
    })
  })

  describe('Modal Close Handlers', () => {
    it('should call setModal with correct args when closing search', () => {
      const LazySearchModal = vi.mocked(
        require('../../features/LazyComponents').LazySearchModal
      )

      const props = {
        ...defaultProps,
        modals: { ...defaultProps.modals, search: true },
      }

      render(<AppModals {...props} />)

      const onCloseHandler = LazySearchModal.mock.calls[0][0].onClose
      onCloseHandler()

      expect(defaultProps.setModal).toHaveBeenCalledWith('search', false)
    })

    it('should call setModal when closing each modal type', () => {
      const modals = [
        'export',
        'settings',
        'tagModal',
        'notebookManager',
      ] as const

      modals.forEach(modalName => {
        vi.clearAllMocks()

        const props = {
          ...defaultProps,
          modals: { ...defaultProps.modals, [modalName]: true },
        }

        render(<AppModals {...props} />)

        // Get the appropriate lazy component
        const componentMap = {
          export: 'LazyExportDialog',
          settings: 'LazySettingsModal',
          tagModal: 'LazyTagModal',
          notebookManager: 'LazyNotebookManager',
        }

        const LazyComponent = vi.mocked(
          require('../../features/LazyComponents')[componentMap[modalName]]
        )

        const onCloseHandler = LazyComponent.mock.calls[0][0].onClose
        onCloseHandler()

        expect(defaultProps.setModal).toHaveBeenCalledWith(modalName, false)
      })
    })
  })
})
