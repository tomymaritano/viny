import React from 'react'
import { extractTaskProgress } from '../../lib/taskProgress'

interface TaskProgressProps {
  content: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const TaskProgress: React.FC<TaskProgressProps> = ({ content, size = 'sm' }) => {
  const { total, completed, progress } = extractTaskProgress(content)
  
  // Size configurations
  const sizeConfig = {
    xs: { text: 'text-xs', height: 'h-1', width: 'w-16' },
    sm: { text: 'text-xs', height: 'h-1.5', width: 'w-20' },
    md: { text: 'text-sm', height: 'h-2', width: 'w-24' },
    lg: { text: 'text-base', height: 'h-2.5', width: 'w-32' }
  }
  
  const config = sizeConfig[size]
  
  if (total === 0) {
    return (
      <span className={`${config.text} text-theme-text-muted`}>
        {content?.length || 0} chars
      </span>
    )
  }

  // Get progress color without 'text-' prefix for both bar and text
  const getBarColor = (progress: number): string => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = (progress: number): string => {
    if (progress === 100) return 'text-green-500'
    if (progress >= 75) return 'text-blue-500'
    if (progress >= 50) return 'text-yellow-500'
    if (progress >= 25) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="flex items-center gap-2">
      {/* Progress bar */}
      <div className={`${config.width} ${config.height} bg-theme-bg-tertiary rounded-full overflow-hidden flex-shrink-0`}>
        <div 
          className={`${config.height} ${getBarColor(progress)} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress text */}
      <span className={`${config.text} ${getTextColor(progress)} font-medium flex-shrink-0`}>
        {completed}/{total}
      </span>
    </div>
  )
}

export default TaskProgress