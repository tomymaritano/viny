import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Create mock functions with vi.hoisted
const {
  mockCreateNewNote,
  mockHandleSaveNote,
  mockHandleDeleteNote,
  mockHandleTogglePin,
  mockHandleDuplicateNote,
  mockSetModal,
  mockRemoveToast,
  mockSetIsPreviewVisible,
  mockSortNotes,
  mockDebouncedAutoSave,
  mockHandleOpenNote,
  mockHandleContentChange,
  mockHandleNotebookChange,
  mockHandleMetadataChange,
  mockSetupGlobalErrorHandler,
  mockI18nInitialize,
  mockAppPresentation,
  mockToastContainer,
} = vi.hoisted(() => {
  return {
    mockCreateNewNote: vi.fn(),
    mockHandleSaveNote: vi.fn(),
    mockHandleDeleteNote: vi.fn(),
    mockHandleTogglePin: vi.fn(),
    mockHandleDuplicateNote: vi.fn(),
    mockSetModal: vi.fn(),
    mockRemoveToast: vi.fn(),
    mockSetIsPreviewVisible: vi.fn(),
    mockSortNotes: vi.fn(),
    mockDebouncedAutoSave: vi.fn(),
    mockHandleOpenNote: vi.fn(),
    mockHandleContentChange: vi.fn(),
    mockHandleNotebookChange: vi.fn(),
    mockHandleMetadataChange: vi.fn(),
    mockSetupGlobalErrorHandler: vi.fn(),
    mockI18nInitialize: vi.fn(),
    mockAppPresentation: vi.fn((props: any) => (
      <div data-testid="app-presentation">
        App Presentation
        {props.currentNote && (
          <div data-testid="current-note">{props.currentNote.title}</div>
        )}
        {props.isLoading && <div data-testid="loading">Loading...</div>}
      </div>
    )),
    mockToastContainer: vi.fn(({ toasts, onDismiss }: any) => (
      <div data-testid="toast-container">
        {toasts.map((toast: any) => (
          <div key={toast.id} data-testid={`toast-${toast.id}`}>
            {toast.message}
            <button onClick={() => onDismiss(toast.id)}>Dismiss</button>
          </div>
        ))}
      </div>
    )),
  }
})

// Mock all the hooks
vi.mock('../../../hooks/useSimpleLogic', () => ({
  useAppLogic: vi.fn(() => ({
    currentNote: null,
    selectedNote: null,
    isEditorOpen: false,
    isLoading: false,
    filteredNotes: [],
  })),
  useNoteActions: vi.fn(() => ({
    createNewNote: mockCreateNewNote,
    handleSaveNote: mockHandleSaveNote,
    handleDeleteNote: mockHandleDeleteNote,
    handleTogglePin: mockHandleTogglePin,
    handleDuplicateNote: mockHandleDuplicateNote,
  })),
}))

vi.mock('../../../stores/newSimpleStore', () => ({
  useAppStore: vi.fn(() => ({
    modals: {},
    toasts: [],
    isPreviewVisible: false,
    activeSection: 'notes',
    setModal: mockSetModal,
    removeToast: mockRemoveToast,
    setIsPreviewVisible: mockSetIsPreviewVisible,
    sortNotes: mockSortNotes,
  })),
}))

vi.mock('../../../hooks/useSettings', () => ({
  useSettings: vi.fn(() => ({
    settings: {
      theme: 'light',
      language: 'en',
    },
  })),
}))

vi.mock('../../../hooks/useNotebooks', () => ({
  useNotebooks: vi.fn(() => ({
    notebooks: [],
  })),
}))

vi.mock('../../../hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    debouncedAutoSave: mockDebouncedAutoSave,
  })),
}))

vi.mock('../../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}))

vi.mock('../../../hooks/usePageLifecycle', () => ({
  usePageLifecycle: vi.fn(),
}))

vi.mock('../../../hooks/useAppHandlers', () => ({
  useAppHandlers: vi.fn(() => ({
    handleOpenNote: mockHandleOpenNote,
    handleContentChange: mockHandleContentChange,
    handleNotebookChange: mockHandleNotebookChange,
    handleMetadataChange: mockHandleMetadataChange,
  })),
}))

vi.mock('../../../hooks/useSettingsEffects', () => ({
  useSettingsEffects: vi.fn(),
}))

vi.mock('../../../hooks/useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({})),
}))

