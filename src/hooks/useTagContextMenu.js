/**
 * Hook for managing tag context menu state and actions
 */
import { useState, useCallback } from 'react'

export const useTagContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    tag: null,
    index: null,
  })
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Show context menu
  const showContextMenu = useCallback((e, tag, index) => {
    e.preventDefault()
    e.stopPropagation()

    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tag,
      index,
    })
    setShowColorPicker(false)
  }, [])

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0, tag: null, index: null })
    setShowColorPicker(false)
  }, [])

  // Toggle color picker
  const toggleColorPicker = useCallback(() => {
    setShowColorPicker(prev => !prev)
  }, [])

  // Handle color selection
  const handleColorSelect = useCallback(
    (color, onColorChange) => {
      if (contextMenu.tag && onColorChange) {
        onColorChange(contextMenu.tag, color)
      }
      closeContextMenu()
    },
    [contextMenu.tag, closeContextMenu]
  )

  return {
    // State
    contextMenu,
    showColorPicker,

    // Actions
    showContextMenu,
    closeContextMenu,
    toggleColorPicker,
    handleColorSelect,
  }
}
