import { useState, useCallback, useEffect } from 'react'

export const useColumnResize = (initialSizes, minSizes) => {
  const [columnSizes, setColumnSizes] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('inkrun-column-sizes')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return initialSizes
      }
    }
    return initialSizes
  })

  // Save to localStorage whenever sizes change
  useEffect(() => {
    localStorage.setItem('inkrun-column-sizes', JSON.stringify(columnSizes))
  }, [columnSizes])

  const startResize = useCallback(
    (columnIndex, startX) => {
      // Prevent event bubbling
      const startSizes = [...columnSizes]
      let hasMoved = false

      const handleMouseMove = e => {
        hasMoved = true
        const deltaX = e.clientX - startX
        const containerWidth = window.innerWidth
        const deltaPercent = (deltaX / containerWidth) * 100

        setColumnSizes(currentSizes => {
          const newSizes = [...currentSizes]

          // Adjust current column and next column
          const currentColumn = columnIndex
          const nextColumn = columnIndex + 1

          if (nextColumn < newSizes.length) {
            const newCurrentSize = Math.max(
              minSizes[currentColumn],
              Math.min(
                startSizes[currentColumn] + deltaPercent,
                startSizes[currentColumn] +
                  startSizes[nextColumn] -
                  minSizes[nextColumn]
              )
            )

            const newNextSize = Math.max(
              minSizes[nextColumn],
              startSizes[currentColumn] +
                startSizes[nextColumn] -
                newCurrentSize
            )

            newSizes[currentColumn] = newCurrentSize
            newSizes[nextColumn] = newNextSize
          }

          return newSizes
        })
      }

      const handleMouseUp = e => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'

        // Prevent click events if we actually dragged
        if (hasMoved) {
          e.preventDefault()
          e.stopPropagation()
        }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [columnSizes, minSizes]
  )

  const resetSizes = useCallback(() => {
    setColumnSizes(initialSizes)
    localStorage.removeItem('inkrun-column-sizes')
  }, [initialSizes])

  return {
    columnSizes,
    startResize,
    resetSizes,
  }
}
