/**
 * Hook for managing sidebar context menus
 */
import { useState, useCallback } from 'react'

export const useSidebarContextMenu = () => {
  // Tag context menu state
  const [tagContextMenu, setTagContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false,
  })

  // Trash context menu state
  const [trashContextMenu, setTrashContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
  })

  // Tag context menu handlers
  const handleTagRightClick = useCallback((e, tagName) => {
    e.preventDefault()
    e.stopPropagation()
    setTagContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      tagName,
      showColorPicker: false,
    })
  }, [])

  const handleTagsHeaderRightClick = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setTagContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      tagName: 'Tags', // Special identifier for header
      showColorPicker: false,
    })
  }, [])

  const closeTagContextMenu = useCallback(() => {
    setTagContextMenu(prev => ({
      ...prev,
      isVisible: false,
      showColorPicker: false,
    }))
  }, [])

  const toggleColorPicker = useCallback(() => {
    setTagContextMenu(prev => ({
      ...prev,
      showColorPicker: !prev.showColorPicker,
    }))
  }, [])

  // Trash context menu handlers
  const handleTrashRightClick = useCallback(e => {
    e.preventDefault()
    e.stopPropagation()
    setTrashContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
    })
  }, [])

  const closeTrashContextMenu = useCallback(() => {
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Close all context menus
  const closeAllContextMenus = useCallback(() => {
    closeTagContextMenu()
    closeTrashContextMenu()
  }, [closeTagContextMenu, closeTrashContextMenu])

  return {
    // Tag context menu
    tagContextMenu,
    handleTagRightClick,
    handleTagsHeaderRightClick,
    closeTagContextMenu,
    toggleColorPicker,

    // Trash context menu
    trashContextMenu,
    handleTrashRightClick,
    closeTrashContextMenu,

    // General
    closeAllContextMenus,
  }
}
