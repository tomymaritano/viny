/**
 * Custom hook for search navigation and keyboard handling
 */
import { useState, useRef, useCallback } from 'react'

export const useSearchNavigation = (items = [], onSelectItem = null) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const resultsRef = useRef(null)

  // Scroll selected item into view
  const scrollToSelectedItem = useCallback(index => {
    if (!resultsRef.current || index < 0) return

    const selectedElement = resultsRef.current.querySelector(
      `[data-result-index="${index}"]`
    )
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [])

  // Navigate to next item
  const navigateNext = useCallback(() => {
    setSelectedIndex(prev => {
      const nextIndex = prev < items.length - 1 ? prev + 1 : 0
      scrollToSelectedItem(nextIndex)
      return nextIndex
    })
  }, [items.length, scrollToSelectedItem])

  // Navigate to previous item
  const navigatePrevious = useCallback(() => {
    setSelectedIndex(prev => {
      const nextIndex = prev > 0 ? prev - 1 : items.length - 1
      scrollToSelectedItem(nextIndex)
      return nextIndex
    })
  }, [items.length, scrollToSelectedItem])

  // Navigate to first item
  const navigateToFirst = useCallback(() => {
    if (items.length > 0) {
      setSelectedIndex(0)
      scrollToSelectedItem(0)
    }
  }, [items.length, scrollToSelectedItem])

  // Navigate to last item
  const navigateToLast = useCallback(() => {
    if (items.length > 0) {
      const lastIndex = items.length - 1
      setSelectedIndex(lastIndex)
      scrollToSelectedItem(lastIndex)
    }
  }, [items.length, scrollToSelectedItem])

  // Select current item
  const selectCurrentItem = useCallback(() => {
    if (selectedIndex >= 0 && items[selectedIndex] && onSelectItem) {
      onSelectItem(items[selectedIndex], selectedIndex)
      return true
    }
    return false
  }, [selectedIndex, items, onSelectItem])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIndex(-1)
  }, [])

  // Reset selection when items change
  const resetSelection = useCallback(() => {
    setSelectedIndex(-1)
  }, [])

  return {
    selectedIndex,
    resultsRef,
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    selectCurrentItem,
    clearSelection,
    resetSelection,
    setSelectedIndex,
  }
}
