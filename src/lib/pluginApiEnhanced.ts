/**
 * Enhanced Viny Plugin API - Repository Pattern Integration
 * Connects plugins to repository layer for better performance and consistency
 */

import { createDocumentRepository } from './repositories/RepositoryFactory'
import { withRepositoryOperation } from '../utils/repositoryHelpers'
import { logger } from '../utils/logger'
import type { Note, Notebook } from '../types'
import type { IDocumentRepository } from './repositories/IRepository'
import type { PluginAPI, SecurityPolicy } from '../services/PluginService'

/**
 * Create an enhanced Plugin API with Repository Pattern integration
 */
export function createEnhancedPluginAPI(
  pluginName: string,
  policy: SecurityPolicy
): PluginAPI {
  return {
    notes: createEnhancedNotesAPI(pluginName, policy),
    notebooks: createEnhancedNotebooksAPI(pluginName, policy),
    ui: createUIAPI(pluginName, policy),
    editor: createEditorAPI(pluginName, policy),
    storage: createStorageAPI(pluginName, policy),
    utils: createUtilsAPI(pluginName, policy),
    markdown: createMarkdownAPI(pluginName, policy),
  }
}

/**
 * Enhanced Notes API using Repository Pattern
 */
function createEnhancedNotesAPI(
  pluginName: string,
  policy: SecurityPolicy
): PluginAPI['notes'] {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Plugin ${pluginName}: Permission denied - ${permission}`)
    }
  }

  async function getRepository(): Promise<IDocumentRepository> {
    const repository = createDocumentRepository()
    await repository.initialize()
    return repository
  }

  return {
    // Read Operations
    getAll: async (): Promise<Note[]> => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Getting all notes via repository`)

      return (
        withRepositoryOperation(
          async repository => {
            const result = await repository.loadAllNotes()
            return result.filter(note => !note.isTrashed)
          },
          { operationName: `plugin-${pluginName}-get-all-notes` },
          () => {}, // No force refresh needed for read-only
          undefined,
          error => {
            logger.error(
              `Plugin(${pluginName}) failed to get all notes:`,
              error
            )
            throw new Error(`Failed to retrieve notes: ${error}`)
          }
        ) || []
      )
    },

    getById: async (id: string): Promise<Note | null> => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Getting note by ID: ${id}`)

      return withRepositoryOperation(
        async repository => {
          const note = await repository.loadNote(id)
          return note && !note.isTrashed ? note : null
        },
        { operationName: `plugin-${pluginName}-get-note-${id}` },
        () => {},
        undefined,
        error => {
          logger.error(`Plugin(${pluginName}) failed to get note ${id}:`, error)
          return null // Return null instead of throwing for single note retrieval
        }
      )
    },

    search: async (
      query: string,
      options?: {
        tags?: string[]
        notebook?: string
        includeContent?: boolean
      }
    ): Promise<Note[]> => {
      checkPermission('notes.read')
      logger.debug(
        `Plugin(${pluginName}): Searching notes with query: "${query}"`
      )

      return (
        withRepositoryOperation(
          async repository => {
            const allNotes = await repository.loadAllNotes()
            const activeNotes = allNotes.filter(note => !note.isTrashed)

            // Apply search filters
            return activeNotes.filter(note => {
              // Text search
              const searchText = options?.includeContent
                ? `${note.title} ${note.content}`.toLowerCase()
                : note.title.toLowerCase()
              const matchesQuery = searchText.includes(query.toLowerCase())

              // Tag filter
              const matchesTags =
                !options?.tags ||
                options.tags.some(tag => note.tags.includes(tag))

              // Notebook filter
              const matchesNotebook =
                !options?.notebook || note.notebook === options.notebook

              return matchesQuery && matchesTags && matchesNotebook
            })
          },
          { operationName: `plugin-${pluginName}-search-notes` },
          () => {},
          undefined,
          error => {
            logger.error(`Plugin(${pluginName}) search failed:`, error)
            throw new Error(`Search failed: ${error}`)
          }
        ) || []
      )
    },

    // Write Operations
    create: async (noteData: Partial<Note>): Promise<Note> => {
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

      return withRepositoryOperation(
        async repository => {
          await repository.saveNote(newNote)
          return newNote
        },
        { operationName: `plugin-${pluginName}-create-note` },
        () => {
          // Plugin operations don't trigger UI refresh automatically
          // The plugin should handle UI updates if needed
        },
        note => {
          logger.info(
            `Plugin(${pluginName}): Successfully created note "${note.title}"`
          )
        },
        error => {
          logger.error(`Plugin(${pluginName}) failed to create note:`, error)
          throw new Error(`Failed to create note: ${error}`)
        }
      ) as Note
    },

    update: async (id: string, updates: Partial<Note>): Promise<Note> => {
      checkPermission('notes.write')
      logger.debug(`Plugin(${pluginName}): Updating note ${id}`)

      return withRepositoryOperation(
        async repository => {
          const existingNote = await repository.loadNote(id)
          if (!existingNote || existingNote.isTrashed) {
            throw new Error(`Note ${id} not found or is trashed`)
          }

          const updatedNote: Note = {
            ...existingNote,
            ...updates,
            id, // Ensure ID cannot be changed
            updatedAt: new Date().toISOString(),
          }

          await repository.saveNote(updatedNote)
          return updatedNote
        },
        { operationName: `plugin-${pluginName}-update-note-${id}` },
        () => {},
        note => {
          logger.info(
            `Plugin(${pluginName}): Successfully updated note "${note.title}"`
          )
        },
        error => {
          logger.error(
            `Plugin(${pluginName}) failed to update note ${id}:`,
            error
          )
          throw new Error(`Failed to update note: ${error}`)
        }
      ) as Note
    },

    delete: async (id: string, permanent = false): Promise<void> => {
      checkPermission('notes.delete')
      logger.debug(
        `Plugin(${pluginName}): ${permanent ? 'Permanently deleting' : 'Trashing'} note ${id}`
      )

      return withRepositoryOperation(
        async repository => {
          if (permanent) {
            await repository.deleteNote(id)
          } else {
            const note = await repository.loadNote(id)
            if (note) {
              await repository.saveNote({
                ...note,
                isTrashed: true,
                updatedAt: new Date().toISOString(),
              })
            }
          }
        },
        { operationName: `plugin-${pluginName}-delete-note-${id}` },
        () => {},
        () => {
          logger.info(
            `Plugin(${pluginName}): Successfully ${permanent ? 'deleted' : 'trashed'} note ${id}`
          )
        },
        error => {
          logger.error(
            `Plugin(${pluginName}) failed to delete note ${id}:`,
            error
          )
          throw new Error(`Failed to delete note: ${error}`)
        }
      )
    },

    // Batch Operations for Performance
    createBatch: async (notesData: Partial<Note>[]): Promise<Note[]> => {
      checkPermission('notes.write')
      logger.debug(
        `Plugin(${pluginName}): Creating ${notesData.length} notes in batch`
      )

      const newNotes = notesData.map(noteData => ({
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
      }))

      return withRepositoryOperation(
        async repository => {
          // Save all notes in batch
          await Promise.all(newNotes.map(note => repository.saveNote(note)))
          return newNotes
        },
        {
          operationName: `plugin-${pluginName}-create-batch-${newNotes.length}`,
        },
        () => {},
        notes => {
          logger.info(
            `Plugin(${pluginName}): Successfully created ${notes.length} notes in batch`
          )
        },
        error => {
          logger.error(
            `Plugin(${pluginName}) failed to create notes in batch:`,
            error
          )
          throw new Error(`Failed to create notes: ${error}`)
        }
      ) as Note[]
    },

    // Statistics for plugin insights
    getStats: async (): Promise<{
      total: number
      byNotebook: Record<string, number>
      byTag: Record<string, number>
      byStatus: Record<string, number>
    }> => {
      checkPermission('notes.read')
      logger.debug(`Plugin(${pluginName}): Getting note statistics`)

      return withRepositoryOperation(
        async repository => {
          const allNotes = await repository.loadAllNotes()
          const activeNotes = allNotes.filter(note => !note.isTrashed)

          const stats = {
            total: activeNotes.length,
            byNotebook: {} as Record<string, number>,
            byTag: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
          }

          activeNotes.forEach(note => {
            // Count by notebook
            stats.byNotebook[note.notebook] =
              (stats.byNotebook[note.notebook] || 0) + 1

            // Count by status
            stats.byStatus[note.status] = (stats.byStatus[note.status] || 0) + 1

            // Count by tags
            note.tags.forEach(tag => {
              stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
            })
          })

          return stats
        },
        { operationName: `plugin-${pluginName}-get-stats` },
        () => {},
        undefined,
        error => {
          logger.error(`Plugin(${pluginName}) failed to get statistics:`, error)
          throw new Error(`Failed to get statistics: ${error}`)
        }
      ) as any
    },
  }
}

/**
 * Enhanced Notebooks API using Repository Pattern
 */
function createEnhancedNotebooksAPI(
  pluginName: string,
  policy: SecurityPolicy
): any {
  function checkPermission(permission: string): void {
    if (!hasPermission(policy, permission)) {
      throw new Error(`Plugin ${pluginName}: Permission denied - ${permission}`)
    }
  }

  return {
    getAll: async (): Promise<Notebook[]> => {
      checkPermission('notebooks.read')
      logger.debug(
        `Plugin(${pluginName}): Getting all notebooks via repository`
      )

      return (
        withRepositoryOperation(
          async repository => {
            return await repository.loadAllNotebooks()
          },
          { operationName: `plugin-${pluginName}-get-all-notebooks` },
          () => {},
          undefined,
          error => {
            logger.error(
              `Plugin(${pluginName}) failed to get notebooks:`,
              error
            )
            throw new Error(`Failed to retrieve notebooks: ${error}`)
          }
        ) || []
      )
    },

    create: async (notebookData: Partial<Notebook>): Promise<Notebook> => {
      checkPermission('notebooks.write')
      logger.debug(`Plugin(${pluginName}): Creating new notebook`)

      const newNotebook: Notebook = {
        id: generateNotebookId(),
        name: notebookData.name || 'Untitled Notebook',
        parentId: notebookData.parentId || null,
        description: notebookData.description || '',
        color: notebookData.color || '#3b82f6',
        icon: notebookData.icon || '📓',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return withRepositoryOperation(
        async repository => {
          await repository.saveNotebook(newNotebook)
          return newNotebook
        },
        { operationName: `plugin-${pluginName}-create-notebook` },
        () => {},
        notebook => {
          logger.info(
            `Plugin(${pluginName}): Successfully created notebook "${notebook.name}"`
          )
        },
        error => {
          logger.error(
            `Plugin(${pluginName}) failed to create notebook:`,
            error
          )
          throw new Error(`Failed to create notebook: ${error}`)
        }
      ) as Notebook
    },
  }
}

// Utility functions
function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateNotebookId(): string {
  return `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function hasPermission(policy: SecurityPolicy, permission: string): boolean {
  // Implement permission checking logic based on the security policy
  return (
    policy.permissions?.includes(permission) ||
    policy.permissions?.includes('*') ||
    false
  )
}

// Re-export existing API functions that don't need repository integration
import {
  createUIAPI,
  createEditorAPI,
  createStorageAPI,
  createUtilsAPI,
  createMarkdownAPI,
} from './pluginApi'

export {
  createUIAPI,
  createEditorAPI,
  createStorageAPI,
  createUtilsAPI,
  createMarkdownAPI,
}
