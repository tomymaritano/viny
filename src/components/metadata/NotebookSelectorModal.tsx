import React, {
  useState,
  useRef,
  useEffect,
  useTransition,
  useMemo,
} from 'react'
import { Icons } from '../Icons'
import CreateNotebookModal from '../ui/CreateNotebookModal'
// ManageNotebooksModal import removed - now handled in Settings
import IconButton from '../ui/IconButton'
import { StandardModal } from '../ui/StandardModal'
import { useNotebooks } from '../../hooks/useNotebooks'
import { cn } from '../../lib/utils'
import { logger } from '../../utils/logger'
import {
  fuzzySearch,
  highlightMatches,
  SearchCache,
  type HighlightedText,
} from '../../utils/searchUtils'

interface NotebookOption {
  value: string
  label: string
  level?: number
  color?: string
  id?: string
  hasChildren?: boolean
  parentId?: string | null
  count?: number // Add count for compatibility with NotebookWithCounts
}

interface NotebookSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedNotebook?: string
  notebooks: NotebookOption[]
  onSelect: (notebook: string) => void
  disabled?: boolean
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Initialize search cache for performance optimization
const searchCache = new SearchCache<NotebookOption>(100)

const NotebookSelectorModal: React.FC<NotebookSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedNotebook,
  notebooks,
  onSelect,
  disabled = false,
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  // showManageModal removed - now handled in Settings
  const [isPending, startTransition] = useTransition()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { createNotebook, notebooks: allNotebooks } = useNotebooks()

  // Debounce search for performance
  const debouncedSearch = useDebounce(searchValue, 300)

  // Check if search term can be created (no exact match)
  const canCreateFromSearch = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim()
    if (!trimmedSearch) return false

    // Check if there's an exact match (case insensitive)
    const hasExactMatch = notebooks.some(
      nb =>
        nb.label?.toLowerCase() === trimmedSearch.toLowerCase() ||
        nb.name?.toLowerCase() === trimmedSearch.toLowerCase()
    )

    return !hasExactMatch
  }, [debouncedSearch, notebooks])

  // Advanced fuzzy search with hierarchy awareness
  const filteredNotebooks = useMemo(() => {
    if (!debouncedSearch.trim()) {
      // When not searching, show hierarchy with collapsed/expanded state
      const result: NotebookOption[] = []

      notebooks.forEach(notebook => {
        const level = notebook.level || 0

        // Always show root level (level 0)
        if (level === 0) {
          result.push(notebook)
        }
        // Show level 1+ only if parent is expanded
        else if (level > 0) {
          // Check if ALL parents in the path are expanded
          let shouldShow = true
          let currentNotebook = notebook

          // Walk up the parent chain
          while (currentNotebook && currentNotebook.parentId) {
            const parentNotebook = notebooks.find(
              nb => nb.id === currentNotebook.parentId
            )
            if (parentNotebook) {
              // If any parent is not expanded, don't show this notebook
              if (
                !expandedNodes.has(parentNotebook.id || parentNotebook.value)
              ) {
                shouldShow = false
                break
              }
              currentNotebook = parentNotebook
            } else {
              break
            }
          }

          if (shouldShow) {
            result.push(notebook)
          }
        }
      })

      return result.slice(0, 50)
    }

    // When searching, use fuzzy search and show all matches regardless of hierarchy
    const searchResults = searchCache.search(
      notebooks,
      debouncedSearch,
      (items, query) =>
        fuzzySearch(items, query, item => `${item.label} ${item.value}`, {
          threshold: 0.2,
          maxResults: 30,
          caseSensitive: false,
        }),
      `${debouncedSearch}_${notebooks.length}`
    )

    return searchResults
  }, [notebooks, debouncedSearch, expandedNodes])

  // Options without create action (moved to inline button)
  const enhancedOptions = useMemo(() => {
    // Just return filtered notebooks, no create option in list
    return filteredNotebooks
  }, [filteredNotebooks])

  // Initialize expanded state - only expand path to selected notebook
  useEffect(() => {
    if (isOpen && notebooks.length > 0 && selectedNotebook) {
      // Find the selected notebook and expand only its parent path
      const selectedNb = notebooks.find(
        nb => nb.value === selectedNotebook || nb.name === selectedNotebook
      )

      if (selectedNb) {
        const pathToExpand = new Set<string>()

        // Walk up the parent chain and add all parents to expansion set
        let currentNotebook = selectedNb
        while (currentNotebook && currentNotebook.parentId) {
          const parentNotebook = notebooks.find(
            nb => nb.id === currentNotebook.parentId
          )
          if (parentNotebook) {
            pathToExpand.add(parentNotebook.id || parentNotebook.value)
            currentNotebook = parentNotebook
          } else {
            break
          }
        }

        logger.info(
          '🎯 Expanding path to selected:',
          selectedNotebook,
          pathToExpand
        )
        setExpandedNodes(pathToExpand)
      } else {
        // No selection, start collapsed
        setExpandedNodes(new Set())
      }
    } else {
      // No selection or modal closed, start collapsed
      setExpandedNodes(new Set())
    }
  }, [isOpen, notebooks, selectedNotebook])

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchValue('')
      setSelectedIndex(0)
      // Focus search input after a short delay to ensure modal is rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Toggle expand/collapse of notebook nodes
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // Handle input changes with transition for performance
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)

    startTransition(() => {
      setSelectedIndex(0)
    })
  }

  // Handle keyboard navigation with create shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < enhancedOptions.length - 1 ? prev + 1 : 0
        )
        scrollToSelectedItem()
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : enhancedOptions.length - 1
        )
        scrollToSelectedItem()
        break
      case 'Enter':
        e.preventDefault()
        // Ctrl/Cmd + Enter to create new category
        if ((e.ctrlKey || e.metaKey) && canCreateFromSearch) {
          handleCreateModalOpen()
        } else if (
          selectedIndex >= 0 &&
          selectedIndex < enhancedOptions.length
        ) {
          handleOptionSelect(enhancedOptions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  // Scroll to keep selected item visible
  const scrollToSelectedItem = () => {
    setTimeout(() => {
      const selectedElement = listRef.current?.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }, 0)
  }

  // Handle option selection (simplified)
  const handleOptionSelect = (option: NotebookOption) => {
    onSelect(option.value)
    onClose()
  }

  // Handle create notebook with better modal UX flow
  const handleCreateNotebook = (
    name: string,
    color: string,
    parentId?: string | null
  ) => {
    createNotebook({ name, color, parentId })
    onSelect(name)
    setShowCreateModal(false)
    // Close the main modal after successful creation
    onClose()
  }

  // Handle closing create modal - restore main modal
  const handleCreateModalClose = () => {
    setShowCreateModal(false)
    // Don't restore main modal automatically, user explicitly closed
  }

  // Handle opening create modal - close main modal
  const handleCreateModalOpen = () => {
    // Close main modal when opening create modal for better UX
    onClose()
    setShowCreateModal(true)
  }

  // Manage modal handlers removed - functionality moved to Settings

  // Enhanced text highlighting using searchUtils
  const renderHighlightedText = (text: string, search: string) => {
    if (!search.trim()) return text

    const highlights = highlightMatches(text, search)
    return highlights.map((segment: HighlightedText, index: number) =>
      segment.highlighted ? (
        <mark
          key={index}
          className="bg-theme-accent-primary/20 text-theme-accent-primary font-medium"
        >
          {segment.text}
        </mark>
      ) : (
        <span key={index}>{segment.text}</span>
      )
    )
  }

  // Get notebook color indicator
  const getNotebookColor = (option: NotebookOption) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      yellow: '#eab308',
      red: '#ef4444',
      purple: '#a855f7',
      magenta: '#a855f7',
      cyan: '#06b6d4',
      teal: '#14b8a6',
      indigo: '#6366f1',
      pink: '#ec4899',
    }

    return colorMap[option.color || 'blue'] || '#3b82f6'
  }

  // Handle node expansion click
  const handleNodeClick = (e: React.MouseEvent, option: NotebookOption) => {
    e.stopPropagation()
    if (option.hasChildren) {
      toggleNodeExpansion(option.id || option.value)
    }
  }

  return (
    <>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Category"
        size="large"
        closeOnEscape={true}
        closeOnBackdrop={true}
        className="max-w-2xl"
        footer={
          <div className="flex items-center justify-center w-full">
            <div className="text-xs text-theme-text-muted">
              Press <span className="font-medium">Enter</span> to select •{' '}
              <span className="font-medium">Esc</span> to close
            </div>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          {/* Categories count */}
          {searchValue && enhancedOptions.length > 0 && (
            <div className="text-sm text-theme-text-muted">
              {filteredNotebooks.length}{' '}
              {filteredNotebooks.length === 1 ? 'category' : 'categories'} found
            </div>
          )}

          {/* Search Bar with inline Create button */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted">
              <Icons.Search size={16} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                searchValue
                  ? 'Search categories...'
                  : 'Search categories or create new...'
              }
              disabled={disabled}
              className={cn(
                'w-full pl-10 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent transition-colors',
                canCreateFromSearch ? 'pr-24' : 'pr-10'
              )}
            />

            {/* Inline Create button when search can create new category */}
            {canCreateFromSearch && (
              <button
                onClick={handleCreateModalOpen}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-xs bg-theme-accent-primary text-white rounded-md hover:bg-theme-accent-primary/90 transition-colors"
                title={`Create "${debouncedSearch}" category`}
              >
                <Icons.Plus size={12} />
                Create
              </button>
            )}

            {/* Clear button */}
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary transition-colors"
              >
                <Icons.X size={14} />
              </button>
            )}

            {/* Quick create button when input is empty */}
            {!searchValue && (
              <button
                onClick={handleCreateModalOpen}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-accent-primary transition-colors"
                title="Create new category"
              >
                <Icons.Plus size={16} />
              </button>
            )}
          </div>

          {/* Categories List */}
          <div ref={listRef} className="max-h-96 overflow-y-auto">
            {isPending && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-theme-accent-primary border-t-transparent" />
                <span className="ml-3 text-sm text-theme-text-muted">
                  Searching...
                </span>
              </div>
            )}

            {!isPending && enhancedOptions.length === 0 && (
              <div className="p-8 text-center">
                {debouncedSearch.trim() ? (
                  /* No results for search */
                  <>
                    <Icons.Search
                      size={32}
                      className="mx-auto text-theme-text-muted mb-3"
                    />
                    <p className="text-sm text-theme-text-muted mb-2">
                      No categories found for "{debouncedSearch}"
                    </p>
                    {canCreateFromSearch && (
                      <>
                        <p className="text-xs text-theme-text-muted mb-4">
                          Would you like to create this category instead?
                        </p>
                        <button
                          onClick={handleCreateModalOpen}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors text-sm"
                        >
                          <Icons.Plus size={14} />
                          Create "{debouncedSearch}"
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  /* No categories at all */
                  <>
                    <Icons.Book
                      size={32}
                      className="mx-auto text-theme-text-muted mb-3"
                    />
                    <p className="text-sm text-theme-text-muted mb-2">
                      No categories yet
                    </p>
                    <p className="text-xs text-theme-text-muted mb-4">
                      Create your first category to organize your notes
                    </p>
                    <button
                      onClick={handleCreateModalOpen}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors text-sm"
                    >
                      <Icons.Plus size={14} />
                      Create Category
                    </button>
                  </>
                )}
              </div>
            )}

            {!isPending &&
              enhancedOptions.map((option, index) => {
                const isSpecial = false // No special options in list anymore
                const level = option.level || 0
                const isSelected = index === selectedIndex
                const isCurrentlySelected = option.value === selectedNotebook
                const hasChildren = option.hasChildren && !isSpecial
                const isExpanded = expandedNodes.has(option.id || option.value)
                const isSearching = debouncedSearch.trim().length > 0

                return (
                  <div
                    key={`${option.value}-${index}`}
                    className={cn(
                      'flex items-center w-full text-sm transition-colors relative',
                      isSelected
                        ? 'bg-theme-accent-primary/10'
                        : 'hover:bg-theme-bg-tertiary'
                      // Special option styling removed
                    )}
                    data-index={index}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {/* Expand/Collapse button for categories with children */}
                    {!isSearching && (
                      <div
                        style={{ marginLeft: `${level * 20}px` }}
                        className="flex items-center flex-shrink-0"
                      >
                        {hasChildren ? (
                          <IconButton
                            icon={({ size, ...iconProps }) => (
                              <Icons.ChevronRight
                                size={size}
                                className={cn(
                                  'transition-transform duration-150',
                                  isExpanded && 'rotate-90'
                                )}
                                {...iconProps}
                              />
                            )}
                            onClick={e =>
                              handleNodeClick(e as React.MouseEvent, option)
                            }
                            variant="ghost"
                            size={12}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                            aria-label={
                              isExpanded
                                ? 'Collapse category'
                                : 'Expand category'
                            }
                            className="mr-1 hover:bg-theme-bg-tertiary hover:text-theme-text-primary rounded-sm p-1"
                          />
                        ) : (
                          <div className="w-6 mr-1" />
                        )}
                      </div>
                    )}

                    {/* Main selection button */}
                    <button
                      onClick={() => handleOptionSelect(option)}
                      className={cn(
                        'flex-1 text-left px-3 py-2.5 border-none transition-colors',
                        isSelected
                          ? 'text-theme-accent-primary'
                          : 'text-theme-text-secondary hover:text-theme-text-primary',
                        // Special option styling removed
                        isCurrentlySelected &&
                          !isSpecial &&
                          'text-theme-accent-primary'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Special option icons removed - no special options in list */}

                        {/* Color indicator removed for cleaner look */}

                        {/* Category name with highlighting */}
                        <span
                          className={cn(
                            'flex-1 min-w-0 text-sm',
                            hasChildren && level === 0 && !isSpecial
                              ? 'font-medium text-theme-text-primary'
                              : level > 0 && !isSpecial
                                ? 'text-theme-text-secondary'
                                : 'text-theme-text-primary'
                          )}
                        >
                          {isSpecial
                            ? option.label
                            : renderHighlightedText(
                                option.label,
                                debouncedSearch
                              )}
                        </span>

                        {/* Current selection indicator */}
                        {isCurrentlySelected && !isSpecial && (
                          <Icons.Check
                            size={16}
                            className="text-theme-accent-primary flex-shrink-0"
                          />
                        )}

                        {/* Children count for parent categories */}
                        {hasChildren && !isSearching && (
                          <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-1.5 py-0.5 rounded flex-shrink-0">
                            {
                              notebooks.filter(nb => nb.parentId === option.id)
                                .length
                            }
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-theme-text-muted text-center">
            {canCreateFromSearch ? (
              <span>
                ↑↓ to navigate • Enter to select •{' '}
                <kbd className="px-1 py-0.5 bg-theme-bg-tertiary rounded text-xs">
                  Ctrl+Enter
                </kbd>{' '}
                to create • Esc to close
              </span>
            ) : (
              <span>↑↓ to navigate • Enter to select • Esc to close</span>
            )}
          </div>
        </div>
      </StandardModal>

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
        onCreate={handleCreateNotebook}
        existingNames={allNotebooks?.map(nb => nb.name) || []}
        availableParents={allNotebooks || []}
      />

      {/* ManageNotebooksModal removed - now accessible via Settings > General */}
    </>
  )
}

export default NotebookSelectorModal
