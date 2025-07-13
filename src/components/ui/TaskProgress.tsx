import React from 'react'
import { extractTaskProgress, getProgressColor } from '../../lib/taskProgress'

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

  return (
    <div className="flex items-center gap-2">
      {/* Progress bar */}
      <div className={`${config.width} ${config.height} bg-theme-bg-tertiary rounded-full overflow-hidden flex-shrink-0`}>
        <div 
          className={`${config.height} bg-theme-accent-primary rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress text */}
      <span className={`${config.text} ${getProgressColor(progress)} font-medium flex-shrink-0`}>
        {completed}/{total}
      </span>
    </div>
  )
}

export default TaskProgress