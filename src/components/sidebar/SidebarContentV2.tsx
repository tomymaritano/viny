/**
 * SidebarContentV2 - Clean Architecture Implementation
 * UI component that uses data from SidebarLogicProviderV2
 * 
 * IMPORTANT: This component maintains EXACTLY the same UI as V1
 * Only the data layer has been migrated to clean architecture
 */

import React, { useState, memo, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSidebarContext } from './SidebarLogicProviderV2'
import { useModalStore, useNoteUI, useToastStore, useUiStore, useCleanUIStore } from '../../stores/cleanUIStore'
import { useNotebookUI } from '../../stores/cleanUIStore'
import { useUpdateNoteMutationV2 } from '../../hooks/queries/useNotesServiceQueryV2'
import { sidebarLogger } from '../../utils/logger'
import SidebarContainer from './SidebarContainer'
import SidebarModals from './SidebarModals'
import SidebarContextMenuManager from './SidebarContextMenuManager'
import RenameModal from '../modals/RenameModal'
import { UserProfile } from '../auth/UserProfile'
import { useConfirmDialog } from '../../hooks/useConfirmDialog'
import SidebarBreadcrumbV2 from './SidebarBreadcrumbV2'
import FilterBarV2 from '../filters/FilterBarV2'
import SidebarSettingsButton from './SidebarSettingsButton'
import SidebarFooter from './SidebarFooter'
import SidebarSections from './SidebarSections'
// Auth is part of cleanUIStore

