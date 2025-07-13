import { useState, useCallback } from 'react'
import { NotebookWithCounts } from '../types/notebook'

interface ContextMenuState {
  isVisible: boolean
  position: { x: number; y: number }
}

interface TagContextMenuState extends ContextMenuState {
  tagName: string
  showColorPicker: boolean
}

interface NotebookContextMenuState extends ContextMenuState {
  notebook: NotebookWithCounts | null
}

/**
 * Custom hook to manage all sidebar state
 */
export const useSidebarState = () => {
  // Context menu states
  const [tagContextMenu, setTagContextMenu] = useState<TagContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false
  })

  const [notebookContextMenu, setNotebookContextMenu] = useState<NotebookContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null
  })

  const [trashContextMenu, setTrashContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 }
  })

  // Modal states
  const [tagSettingsModal, setTagSettingsModal] = useState({ 
    show: false, 
    tagName: '' 
  })

  const [createNotebookModal, setCreateNotebookModal] = useState(false)

  // Editing states
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  
  // Expansion states
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())

  // Context menu handlers
  const handleTagRightClick = useCallback((e: React.MouseEvent, tagName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setTagContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      tagName,
      showColorPicker: false
    })
  }, [])

  const handleNotebookRightClick = useCallback((e: React.MouseEvent, notebook: NotebookWithCounts) => {
    e.preventDefault()
    e.stopPropagation()
    setNotebookContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      notebook
    })
  }, [])

  const handleTrashRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTrashContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY }
    })
  }, [])

  // Close handlers
  const closeAllContextMenus = useCallback(() => {
    setTagContextMenu(prev => ({ ...prev, isVisible: false, showColorPicker: false }))
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false }))
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Toggle handlers
  const toggleNotebookExpansion = useCallback((notebookId: string) => {
    setExpandedNotebooks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notebookId)) {
        newSet.delete(notebookId)
      } else {
        newSet.add(notebookId)
      }
      return newSet
    })
  }, [])

  // Edit handlers
  const startEditingNotebook = useCallback((notebookId: string, currentName: string) => {
    setEditingNotebook(notebookId)
    setEditValue(currentName)
  }, [])

  const cancelEditingNotebook = useCallback(() => {
    setEditingNotebook(null)
    setEditValue('')
  }, [])

  return {
    // States
    tagContextMenu,
    notebookContextMenu,
    trashContextMenu,
    tagSettingsModal,
    createNotebookModal,
    editingNotebook,
    editValue,
    expandedNotebooks,

    // Setters
    setTagSettingsModal,
    setCreateNotebookModal,
    setEditValue,

    // Handlers
    handleTagRightClick,
    handleNotebookRightClick,
    handleTrashRightClick,
    closeAllContextMenus,
    toggleNotebookExpansion,
    startEditingNotebook,
    cancelEditingNotebook
  }
}