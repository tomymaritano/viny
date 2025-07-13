import React, { forwardRef, useCallback } from 'react'
import { useDropdown } from '../../hooks/useDropdown'
import Icons from '../Icons'

interface DropdownOption {
  value: string | number
  label: string
  icon?: string | React.ReactNode
  color?: string
  disabled?: boolean
}

interface DropdownProps {
  trigger?: React.ReactNode
  options?: (string | DropdownOption)[]
  onSelect?: (option: string | DropdownOption, index: number) => void
  value?: string | number | null
  placeholder?: string
  className?: string
  dropdownClassName?: string
  optionClassName?: string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showChevron?: boolean
  closeOnSelect?: boolean
  renderOption?: (
    option: string | DropdownOption, 
    index: number, 
    isFocused: boolean, 
    handleSelect: (option: string | DropdownOption, index: number) => void
  ) => React.ReactNode
  renderTrigger?: (props: { 
    isOpen: boolean
    value: string | number | null
    placeholder: string 
  }) => React.ReactNode
  maxHeight?: string
}

/**
 * Reusable dropdown component with accessibility support
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  trigger,
  options = [],
  onSelect,
  value = null,
  placeholder = 'Select...',
  className = '',
  dropdownClassName = '',
  optionClassName = '',
  disabled = false,
  size = 'sm',
  showChevron = true,
  closeOnSelect = true,
  renderOption = null,
  renderTrigger = null,
  maxHeight = 'max-h-60',
  ...props
}, ref) => {
  const {
    isOpen,
    focusedIndex,
    toggle,
    close,
    handleKeyDown,
    dropdownRef,
    triggerRef,
    setFocusedIndex
  } = useDropdown(false, {
    closeOnEscape: true,
    closeOnClickOutside: true,
    containerSelector: '.dropdown-container'
  })

  // Size variants
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-sm'
  }

  const chevronSizes = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14
  }

  // Handle option selection
  const handleSelect = useCallback((option: string | DropdownOption, index: number) => {
    onSelect?.(option, index)
    if (closeOnSelect) {
      close()
    }
  }, [onSelect, closeOnSelect, close])

  // Handle keyboard navigation
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    const result = handleKeyDown(e, options.length)
    
    // Handle Enter/Space on focused option
    if (typeof result === 'number' && result >= 0) {
      handleSelect(options[result], result)
    }
  }, [handleKeyDown, options, handleSelect])

  // Default option renderer
  const defaultRenderOption = useCallback((option: string | DropdownOption, index: number, isFocused: boolean) => {
    const optionValue = typeof option === 'string' ? option : option.value
    const optionLabel = typeof option === 'string' ? option : option.label
    const optionIcon = typeof option === 'object' ? option.icon : null
    const optionColor = typeof option === 'object' ? option.color : null

    return (
      <button
        key={optionValue || index}
        type="button"
        className={`w-full px-3 py-2 text-left text-xs text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors flex items-center space-x-2 ${
          isFocused ? 'bg-theme-bg-tertiary' : ''
        } ${optionClassName}`}
        onClick={() => handleSelect(option, index)}
        onMouseEnter={() => setFocusedIndex(index)}
        role="option"
        aria-selected={value === optionValue}
      >
        {optionIcon && (
          <span className="opacity-75 flex-shrink-0">
            {React.isValidElement(optionIcon) ? optionIcon : 
              (typeof optionIcon === 'string' && Icons[optionIcon as keyof typeof Icons] ? React.createElement(Icons[optionIcon as keyof typeof Icons], { size: 12 }) : null)
            }
          </span>
        )}
        {optionColor && (
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${optionColor}`} />
        )}
        <span className="flex-1 truncate">{optionLabel}</span>
      </button>
    )
  }, [optionClassName, handleSelect, setFocusedIndex, value])

  // Default trigger renderer
  const defaultRenderTrigger = useCallback(() => {
    const selectedOption = options.find(opt => 
      (typeof opt === 'string' ? opt : opt.value) === value
    )
    const displayText = selectedOption 
      ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
      : placeholder

    return (
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {selectedOption && typeof selectedOption === 'object' && selectedOption.icon && (
          <span className="opacity-75 flex-shrink-0">
            {React.isValidElement(selectedOption.icon) ? 
              selectedOption.icon : 
              (typeof selectedOption.icon === 'string' && Icons[selectedOption.icon as keyof typeof Icons] ? React.createElement(Icons[selectedOption.icon as keyof typeof Icons], { size: chevronSizes[size] }) : null)
            }
          </span>
        )}
        {selectedOption && typeof selectedOption === 'object' && selectedOption.color && (
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedOption.color}`} />
        )}
        <span className="truncate flex-1 text-left">{displayText}</span>
        {showChevron && (
          <Icons.ChevronDown 
            size={chevronSizes[size]} 
            className={`transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </div>
    )
  }, [options, value, placeholder, showChevron, size, chevronSizes, isOpen])

  return (
    <div className={`relative dropdown-container ${className}`} ref={ref} {...props}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={`flex items-center justify-between w-full ${sizeClasses[size]} bg-transparent text-theme-text-muted rounded-xl hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-opacity-50 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        aria-label={placeholder}
      >
        {renderTrigger ? renderTrigger({ isOpen, value, placeholder }) : defaultRenderTrigger()}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-full left-0 mt-1 w-full min-w-fit bg-theme-bg-secondary border border-theme-border-primary rounded-md shadow-lg py-1 z-50 ${maxHeight} overflow-y-auto ${dropdownClassName}`}
          role="listbox"
          aria-label={`${placeholder} options`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-theme-text-muted italic text-center">
              No options available
            </div>
          ) : (
            options.map((option, index) => {
              const isFocused = index === focusedIndex
              return renderOption 
                ? renderOption(option, index, isFocused, handleSelect)
                : defaultRenderOption(option, index, isFocused)
            })
          )}
        </div>
      )}
    </div>
  )
})

Dropdown.displayName = 'Dropdown'

export default Dropdown
