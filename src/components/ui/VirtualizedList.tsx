/**
 * Virtualized list component for handling large datasets efficiently
 * Only renders visible items to improve performance
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  getItemId: (item: T, index: number) => string | number
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  getItemId,
  overscan = 5,
  className = '',
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Calculate which items should be visible
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)
    
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1)
  }, [items, visibleRange])

  // Total height of all items
  const totalHeight = items.length * itemHeight

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight
      scrollElementRef.current.scrollTop = targetScrollTop
      setScrollTop(targetScrollTop)
    }
  }, [itemHeight])

  // Expose scroll methods
  useEffect(() => {
    const element = scrollElementRef.current
    if (element) {
      // Add scroll methods to the element for external access
      ;(element as any).scrollToItem = scrollToItem
    }
  }, [scrollToItem])

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total container with proper height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index
            return (
              <div
                key={getItemId(item, actualIndex)}
                style={{
                  height: itemHeight,
                  overflow: 'hidden',
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VirtualizedList

// Hook for easier virtualization setup
export function useVirtualization<T>({
  items,
  containerRef,
  itemHeight = 60,
  overscan = 5,
}: {
  items: T[]
  containerRef: React.RefObject<HTMLElement>
  itemHeight?: number
  overscan?: number
}) {
  const [containerHeight, setContainerHeight] = useState(400)

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(container)
    
    // Set initial height
    setContainerHeight(container.clientHeight)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef])

  return {
    containerHeight,
    itemHeight,
    overscan,
  }
}