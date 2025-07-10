import React from 'react'
import { extractTaskProgress, getProgressColor, formatProgressText } from '../../lib/taskProgress'

interface TaskProgressProps {
  content: string
  showText?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const TaskProgress: React.FC<TaskProgressProps> = ({ content, showText = true, size = 'sm' }) => {
  const { total, completed, progress } = extractTaskProgress(content)

  // Don't render if no tasks
  if (total === 0) return null

  const colorClass = getProgressColor(progress)
  const progressText = formatProgressText(completed, total)

  const sizeClasses = {
    xs: 'w-12 h-1.5',
    sm: 'w-16 h-2',
    md: 'w-20 h-2.5',
    lg: 'w-24 h-3'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm'
  }

  return (
    <div className="flex items-center gap-2">
      {/* Progress Bar */}
      <div className={`${sizeClasses[size]} bg-theme-bg-tertiary rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-current transition-all duration-300 ${colorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress Text */}
      {showText && (
        <span className={`${textSizeClasses[size]} ${colorClass} font-medium`}>
          {progressText}
        </span>
      )}
    </div>
  )
}

export default TaskProgress