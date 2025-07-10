import { useState, useCallback } from 'react'

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    items: [],
  })

  const showContextMenu = useCallback((event, items) => {
    event.preventDefault()
    event.stopPropagation()

    // Calculate position to keep menu within viewport
    const { clientX, clientY } = event
    const { innerWidth, innerHeight } = window
    const menuWidth = 200 // Approximate menu width
    const menuHeight = items.length * 40 // Approximate item height

    let x = clientX
    let y = clientY

    // Adjust position if menu would go off-screen
    if (x + menuWidth > innerWidth) {
      x = innerWidth - menuWidth - 10
    }
    if (y + menuHeight > innerHeight) {
      y = innerHeight - menuHeight - 10
    }

    setContextMenu({
      isVisible: true,
      position: { x, y },
      items,
    })
  }, [])

  const hideContextMenu = useCallback(() => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
      items: [],
    })
  }, [])

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  }
}
