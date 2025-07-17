import { useState, useCallback, useEffect, useRef } from 'react'

interface DropdownOptions {
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  containerSelector?: string
}

interface DropdownReturn {
  isOpen: boolean
  focusedIndex: number
  open: () => void
  close: () => void
  toggle: () => void
  handleKeyDown: (e: KeyboardEvent, optionsLength?: number) => number | void
  dropdownRef: React.RefObject<HTMLElement | null>
  triggerRef: React.RefObject<HTMLElement | null>
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>
}

/**
 * Custom hook for dropdown management with accessibility and keyboard navigation
 * @param initialState - Initial open/closed state
 * @param options - Configuration options
 * @returns Dropdown state and handlers
 */
export const useDropdown = (
  initialState = false, 
  options: DropdownOptions = {}
): DropdownReturn => {
  const {
    closeOnEscape = true,
    closeOnClickOutside = true,
    containerSelector = '.dropdown-container',
  } = options

  const [isOpen, setIsOpen] = useState(initialState)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLElement>(null)

  // Basic handlers
  const open = useCallback(() => {
    setIsOpen(true)
    setFocusedIndex(-1)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setFocusedIndex(-1)
    // Return focus to trigger
    if (triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, optionsLength = 0) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          if (closeOnEscape) {
            e.preventDefault()
            close()
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev => (prev < optionsLength - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : optionsLength - 1))
          break
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0) {
            e.preventDefault()
            // This will be handled by the specific dropdown implementation
            return focusedIndex
          }
          break
        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setFocusedIndex(optionsLength - 1)
          break
      }
    },
    [isOpen, focusedIndex, closeOnEscape, close]
  )

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const container = target.closest(containerSelector)
      const dropdown = dropdownRef.current

      // Close if clicking outside the dropdown container
      if (!container && !dropdown?.contains(target)) {
        close()
      }
    }

    // Use capture phase to handle before other click handlers
    document.addEventListener('mousedown', handleClickOutside, true)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside, true)
  }, [isOpen, closeOnClickOutside, containerSelector, close])

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Focus the dropdown container for keyboard navigation
      const focusableElements = dropdownRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0 && focusedIndex >= 0) {
        const element = focusableElements[focusedIndex] as HTMLElement
        element?.focus()
      }
    }
  }, [isOpen, focusedIndex])

  return {
    isOpen,
    focusedIndex,
    open,
    close,
    toggle,
    handleKeyDown,
    dropdownRef,
    triggerRef,
    setFocusedIndex,
  }
}

