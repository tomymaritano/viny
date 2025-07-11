/**
 * Main search bar hook that combines search logic and navigation
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearch } from './useSearch'
import { useSearchNavigation } from './useSearchNavigation'

export const useSearchBar = (notes = []) => {
  const [isOpen, setIsOpen] = useState(false)

  const {
    query,
    results,
    isSearching,
    searchHistory,
    search,
    setQuery,
    clearSearch,
    addToHistory,
  } = useSearch(notes)

  // Get all selectable items (results + history)
  const getSelectableItems = useCallback(() => {
    const items = []

    // Add search results
    results.forEach(result => {
      items.push({ type: 'result', data: result })
    })

    // Add search history if no results and no current query
    if (results.length === 0 && !query.trim() && searchHistory.length > 0) {
      searchHistory.forEach(historyItem => {
        items.push({ type: 'history', data: historyItem })
      })
    }

    return items
  }, [results, query, searchHistory])

  const selectableItems = getSelectableItems()

  const {
    selectedIndex,
    resultsRef,
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    selectCurrentItem,
    clearSelection,
    resetSelection,
  } = useSearchNavigation(selectableItems)

  // Reset selection when results change
  useEffect(() => {
    resetSelection()
  }, [results, resetSelection])

  // Handle item selection
  const handleSelectItem = useCallback(
    (item, index) => {
      if (item.type === 'result') {
        addToHistory(query)
        return { type: 'result', data: item.data }
      } else if (item.type === 'history') {
        setQuery(item.data)
        search(item.data)
        return { type: 'history', data: item.data }
      }
      return null
    },
    [query, addToHistory, setQuery, search]
  )

  // Handle input change
  const handleInputChange = useCallback(
    value => {
      setQuery(value)
      setIsOpen(true)
      resetSelection()
    },
    [setQuery, resetSelection]
  )

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsOpen(false)
      clearSelection()
    }, 150)
  }, [clearSelection])

  // Clear search and close
  const handleClearSearch = useCallback(() => {
    clearSearch()
    setIsOpen(false)
    clearSelection()
  }, [clearSearch, clearSelection])

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    clearSelection()
  }, [clearSelection])

  return {
    // Search state
    query,
    results,
    isSearching,
    searchHistory,
    isOpen,

    // Navigation state
    selectedIndex,
    selectableItems,
    resultsRef,

    // Search actions
    search,
    setQuery,
    clearSearch: handleClearSearch,

    // Navigation actions
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    selectCurrentItem: () =>
      selectCurrentItem()
        ? handleSelectItem(selectableItems[selectedIndex], selectedIndex)
        : null,

    // Input handlers
    handleInputChange,
    handleInputFocus,
    handleInputBlur,

    // UI actions
    closeDropdown,
    setIsOpen,

    // Item selection
    handleSelectItem,
  }
}
