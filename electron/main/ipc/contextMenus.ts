import { ipcMain, Menu, MenuItem, MenuItemConstructorOptions, clipboard } from 'electron'
import type { WindowManager } from '../windows/WindowManager'
import type { Note } from '../../shared/types'
import { IPC_CHANNELS } from '../../shared/constants/ipc'

export function setupContextMenus(windowManager: WindowManager): void {
  // Note context menu
  ipcMain.on(IPC_CHANNELS.SHOW_NOTE_CONTEXT_MENU, (event, note: Note) => {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'Export Note',
        submenu: [
          {
            label: 'As Markdown',
            click: () => {
              event.sender.send('export-note', { note, format: 'markdown' })
            }
          },
          {
            label: 'As HTML',
            click: () => {
              event.sender.send('export-note', { note, format: 'html' })
            }
          },
          {
            label: 'As PDF',
            click: () => {
              event.sender.send('export-note', { note, format: 'pdf' })
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: note.isPinned ? 'Unpin Note' : 'Pin Note',
        click: () => {
          event.sender.send('toggle-pin-note', note.id)
        }
      },
      {
        label: 'Duplicate Note',
        click: () => {
          event.sender.send('duplicate-note', note.id)
        }
      },
      { type: 'separator' },
      {
        label: 'Copy Note Link',
        click: () => {
          clipboard.writeText(`viny://note/${note.id}`)
        }
      },
      {
        label: 'Open in New Window',
        click: () => {
          windowManager.createNoteWindow(note)
        }
      },
      {
        label: 'View History',
        click: () => {
          event.sender.send('view-note-history', note.id)
        }
      },
      { type: 'separator' },
      {
        label: note.isTrashed ? 'Restore Note' : 'Move to Trash',
        click: () => {
          if (note.isTrashed) {
            event.sender.send('restore-note', note.id)
          } else {
            event.sender.send('delete-note', note.id)
          }
        }
      },
      ...(note.isTrashed ? [
        {
          label: 'Delete Permanently',
          click: () => {
            event.sender.send('permanent-delete-note', note.id)
          }
        } as MenuItemConstructorOptions
      ] : [])
    ]

    const menu = Menu.buildFromTemplate(template)
    menu.popup()
  })

  // Generic context menu
  ipcMain.on(IPC_CHANNELS.SHOW_CONTEXT_MENU, (event, { type, context }) => {
    let template: MenuItemConstructorOptions[] = []

    switch (type) {
      case 'notebook':
        template = [
          {
            label: 'New Note',
            click: () => {
              event.sender.send('create-note-in-notebook', context.id)
            }
          },
          {
            label: 'New Sub-notebook',
            click: () => {
              event.sender.send('create-new-notebook', { parentId: context.id })
            }
          },
          { type: 'separator' },
          {
            label: 'Rename',
            click: () => {
              event.sender.send('rename-notebook', context.id)
            }
          },
          {
            label: 'Delete',
            click: () => {
              event.sender.send('delete-notebook', context.id)
            }
          },
          { type: 'separator' },
          {
            label: 'Expand All',
            click: () => {
              event.sender.send('expand-all-notebooks')
            }
          },
          {
            label: 'Collapse All',
            click: () => {
              event.sender.send('collapse-all-notebooks')
            }
          }
        ]
        break

      case 'tag':
        template = [
          {
            label: 'Rename Tag',
            click: () => {
              event.sender.send('rename-tag', context.tag)
            }
          },
          {
            label: 'Change Color',
            click: () => {
              event.sender.send('change-tag-color', context.tag)
            }
          },
          { type: 'separator' },
          {
            label: 'Remove Tag',
            click: () => {
              event.sender.send('remove-tag', context.tag)
            }
          }
        ]
        break

      case 'trash':
        template = [
          {
            label: 'Empty Trash',
            click: () => {
              event.sender.send('empty-trash')
            }
          }
        ]
        break

      case 'editor':
        template = [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]
        break

      default:
        return
    }

    const menu = Menu.buildFromTemplate(template)
    menu.popup()
  })
}