vi.mock('../../../utils/errorHandler', () => ({
  setupGlobalErrorHandler: mockSetupGlobalErrorHandler,
}))

vi.mock('../../../services/i18nService', () => ({
  i18nService: {
    initialize: mockI18nInitialize,
  },
}))

vi.mock('../AppPresentation', () => ({
  default: mockAppPresentation,
}))

vi.mock('../../ui/ToastContainer', () => ({
  default: mockToastContainer,
}))

// Import mocked hooks
import { useAppLogic, useNoteActions } from '../../../hooks/useSimpleLogic'
import { useAppStore } from '../../../stores/newSimpleStore'
import { useSettings } from '../../../hooks/useSettings'
import { useNotebooks } from '../../../hooks/useNotebooks'
import { useAutoSave } from '../../../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'
import { usePageLifecycle } from '../../../hooks/usePageLifecycle'
import { useAppHandlers } from '../../../hooks/useAppHandlers'
import { useSettingsEffects } from '../../../hooks/useSettingsEffects'
import { useErrorHandler } from '../../../hooks/useErrorHandler'

// Import the component
import AppContainer from '../AppContainer'

describe('AppContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset all mocks to their default return values
    ;(useAppLogic as any).mockReturnValue({
      currentNote: null,
      selectedNote: null,
      isEditorOpen: false,
      isLoading: false,
      filteredNotes: [],
    })
    ;(useAppStore as any).mockReturnValue({
      modals: {},
      toasts: [],
      isPreviewVisible: false,
      activeSection: 'notes',
      setModal: mockSetModal,
      removeToast: mockRemoveToast,
      setIsPreviewVisible: mockSetIsPreviewVisible,
      sortNotes: mockSortNotes,
    })
    ;(useSettings as any).mockReturnValue({
      settings: {
        theme: 'light',
        language: 'en',
      },
    })
    ;(useNotebooks as any).mockReturnValue({
      notebooks: [],
    })
  })

  it('renders AppPresentation and ToastContainer', () => {
    render(<AppContainer />)

    expect(screen.getByTestId('app-presentation')).toBeInTheDocument()
    expect(screen.getByTestId('toast-container')).toBeInTheDocument()
  })

  it('initializes i18n service on mount', () => {
    render(<AppContainer />)

    expect(mockI18nInitialize).toHaveBeenCalled()
  })

  it('sets up global error handler on mount', () => {
    render(<AppContainer />)

    expect(mockSetupGlobalErrorHandler).toHaveBeenCalled()
  })

  it('passes current note to presentation component', () => {
    const mockNote = { id: '1', title: 'Test Note', content: 'Test content' }
    ;(useAppLogic as any).mockReturnValue({
      currentNote: mockNote,
      selectedNote: null,
      isEditorOpen: false,
      isLoading: false,
      filteredNotes: [],
    })

    render(<AppContainer />)

    expect(screen.getByTestId('current-note')).toHaveTextContent('Test Note')
  })

  it('passes loading state to presentation component', () => {
    ;(useAppLogic as any).mockReturnValue({
      currentNote: null,
      selectedNote: null,
      isEditorOpen: false,
      isLoading: true,
      filteredNotes: [],
    })

    render(<AppContainer />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('renders toasts from store', () => {
    const mockToasts = [
      { id: '1', message: 'Success!', type: 'success' },
      { id: '2', message: 'Error!', type: 'error' },
    ]
    ;(useAppStore as any).mockReturnValue({
      modals: {},
      toasts: mockToasts,
      isPreviewVisible: false,
      activeSection: 'notes',
      setModal: mockSetModal,
      removeToast: mockRemoveToast,
      setIsPreviewVisible: mockSetIsPreviewVisible,
      sortNotes: mockSortNotes,
    })

    render(<AppContainer />)

    expect(screen.getByTestId('toast-1')).toHaveTextContent('Success!')
    expect(screen.getByTestId('toast-2')).toHaveTextContent('Error!')
  })

  it('configures keyboard shortcuts', () => {
    render(<AppContainer />)

    expect(useKeyboardShortcuts).toHaveBeenCalledWith({
      currentNote: null,
      onCreateNew: mockCreateNewNote,
      onSave: expect.any(Function),
      onSearch: expect.any(Function),
      onExport: expect.any(Function),
      onSettings: expect.any(Function),
    })
  })

  it('configures auto-save with debounce', () => {
    render(<AppContainer />)

    expect(useAutoSave).toHaveBeenCalledWith({
      onSave: expect.any(Function),
      debounceMs: 1000,
    })
  })

  it('applies settings effects', () => {
    render(<AppContainer />)

    expect(useSettingsEffects).toHaveBeenCalled()
  })

  it('configures page lifecycle', () => {
    const mockNote = { id: '1', title: 'Test Note', content: 'Test content' }
    ;(useAppLogic as any).mockReturnValue({
      currentNote: mockNote,
      selectedNote: null,
      isEditorOpen: false,
      isLoading: false,
      filteredNotes: [],
    })

    render(<AppContainer />)

    expect(usePageLifecycle).toHaveBeenCalledWith({ currentNote: mockNote })
  })

  it('passes all required props to AppPresentation', () => {
    render(<AppContainer />)

    const callArgs = mockAppPresentation.mock.calls[0][0]

    expect(callArgs).toMatchObject({
      currentNote: null,
      selectedNote: null,
      filteredNotes: [],
      notebooks: [],
      settings: { theme: 'light', language: 'en' },
      isEditorOpen: false,
      isLoading: false,
      isPreviewVisible: false,
      activeSection: 'notes',
      modals: {},
      toasts: [],
      handleOpenNote: mockHandleOpenNote,
      handleContentChange: mockHandleContentChange,
      handleNotebookChange: mockHandleNotebookChange,
      handleMetadataChange: mockHandleMetadataChange,
      createNewNote: mockCreateNewNote,
      handleSaveNote: mockHandleSaveNote,
      handleDeleteNote: mockHandleDeleteNote,
      handleTogglePin: mockHandleTogglePin,
      handleDuplicateNote: mockHandleDuplicateNote,
      setModal: mockSetModal,
      removeToast: mockRemoveToast,
      setIsPreviewVisible: mockSetIsPreviewVisible,
      sortNotes: mockSortNotes,
    })

    expect(callArgs.previewRef).toBeDefined()
    expect(callArgs.previewRef.current).toBe(null)
  })

  it('configures app handlers with correct dependencies', () => {
    const mockFilteredNotes = [{ id: '1', title: 'Note 1' }]
    ;(useAppLogic as any).mockReturnValue({
      currentNote: null,
      selectedNote: null,
      isEditorOpen: false,
      isLoading: false,
      filteredNotes: mockFilteredNotes,
    })

    render(<AppContainer />)

    expect(useAppHandlers).toHaveBeenCalledWith({
      filteredNotes: mockFilteredNotes,
      onSaveNote: expect.any(Function),
      debouncedAutoSave: mockDebouncedAutoSave,
    })
  })

  it('passes notebooks from useNotebooks hook', () => {
    const mockNotebooks = [
      { id: '1', name: 'Work' },
      { id: '2', name: 'Personal' },
    ]
    ;(useNotebooks as any).mockReturnValue({
      notebooks: mockNotebooks,
    })

    render(<AppContainer />)

    const callArgs = mockAppPresentation.mock.calls[0][0]
    expect(callArgs.notebooks).toEqual(mockNotebooks)
  })

  it('handles error handler initialization', () => {
    render(<AppContainer />)

    expect(useErrorHandler).toHaveBeenCalled()
  })

  it('passes correct toast container props', () => {
    const mockToasts = [{ id: '1', message: 'Test toast' }]
    ;(useAppStore as any).mockReturnValue({
      modals: {},
      toasts: mockToasts,
      isPreviewVisible: false,
      activeSection: 'notes',
      setModal: mockSetModal,
      removeToast: mockRemoveToast,
      setIsPreviewVisible: mockSetIsPreviewVisible,
      sortNotes: mockSortNotes,
    })

    render(<AppContainer />)

    const callArgs = mockToastContainer.mock.calls[0][0]
    expect(callArgs).toEqual({
      toasts: mockToasts,
      onDismiss: mockRemoveToast,
      position: 'top-right',
      maxToasts: 5,
    })
  })
})
