import React, { useState, useEffect, useRef, ReactNode, useMemo } from 'react'

interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
  description?: string
  disabled?: boolean
  color?: string
}

interface DropdownSection {
  title?: string
  options: DropdownOption[]
}

// Simple dropdown item for contextual menus
interface DropdownItem {
  icon?: ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'default' | 'danger'
  type?: 'item' | 'separator'
}

interface StandardDropdownProps {
  trigger?: ReactNode
  sections?: DropdownSection[]
  items?: DropdownItem[]
  onSelect?: (value: string) => void
  selectedValue?: string
  placeholder?: string
  disabled?: boolean
  width?: 'auto' | 'trigger' | 'full' | 'sm' | 'md' | 'lg' | number
  maxHeight?: number
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  showSearch?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  isOpen?: boolean
  onClose?: () => void
  style?: React.CSSProperties
}

const StandardDropdown: React.FC<StandardDropdownProps> = ({
  trigger,
  sections,
  items,
  onSelect,
  selectedValue,
  disabled = false,
  width = 'auto',
  maxHeight = 320,
  position = 'bottom-left',
  showSearch = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options available',
  className = '',
  isOpen: isOpenProp,
  onClose,
  style
}) => {
  const [isOpenState, setIsOpenState] = useState(false)
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState
  const setIsOpen = isOpenProp !== undefined ? (open: boolean) => { if (!open && onClose) onClose() } : setIsOpenState
  
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens and reset focus
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1)
      if (showSearch && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }
  }, [isOpen, showSearch])

  // Reset focused index when search term changes
  useEffect(() => {
    setFocusedIndex(-1)
  }, [searchTerm])

  // Filter options based on search term
  const filteredSections = sections ? sections.map(section => ({
    ...section,
    options: section.options.filter(option =>
      !searchTerm || 
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.options.length > 0) : []

  // Get all selectable options for keyboard navigation
  const selectableOptions = useMemo(() => {
    const allOptions: DropdownOption[] = []
    if (items) {
      // Convert items to options format for unified handling
      items.forEach(item => {
        if (item.type !== 'separator') {
          allOptions.push({
            value: item.label,
            label: item.label,
            icon: item.icon
          })
        }
      })
    } else {
      filteredSections.forEach(section => {
        section.options.forEach(option => {
          if (!option.disabled) {
            allOptions.push(option)
          }
        })
      })
    }
    return allOptions
  }, [items, filteredSections])

  const handleSelect = (value: string) => {
    onSelect?.(value)
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => {
            const maxIndex = selectableOptions.length - 1
            return prev < maxIndex ? prev + 1 : 0
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => {
            const maxIndex = selectableOptions.length - 1
            return prev > 0 ? prev - 1 : maxIndex
          })
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < selectableOptions.length) {
            const selectedOption = selectableOptions[focusedIndex]
            if (items) {
              // Handle items (context menu)
              const correspondingItem = items.find(item => item.label === selectedOption.label && item.type !== 'separator')
              if (correspondingItem) {
                correspondingItem.onClick({} as React.MouseEvent)
                setIsOpen(false)
              }
            } else {
              // Handle regular options
              handleSelect(selectedOption.value)
            }
          }
          break
        case 'Home':
          event.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setFocusedIndex(selectableOptions.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, focusedIndex, selectableOptions, items, handleSelect])

  // Get the global index of an option for focus management
  const getOptionGlobalIndex = (sectionIndex: number, optionIndex: number) => {
    let globalIndex = 0
    for (let i = 0; i < sectionIndex; i++) {
      globalIndex += filteredSections[i].options.filter(opt => !opt.disabled).length
    }
    
    let validOptionsInCurrentSection = 0
    for (let i = 0; i < optionIndex; i++) {
      if (!filteredSections[sectionIndex].options[i].disabled) {
        validOptionsInCurrentSection++
      }
    }
    
    return globalIndex + validOptionsInCurrentSection
  }

  // Get the global index of an item for focus management
  const getItemGlobalIndex = (itemIndex: number) => {
    let globalIndex = 0
    for (let i = 0; i < itemIndex; i++) {
      if (items?.[i]?.type !== 'separator') {
        globalIndex++
      }
    }
    return globalIndex
  }

  const getWidthClass = () => {
    if (typeof width === 'number') return `w-${width}`
    switch (width) {
      case 'full': return 'w-full'
      case 'trigger': return 'w-full'
      case 'sm': return 'min-w-40'
      case 'md': return 'min-w-48'
      case 'lg': return 'min-w-56'
      case 'auto':
      default: return 'min-w-48'
    }
  }

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-right': return 'right-0 top-full'
      case 'top-left': return 'left-0 bottom-full'
      case 'top-right': return 'right-0 bottom-full'
      case 'bottom-left':
      default: return 'left-0 top-full'
    }
  }

  const hasOptions = filteredSections.some(section => section.options.length > 0)
  const hasItems = items && items.length > 0

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      {trigger && (
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        >
          {trigger}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`${style?.left !== undefined || style?.top !== undefined ? 'fixed' : 'absolute'} ${getPositionClass()} ${getWidthClass()} ${style?.left === undefined && style?.top === undefined ? 'mt-1' : ''} 
            bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl
            backdrop-blur-sm z-50 overflow-hidden transition-all duration-200
            animate-in fade-in slide-in-from-top-2`}
          style={{ maxHeight: `${maxHeight}px`, ...style }}
        >
          {/* Search Input */}
          {showSearch && (
            <div className="p-3 border-b border-theme-border-primary">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-tertiary border border-theme-border-secondary 
                  rounded-md text-sm text-theme-text-primary placeholder-theme-text-muted
                  focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
              />
            </div>
          )}

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: showSearch ? `${maxHeight - 70}px` : `${maxHeight}px` }}>
            {/* Render items if provided (for contextual menus) */}
            {hasItems ? (
              <div className="py-1">
                {items?.map((item, index) => {
                  const globalIndex = item.type !== 'separator' ? getItemGlobalIndex(index) : -1
                  const isFocused = globalIndex === focusedIndex
                  
                  return item.type === 'separator' ? (
                    <div key={index} className="h-px bg-theme-border-primary my-1" />
                  ) : (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                        transition-colors duration-150
                        ${isFocused ? 'bg-theme-bg-tertiary ring-2 ring-theme-accent-primary/50' : ''}
                        ${item.variant === 'danger' 
                          ? 'text-red-400 hover:bg-red-500/10' 
                          : 'text-theme-text-primary hover:bg-theme-bg-tertiary'
                        }`}
                    >
                      {item.icon && (
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                      )}
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ) : !hasOptions ? (
              <div className="px-3 py-4 text-sm text-theme-text-muted text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Title */}
                  {section.title && (
                    <div className="px-3 py-2 text-xs font-medium text-theme-text-muted uppercase tracking-wider border-b border-theme-border-primary bg-theme-bg-tertiary/50">
                      {section.title}
                    </div>
                  )}

                  {/* Section Options */}
                  <div className="py-1">
                    {section.options.map((option, optionIndex) => {
                      const globalIndex = !option.disabled ? getOptionGlobalIndex(sectionIndex, optionIndex) : -1
                      const isFocused = globalIndex === focusedIndex
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => !option.disabled && handleSelect(option.value)}
                          disabled={option.disabled}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left
                            transition-colors duration-150
                            ${isFocused ? 'bg-theme-bg-tertiary ring-2 ring-theme-accent-primary/50' : ''}
                            ${option.disabled 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-theme-bg-tertiary hover:text-theme-text-primary cursor-pointer'
                            }
                            ${selectedValue === option.value 
                              ? 'bg-theme-bg-tertiary text-theme-accent-primary font-medium' 
                              : 'text-theme-text-primary'
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {option.icon && (
                              <div className="flex-shrink-0">
                                {option.icon}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-theme-text-muted truncate">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {option.color && (
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: option.color }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardDropdown