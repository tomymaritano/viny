import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSidebarContext } from './SidebarLogicProvider'
import { useSidebarState } from '../../hooks/useSidebarState'
import { useAppStore } from '../../stores/newSimpleStore'
import { useNoteActions } from '../../hooks/useNoteActions'
import { useNotebooks } from '../../hooks/useNotebooks'
import { useConfirmDialog } from '../../hooks/useConfirmDialog'
import { useContextMenu } from '../../hooks/useContextMenu'
import { sidebarLogger } from '../../utils/logger'
import SidebarModals from './SidebarModals'
import SidebarContextMenuManager from './SidebarContextMenuManager'
import SidebarContainer from './SidebarContainer'
import RenameModal from '../modals/RenameModal'
import { UserProfile } from '../auth/UserProfile'
import SidebarBreadcrumb from './SidebarBreadcrumb'
import FilterBar from '../filters/FilterBar'
import SidebarSettingsButton from './SidebarSettingsButton'
import SidebarFooter from './SidebarFooter'
import SidebarSections from './SidebarSections'

const SidebarContent: React.FC = () => {
  const {
    activeSection,
    expandedSections,
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    allNotebooksWithCounts,
    tagsWithCounts,
    handleSectionClick,
    handleToggleSection,
    handleSettingsClick,
    setModal,
    getTagColor,
    updateNotebook,
    createNotebook,
    deleteNotebook,
    getNotebook,
    handleEmptyTrash,
  } = useSidebarContext()

  const {
    showSuccess,
    showError,
    removeTagFromAllNotes,
    renameTagInAllNotes,
    user,
    selectedNoteId,
    setSelectedNoteId,
    setIsEditorOpen,
    notebookFilter,
    focusedNotebookId,
    setFocusedNotebook,
    exitFocusMode,
  } = useAppStore()

  // Get note actions
  const { createNoteInNotebook } = useNoteActions()

  // Get notebooks hook for focus mode
  const { getNotebook: getNotebookDetails, getNotebookChildren } =
    useNotebooks()

  // User profile modal state
  const [showUserProfile, setShowUserProfile] = useState(false)

  // Use centralized confirm dialog hook
  const { showConfirm, showDeleteConfirm } = useConfirmDialog()

  // Use context menu hook for Electron support
  const contextMenu = useContextMenu()

  // Handle note click
  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId)
    setIsEditorOpen(true)
  }

  // Handle create note in specific notebook
  const handleCreateNoteInNotebook = async (notebookId: string) => {
    try {
      await createNoteInNotebook(notebookId)
      // Show success feedback
      const notebook = getNotebookDetails(notebookId)
      if (notebook) {
        showSuccess(`Note created in "${notebook.name}"`)
      }
    } catch (error) {
      sidebarLogger.error('Failed to create note in notebook:', error)
      // Error is already shown by the hook
    }
  }

  // State management hook
  const {
    tagContextMenu,
    notebookContextMenu,
    trashContextMenu,
    tagSettingsModal,
    createNotebookModal,
    renameNotebookModal,
    editingNotebook,
    editValue,
    expandedNotebooks,
    setTagSettingsModal,
    setCreateNotebookModal,
    setRenameNotebookModal,
    setEditValue,
    handleTagRightClick: handleTagRightClickOriginal,
    handleNotebookRightClick: handleNotebookRightClickOriginal,
    handleTrashRightClick: handleTrashRightClickOriginal,
    closeAllContextMenus,
    toggleNotebookExpansion,
    startEditingNotebook,
    cancelEditingNotebook,
  } = useSidebarState()

  // Enhanced context menu handlers for Electron/React
  const handleNotebookRightClick = React.useCallback((e: React.MouseEvent, notebook: any) => {
    if (contextMenu.isElectron) {
      // Use native Electron menu
      contextMenu.handleNotebookContextMenu(e, notebook, async (action: string) => {
        switch (action) {
          case 'rename':
            setRenameNotebookModal({
              show: true,
              notebookId: notebook.id,
              notebookName: notebook.name,
            })
            break
          case 'delete':
            const hasNotes = notebook.count > 0
            const confirmMessage = hasNotes
              ? `Are you sure you want to delete "${notebook.name}" and move all its notes to the trash?`
              : `Are you sure you want to delete "${notebook.name}"?`
            await showConfirm({
              title: 'Delete Notebook',
              message: confirmMessage,
              type: 'danger',
              confirmText: 'Delete',
              onConfirm: async () => {
                try {
                  await deleteNotebook(notebook.id)
                  showSuccess(`Notebook "${notebook.name}" deleted successfully`)
                } catch (error) {
                  sidebarLogger.error('Failed to delete notebook:', error)
                  showError('Failed to delete notebook')
                }
              }
            })
            break
          case 'createNote':
            await createNoteInNotebook(notebook.id)
            break
        }
      })
    } else {
      // Use React context menu
      handleNotebookRightClickOriginal(e, notebook)
    }
  }, [contextMenu, handleNotebookRightClickOriginal, setRenameNotebookModal, showConfirm,
      deleteNotebook, showSuccess, showError, createNoteInNotebook])

  const handleTagRightClick = React.useCallback((e: React.MouseEvent, x: number, y: number, tagName: string) => {
    if (contextMenu.isElectron) {
      contextMenu.handleTagContextMenu(e, tagName, async (action: string) => {
        switch (action) {
          case 'removeTag':
            await showConfirm({
              title: 'Remove Tag',
              message: `Are you sure you want to remove the tag "${tagName}" from all notes?`,
              type: 'danger',
              confirmText: 'Remove',
              onConfirm: () => {
                removeTagFromAllNotes(tagName)
              }
            })
            break
          case 'changeTagColor':
            setTagSettingsModal({ show: true, tagName })
            break
        }
      })
    } else {
      handleTagRightClickOriginal(e, x, y, tagName)
    }
  }, [contextMenu, handleTagRightClickOriginal, showConfirm, removeTagFromAllNotes, setTagSettingsModal])

  const handleTrashRightClick = React.useCallback((e: React.MouseEvent) => {
    if (contextMenu.isElectron) {
      contextMenu.handleTrashContextMenu(e, async (action: string) => {
        if (action === 'emptyTrash') {
          await handleEmptyTrash()
        }
      })
    } else {
      handleTrashRightClickOriginal(e)
    }
  }, [contextMenu, handleTrashRightClickOriginal, handleEmptyTrash])

  // Filter notebooks based on focus mode
  const displayedNotebooks = React.useMemo(() => {
    console.log('📊 SidebarContent displayedNotebooks calculation:', {
      focusedNotebookId,
      notebooksWithCounts: notebooksWithCounts,
      notebooksWithCountsLength: notebooksWithCounts.length,
      allNotebooksWithCounts: allNotebooksWithCounts,
      allNotebooksWithCountsLength: allNotebooksWithCounts?.length,
      notebooksDetail: notebooksWithCounts.map(nb => ({
        id: nb.id,
        name: nb.name,
        parentId: nb.parentId,
        directCount: nb.directCount,
        totalCount: nb.totalCount
      }))
    })
    
    if (!focusedNotebookId) {
      // When not in focus mode, show only root notebooks
      const rootNotebooks = notebooksWithCounts.filter(nb => !nb.parentId)
      console.log('📊 Root notebooks:', rootNotebooks.map(nb => ({
        id: nb.id,
        name: nb.name,
        parentId: nb.parentId,
        totalCount: nb.totalCount
      })))
      return rootNotebooks
    }

    // In focus mode, show only children of the focused notebook
    const focusedNotebook = allNotebooksWithCounts?.find(
      nb => nb.id === focusedNotebookId
    )
    if (!focusedNotebook) {
      return notebooksWithCounts.filter(nb => !nb.parentId)
    }

    // Return only the children of the focused notebook as root level items
    const childNotebooks =
      allNotebooksWithCounts?.filter(nb => nb.parentId === focusedNotebookId) ||
      []

    return childNotebooks
  }, [focusedNotebookId, notebooksWithCounts, allNotebooksWithCounts])

  return (
    <SidebarContainer onContextMenuClose={closeAllContextMenus}>
      {/* Settings button at the very top */}
      <SidebarSettingsButton onClick={() => setModal('settings', true)} />

      {/* Breadcrumb Navigation - Fixed at top */}
      <AnimatePresence>
        <SidebarBreadcrumb
          onNotebookClick={notebookId => {
            const notebook = getNotebook(notebookId)
            if (notebook) {
              handleSectionClick(`notebook-${notebook.name.toLowerCase()}`)
            }
          }}
          focusedNotebookId={focusedNotebookId}
        />
      </AnimatePresence>

      {/* Filter Bar - Shows active filters */}
      <FilterBar />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedNotebookId || 'all-notebooks'}
            className="px-2 py-2 space-y-4"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
              notebooks={allNotebooksWithCounts || []}
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
                  const notebook = getNotebook(notebookId)
                  if (notebook) {
                    updateNotebook({ ...notebook, name: editValue.trim() })
                    cancelEditingNotebook()
                  }
                }
              }}
              onCancelEdit={cancelEditingNotebook}
              onCreateNoteInNotebook={handleCreateNoteInNotebook}
              onFocusNotebook={setFocusedNotebook}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer with User Profile */}
        <SidebarFooter
          user={user}
          onShowUserProfile={() => setShowUserProfile(true)}
        />
      </div>

      {/* Context Menu Manager */}
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
                // Success notification is handled by the store function
              },
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

            // Confirm deletion
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
                  // Show success toast
                  showSuccess(`Notebook "${notebookName}" deleted successfully`)
                } catch (error) {
                  // Show error toast
                  sidebarLogger.error('Failed to delete notebook:', error)
                  showError('Failed to delete notebook')
                }
              },
            })
            closeAllContextMenus()
          }
        }}
        onEmptyTrash={async () => {
          await handleEmptyTrash()
          closeAllContextMenus()
        }}
      />

      {/* Modals */}
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
            showSuccess(
              `Tag renamed from "${tagSettingsModal.tagName}" to "${newName}" in all notes`
            )
          }
        }}
        createNotebookModal={createNotebookModal}
        onCreateNotebookClose={() => setCreateNotebookModal(false)}
        onCreateNotebook={async (
          name: string,
          color: string,
          parentId?: string | null
        ) => {
          sidebarLogger.group('Create Notebook from UI')
          sidebarLogger.debug('UI create notebook called with:', {
            name,
            color,
            parentId,
          })

          try {
            const result = await createNotebook(name, parentId)
            sidebarLogger.debug('Create notebook result:', result)

            if (result === null) {
              sidebarLogger.error(
                'Failed to create notebook - validation failed'
              )
              showError('Failed to create notebook - validation failed')
            } else {
              sidebarLogger.info('Notebook created successfully:', result.name)
              showSuccess(`Notebook "${result.name}" created successfully`)
            }
          } catch (error) {
            sidebarLogger.error('Create notebook error:', error)
            showError('Failed to create notebook')
          }

          sidebarLogger.groupEnd()
          setCreateNotebookModal(false)
        }}
        existingNotebookNames={(
          allNotebooksWithCounts || notebooksWithCounts
        ).map(n => n.name)}
        availableParents={allNotebooksWithCounts || notebooksWithCounts}
        defaultParentId={focusedNotebookId}
      />

      {/* Rename Notebook Modal */}
      <RenameModal
        isOpen={renameNotebookModal.show}
        onClose={() =>
          setRenameNotebookModal({
            show: false,
            notebookId: '',
            notebookName: '',
          })
        }
        currentName={renameNotebookModal.notebookName}
        title="Rename Notebook"
        onRename={async (newName: string) => {
          const notebook = getNotebook(renameNotebookModal.notebookId)
          if (notebook) {
            try {
              await updateNotebook({ ...notebook, name: newName })
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
}

export default SidebarContent
