import React from 'react'
import { Icons } from '../../Icons'
import type { Note } from '../../../types'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalClose,
} from '../../ui/Modal'
import IconButton from '../../ui/IconButton'

interface EditorOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onDuplicate: () => void
  onDelete: () => void
  onPin: () => void
  onExport: () => void
  onOpenInNewWindow: () => void
  onCopyLink: () => void
  selectedNote?: Note | null
}

const EditorOptionsModal: React.FC<EditorOptionsModalProps> = ({
  isOpen,
  onClose,
  onDuplicate,
  onDelete,
  onPin,
  onExport,
  onOpenInNewWindow,
  onCopyLink,
  selectedNote,
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent
        className="fixed right-0 top-0 h-full w-80 rounded-none border-l border-theme-border-primary shadow-xl translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        variant="default"
      >
        <ModalHeader className="p-4 border-b border-theme-border-primary">
          <div className="flex items-center justify-between">
            <ModalTitle className="text-lg font-semibold text-theme-text-primary">
              Note Options
            </ModalTitle>
            <ModalClose asChild>
              <IconButton
                icon={Icons.X}
                onClick={onClose}
                title="Close"
                size={16}
                variant="ghost"
                aria-label="Close options"
              />
            </ModalClose>
          </div>
        </ModalHeader>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Pin/Unpin Note */}
          <button
            onClick={onPin}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
          >
            <Icons.Pin
              size={16}
              className={
                selectedNote?.isPinned
                  ? 'text-theme-accent-primary'
                  : 'text-theme-text-muted'
              }
            />
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                {selectedNote?.isPinned ? 'Unpin Note' : 'Pin to Top'}
              </div>
              <div className="text-xs text-theme-text-muted">
                {selectedNote?.isPinned
                  ? 'Remove from pinned notes'
                  : 'Keep this note at the top'}
              </div>
            </div>
          </button>

          {/* Duplicate Note */}
          <button
            onClick={onDuplicate}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
          >
            <Icons.Copy size={16} className="text-theme-text-muted" />
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Duplicate Note
              </div>
              <div className="text-xs text-theme-text-muted">
                Create a copy of this note
              </div>
            </div>
          </button>

          {/* Export Note */}
          <button
            onClick={onExport}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
          >
            <Icons.Download size={16} className="text-theme-text-muted" />
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Export Note
              </div>
              <div className="text-xs text-theme-text-muted">
                Download as Markdown, PDF, or HTML
              </div>
            </div>
          </button>

          {/* Open in New Window */}
          {window.electronAPI?.isElectron && (
            <button
              onClick={onOpenInNewWindow}
              className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
            >
              <Icons.ExternalLink size={16} className="text-theme-text-muted" />
              <div>
                <div className="text-sm font-medium text-theme-text-primary">
                  Open in New Window
                </div>
                <div className="text-xs text-theme-text-muted">
                  Edit in a separate window
                </div>
              </div>
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={onCopyLink}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-theme-bg-secondary/50 transition-colors"
          >
            <Icons.Link size={16} className="text-theme-text-muted" />
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Copy Link
              </div>
              <div className="text-xs text-theme-text-muted">
                Copy link to this note
              </div>
            </div>
          </button>

          <div className="border-t border-theme-border-primary my-2" />

          {/* Delete Note */}
          <button
            onClick={onDelete}
            className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-red-500/10 transition-colors text-theme-accent-red"
          >
            <Icons.Trash size={16} className="text-theme-accent-red" />
            <div>
              <div className="text-sm font-medium">Move to Trash</div>
              <div className="text-xs text-theme-text-muted">
                Move this note to trash
              </div>
            </div>
          </button>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default EditorOptionsModal
