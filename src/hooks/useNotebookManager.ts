import { useState, useMemo } from 'react'
import { useNotebooks } from './useNotebooks'
import { logger } from '../utils/logger'

interface NotebookOption {
  value: string
  label: string
  icon: string
}

export function useNotebookManager(note: any, onNotebookChange: (notebookId: string) => void) {
  const [showNotebookModal, setShowNotebookModal] = useState(false)
  const [notebookSearchInput, setNotebookSearchInput] = useState('')
  
  const { flatNotebooks } = useNotebooks()

  // Convert notebooks to options for dropdown
  const notebookOptions: NotebookOption[] = useMemo(() => {
    return flatNotebooks.map(notebook => ({
      value: notebook.id,
      label: notebook.name,
      icon: notebook.icon || 'Book'
    }))
  }, [flatNotebooks])

  // Filter notebooks based on search input
  const filteredNotebooks = useMemo(() => {
    if (!notebookSearchInput.trim()) return notebookOptions
    
    const search = notebookSearchInput.toLowerCase()
    return notebookOptions.filter(notebook =>
      notebook.label.toLowerCase().includes(search)
    )
  }, [notebookOptions, notebookSearchInput])

  // Get current notebook display info
  const currentNotebook = useMemo(() => {
    if (!note?.notebookId) return null
    return notebookOptions.find(nb => nb.value === note.notebookId) || null
  }, [note?.notebookId, notebookOptions])

  const handleNotebookSelect = (notebookId: string) => {
    try {
      onNotebookChange(notebookId)
      setShowNotebookModal(false)
      setNotebookSearchInput('')
      logger.debug('Notebook changed to:', notebookId)
    } catch (error) {
      logger.error('Failed to change notebook:', error)
    }
  }

  const handleNotebookModalClose = () => {
    setShowNotebookModal(false)
    setNotebookSearchInput('')
  }

  return {
    // State
    showNotebookModal,
    notebookSearchInput,
    notebookOptions,
    filteredNotebooks,
    currentNotebook,
    
    // Actions
    setShowNotebookModal,
    setNotebookSearchInput,
    handleNotebookSelect,
    handleNotebookModalClose,
  }
}