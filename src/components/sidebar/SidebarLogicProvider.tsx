import React, { createContext, useContext, ReactNode } from 'react'
import { useSidebarLogic } from '../../hooks/useSidebarLogic'
import { useSidebarState } from '../../hooks/useSidebarState'
import { useNoteActions } from '../../hooks/useNoteActions'
import { useAppStore } from '../../stores/newSimpleStore'
import { getCustomTagColor } from '../../utils/customTagColors'

interface SidebarContextType {
  // Logic from useSidebarLogic
  activeSection: string
  expandedSections: any
  notes: any[]
  mainSections: any[]
  statusSections: any[]
  systemSections: any[]
  notebooksWithCounts: any[]
  tagsWithCounts: any[]
  handleSectionClick: (section: string) => void
  handleToggleSection: (section: string) => void
  handleSettingsClick: () => void
  createNotebook: any
  updateNotebook: any
  deleteNotebook: any
  moveNotebook: any
  getRootNotebooks: () => any[]
  getNotebookChildren: (parentId: string) => any[]
  getNotebook: (id: string) => any
  
  // Actions
  createNewNote: () => void
  handleEmptyTrash: () => void
  setModal: (modal: string, state: boolean) => void
  updateNote: any
  getTagColor: (tag: string) => { bg: string; border: string; text: string; name: string }
  
  // Missing notebook actions
  expandedNotebooks?: Set<string>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebarContext = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarLogicProvider')
  }
  return context
}

interface SidebarLogicProviderProps {
  children: ReactNode
}

const SidebarLogicProvider: React.FC<SidebarLogicProviderProps> = ({ children }) => {
  // All the logic hooks
  const sidebarLogic = useSidebarLogic()
  const { createNewNote, handleEmptyTrash } = useNoteActions()
  const { setModal, updateNote, getTagColor: getTagColorKey, tagColors } = useAppStore()
  
  // Wrapper function to convert tag color key to full color object
  const getTagColor = (tag: string) => {
    return getCustomTagColor(tag, tagColors)
  }

  const contextValue: SidebarContextType = {
    ...sidebarLogic,
    createNewNote,
    handleEmptyTrash,
    setModal,
    updateNote,
    getTagColor
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
}

export default SidebarLogicProvider