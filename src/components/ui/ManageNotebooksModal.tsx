import React, { useState, useMemo, useEffect } from 'react'
import { Icons } from '../Icons'
import { StandardModal } from './StandardModal'
import CreateNotebookModal from './CreateNotebookModal'
import IconButton from './IconButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './SelectRadix'
import type { Notebook } from '../../types/notebook'
import { NOTEBOOK_COLORS } from '../../types/notebook'
import { useNotebooks } from '../../hooks/useNotebooks'
import { getNotebookWithCounts } from '../../utils/notebookTree'
import { useAppStore } from '../../stores/newSimpleStore'
import { useModalContext } from '../../contexts/ModalContext'
import { logger } from '../../utils/logger'

interface ManageNotebooksModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'overview' | 'create' | 'edit' | 'organize'

const ManageNotebooksModal: React.FC<ManageNotebooksModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editParent, setEditParent] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isOperationLoading, setIsOperationLoading] = useState(false)

  const { notes } = useAppStore()
  const {
    notebooks: treeNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    refreshNotebooks,
    getFlattenedNotebooks,
  } = useNotebooks()

  // Use flattened notebooks for getNotebookWithCounts
  const allNotebooks = getFlattenedNotebooks()
  const { openNestedModal } = useModalContext()

  // Note: No manual refresh needed - optimistic updates handle state sync

  // Get hierarchical notebooks with counts
  const hierarchicalNotebooks = useMemo(
    () => getNotebookWithCounts(allNotebooks, notes),
    [allNotebooks, notes]
  )

  // Flatten notebooks for easier manipulation
  const flatNotebooks = useMemo(() => {
    const flatten = (notebooks: any[], level = 0): any[] => {
      const result: any[] = []
      notebooks.forEach(notebook => {
        result.push({ ...notebook, level })
        if (notebook.children && notebook.children.length > 0) {
          result.push(...flatten(notebook.children, level + 1))
        }
      })
      return result
    }
    return flatten(hierarchicalNotebooks)
  }, [hierarchicalNotebooks])

  // Get statistics
  const stats = useMemo(() => {
    const totalCategories = flatNotebooks.length
    const totalNotes = flatNotebooks.reduce(
      (sum, nb) => sum + (nb.totalCount || 0),
      0
    )
    const emptyCategories = flatNotebooks.filter(
      nb => (nb.totalCount || 0) === 0
    ).length
    const maxDepth = Math.max(...flatNotebooks.map(nb => nb.level), 0) + 1

    return { totalCategories, totalNotes, emptyCategories, maxDepth }
  }, [flatNotebooks])

  const handleCreateNotebook = async (
    name: string,
    color: string,
    parentId?: string | null
  ) => {
    setIsOperationLoading(true)
    logger.info('ManageNotebooksModal: Creating new notebook', {
      name,
      color,
      parentId,
    })
    try {
      await createNotebook({ name, color, parentId })
      logger.info('ManageNotebooksModal: Successfully created notebook', {
        name,
      })
      setShowCreateModal(false)
    } catch (error) {
      logger.error('ManageNotebooksModal: Failed to create notebook', {
        name,
        error,
      })
      // Error is already handled by useNotebooks hook
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleCreateModalOpen = () => {
    // Close main modal and open create modal
    onClose()
    setShowCreateModal(true)
  }

  const handleEditStart = (notebook: Notebook) => {
    setEditingNotebook(notebook)
    setEditName(notebook.name)
    setEditColor(notebook.color)
    setEditParent(notebook.parentId)
    setActiveTab('edit')
  }

  const handleEditSave = async () => {
    if (!editingNotebook) return

    setIsOperationLoading(true)
    logger.info('ManageNotebooksModal: Updating notebook', {
      id: editingNotebook.id,
      oldName: editingNotebook.name,
      newName: editName.trim(),
      newColor: editColor,
      newParent: editParent,
    })
    try {
      const updatedNotebook = {
        ...editingNotebook,
        name: editName.trim(),
        color: editColor,
        parentId: editParent,
      }

      await updateNotebook(updatedNotebook)
      logger.info('ManageNotebooksModal: Successfully updated notebook', {
        id: editingNotebook.id,
        name: editName.trim(),
      })
      setEditingNotebook(null)
      setActiveTab('overview')
    } catch (error) {
      logger.error('ManageNotebooksModal: Failed to update notebook', {
        id: editingNotebook.id,
        error,
      })
      // Error is already handled by useNotebooks hook
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingNotebook(null)
    setActiveTab('overview')
  }

  const handleDelete = async (notebookId: string) => {
    setIsOperationLoading(true)
    const notebook = allNotebooks.find(nb => nb.id === notebookId)
    logger.info('ManageNotebooksModal: Deleting notebook', {
      id: notebookId,
      name: notebook?.name || 'Unknown',
    })
    try {
      await deleteNotebook(notebookId)
      logger.info('ManageNotebooksModal: Successfully deleted notebook', {
        id: notebookId,
        name: notebook?.name || 'Unknown',
      })
      setDeleteConfirm(null)
    } catch (error) {
      logger.error('ManageNotebooksModal: Failed to delete notebook', {
        id: notebookId,
        name: notebook?.name || 'Unknown',
        error,
      })
      // Error is already handled by useNotebooks hook
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleDeleteModalOpen = (notebookId: string) => {
    // Keep main modal open and show delete confirmation overlay
    setDeleteConfirm(notebookId)
  }

  const renderNotebookItem = (notebook: any) => {
    const indent = notebook.level * 20

    return (
      <div
        key={notebook.id}
        className="flex items-center gap-3 p-3 bg-theme-bg-secondary rounded-lg hover:bg-theme-bg-tertiary transition-colors"
      >
        {/* Color indicator with subtle margin */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: getNotebookColor(notebook),
            marginLeft: `${notebook.level * 20 + 8}px`,
          }}
        />

        {/* Category info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-theme-text-primary">
            {notebook.name}
          </div>
          <div className="text-xs text-theme-text-muted">
            {notebook.directCount || 0} direct notes •{' '}
            {notebook.totalCount || 0} total notes
            {notebook.level > 0 && ` • Level ${notebook.level + 1}`}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={Icons.Edit}
            onClick={() => handleEditStart(notebook)}
            variant="ghost"
            size={14}
            title="Edit category"
            aria-label="Edit category"
            className="ml-2 hover:bg-theme-bg-tertiary"
          />

          {(notebook.totalCount || 0) === 0 && (
            <IconButton
              icon={Icons.Trash2}
              onClick={() => handleDeleteModalOpen(notebook.id)}
              variant="ghost"
              size={14}
              title="Delete empty category"
              aria-label="Delete empty category"
              className="ml-1 hover:text-red-400 hover:bg-red-50/50"
            />
          )}
        </div>
      </div>
    )
  }

  const getNotebookColor = (notebook: any) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      yellow: '#eab308',
      red: '#ef4444',
      purple: '#a855f7',
      cyan: '#06b6d4',
    }
    return colorMap[notebook.color] || '#3b82f6'
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-theme-bg-secondary rounded-lg">
          <div className="text-2xl font-bold text-theme-accent-primary">
            {stats.totalCategories}
          </div>
          <div className="text-sm text-theme-text-muted">Total Categories</div>
        </div>
        <div className="p-4 bg-theme-bg-secondary rounded-lg">
          <div className="text-2xl font-bold text-theme-accent-primary">
            {stats.totalNotes}
          </div>
          <div className="text-sm text-theme-text-muted">Total Notes</div>
        </div>
        <div className="p-4 bg-theme-bg-secondary rounded-lg">
          <div className="text-2xl font-bold text-theme-text-muted">
            {stats.emptyCategories}
          </div>
          <div className="text-sm text-theme-text-muted">Empty Categories</div>
        </div>
        <div className="p-4 bg-theme-bg-secondary rounded-lg">
          <div className="text-2xl font-bold text-theme-text-muted">
            {stats.maxDepth}
          </div>
          <div className="text-sm text-theme-text-muted">Max Depth</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCreateModalOpen}
          className="flex items-center gap-2 px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 transition-colors"
        >
          <Icons.Plus size={16} />
          New Category
        </button>
        <button
          onClick={() => setActiveTab('organize')}
          className="flex items-center gap-2 px-4 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-bg-tertiary transition-colors"
        >
          <Icons.Settings size={16} />
          Organize
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-2">{flatNotebooks.map(renderNotebookItem)}</div>
    </div>
  )

  const renderEditTab = () => {
    if (!editingNotebook) return null

    const availableParents = flatNotebooks.filter(
      nb => nb.id !== editingNotebook.id && nb.level < 4
    )

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <IconButton
            icon={Icons.ArrowLeft}
            onClick={handleEditCancel}
            variant="ghost"
            size={12}
            title="Back to overview"
            aria-label="Back to overview"
            className="mr-2"
          />
          <h3 className="font-medium text-theme-text-primary">
            Edit "{editingNotebook.name}"
          </h3>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Category name
          </label>
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          />
        </div>

        {/* Parent */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            Parent Category
          </label>
          <Select
            value={editParent || '__root__'}
            onValueChange={value =>
              setEditParent(value === '__root__' ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__root__">Root Level</SelectItem>
              {availableParents.map(parent => (
                <SelectItem key={parent.id} value={parent.id}>
                  {'  '.repeat(parent.level)}
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-3">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {NOTEBOOK_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => setEditColor(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  editColor === color.value
                    ? 'border-theme-text-primary scale-110'
                    : 'border-theme-border-primary hover:scale-105'
                }`}
                style={{
                  backgroundColor: getNotebookColor({ color: color.value }),
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleEditSave}
            disabled={!editName.trim() || isOperationLoading}
            className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:bg-theme-accent-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isOperationLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isOperationLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleEditCancel}
            className="px-4 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-bg-tertiary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const renderOrganizeTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <IconButton
          icon={Icons.ArrowLeft}
          onClick={() => setActiveTab('overview')}
          variant="ghost"
          size={12}
          title="Back to overview"
          aria-label="Back to overview"
          className="mr-2"
        />
        <h3 className="font-medium text-theme-text-primary">
          Organize Categories
        </h3>
      </div>

      <div className="text-sm text-theme-text-muted mb-4">
        Advanced organization features coming soon!
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-theme-bg-secondary rounded-lg">
          <div className="font-medium text-theme-text-primary mb-1">
            Drag & Drop
          </div>
          <div className="text-xs text-theme-text-muted">
            Reorder categories and change hierarchy with drag and drop
          </div>
        </div>
        <div className="p-3 bg-theme-bg-secondary rounded-lg">
          <div className="font-medium text-theme-text-primary mb-1">
            Bulk Operations
          </div>
          <div className="text-xs text-theme-text-muted">
            Move multiple categories, bulk color changes, and mass operations
          </div>
        </div>
        <div className="p-3 bg-theme-bg-secondary rounded-lg">
          <div className="font-medium text-theme-text-primary mb-1">
            Import/Export
          </div>
          <div className="text-xs text-theme-text-muted">
            Export category structure and import from other applications
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Icons.Book },
    {
      id: 'edit' as TabType,
      label: 'Edit',
      icon: Icons.Edit,
      hidden: !editingNotebook,
    },
    { id: 'organize' as TabType, label: 'Organize', icon: Icons.Settings },
  ]

  return (
    <>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Categories"
        size="large"
        closeOnEscape={true}
        closeOnBackdrop={true}
        footer={
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-theme-bg-primary border border-theme-border-primary rounded hover:bg-theme-bg-secondary transition-colors"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-theme-border-primary p-4">
            <nav className="space-y-1">
              {tabs
                .filter(tab => !tab.hidden)
                .map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-theme-accent-primary text-white'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'edit' && renderEditTab()}
              {activeTab === 'organize' && renderOrganizeTab()}
            </div>
          </div>
        </div>
      </StandardModal>

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNotebook}
        existingNames={allNotebooks?.map(nb => nb.name) || []}
        availableParents={allNotebooks || []}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <StandardModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Category"
          size="sm"
        >
          <div className="p-4">
            <p className="text-sm text-theme-text-secondary mb-4">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-2 bg-theme-bg-secondary text-theme-text-primary rounded-lg hover:bg-theme-bg-tertiary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </StandardModal>
      )}
    </>
  )
}

export default ManageNotebooksModal
