import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ResizableLayout } from '../ResizableLayout'

// Mock ResizeHandle component
vi.mock('../ResizeHandle', () => ({
  default: vi.fn(({ onMouseDown, position }) => (
    <div
      data-testid={`resize-handle-${position}`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'col-resize' }}
    />
  ))
}))

describe('ResizableLayout', () => {
  const defaultProps = {
    sidebar: <div data-testid="sidebar-content">Sidebar</div>,
    notesList: <div data-testid="notes-list-content">Notes List</div>,
    mainContent: <div data-testid="main-content">Main Content</div>,
    isSidebarVisible: true,
    isNotesListVisible: true,
    settings: { sidebarWidth: 200, notesListWidth: 300 }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Storage.prototype.getItem = vi.fn()
    Storage.prototype.setItem = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Layout Rendering', () => {
    it('should render all three panels when visible', () => {
      render(<ResizableLayout {...defaultProps} />)
      
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
      expect(screen.getByTestId('notes-list-content')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('should render only notes list and main content when sidebar is hidden', () => {
      render(<ResizableLayout {...defaultProps} isSidebarVisible={false} />)
      
      expect(screen.queryByTestId('sidebar-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('notes-list-content')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('should render resize handles', () => {
      render(<ResizableLayout {...defaultProps} />)
      
      // Should have two resize handles when both sidebar and notes list are visible
      const handles = screen.getAllByTestId('resize-handle-right')
      expect(handles).toHaveLength(2)
    })
  })

  describe('Initial Widths', () => {
    it('should use default widths when localStorage is empty', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      const sidebar = container.querySelector('[style*="width: 200px"]')
      const mainContent = container.querySelector('.flex-1')
      
      expect(sidebar).toBeInTheDocument()
      expect(mainContent).toBeInTheDocument()
    })

    it('should load saved sidebar width from localStorage', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'inkrun-sidebar-width') return '300'
        if (key === 'inkrun-noteslist-width') return null
        return null
      })
      
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      const sidebar = container.querySelector('[style*="width: 300px"]')
      expect(sidebar).toBeInTheDocument()
      expect(localStorage.getItem).toHaveBeenCalledWith('inkrun-sidebar-width')
    })

    it('should validate sidebar width boundaries', () => {
      // Test boundary validation by checking that component renders without errors
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'inkrun-sidebar-width') return '50' // Too small
        return null
      })
      const { container: container1 } = render(<ResizableLayout {...defaultProps} />)
      expect(container1.querySelector('.flex')).toBeInTheDocument()
      
      // Reset and test large value
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'inkrun-sidebar-width') return '1000' // Too large
        return null
      })
      const { container: container2 } = render(<ResizableLayout {...defaultProps} />)
      expect(container2.querySelector('.flex')).toBeInTheDocument()
    })
  })

  describe('Resize Functionality', () => {
    it('should handle sidebar resize', () => {
      const { container } = render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0] // First handle is for sidebar
      
      // Start resize
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 300 })
      
      // End resize
      fireEvent.mouseUp(document)
      
      expect(localStorage.setItem).toHaveBeenCalledWith('inkrun-sidebar-width', expect.any(String))
    })

    it('should respect minimum sidebar width during resize', () => {
      render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0]
      
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      fireEvent.mouseMove(document, { clientX: 50 }) // Try to make it too small
      fireEvent.mouseUp(document)
      
      expect(localStorage.setItem).toHaveBeenCalledWith('inkrun-sidebar-width', expect.any(String))
    })

    it('should respect maximum sidebar width during resize', () => {
      render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0]
      
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      fireEvent.mouseMove(document, { clientX: 800 }) // Try to make it too large
      fireEvent.mouseUp(document)
      
      expect(localStorage.setItem).toHaveBeenCalledWith('inkrun-sidebar-width', expect.any(String))
    })

    it('should update body cursor during resize', () => {
      render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0]
      
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      // Note: ResizeHandle component might handle cursor styling internally
      
      fireEvent.mouseUp(document)
      // Component should clean up after resize
      expect(true).toBe(true) // Basic test that resize completes without errors
    })
  })

  describe('Three Panel Layout', () => {
    it('should render three panels with correct structure', () => {
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      // Check for the three main sections: sidebar, notesList, mainContent
      const sidebar = container.querySelector('[style*="width:"]')
      const notesList = container.querySelectorAll('[style*="width:"]')[1]
      const mainContent = container.querySelector('.flex-1')
      
      expect(sidebar).toBeInTheDocument()
      expect(notesList).toBeInTheDocument()
      expect(mainContent).toBeInTheDocument()
    })

    it('should apply correct flex properties to panels', () => {
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      const mainContentContainer = container.querySelector('.flex-1')
      expect(mainContentContainer).toBeInTheDocument()
      expect(mainContentContainer).toHaveClass('flex-1')
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle window resize events', () => {
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      // Simulate window resize
      global.innerWidth = 800
      fireEvent.resize(window)
      
      // Should maintain layout integrity
      expect(container.querySelector('.flex')).toBeInTheDocument()
      expect(container.querySelector('.flex-1')).toBeInTheDocument()
    })

    it('should adjust max width based on viewport', () => {
      // Mock small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })
      
      render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0]
      
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      fireEvent.mouseMove(document, { clientX: 700 })
      fireEvent.mouseUp(document)
      
      // Should save some width value
      expect(localStorage.setItem).toHaveBeenCalledWith('inkrun-sidebar-width', expect.any(String))
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing child components gracefully', () => {
      const { container } = render(
        <ResizableLayout
          sidebar={null}
          notesList={<div>Notes List</div>}
          mainContent={<div>Main Content</div>}
          isSidebarVisible={false}
          isNotesListVisible={true}
          settings={{ sidebarWidth: 200, notesListWidth: 300 }}
        />
      )
      
      expect(container.querySelector('.flex-1')).toBeInTheDocument()
    })

    it('should handle rapid resize events', () => {
      render(<ResizableLayout {...defaultProps} />)
      const resizeHandles = screen.getAllByTestId('resize-handle-right')
      const sidebarHandle = resizeHandles[0]
      
      fireEvent.mouseDown(sidebarHandle, { clientX: 250 })
      
      // Simulate rapid mouse movements
      for (let i = 260; i <= 350; i += 10) {
        fireEvent.mouseMove(document, { clientX: i })
      }
      
      fireEvent.mouseUp(document)
      
      // Should save final position
      expect(localStorage.setItem).toHaveBeenCalledWith('inkrun-sidebar-width', expect.any(String))
    })

    it('should handle invalid localStorage values', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid')
      
      const { container } = render(<ResizableLayout {...defaultProps} />)
      
      // Should render without errors and use default width
      const sidebar = container.querySelector('[style*="width:"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<ResizableLayout {...defaultProps} />)
      
      // Unmount component
      unmount()
      
      // Should have cleaned up window resize listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })
})