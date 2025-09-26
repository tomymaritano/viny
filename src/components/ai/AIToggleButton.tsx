/**
 * AIToggleButton - Button to toggle AI chat panel
 */

import React from 'react'
import { Icons } from '../Icons'
import { ButtonRadix } from '../ui/ButtonRadix'
import { Tooltip } from '../ui/Tooltip'
import { cn } from '../../lib/utils'

interface AIToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
  hasNewFeatures?: boolean
}

export const AIToggleButton: React.FC<AIToggleButtonProps> = ({
  isOpen,
  onClick,
  className,
  hasNewFeatures = false,
}) => {
  return (
    <Tooltip
      content={
        isOpen ? 'Close AI Assistant' : 'Open AI Assistant (Free with Ollama)'
      }
    >
      <ButtonRadix
        variant={isOpen ? 'primary' : 'ghost'}
        size="sm"
        onClick={onClick}
        className={cn('relative', className)}
      >
        <Icons.sparkles className="w-4 h-4" />
        {hasNewFeatures && !isOpen && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-theme-accent-primary rounded-full animate-pulse" />
        )}
      </ButtonRadix>
    </Tooltip>
  )
}
