import React, { useCallback, useEffect } from 'react'
import { IPC_CHANNELS } from '../../electron/shared/constants/ipc'

interface ContextMenuOptions {
  type: 'notebook' | 'tag' | 'trash' | 'note' | 'editor'
  context?: any
  position?: { x: number; y: number }
  onAction?: (action: string, data?: any) => void
}

/**
 * Hook for handling context menus that works in both Web and Electron
 *
 * In Electron: Uses native context menus via IPC
 * In Web: Falls back to React-based context menus
 */
export const useContextMenu = () => {
  const isElectron = window.electronAPI?.isElectron || false

  // Setup Electron listeners for context menu actions
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return

    const listeners: Array<{ channel: string; handler: any }> = []

    // Cleanup on unmount
    return () => {
      listeners.forEach(({ channel }) => {
        window.electronAPI?.removeAllListeners?.(channel)
      })
    }
  }, [isElectron])

  const showContextMenu = useCallback((options: ContextMenuOptions) => {
    const { type, context, position, onAction } = options

    if (isElectron && window.electronAPI) {
      // Use native Electron context menus
      switch (type) {
        case 'note':
          window.electronAPI.send(IPC_CHANNELS.SHOW_NOTE_CONTEXT_MENU, context)
          break
        default:
          window.electronAPI.send(IPC_CHANNELS.SHOW_CONTEXT_MENU, { type, context })
          break
      }

      // Listen for actions from Electron menu
      const handlers: { [key: string]: (data?: any) => void } = {
        'create-note-in-notebook': (id: string) => onAction?.('createNote', id),
        'rename-notebook': (id: string) => onAction?.('rename', id),
        'delete-notebook': (id: string) => onAction?.('delete', id),
        'rename-tag': (tag: string) => onAction?.('renameTag', tag),
        'remove-tag': (tag: string) => onAction?.('removeTag', tag),
        'change-tag-color': (tag: string) => onAction?.('changeTagColor', tag),
        'empty-trash': () => onAction?.('emptyTrash'),
        'delete-note': (id: string) => onAction?.('deleteNote', id),
        'restore-note': (id: string) => onAction?.('restoreNote', id),
        'permanent-delete-note': (id: string) => onAction?.('permanentDelete', id),
        'toggle-pin-note': (id: string) => onAction?.('togglePin', id),
        'duplicate-note': (id: string) => onAction?.('duplicate', id),
        'export-note': (data: any) => onAction?.('export', data),
      }

      // Register handlers temporarily
      Object.entries(handlers).forEach(([channel, handler]) => {
        // Remove any existing listener first
        window.electronAPI?.removeAllListeners?.(channel)
        // Then add the new one
        window.electronAPI?.on?.(channel, handler)
      })

      // Set up cleanup after a delay
      setTimeout(() => {
        Object.keys(handlers).forEach(channel => {
          window.electronAPI?.removeAllListeners?.(channel)
        })
      }, 5000) // Clean up after 5 seconds
    } else {
      // In web, return position for React context menu
      return position
    }
  }, [isElectron])

  const handleNotebookContextMenu = useCallback((
    e: React.MouseEvent,
    notebook: any,
    onAction: (action: string, data?: any) => void
  ): { x: number; y: number } | void => {
    e.preventDefault()
    e.stopPropagation()

    const position = { x: e.clientX, y: e.clientY }

    if (isElectron) {
      showContextMenu({
        type: 'notebook',
        context: notebook,
        position,
        onAction
      })
      return
    } else {
      // Return position for React context menu
      return position
    }
  }, [isElectron, showContextMenu])

  const handleTagContextMenu = useCallback((
    e: React.MouseEvent,
    tag: string,
    onAction: (action: string, data?: any) => void
  ): { x: number; y: number } | void => {
    e.preventDefault()
    e.stopPropagation()

    const position = { x: e.clientX, y: e.clientY }

    if (isElectron) {
      showContextMenu({
        type: 'tag',
        context: { tag },
        position,
        onAction
      })
      return
    } else {
      // Return position for React context menu
      return position
    }
  }, [isElectron, showContextMenu])

  const handleTrashContextMenu = useCallback((
    e: React.MouseEvent,
    onAction: (action: string, data?: any) => void
  ): { x: number; y: number } | void => {
    e.preventDefault()
    e.stopPropagation()

    const position = { x: e.clientX, y: e.clientY }

    if (isElectron) {
      showContextMenu({
        type: 'trash',
        context: {},
        position,
        onAction
      })
      return
    } else {
      // Return position for React context menu
      return position
    }
  }, [isElectron, showContextMenu])

  return {
    isElectron,
    showContextMenu,
    handleNotebookContextMenu,
    handleTagContextMenu,
    handleTrashContextMenu,
  }
}