const SidebarContentV2: React.FC = memo(() => {
  const {
    // Navigation
    activeSection,
    handleSectionClick,
    
    // Notebooks
    notebookTree,
    notebooksWithCounts,
    isLoadingNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    moveNotebook,
    getNotebook,
    
    // Notebook UI
    expandedNotebooks,
    toggleNotebookExpanded,
    
    // Notes
    notes,
    trashedNotes,
    isLoadingNotes,
    
    // Tags
    tagsWithCounts,
    getTagColor,
    
    // Actions
    createNewNote,
    handleEmptyTrash,
    handleSettingsClick,
    
    // Sections
    mainSections,
    statusSections,
    systemSections,
  } = useSidebarContext()
  
  // UI State
  const { openModal, closeModal, setModal } = useModalStore()
  const { setSelectedNoteId, openEditor } = useNoteUI()
  const { showSuccess, showError } = useToastStore()
  const { notebookFilter } = useUiStore()
  const { 
    editingNotebookId,
    startEditingNotebook,
    stopEditingNotebook,
    isCreatingNotebook,
    parentNotebookId,
    startCreatingNotebook,
    stopCreatingNotebook,
  } = useNotebookUI()
  
  // Get user from clean UI store
  const user = useCleanUIStore(state => state.user)
  
  // Get modal state from store
  const modalState = useModalStore()
  
  // Mutations
  const updateNoteMutation = useUpdateNoteMutationV2()
  
  // Local state - matching V1 exactly
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    notebooks: true,
    status: true,
    tags: true,
  })
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [createNotebookModal, setCreateNotebookModal] = useState(false)
  const [focusedNotebookId, setFocusedNotebookId] = useState<string | null>(null)
  
  // Tag modals state
  const [tagSettingsModal, setTagSettingsModal] = useState({
    show: false,
    tagName: '',
  })
  
  // Rename modal state
  const [renameNotebookModal, setRenameNotebookModal] = useState({
    show: false,
    notebookId: '',
    notebookName: '',
  })
  
  // Context menu state
  const [tagContextMenu, setTagContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    tagName: '',
    showColorPicker: false,
  })
  
  const [notebookContextMenu, setNotebookContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    notebook: null as any,
  })
  
  const [trashContextMenu, setTrashContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
  })
  
  // Use centralized confirm dialog hook
  const { showConfirm } = useConfirmDialog()
  
  // Handlers
  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId)
    openEditor(noteId)
  }
  
  const handleToggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }
  
  const toggleNotebookExpansion = (notebookId: string) => {
    toggleNotebookExpanded(notebookId)
  }
  
  const handleCreateNoteInNotebook = async (notebookId: string) => {
    await createNewNote(notebookId)
  }
  
  const startEditingNotebookHandler = (notebookId: string) => {
    const notebook = notebooksWithCounts.find(n => n.id === notebookId)
    if (notebook) {
      setEditingNotebook(notebookId)
      setEditValue(notebook.name)
    }
  }
  
  const cancelEditingNotebook = () => {
    setEditingNotebook(null)
    setEditValue('')
  }
  
  // Context menu handlers
  const closeAllContextMenus = useCallback(() => {
    setTagContextMenu(prev => ({ ...prev, isVisible: false }))
    setNotebookContextMenu(prev => ({ ...prev, isVisible: false }))
    setTrashContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])
  
  const handleTagRightClick = useCallback(
    (e: React.MouseEvent, x: number, y: number, tagName: string) => {
      e.preventDefault()
      e.stopPropagation()
      setTagContextMenu({
        isVisible: true,
        position: { x, y },
        tagName,
        showColorPicker: false,
      })
    },
    []
  )
  
  const handleNotebookRightClick = useCallback(
    (e: React.MouseEvent, notebook: any) => {
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
  
  const handleTrashRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setTrashContextMenu({
        isVisible: true,
        position: { x: e.clientX, y: e.clientY },
      })
    },
    []
  )
  
  const removeTagFromAllNotes = async (tagName: string) => {
    const notesWithTag = notes.filter(note => note.tags?.includes(tagName))
    
    for (const note of notesWithTag) {
      const newTags = note.tags?.filter(t => t !== tagName) || []
      await updateNoteMutation.mutateAsync({ id: note.id, data: { tags: newTags } })
    }
    
    showSuccess(`Tag "${tagName}" removed from all notes`)
  }
  
  const renameTagInAllNotes = async (oldName: string, newName: string) => {
    const notesWithTag = notes.filter(note => note.tags?.includes(oldName))
    
    for (const note of notesWithTag) {
      const newTags = note.tags?.map(tag => tag === oldName ? newName : tag) || []
      await updateNoteMutation.mutateAsync({ id: note.id, data: { tags: newTags } })
    }
    
    showSuccess(`Tag renamed from "${oldName}" to "${newName}" in all notes`)
  }
  
  // Filter displayed notebooks - EXACTLY like V1
  const displayedNotebooks = focusedNotebookId 
    ? notebooksWithCounts.filter(n => n.parentId === focusedNotebookId)
    : notebooksWithCounts.filter(n => !n.parentId)
  
  // Breadcrumb click handler for notebook
  const handleNotebookClick = useCallback((notebookId: string) => {
    const notebook = getNotebook(notebookId)
    if (notebook) {
      // Convert to lowercase to match V1 behavior and ensure consistent filtering
      const sectionId = `notebook-${notebook.name.toLowerCase()}`
      console.log('📁 Notebook click:', notebook.name, '-> section:', sectionId)
      handleSectionClick(sectionId)
    }
  }, [handleSectionClick, getNotebook])
  
  return (
    <SidebarContainer onContextMenuClose={closeAllContextMenus}>
      {/* Settings button at the top - MATCHING V1 EXACTLY */}
      <SidebarSettingsButton onClick={handleSettingsClick} />
      
      {/* Breadcrumb Navigation - MATCHING V1 EXACTLY */}
      <AnimatePresence>
        <SidebarBreadcrumbV2
          onNotebookClick={handleNotebookClick}
          focusedNotebookId={focusedNotebookId}
          onExitFocus={() => setFocusedNotebookId(null)}
          getNotebook={getNotebook}
        />
      </AnimatePresence>
      
      {/* Filter Bar - MATCHING V1 EXACTLY */}
      <FilterBarV2 />
      
      {/* Main scrollable content with animations - MATCHING V1 EXACTLY */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedNotebookId || 'all-notebooks'}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="px-2 py-2 space-y-4"
          >
            <SidebarSections
              // Main sections
              mainSections={mainSections}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              focusedNotebookId={focusedNotebookId}
              // Notebooks
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              onCreateNotebookClick={() => setCreateNotebookModal(true)}
              notebooks={notebooksWithCounts || []}
              displayedNotebooks={displayedNotebooks}
              expandedNotebooks={expandedNotebooks}
              onNotebookClick={handleSectionClick}
              onNotebookRightClick={handleNotebookRightClick}
              onToggleNotebookExpansion={toggleNotebookExpansion}
              editingNotebook={editingNotebook}
              editValue={editValue}
              onEditValueChange={setEditValue}
              onSaveNotebookName={(notebookId: string) => {
                if (editValue.trim()) {
                  const notebook = notebooksWithCounts.find(n => n.id === notebookId)
                  if (notebook) {
                    updateNotebook(notebookId, { name: editValue.trim() })
                    cancelEditingNotebook()
                  }
                }
              }}
              onCancelEdit={cancelEditingNotebook}
              onCreateNoteInNotebook={handleCreateNoteInNotebook}
              onFocusNotebook={setFocusedNotebookId}
              // Status sections
              statusSections={statusSections}
              // Tags
              tagsWithCounts={tagsWithCounts}
              onTagRightClick={handleTagRightClick}
              getTagColor={getTagColor}
              onCreateTagClick={() => setModal('tagModal', true)}
              // System sections
              systemSections={systemSections}
              onTrashRightClick={handleTrashRightClick}
            />
          </motion.div>
        </AnimatePresence>

        {/* Spacer - MATCHING V1 EXACTLY */}
        <div className="flex-1" />

        {/* Footer with User Profile - MATCHING V1 EXACTLY */}
        <SidebarFooter
          user={user}
          onShowUserProfile={() => setShowUserProfile(true)}
        />
      </div>
      
      {/* Context Menu Manager - MATCHING V1 */}
      <SidebarContextMenuManager
        contextMenuState={{
          tag: tagContextMenu,
          notebook: notebookContextMenu,
          trash: trashContextMenu,
        }}
        onCloseAll={closeAllContextMenus}
        onTagRemove={async () => {
          if (tagContextMenu.tagName) {
            const confirmed = await showConfirm({
              title: 'Remove Tag',
              message: `Are you sure you want to remove the tag "${tagContextMenu.tagName}" from all notes?`,
              type: 'danger',
              confirmText: 'Remove',
              onConfirm: () => {
                removeTagFromAllNotes(tagContextMenu.tagName)
              }
            })
          }
          closeAllContextMenus()
        }}
        onTagSettings={() => {
          setTagSettingsModal({ show: true, tagName: tagContextMenu.tagName })
          closeAllContextMenus()
        }}
        onNotebookEdit={() => {
          if (notebookContextMenu.notebook) {
            setRenameNotebookModal({
              show: true,
              notebookId: notebookContextMenu.notebook.id,
              notebookName: notebookContextMenu.notebook.name,
            })
            closeAllContextMenus()
          }
        }}
        onNotebookDelete={async () => {
          if (notebookContextMenu.notebook) {
            const notebookName = notebookContextMenu.notebook.name
            const hasNotes = notebookContextMenu.notebook.count > 0

            const confirmMessage = hasNotes
              ? `Are you sure you want to delete "${notebookName}" and move all its notes to the trash?`
              : `Are you sure you want to delete "${notebookName}"?`

            const confirmed = await showConfirm({
              title: 'Delete Notebook',
              message: confirmMessage,
              type: 'danger',
              confirmText: 'Delete',
              onConfirm: async () => {
                try {
                  await deleteNotebook(notebookContextMenu.notebook!.id)
                  showSuccess(`Notebook "${notebookName}" deleted successfully`)
                } catch (error) {
                  sidebarLogger.error('Failed to delete notebook:', error)
                  showError('Failed to delete notebook')
                }
              }
            })
            closeAllContextMenus()
          }
        }}
        onEmptyTrash={async () => {
          await handleEmptyTrash()
          closeAllContextMenus()
        }}
      />
      
      {/* Modals - MATCHING V1 */}
      <SidebarModals
        tagSettingsModal={tagSettingsModal}
        onTagSettingsClose={() =>
          setTagSettingsModal({ show: false, tagName: '' })
        }
        onTagNameChange={(newName: string) => {
          if (
            tagSettingsModal.tagName &&
            newName &&
            tagSettingsModal.tagName !== newName
          ) {
            renameTagInAllNotes(tagSettingsModal.tagName, newName)
          }
        }}
        createNotebookModal={createNotebookModal}
        onCreateNotebookClose={() => setCreateNotebookModal(false)}
        onCreateNotebook={async (
          name: string,
          color: string,
          parentId?: string | null
        ) => {
          try {
            await createNotebook({ name, color, parentId })
            setCreateNotebookModal(false)
          } catch (error) {
            sidebarLogger.error('Failed to create notebook:', error)
            showError('Failed to create notebook')
          }
        }}
        existingNotebookNames={notebooksWithCounts.map(n => n.name)}
        availableParents={notebooksWithCounts}
        defaultParentId={focusedNotebookId}
      />
      
      {/* Rename Modal */}
      <RenameModal
        isOpen={renameNotebookModal.show}
        onClose={() => setRenameNotebookModal({ 
          show: false, 
          notebookId: '', 
          notebookName: '' 
        })}
        currentName={renameNotebookModal.notebookName}
        title="Rename Notebook"
        onRename={async (newName: string) => {
          const notebook = getNotebook(renameNotebookModal.notebookId)
          if (notebook) {
            try {
              await updateNotebook(renameNotebookModal.notebookId, { name: newName })
              showSuccess(`Notebook renamed to "${newName}"`)
            } catch (error) {
              sidebarLogger.error('Failed to rename notebook:', error)
              showError('Failed to rename notebook')
            }
          }
        }}
      />
      
      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      
    </SidebarContainer>
  )
})

SidebarContentV2.displayName = 'SidebarContentV2'

export default SidebarContentV2