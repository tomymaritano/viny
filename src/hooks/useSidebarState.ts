import { useState, useCallback } from 'react'
import type { NotebookWithCounts } from '../types/notebook'
import { usePersistentNotebookState } from './usePersistentNotebookState'

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
  // Use persistent notebook expansion state
  const { expandedNotebooks, toggleNotebook: toggleNotebookExpansion } =
    usePersistentNotebookState()
  // Context menu states
  const [tagContextMenu, setTagContextMenu] = useState<TagContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false,
  })

  const [notebookContextMenu, setNotebookContextMenu] =
    useState<NotebookContextMenuState>({
      isVisible: false,
      position: { x: 0, y: 0 },
      notebook: null,
    })

  const [trashContextMenu, setTrashContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
  })

  // Modal states
  const [tagSettingsModal, setTagSettingsModal] = useState({
    show: false,
    tagName: '',
  })

  const [createNotebookModal, setCreateNotebookModal] = useState(false)
  const [renameNotebookModal, setRenameNotebookModal] = useState<{
    show: boolean
    notebookId: string
    notebookName: string
  }>({
    show: false,
    notebookId: '',
    notebookName: '',
  })

  // Editing states
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Context menu handlers
  const handleTagRightClick = useCallback(
    (e: React.MouseEvent, tagName: string) => {
      e.preventDefault()
      e.stopPropagation()
      setTagContextMenu({
        isVisible: true,
        position: { x: e.clientX, y: e.clientY },
        tagName,
        showColorPicker: false,
      })
    },
    []
  )

  const handleNotebookRightClick = useCallback(
    (e: React.MouseEvent, notebook: NotebookWithCounts) => {
      e.preventDefault()
      e.stopPropagation()
      setNotebookContextMenu({
        isVisible: true,
        position: { x: e.clientX, y: e.clientY },
        notebook,
      })
    },
    []
  )

  const handleTrashRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTrashContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
    })
  }, [])

  // Close handlers
  const closeAllContextMenus = useCallback(() => {
    setTagContextMenu(prev => ({
      ...prev,
      isVisible: false,
      showColorPicker: false,
    }))
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false }))
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Edit handlers
  const startEditingNotebook = useCallback(
    (notebookId: string, currentName: string) => {
      setEditingNotebook(notebookId)
      setEditValue(currentName)
    },
    []
  )

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
    renameNotebookModal,
    editingNotebook,
    editValue,
    expandedNotebooks,

    // Setters
    setTagSettingsModal,
    setCreateNotebookModal,
    setRenameNotebookModal,
    setEditValue,

    // Handlers
    handleTagRightClick,
    handleNotebookRightClick,
    handleTrashRightClick,
    closeAllContextMenus,
    toggleNotebookExpansion,
    startEditingNotebook,
    cancelEditingNotebook,
  }
}
