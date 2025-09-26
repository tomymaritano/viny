import React from 'react'
import {
  Search,
  FileText,
  Network,
  Calendar,
  Hash,
  Sparkles,
} from 'lucide-react'
import { SLASH_COMMANDS } from '../../config/slashCommands'

interface CommandPaletteProps {
  filter: string
  onSelect: (command: (typeof SLASH_COMMANDS)[0]) => void
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  filter,
  onSelect,
  onClose,
}) => {
  const filtered = SLASH_COMMANDS.filter(cmd =>
    cmd.command.toLowerCase().includes(filter.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full mb-2 w-full max-w-md bg-popover border rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          No commands found matching "{filter}"
        </p>
      </div>
    )
  }

  return (
    <div className="absolute bottom-full mb-2 w-full max-w-md bg-popover border rounded-lg shadow-lg overflow-hidden">
      <div className="p-2 border-b bg-muted/50">
        <p className="text-xs text-muted-foreground">
          Commands matching "{filter}"
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {filtered.map(cmd => {
          const Icon = getCommandIcon(cmd.command)

          return (
            <button
              key={cmd.command}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors"
              onClick={() => {
                onSelect(cmd)
                onClose()
              }}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{cmd.command}</div>
                <div className="text-xs text-muted-foreground">
                  {cmd.description}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">
                    {cmd.shortcut}
                  </kbd>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-2 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground">
          Press{' '}
          <kbd className="px-1 py-0.5 bg-background rounded border text-xs">
            ESC
          </kbd>{' '}
          to cancel
        </p>
      </div>
    </div>
  )
}

function getCommandIcon(command: string) {
  switch (command) {
    case '/search':
      return Search
    case '/summarize':
      return FileText
    case '/graph':
      return Network
    case '/timeline':
      return Calendar
    case '/tags':
      return Hash
    default:
      return Sparkles
  }
}
