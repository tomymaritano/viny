import { useState, useCallback } from 'react'
import { sidebarLogger as logger } from '../utils/logger'

interface ContextMenuState {
  show: boolean
  x: number
  y: number
  tagName?: string
  notebookId?: string
}

interface TagSettingsModalState {
  show: boolean
  tagName: string
}

/**
 * Hook to manage all sidebar-related UI state (context menus, modals, editing)
 * Separates state management from presentation logic
 */
export function useSidebarState() {
  // Context menu states
  const [tagContextMenu, setTagContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0
  })

  const [trashContextMenu, setTrashContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0
  })

  const [notebookContextMenu, setNotebookContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0
  })

  // Modal states
  const [tagSettingsModal, setTagSettingsModal] = useState<TagSettingsModalState>({
    show: false,
    tagName: ''
  })

  const [createNotebookModal, setCreateNotebookModal] = useState(false)

  // Editing states
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())

  // Tag context menu handlers
  const showTagContextMenu = useCallback((x: number, y: number, tagName: string) => {
    setTagContextMenu({ show: true, x, y, tagName })
    logger.debug('Tag context menu opened', { tagName })
  }, [])

  const closeTagContextMenu = useCallback(() => {
    setTagContextMenu({ show: false, x: 0, y: 0 })
    logger.debug('Tag context menu closed')
  }, [])

  // Trash context menu handlers
  const showTrashContextMenu = useCallback((x: number, y: number) => {
    setTrashContextMenu({ show: true, x, y })
    logger.debug('Trash context menu opened')
  }, [])

  const closeTrashContextMenu = useCallback(() => {
    setTrashContextMenu({ show: false, x: 0, y: 0 })
    logger.debug('Trash context menu closed')
  }, [])

  // Notebook context menu handlers
  const showNotebookContextMenu = useCallback((x: number, y: number, notebookId: string) => {
    setNotebookContextMenu({ show: true, x, y, notebookId })
    logger.debug('Notebook context menu opened', { notebookId })
  }, [])

  const closeNotebookContextMenu = useCallback(() => {
    setNotebookContextMenu({ show: false, x: 0, y: 0 })
    logger.debug('Notebook context menu closed')
  }, [])

  // Tag settings modal handlers
  const showTagSettings = useCallback((tagName: string) => {
    setTagSettingsModal({ show: true, tagName })
    closeTagContextMenu() // Close context menu when opening modal
    logger.debug('Tag settings modal opened', { tagName })
  }, [closeTagContextMenu])

  const closeTagSettings = useCallback(() => {
    setTagSettingsModal({ show: false, tagName: '' })
    logger.debug('Tag settings modal closed')
  }, [])

  // Create notebook modal handlers
  const showCreateNotebook = useCallback(() => {
    setCreateNotebookModal(true)
    logger.debug('Create notebook modal opened')
  }, [])

  const closeCreateNotebook = useCallback(() => {
    setCreateNotebookModal(false)
    logger.debug('Create notebook modal closed')
  }, [])

  // Notebook editing handlers
  const startEditingNotebook = useCallback((notebookId: string, currentName: string) => {
    setEditingNotebook(notebookId)
    setEditValue(currentName)
    closeNotebookContextMenu()
    logger.debug('Started editing notebook', { notebookId })
  }, [closeNotebookContextMenu])

  const cancelEditingNotebook = useCallback(() => {
    setEditingNotebook(null)
    setEditValue('')
    logger.debug('Cancelled editing notebook')
  }, [])

  const finishEditingNotebook = useCallback(() => {
    const notebookId = editingNotebook
    const newName = editValue.trim()
    
    setEditingNotebook(null)
    setEditValue('')
    
    logger.debug('Finished editing notebook', { notebookId, newName })
    
    return { notebookId, newName }
  }, [editingNotebook, editValue])

  // Notebook expansion handlers
  const toggleNotebookExpansion = useCallback((notebookId: string) => {
    setExpandedNotebooks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notebookId)) {
        newSet.delete(notebookId)
        logger.debug('Collapsed notebook', { notebookId })
      } else {
        newSet.add(notebookId)
        logger.debug('Expanded notebook', { notebookId })
      }
      return newSet
    })
  }, [])

  const isNotebookExpanded = useCallback((notebookId: string) => {
    return expandedNotebooks.has(notebookId)
  }, [expandedNotebooks])

  // Close all menus (useful for cleanup)
  const closeAllMenus = useCallback(() => {
    closeTagContextMenu()
    closeTrashContextMenu()
    closeNotebookContextMenu()
    closeTagSettings()
    closeCreateNotebook()
    cancelEditingNotebook()
    logger.debug('All menus and modals closed')
  }, [
    closeTagContextMenu,
    closeTrashContextMenu,
    closeNotebookContextMenu,
    closeTagSettings,
    closeCreateNotebook,
    cancelEditingNotebook
  ])

  return {
    // States
    tagContextMenu,
    trashContextMenu,
    notebookContextMenu,
    tagSettingsModal,
    createNotebookModal,
    editingNotebook,
    editValue,
    expandedNotebooks,

    // Tag context menu
    showTagContextMenu,
    closeTagContextMenu,

    // Trash context menu
    showTrashContextMenu,
    closeTrashContextMenu,

    // Notebook context menu
    showNotebookContextMenu,
    closeNotebookContextMenu,

    // Tag settings modal
    showTagSettings,
    closeTagSettings,

    // Create notebook modal
    showCreateNotebook,
    closeCreateNotebook,

    // Notebook editing
    startEditingNotebook,
    cancelEditingNotebook,
    finishEditingNotebook,
    setEditValue,

    // Notebook expansion
    toggleNotebookExpansion,
    isNotebookExpanded,

    // Utilities
    closeAllMenus
  }
}