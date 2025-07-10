// Hook for modal management logic
import { useCallback } from 'react'
import { useAppStore } from '../stores/appStoreFixed'

export const useModalLogic = () => {
  const {
    modals,
    openModal,
    closeModal,
    closeAllModals
  } = useAppStore(state => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals
  }))

  // Modal handlers
  const handleOpenSettings = useCallback(() => {
    openModal('settings')
  }, [openModal])

  const handleCloseSettings = useCallback(() => {
    closeModal('settings')
  }, [closeModal])

  const handleOpenSearch = useCallback(() => {
    openModal('search')
  }, [openModal])

  const handleCloseSearch = useCallback(() => {
    closeModal('search')
  }, [closeModal])

  const handleOpenExport = useCallback(() => {
    openModal('export')
  }, [openModal])

  const handleCloseExport = useCallback(() => {
    closeModal('export')
  }, [closeModal])

  const handleOpenNotebookManager = useCallback(() => {
    openModal('notebookManager')
  }, [openModal])

  const handleCloseNotebookManager = useCallback(() => {
    closeModal('notebookManager')
  }, [closeModal])

  return {
    // State
    modals,
    
    // Actions
    openModal,
    closeModal,
    closeAllModals,
    
    // Specific handlers
    handleOpenSettings,
    handleCloseSettings,
    handleOpenSearch,
    handleCloseSearch,
    handleOpenExport,
    handleCloseExport,
    handleOpenNotebookManager,
    handleCloseNotebookManager
  }
}