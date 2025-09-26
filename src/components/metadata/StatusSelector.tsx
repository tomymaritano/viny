import React from 'react'
import { Icons } from '../Icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui/DropdownMenuRadix'

interface StatusOption {
  value: string
  label: string
  color: string
  icon: string
}

interface StatusSelectorProps {
  status?: string
  onStatusChange: (e: { target: { value: string } }) => void
  statusOptions: StatusOption[]
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  status,
  onStatusChange,
  statusOptions,
}) => {
  const currentStatus = statusOptions.find(s => s.value === status)

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1 px-2 py-1 text-xs bg-theme-bg-tertiary/50 text-theme-text-secondary rounded hover:bg-theme-bg-tertiary transition-colors border-none"
            title={`Status: ${currentStatus?.label || 'None'}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${currentStatus?.color || 'bg-gray-400'}`}
            />
            <span className="max-w-12 truncate font-medium">
              {currentStatus?.label || 'Status'}
            </span>
            <Icons.ChevronDown
              size={12}
              className="transition-transform group-data-[state=open]:rotate-180"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-36">
          {statusOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                onStatusChange({ target: { value: option.value } })
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${option.color} mr-2`}
              />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default StatusSelector
