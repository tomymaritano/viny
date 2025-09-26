import React, { createContext, useContext, useState, useCallback } from 'react'

interface ModalContextType {
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  isModalOpen: (modalId: string) => boolean
  getOpenModals: () => string[]
  // Stack management for nested modals
  openNestedModal: (modalId: string, parentModalId?: string) => void
  closeToModal: (modalId: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider')
  }
  return context
}

interface ModalProviderProps {
  children: React.ReactNode
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalStack, setModalStack] = useState<string[]>([])

  const openModal = useCallback((modalId: string) => {
    setModalStack(prev => {
      if (prev.includes(modalId)) {
        return prev
      }
      return [...prev, modalId]
    })
  }, [])

  const closeModal = useCallback((modalId: string) => {
    setModalStack(prev => prev.filter(id => id !== modalId))
  }, [])

  const closeAllModals = useCallback(() => {
    setModalStack([])
  }, [])

  const isModalOpen = useCallback(
    (modalId: string) => {
      return modalStack.includes(modalId)
    },
    [modalStack]
  )

  const getOpenModals = useCallback(() => {
    return [...modalStack]
  }, [modalStack])

  // When opening a nested modal, close all current modals and open the new one
  const openNestedModal = useCallback(
    (modalId: string, parentModalId?: string) => {
      setModalStack([modalId])
    },
    []
  )

  // Close modals until we reach the specified modal (exclusive)
  const closeToModal = useCallback((modalId: string) => {
    setModalStack(prev => {
      const index = prev.indexOf(modalId)
      if (index === -1) {
        return prev
      }
      return prev.slice(0, index + 1)
    })
  }, [])

  const value: ModalContextType = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getOpenModals,
    openNestedModal,
    closeToModal,
  }

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}
