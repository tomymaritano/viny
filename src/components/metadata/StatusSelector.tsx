/**
 * Status selector dropdown component
 */
import React from 'react'
import Icons from '../Icons'
import DropdownMenu, { DropdownMenuItem } from '../ui/DropdownMenu'

interface StatusOption {
  value: string
  label: string
  color: string
  icon: string
}

interface StatusSelectorProps {
  selectedStatus?: string
  isOpen: boolean
  onToggle: () => void
  onSelect: (status: string) => void
  className?: string
}

const statusOptions: StatusOption[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-400', icon: 'FileText' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-400', icon: 'Clock' },
  { value: 'review', label: 'Review', color: 'bg-yellow-400', icon: 'Eye' },
  { value: 'completed', label: 'Completed', color: 'bg-green-400', icon: 'CheckCircle' },
  { value: 'archived', label: 'Archived', color: 'bg-red-400', icon: 'Archive' },
]

const StatusSelector: React.FC<StatusSelectorProps> = ({
  selectedStatus,
  isOpen,
  onToggle,
  onSelect,
  className = ''
}) => {
  // Get current status display info
  const getCurrentStatus = () => {
    const status = statusOptions.find(s => s.value === selectedStatus)
    return status || { label: 'Status', icon: 'FileChartLine' }
  }

  const currentStatus = getCurrentStatus()
  const IconComponent = Icons[currentStatus.icon as keyof typeof Icons]

  return (
    <div className={`relative dropdown-container min-w-28 ${className}`}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-transparent text-theme-text-muted rounded-xl hover:bg-theme-bg-secondary/50 transition-colors border border-transparent hover:border-theme-border-primary"
      >
        <Icons.FileChartLine size={12} />
        <span className="max-w-20 truncate">
          {currentStatus.label}
        </span>
        <Icons.ChevronDown size={10} />
      </button>
      
      <DropdownMenu
        isOpen={isOpen}
        width="w-40"
      >
        {statusOptions.map((option) => {
          const OptionIcon = Icons[option.icon as keyof typeof Icons]
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSelect(option.value)}
              icon={<OptionIcon size={12} />}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenu>
    </div>
  )
}

export default StatusSelector