import type { ReactNode } from 'react'
import React, { useState, useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './DropdownMenuRadix'
import { cn } from '../../lib/utils'

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
  testId?: string
}

interface StandardDropdownRadixProps {
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
  'data-testid'?: string
}

const StandardDropdownRadix: React.FC<StandardDropdownRadixProps> = ({
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
  style,
  'data-testid': testId,
}) => {
  const [isOpenState, setIsOpenState] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Use controlled state if provided, otherwise use internal state
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState
  const setIsOpen =
    isOpenProp !== undefined
      ? (open: boolean) => {
          if (!open && onClose) onClose()
        }
      : setIsOpenState

  // Filter options based on search term
  const filteredSections = sections
    ? sections
        .map(section => ({
          ...section,
          options: section.options.filter(
            option =>
              !searchTerm ||
              option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              option.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          ),
        }))
        .filter(section => section.options.length > 0)
    : []

  const handleSelect = (value: string) => {
    onSelect?.(value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleItemClick = (item: DropdownItem) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      
      // Execute the action immediately
      item.onClick(e)
      
      // Then close the menu
      setIsOpen(false)
    }
  }

  const getWidthClass = () => {
    if (typeof width === 'number') return `w-${width}`
    switch (width) {
      case 'full':
        return 'w-full'
      case 'trigger':
        return 'w-full'
      case 'sm':
        return 'min-w-40'
      case 'md':
        return 'min-w-48'
      case 'lg':
        return 'min-w-56'
      case 'auto':
      default:
        return 'min-w-48'
    }
  }

  const getSide = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom'
      case 'top-left':
        return 'top'
      case 'top-right':
        return 'top'
      case 'bottom-left':
      default:
        return 'bottom'
    }
  }

  const getAlign = () => {
    switch (position) {
      case 'bottom-right':
      case 'top-right':
        return 'end'
      case 'bottom-left':
      case 'top-left':
      default:
        return 'start'
    }
  }

  const hasOptions = filteredSections.some(
    section => section.options.length > 0
  )
  const hasItems = items && items.length > 0

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      {trigger && (
        <DropdownMenuTrigger asChild disabled={disabled} className={className}>
          <div
            className={
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }
          >
            {trigger}
          </div>
        </DropdownMenuTrigger>
      )}

      {/* Dropdown Menu */}
      <DropdownMenuContent
        side={getSide()}
        align={getAlign()}
        className={cn(
          getWidthClass(),
          'overflow-hidden',
          style?.left !== undefined || style?.top !== undefined ? 'fixed' : ''
        )}
        style={{
          maxHeight: `${maxHeight}px`,
          ...style,
        }}
        data-testid={testId}
      >
        {/* Search Input */}
        {showSearch && (
          <div className="p-3 border-b border-theme-border-primary">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-tertiary border border-theme-border-secondary 
                rounded-md text-sm text-theme-text-primary placeholder-theme-text-muted
                focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: showSearch ? `${maxHeight - 70}px` : `${maxHeight}px`,
          }}
        >
          {/* Render items if provided (for contextual menus) */}
          {hasItems ? (
            items?.map((item, index) => {
              return item.type === 'separator' ? (
                <DropdownMenuSeparator key={index} />
              ) : (
                <DropdownMenuItem
                  key={index}
                  onClick={handleItemClick(item)}
                  className={cn(
                    'flex items-center gap-3 cursor-pointer',
                    item.variant === 'danger'
                      ? 'text-red-400 focus:text-red-300'
                      : 'text-theme-text-primary'
                  )}
                  data-testid={item.testId}
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              )
            })
          ) : !hasOptions ? (
            <div className="px-3 py-4 text-sm text-theme-text-muted text-center">
              {emptyMessage}
            </div>
          ) : (
            filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {/* Section Title */}
                {section.title && (
                  <DropdownMenuLabel className="text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                    {section.title}
                  </DropdownMenuLabel>
                )}

                {/* Section Options */}
                {section.options.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                    disabled={option.disabled}
                    className={cn(
                      'flex items-center justify-between cursor-pointer',
                      selectedValue === option.value
                        ? 'bg-theme-bg-tertiary text-theme-accent-primary font-medium'
                        : 'text-theme-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
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
                  </DropdownMenuItem>
                ))}

                {/* Add separator between sections except the last one */}
                {sectionIndex < filteredSections.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default StandardDropdownRadix
