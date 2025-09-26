/**
 * Viny Plugin API Implementation
 * Connects plugins to actual app functionality and stores
 */

import { useAppStore } from '../stores/newSimpleStore'
import { logger } from '../utils/logger'
import type { Note } from '../types'
import type { PluginAPI, SecurityPolicy } from '../services/PluginService'

/**
 * Create a real Plugin API instance connected to Viny's systems
 */
export function createVinyPluginAPI(
  pluginName: string,
  policy: SecurityPolicy,
  storeInstance?: any
): PluginAPI {
  // Get store instance (either passed or current)
  const store = storeInstance || useAppStore.getState()

  return {
    notes: createNotesAPI(pluginName, policy, store),
    ui: createUIAPI(pluginName, policy, store),
    editor: createEditorAPI(pluginName, policy, store),
    storage: createStorageAPI(pluginName, policy),
    utils: createUtilsAPI(pluginName, policy),
    markdown: createMarkdownAPI(pluginName, policy),
  }
}

/**
 * Notes API - Connected to Viny's note store
 */
function createNotesAPI(
  pluginName: string,
  policy: SecurityPolicy,
  store: any
): PluginAPI['notes'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  return {
    getAll: (): Note[] => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Getting all notes`)

      // Get notes from store, filter out trashed unless specifically requested
      const notes = store.notes || []
      return notes.filter((note: Note) => !note.isTrashed)
    },

    getById: (id: string): Note | null => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Getting note by ID: ${id}`)

      const notes = store.notes || []
      return (
        notes.find((note: Note) => note.id === id && !note.isTrashed) || null
      )
    },

    create: (noteData: Partial<Note>): Note => {
      checkPermission('notes.write')
      logger.debug(`Plugin(${pluginName}): Creating new note`)

      const newNote: Note = {
        id: generateNoteId(),
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        notebook: noteData.notebook || 'personal',
        tags: noteData.tags || [],
        status: noteData.status || 'draft',
        isPinned: noteData.isPinned || false,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to store
      if (store.addNote) {
        store.addNote(newNote)
      }

      logger.info(`Plugin(${pluginName}): Created note: ${newNote.title}`)
      return newNote
    },

    update: (id: string, updates: Partial<Note>): Note | null => {
      checkPermission('notes.write')
      logger.debug(`Plugin(${pluginName}): Updating note: ${id}`)

      const notes = store.notes || []
      const existingNote = notes.find(
        (note: Note) => note.id === id && !note.isTrashed
      )

      if (!existingNote) {
        logger.warn(`Plugin(${pluginName}): Note not found for update: ${id}`)
        return null
      }

      const updatedNote: Note = {
        ...existingNote,
        ...updates,
        id: existingNote.id, // Prevent ID changes
        updatedAt: new Date().toISOString(),
      }

      // Update in store
      if (store.updateNote) {
        store.updateNote(updatedNote)
      }

      logger.info(`Plugin(${pluginName}): Updated note: ${updatedNote.title}`)
      return updatedNote
    },

    delete: (id: string): boolean => {
      checkPermission('notes.write')
      logger.debug(`Plugin(${pluginName}): Deleting note: ${id}`)

      const notes = store.notes || []
      const note = notes.find((n: Note) => n.id === id && !n.isTrashed)

      if (!note) {
        logger.warn(`Plugin(${pluginName}): Note not found for deletion: ${id}`)
        return false
      }

      // Mark as trashed instead of hard delete
      const trashedNote = {
        ...note,
        isTrashed: true,
        trashedAt: new Date().toISOString(),
      }

      if (store.updateNote) {
        store.updateNote(trashedNote)
      }

      logger.info(`Plugin(${pluginName}): Deleted note: ${note.title}`)
      return true
    },

    search: (query: string): Note[] => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Searching notes: ${query}`)

      const notes = store.notes || []
      const searchTerms = query
        .toLowerCase()
        .split(' ')
        .filter(term => term.length > 0)

      if (searchTerms.length === 0) {
        return []
      }

      const results = notes.filter((note: Note) => {
        if (note.isTrashed) return false

        const searchText =
          `${note.title} ${note.content} ${note.tags?.join(' ') || ''}`.toLowerCase()
        return searchTerms.every(term => searchText.includes(term))
      })

      logger.debug(
        `Plugin(${pluginName}): Search found ${results.length} results`
      )
      return results
    },
  }
}

/**
 * UI API - Connected to Viny's UI systems
 */
function createUIAPI(
  pluginName: string,
  policy: SecurityPolicy,
  store: any
): PluginAPI['ui'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  return {
    showToast: (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info'
    ): void => {
      checkPermission('ui.toast')
      logger.debug(`Plugin(${pluginName}): Showing toast: ${message} [${type}]`)

      // Connect to actual toast system
      const toastId = `plugin_${pluginName}_${Date.now()}`

      if (store.addToast) {
        store.addToast({
          id: toastId,
          message: `[${pluginName}] ${message}`,
          type,
          duration: type === 'error' ? 8000 : 4000,
          timestamp: Date.now(),
        })
      } else if (store.showSuccess && type === 'success') {
        store.showSuccess(`[${pluginName}] ${message}`)
      } else if (store.showError && type === 'error') {
        store.showError(`[${pluginName}] ${message}`)
      } else {
        // Fallback to console
        logger.info(`Plugin(${pluginName}) Toast [${type}]: ${message}`)
      }
    },

    showModal: (content: string, options: any = {}): void => {
      checkPermission('ui.modal')
      logger.debug(`Plugin(${pluginName}): Showing modal`)

      // Connect to actual modal system
      if (store.setActiveModal) {
        store.setActiveModal({
          type: 'plugin',
          data: {
            pluginName,
            title: options.title || `${pluginName} Plugin`,
            content,
            ...options,
          },
        })
      } else {
        // Fallback to alert for now
        alert(`[${pluginName}] ${content}`)
      }
    },

    addSidebarItem: (item: any): void => {
      checkPermission('ui.sidebar')
      logger.debug(`Plugin(${pluginName}): Adding sidebar item`)

      // Store sidebar items for plugins
      const sidebarItems = getPluginUIElements('sidebar')
      sidebarItems.push({
        pluginName,
        id: item.id || `plugin_${pluginName}_sidebar_${Date.now()}`,
        ...item,
      })
      setPluginUIElements('sidebar', sidebarItems)

      // Trigger UI refresh if available
      if (store.refreshUI) {
        store.refreshUI()
      }
    },

    addMenuItem: (item: any): void => {
      checkPermission('ui.menu')
      logger.debug(`Plugin(${pluginName}): Adding menu item`)

      // Store menu items for plugins
      const menuItems = getPluginUIElements('menu')
      menuItems.push({
        pluginName,
        id: item.id || `plugin_${pluginName}_menu_${Date.now()}`,
        ...item,
      })
      setPluginUIElements('menu', menuItems)

      // Trigger UI refresh if available
      if (store.refreshUI) {
        store.refreshUI()
      }
    },

    addToolbarButton: (button: any): void => {
      checkPermission('ui.toolbar')
      logger.debug(`Plugin(${pluginName}): Adding toolbar button`)

      // Store toolbar buttons for plugins
      const toolbarButtons = getPluginUIElements('toolbar')
      toolbarButtons.push({
        pluginName,
        id: button.id || `plugin_${pluginName}_toolbar_${Date.now()}`,
        ...button,
      })
      setPluginUIElements('toolbar', toolbarButtons)

      // Trigger UI refresh if available
      if (store.refreshUI) {
        store.refreshUI()
      }
    },
  }
}

/**
 * Editor API - Connected to Viny's editor
 */
function createEditorAPI(
  pluginName: string,
  policy: SecurityPolicy,
  store: any
): PluginAPI['editor'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  // Get current editor instance (this will need to be connected to actual editor)
  function getEditorInstance(): any {
    // TODO: Connect to actual editor instance
    // This could be Monaco, CodeMirror, or custom editor
    return null
  }

  return {
    insertText: (text: string): void => {
      checkPermission('editor.write')
      logger.debug(`Plugin(${pluginName}): Inserting text`)

      const editor = getEditorInstance()
      if (editor) {
        // Connect to actual editor insert method
        // editor.insertText(text)
      }

      // Store editor command for processing
      addEditorCommand(pluginName, 'insertText', { text })
    },

    replaceSelection: (text: string): void => {
      checkPermission('editor.write')
      logger.debug(`Plugin(${pluginName}): Replacing selection`)

      const editor = getEditorInstance()
      if (editor) {
        // Connect to actual editor replace method
        // editor.replaceSelection(text)
      }

      // Store editor command for processing
      addEditorCommand(pluginName, 'replaceSelection', { text })
    },

    getSelection: (): string => {
      checkPermission('editor.read')
      logger.debug(`Plugin(${pluginName}): Getting selection`)

      const editor = getEditorInstance()
      if (editor) {
        // Connect to actual editor selection method
        // return editor.getSelection()
      }

      // Fallback - get from document selection if available
      if (window.getSelection) {
        return window.getSelection()?.toString() || ''
      }

      return ''
    },

    getCursorPosition: (): number => {
      checkPermission('editor.read')
      logger.debug(`Plugin(${pluginName}): Getting cursor position`)

      const editor = getEditorInstance()
      if (editor) {
        // Connect to actual editor cursor method
        // return editor.getCursorPosition()
      }

      return 0
    },

    setCursorPosition: (position: number): void => {
      checkPermission('editor.write')
      logger.debug(
        `Plugin(${pluginName}): Setting cursor position: ${position}`
      )

      const editor = getEditorInstance()
      if (editor) {
        // Connect to actual editor cursor method
        // editor.setCursorPosition(position)
      }

      // Store editor command for processing
      addEditorCommand(pluginName, 'setCursorPosition', { position })
    },

    addCommand: (command: any): void => {
      checkPermission('editor.commands')
      logger.debug(`Plugin(${pluginName}): Adding command: ${command.name}`)

      // Store custom commands for plugins
      const commands = getPluginUIElements('commands')
      commands.push({
        pluginName,
        id: command.id || `plugin_${pluginName}_cmd_${Date.now()}`,
        ...command,
      })
      setPluginUIElements('commands', commands)
    },

    addKeybinding: (keybinding: any): void => {
      checkPermission('editor.keybindings')
      logger.debug(
        `Plugin(${pluginName}): Adding keybinding: ${keybinding.key}`
      )

      // Store custom keybindings for plugins
      const keybindings = getPluginUIElements('keybindings')
      keybindings.push({
        pluginName,
        id: keybinding.id || `plugin_${pluginName}_key_${Date.now()}`,
        ...keybinding,
      })
      setPluginUIElements('keybindings', keybindings)
    },
  }
}

/**
 * Storage API - Plugin-specific localStorage
 */
function createStorageAPI(
  pluginName: string,
  policy: SecurityPolicy
): PluginAPI['storage'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  const storageKey = `viny_plugin_storage_${pluginName}`

  function getPluginData(): Record<string, any> {
    try {
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      logger.error(`Plugin(${pluginName}): Storage read error`, error)
      return {}
    }
  }

  function setPluginData(data: Record<string, any>): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      logger.error(`Plugin(${pluginName}): Storage write error`, error)
      throw new Error('Storage operation failed')
    }
  }

  return {
    get: (key: string): any => {
      checkPermission('storage.basic')
      logger.debug(`Plugin(${pluginName}): Storage get: ${key}`)

      const data = getPluginData()
      return data[key]
    },

    set: (key: string, value: any): void => {
      checkPermission('storage.basic')
      logger.debug(`Plugin(${pluginName}): Storage set: ${key}`)

      const data = getPluginData()
      data[key] = value
      setPluginData(data)
    },

    remove: (key: string): void => {
      checkPermission('storage.basic')
      logger.debug(`Plugin(${pluginName}): Storage remove: ${key}`)

      const data = getPluginData()
      delete data[key]
      setPluginData(data)
    },

    clear: (): void => {
      checkPermission('storage.basic')
      logger.debug(`Plugin(${pluginName}): Storage clear`)

      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        logger.error(`Plugin(${pluginName}): Storage clear error`, error)
        throw new Error('Storage clear failed')
      }
    },
  }
}

/**
 * Utils API - Utility functions
 */
function createUtilsAPI(
  pluginName: string,
  policy: SecurityPolicy
): PluginAPI['utils'] {
  return {
    generateId: (): string => {
      return `plugin_${pluginName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    formatDate: (date: Date): string => {
      return date.toISOString()
    },

    debounce: (fn: Function, delay: number): Function => {
      let timeoutId: NodeJS.Timeout
      return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(null, args), delay)
      }
    },

    throttle: (fn: Function, delay: number): Function => {
      let lastCall = 0
      return (...args: any[]) => {
        const now = Date.now()
        if (now - lastCall >= delay) {
          lastCall = now
          fn.apply(null, args)
        }
      }
    },
  }
}

