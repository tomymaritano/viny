import React from 'react'
import { extractTaskProgress } from '../../lib/taskProgress'

interface TaskProgressProps {
  content: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const TaskProgress: React.FC<TaskProgressProps> = ({ content, size = 'sm' }) => {
  const { total, completed } = extractTaskProgress(content)
  
  if (total === 0) {
    return <span className={`text-${size} text-theme-text-muted`}>{content?.length || 0} chars</span>
  }

  return (
    <span className={`text-${size} text-theme-text-muted`}>
      {completed}/{total} tasks
    </span>
  )
}

export default TaskProgress