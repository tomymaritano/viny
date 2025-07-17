import React, { useState, useEffect } from 'react'
import BaseModal from '../ui/BaseModal'
import { Icons } from '../Icons'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  title: string
  onRename: (newName: string) => void
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  currentName,
  title,
  onRename
}) => {
  const [newName, setNewName] = useState(currentName)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
      setError('')
    }
  }, [isOpen, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = newName.trim()
    
    if (!trimmedName) {
      setError('Name cannot be empty')
      return
    }
    
    if (trimmedName === currentName) {
      onClose()
      return
    }
    
    onRename(trimmedName)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Icons.Edit size={20} />}
      maxWidth="sm"
      closeOnEscape={true}
    >
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">
            New name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter new name..."
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            autoFocus
          />
          {error && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-theme-accent-primary hover:bg-theme-accent-primary-hover text-white rounded-md transition-colors"
          >
            Rename
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default RenameModal