/**
 * Markdown API - Preview and rendering integration
 */
function createMarkdownAPI(
  pluginName: string,
  policy: SecurityPolicy
): PluginAPI['markdown'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  return {
    registerHook: (hook: any): (() => void) => {
      checkPermission('markdown.hooks')
      logger.debug(`Plugin(${pluginName}): Registering markdown hook`)

      // Import the registerMarkdownPlugin function dynamically to avoid circular imports
      import('../lib/markdown')
        .then(({ registerMarkdownPlugin }) => {
          const unregister = registerMarkdownPlugin(hook)

          // Store cleanup function for plugin unload
          const cleanupKey = `viny_plugin_markdown_${pluginName}`
          const existingCleanups = JSON.parse(
            localStorage.getItem(cleanupKey) || '[]'
          )
          existingCleanups.push(unregister)
          localStorage.setItem(cleanupKey, JSON.stringify(existingCleanups))

          return unregister
        })
        .catch(error => {
          logger.error(
            `Plugin(${pluginName}): Failed to register markdown hook`,
            error
          )
        })

      // Return a stub cleanup function for immediate use
      return () => {}
    },

    injectCSS: (css: string, pluginId: string): (() => void) => {
      checkPermission('markdown.css')
      logger.debug(
        `Plugin(${pluginName}): Injecting CSS for plugin ${pluginId}`
      )

      // Import the MarkdownProcessor dynamically
      import('../lib/markdown')
        .then(({ MarkdownProcessor }) => {
          return MarkdownProcessor.injectPluginCSS(css, pluginId)
        })
        .catch(error => {
          logger.error(`Plugin(${pluginName}): Failed to inject CSS`, error)
        })

      // Return a stub cleanup function
      return () => {}
    },

    removeCSS: (pluginId: string): void => {
      checkPermission('markdown.css')
      logger.debug(`Plugin(${pluginName}): Removing CSS for plugin ${pluginId}`)

      import('../lib/markdown')
        .then(({ MarkdownProcessor }) => {
          MarkdownProcessor.removePluginCSS(pluginId)
        })
        .catch(error => {
          logger.error(`Plugin(${pluginName}): Failed to remove CSS`, error)
        })
    },

    transform: (content: string, options?: any): string => {
      checkPermission('markdown.transform')
      logger.debug(`Plugin(${pluginName}): Transforming markdown content`)

      // For synchronous transformation, we need to use the existing markdown processor
      try {
        // Import synchronously is not possible, so we'll need to use a different approach
        // For now, return the content as-is and log that async processing is needed
        logger.warn(
          `Plugin(${pluginName}): Markdown transform requires async processing`
        )
        return content
      } catch (error) {
        logger.error(`Plugin(${pluginName}): Markdown transform failed`, error)
        return content
      }
    },
  }
}

// Helper functions

function hasPermission(policy: SecurityPolicy, permission: string): boolean {
  return (
    policy.allowedPermissions.includes('*') ||
    policy.allowedPermissions.includes(permission)
  )
}

function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getPluginUIElements(type: string): any[] {
  try {
    const key = `viny_plugin_ui_${type}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    logger.error(`Failed to get plugin UI elements: ${type}`, error)
    return []
  }
}

function setPluginUIElements(type: string, elements: any[]): void {
  try {
    const key = `viny_plugin_ui_${type}`
    localStorage.setItem(key, JSON.stringify(elements))
  } catch (error) {
    logger.error(`Failed to set plugin UI elements: ${type}`, error)
  }
}

function addEditorCommand(
  pluginName: string,
  command: string,
  data: any
): void {
  // Store editor commands for processing by the actual editor
  const commands = getPluginUIElements('editor_commands')
  commands.push({
    pluginName,
    command,
    data,
    timestamp: Date.now(),
  })
  setPluginUIElements('editor_commands', commands)

  // Dispatch custom event for editor to process
  window.dispatchEvent(
    new CustomEvent('viny:plugin:editor:command', {
      detail: { pluginName, command, data },
    })
  )
}

// Function is already exported at line 14
